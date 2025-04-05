"use client"

import { useState } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import EmailList from '@/components/email-list'
import { Sidebar } from '@/components/sidebar'
import { ComposeEmail } from '@/components/compose-email'
import { useAuth } from '@/components/auth-provider'
import PrivyWallet from '@/components/privy-wallet'

export default function Home() {
  const { isLoggedIn, loading } = useAuth()
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentCategory, setCurrentCategory] = useState<string>('inbox')
  const [showWallet, setShowWallet] = useState(false)

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
      
      {/* Privy Wallet Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showWallet ? (
          <button
            onClick={() => setShowWallet(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 7v13a2 2 0 0 0 2 2h16v-4"></path><path d="M18 12h.01"></path></svg>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowWallet(false)}
              className="absolute -top-3 -right-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-1 shadow-lg z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
            <PrivyWallet />
          </div>
        )}
      </div>
    </main>
  )
}

