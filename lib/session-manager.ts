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
 * (Now intentionally empty to avoid clearing sessions)
 */
export function setupSessionCleanup() {
  // Removed code that was clearing sessions on tab close/hide
  // This allows sessions to persist between visits
}

/**
 * Alternative logout function that clears all auth data
 */
export function logoutAndClear() {
  clearAuthData()
  window.location.href = '/login'
} 