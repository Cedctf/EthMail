"use client"
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeToken } from '@/lib/gmail-auth';
import { clearAuthData } from '@/lib/session-manager';
import DebugInfo from '@/components/debug-info';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the full URL for debugging
        console.log('Callback URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // Clear any existing auth data before processing the callback
        clearAuthData();
        
        const url = window.location.href;
        const hash = window.location.hash.substring(1);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const state = searchParams.get('state');
        const storedState = typeof window !== 'undefined' ? localStorage.getItem('oauth_state') : null;
        const magicCredential = searchParams.get('magic_credential');
        
        // Collect debug information
        const debugData: Record<string, any> = {
          'Full URL': url,
          'Search String': window.location.search,
          'Hash': hash,
          'Code': code ? 'Present' : 'Not found',
          'Error param': errorParam,
          'State': state,
          'Stored State': storedState,
          'State Match': state === storedState,
          'Magic Credential': magicCredential ? 'Present' : 'Not found',
          'Search Params Empty': searchParams.toString() === '',
          'Pathname': window.location.pathname
        };
        
        // Add all search params to debug info
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
          debugData[`Param: ${key}`] = value;
        });
        debugData['All Params'] = allParams;
        
        setDebugInfo(debugData);
        
        // Check for standard OAuth code flow (Gmail auth)
        if (code) {
          console.log('Google OAuth code found, exchanging for token...');
          
          // Validate state if present
          if (state && storedState && state !== storedState) {
            console.error('State validation failed');
            debugData['State Validation'] = 'Failed';
            throw new Error('Invalid state parameter. Possible CSRF attack.');
          }
          
          // Clear the state from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('oauth_state');
          }
          
          // Exchange code for token using your backend
          try {
            const response = await fetch('/api/auth/exchange-code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code }),
            });
            
            debugData['Exchange response status'] = response.status;
            setDebugInfo(debugData);
            
            if (!response.ok) {
              let errorText = 'Failed to exchange code';
              try {
                const errorData = await response.json();
                errorText = errorData.error || errorText;
                debugData['Exchange error'] = errorData;
              } catch (e) {
                errorText = await response.text();
                debugData['Exchange error text'] = errorText;
              }
              setDebugInfo(debugData);
              throw new Error(`Failed to exchange code: ${errorText}`);
            }
            
            const data = await response.json();
            if (data.access_token) {
              // Store token and email for later use with Magic Wallet
              storeToken(data.access_token);
              
              // Try to get user email from token if possible
              try {
                // Make a request to Google API to get user info
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    'Authorization': `Bearer ${data.access_token}`
                  }
                });
                
                if (userInfoResponse.ok) {
                  const userInfo = await userInfoResponse.json();
                  if (userInfo.email) {
                    // Store the email for Magic Wallet to use later
                    localStorage.setItem('gmail_user_email', userInfo.email);
                    debugData['Gmail User'] = userInfo.email;
                    console.log('Stored Gmail user email for Magic Wallet:', userInfo.email);
                  }
                }
              } catch (userInfoError) {
                console.error('Failed to get user info:', userInfoError);
                // Non-critical error, continue with authentication
              }
              
              console.log('Authentication successful, redirecting to home');
              router.push('/');
              return;
            } else {
              throw new Error('No access token in response');
            }
          } catch (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            debugData['Code Exchange Error'] = String(exchangeError);
            setDebugInfo(debugData);
            throw new Error(`Token exchange failed: ${String(exchangeError)}`);
          }
        }
        
        // Handle Magic authentication if present
        if (magicCredential) {
          try {
            const apiKey = process.env.NEXT_PUBLIC_MAGIC_API_KEY || '';
            debugData['Magic API Key'] = apiKey ? 'Present' : 'Missing';
            
            if (!apiKey) {
              throw new Error('Missing Magic API Key');
            }
            
            // Initialize Magic SDK
            const magic = new Magic(apiKey, {
              extensions: [new OAuthExtension()],
              network: {
                rpcUrl: process.env.NEXT_PUBLIC_FLOW_RPC_URL || 'https://testnet.evm.nodes.onflow.org',
                chainId: parseInt(process.env.NEXT_PUBLIC_FLOW_CHAIN_ID || '545'),
              }
            });
            
            // Process Magic OAuth result
            const result = await magic.oauth.getRedirectResult();
            debugData['Magic Result'] = result ? 'Success' : 'Failed';
            
            if (result) {
              router.push('/');
              return;
            }
          } catch (magicErr) {
            const errorMessage = magicErr instanceof Error ? magicErr.message : String(magicErr);
            debugData['Magic Error'] = errorMessage;
            setDebugInfo(debugData);
            throw new Error(`Magic authentication failed: ${errorMessage}`);
          }
        }
        
        // Check for errors from OAuth provider
        if (errorParam) {
          setError(`Authentication error: ${errorParam}`);
          return;
        }
        
        // If we got here without finding a valid auth method, show error
        if (window.location.search === '') {
          setError('Empty callback received. This might be due to a redirect issue or browser privacy settings blocking the callback parameters. Please try again or use a different browser.');
        } else {
          setError('No valid authentication data received. Please try logging in again.');
        }
        
        debugData['Resolution'] = 'No valid authentication method found';
        setDebugInfo(debugData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error during auth callback:', errorMessage);
        setError(`Authentication failed: ${errorMessage}`);
      }
    };
    
    handleCallback();
  }, [router, searchParams]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
          <DebugInfo error={error} details={debugInfo} />
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p className="text-gray-500 mb-4">Please wait while we connect your account</p>
        <div className="text-left max-w-md">
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer">Show technical details</summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(debugInfo, null, 2)}
        </pre>
          </details>
        </div>
      </div>
    </div>
  );
} 