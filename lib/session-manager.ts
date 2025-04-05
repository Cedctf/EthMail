"use client"

import { logout } from './gmail-auth'
import { deleteCookie } from './cookie-utils'

/**
 * Clears all authentication data (localStorage and cookies)
 */
export function clearAuthData() {
  if (typeof window !== 'undefined') {
    // Clear localStorage items
    localStorage.removeItem('gmail_access_token')
    localStorage.removeItem('gmail_token_timestamp')
    localStorage.removeItem('gmail_user_info')
    
    // Clear auth cookie
    deleteCookie('auth_token')
  }
}

/**
 * Sets up event listeners to clear auth data when the tab is closed
 */
export function setupSessionCleanup() {
  if (typeof window !== 'undefined') {
    // Clear auth data when the tab is closed
    window.addEventListener('beforeunload', () => {
      clearAuthData()
    })
    
    // Also clear auth data when the page is hidden (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearAuthData()
      }
    })
  }
}

/**
 * Alternative logout function that clears all auth data
 */
export function logoutAndClear() {
  clearAuthData()
  window.location.href = '/login'
} 