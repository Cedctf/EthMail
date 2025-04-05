"use client"
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeToken } from '@/lib/gmail-auth';
import { clearAuthData } from '@/lib/session-manager';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Clear any existing auth data before processing the callback
        clearAuthData();
        
        // Log the URL for debugging
        console.log('Callback URL:', window.location.href);
        setDebugInfo(prev => prev + '\nURL: ' + window.location.href);
        
        // First check if we have a hash with the token (implicit flow)
        const hash = window.location.hash.substring(1);
        console.log('Hash:', hash);
        setDebugInfo(prev => prev + '\nHash: ' + hash);
        
        if (hash) {
          const params = new URLSearchParams(hash);
          const token = params.get('access_token');
          console.log('Token from hash:', token ? 'Present' : 'Not found');
          setDebugInfo(prev => prev + '\nToken from hash: ' + (token ? 'Present' : 'Not found'));
          
          if (token) {
            storeToken(token);
            router.push('/');
            return;
          }
        }
        
        // Then check if we have a code (authorization code flow)
        const code = searchParams.get('code');
        console.log('Code:', code ? 'Present' : 'Not found');
        setDebugInfo(prev => prev + '\nCode: ' + (code ? 'Present' : 'Not found'));
        
        if (code) {
          console.log('Exchanging code for token...');
          setDebugInfo(prev => prev + '\nExchanging code for token...');
          
          // Exchange code for token using your backend
          const response = await fetch('/api/auth/exchange-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
          
          console.log('Exchange response status:', response.status);
          setDebugInfo(prev => prev + '\nExchange response status: ' + response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Exchange error:', errorText);
            setDebugInfo(prev => prev + '\nExchange error: ' + errorText);
            throw new Error('Failed to exchange code for token');
          }
          
          const data = await response.json();
          console.log('Exchange response data:', data);
          setDebugInfo(prev => prev + '\nExchange response data: ' + JSON.stringify(data));
          
          if (data.access_token) {
            storeToken(data.access_token);
            router.push('/');
            return;
          }
        }
        
        // Check for errors
        const errorParam = searchParams.get('error');
        console.log('Error param:', errorParam);
        setDebugInfo(prev => prev + '\nError param: ' + errorParam);
        
        if (errorParam) {
          setError(`Authentication error: ${errorParam}`);
          return;
        }
        
        setError('No access token or code received');
      } catch (err) {
        console.error('Error during auth callback:', err);
        setDebugInfo(prev => prev + '\nError: ' + (err instanceof Error ? err.message : String(err)));
        setError('Authentication failed');
      }
    };
    
    handleCallback();
  }, [router, searchParams]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <h2 className="text-lg font-medium">Authentication Error</h2>
          <p>{error}</p>
          <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto max-h-40">
            {debugInfo}
          </pre>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-medium mb-2">Authenticating...</h2>
        <p className="text-gray-500">Connecting to your Gmail account</p>
        <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto max-h-40">
          {debugInfo}
        </pre>
      </div>
    </div>
  );
} 