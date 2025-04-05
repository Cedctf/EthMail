"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUrl } from '@/lib/gmail-auth';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { clearAuthData } from '@/lib/session-manager';

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  
  useEffect(() => {
    // Clear any existing auth data when landing on the login page
    clearAuthData();
    
    // If already authenticated, redirect to root page
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);
  
  const handleLogin = () => {
    try {
      window.location.href = getAuthUrl();
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to redirect to login page');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white hover:bg-white/10"
          onClick={() => router.push('/landing')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landing
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-10 w-10 text-white">
                  <path
                    fill="currentColor"
                    d="M22.057 20H1.943C0.87 20 0 19.13 0 18.057V5.943C0 4.87 0.87 4 1.943 4h20.114C23.13 4 24 4.87 24 5.943v12.114C24 19.13 23.13 20 22.057 20z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 13.5L0.6 5.3C0.3 5.1 0.3 4.7 0.5 4.4C0.7 4.1 1.1 4.1 1.4 4.3L12 11.8l10.6-7.5c0.3-0.2 0.7-0.2 0.9 0.1c0.2 0.3 0.2 0.7-0.1 0.9L12 13.5z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Flow Mail
            </h1>
            <p className="mt-2 text-lg text-gray-300">Sign in to continue to your inbox</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
            {loginError && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded-md text-sm border border-red-800">
                {loginError}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
            
            <p className="mt-6 text-center text-sm text-gray-400">
              This is a demo application. All emails and account data are stored in your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 