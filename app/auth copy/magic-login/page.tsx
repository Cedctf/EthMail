"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth'

export default function MagicLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Initialize email from query param or localStorage
  useEffect(() => {
    // First try to get from query params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      return
    }
    
    // Then try to get from localStorage
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('last_magic_email')
      if (storedEmail) {
        setEmail(storedEmail)
      }
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Initialize Magic SDK
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY || '', {
        extensions: [new OAuthExtension()]
      })
      
      // Send custom email notification
      try {
        // Generate a demo magic link for the custom email
        const demoToken = btoa(`${email}:${Date.now()}`)
        const demoMagicLink = `${window.location.origin}/auth/magic?token=${demoToken}&email=${encodeURIComponent(email)}`
        
        // Send the custom email through your API
        await fetch('/api/send-magic-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email,
            magicLink: demoMagicLink
          }),
        })
        
        // Show success message
        setSuccessMessage(`Magic link sent to ${email}. Please check your inbox.`)
      } catch (emailErr) {
        console.error('Failed to send custom email:', emailErr)
        setError('Failed to send magic link email. Please try again.')
      }
      
      // IMPORTANT: Don't call magic.auth.loginWithMagicLink here
      // This is what causes the page refresh
      // Instead, just send the email through your API
    } catch (err) {
      console.error('Magic login error:', err)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-white">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 7v13a2 2 0 0 0 2 2h16v-4"></path>
              <path d="M18 12h.01"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mt-4">Magic Wallet Login</h1>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-900/30 text-red-300 p-3 rounded-lg text-sm border border-red-800">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-900/30 text-green-300 p-3 rounded-lg text-sm border border-green-800">
              {successMessage}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 rounded-lg text-white transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              'Send Magic Link'
            )}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-gray-400 hover:text-white"
            >
              Return to Homepage
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 