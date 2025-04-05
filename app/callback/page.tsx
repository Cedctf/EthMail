"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // When the page loads after OAuth redirect, redirect back to the home page
    // The Magic SDK will handle the OAuth result in the main component
    
    setTimeout(() => {
      try {
        // Check if this is a callback from Google OAuth
        if (window.location.pathname.includes('/callback')) {
          // Redirect to home page after processing OAuth
          router.push('/')
        }
      } catch (err) {
        console.error('Redirect error:', err)
        setError('Failed to redirect after authentication')
      }
    }, 1000)
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
        <h1 className="text-2xl font-bold text-white">Completing Login...</h1>
        <p className="text-zinc-400 mt-2">You will be redirected automatically</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 