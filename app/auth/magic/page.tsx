"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Magic } from 'magic-sdk'

export default function MagicLinkHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>('Verifying your magic link...')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Get the email from the URL
        const email = searchParams.get('email')
        
        if (!email) {
          setError('Invalid magic link: email not found')
          return
        }
        
        setStatus(`Authenticating ${email}...`)
        
        // Initialize Magic SDK
        const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY || '')
        
        // Store the email for Magic Wallet auto-login
        localStorage.setItem('gmail_user_email', email)
        
        // Try to login the user
        try {
          // Try to login with Magic SDK
          await magic.auth.loginWithMagicLink({ email })
          
          // Check if login was successful
          const isLoggedIn = await magic.user.isLoggedIn()
          
          if (isLoggedIn) {
            setStatus('Authentication successful! Redirecting...')
            
            // Redirect to home page after a short delay
            setTimeout(() => {
              router.push('/')
            }, 1500)
          } else {
            throw new Error('Login failed')
          }
        } catch (magicError) {
          console.error('Magic auth error:', magicError)
          setError(`Authentication failed. Please try logging in again.`)
        }
      } catch (err) {
        console.error('Error handling magic link:', err)
        setError('An error occurred while processing your magic link')
      }
    }
    
    handleMagicLink()
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 7v13a2 2 0 0 0 2 2h16v-4"></path>
              <path d="M18 12h.01"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Magic Link Authentication</h1>
        </div>
        
        {error ? (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">{status}</p>
          </div>
        )}
      </div>
    </div>
  )
} 