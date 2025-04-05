"use client"

import { useState, useEffect } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import EmailList from '@/components/email-list'
import { Sidebar } from '@/components/sidebar'
import { ComposeEmail } from '@/components/compose-email'
import { useAuth } from '@/components/auth-provider'
import MagicWallet from '@/components/magic-wallet'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { isLoggedIn, loading } = useAuth()
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentCategory, setCurrentCategory] = useState<string>('inbox')
  const [showMagicWallet, setShowMagicWallet] = useState(false)
  const [autoShowWallet, setAutoShowWallet] = useState(false)
  const router = useRouter()

  // Auto-show wallet if this is the first login after Gmail auth
  useEffect(() => {
    if (isLoggedIn && !loading) {
      const hasGmailEmail = typeof window !== 'undefined' && localStorage.getItem('gmail_user_email')
      const hasSeenWallet = typeof window !== 'undefined' && localStorage.getItem('wallet_seen')
      
      if (hasGmailEmail && !hasSeenWallet) {
        // Show the wallet automatically after a short delay
        const timer = setTimeout(() => {
          setShowMagicWallet(true)
          setAutoShowWallet(true)
          
          // Mark wallet as seen to prevent showing on subsequent visits
          localStorage.setItem('wallet_seen', 'true')
        }, 3000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isLoggedIn, loading])

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Don't render main content until logged in (will be redirected by auth provider)
  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <MobileNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onCompose={() => setIsComposeOpen(true)} 
          unreadCount={unreadCount}
          onCategoryChange={setCurrentCategory}
          currentCategory={currentCategory}
        />
        <div className="flex-1 overflow-y-auto">
          <EmailList 
            category={currentCategory} 
            onUnreadCountChange={setUnreadCount} 
          />
        </div>
      </div>
      
      <ComposeEmail open={isComposeOpen} onOpenChange={setIsComposeOpen} />
      
      {/* Magic Wallet Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showMagicWallet ? (
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={() => router.push('/auth/magic-login')}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 18,11"></polyline><path d="M6 10h4"></path><path d="M6 14h2"></path></svg>
              Login
            </button>
            
            <button
              onClick={() => setShowMagicWallet(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 7v13a2 2 0 0 0 2 2h16v-4"></path><path d="M18 12h.01"></path></svg>
            </button>
          </div>
        ) : (
          <div className={`relative ${autoShowWallet ? 'animate-bounce-once' : ''}`}>
            <button
              onClick={() => setShowMagicWallet(false)}
              className="absolute -top-3 -right-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-1 shadow-lg z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
            
            {autoShowWallet && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                Your wallet is ready!
              </div>
            )}
            
            <MagicWallet />
          </div>
        )}
      </div>
    </main>
  )
}

