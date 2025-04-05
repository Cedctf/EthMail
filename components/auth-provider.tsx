"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/gmail-auth'
import { setupSessionCleanup } from '@/lib/session-manager'

// Create auth context
const AuthContext = createContext<{
  isLoggedIn: boolean;
  loading: boolean;
}>({
  isLoggedIn: false,
  loading: true,
})

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Set up session cleanup on mount
  useEffect(() => {
    setupSessionCleanup()
  }, [])

  // Check authentication on mount and path change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated()
        setIsLoggedIn(authenticated)
        
        // If not logged in and not on an auth-related page, redirect to login
        if (!authenticated && 
            pathname !== '/login' && 
            !pathname.startsWith('/auth/callback') && 
            !pathname.startsWith('/auth/magic-login') &&
            !pathname.startsWith('/auth/magic') &&
            !pathname.startsWith('/auth/email-confirmation')) {
          router.push('/login')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => useContext(AuthContext) 