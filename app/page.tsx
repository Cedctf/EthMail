"use client"

import { useState } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import EmailList from '@/components/email-list'
import { Sidebar } from '@/components/sidebar'
import { ComposeEmail } from '@/components/compose-email'
import { useAuth } from '@/components/auth-provider'

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
      
    </main>
  )
}

