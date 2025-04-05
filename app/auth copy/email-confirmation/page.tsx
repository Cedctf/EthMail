"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function EmailConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string>('')
  const [countdown, setCountdown] = useState(60)
  
  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
    
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mt-4">Check Your Email</h1>
        </div>
        
        <div className="text-center">
          <div className="mb-6">
            <p className="mb-2">We've sent a magic link to:</p>
            <p className="text-lg font-medium text-indigo-400">{email}</p>
          </div>
          
          <div className="py-4 px-6 bg-indigo-900/30 rounded-lg mb-6">
            <p className="text-sm">Click the link in your email to sign in to your Magic Wallet.</p>
          </div>
          
          <div className="text-sm text-gray-400 mb-6">
            <p>Don't see the email? Check your spam folder or</p>
            <button 
              onClick={() => router.push('/auth/magic-login')}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              try again with a different email
            </button>
          </div>
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage ({countdown}s)
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 