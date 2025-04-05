"use client"

/**
 * Sets a cookie that will be cleared when the browser tab is closed
 * @param name Cookie name
 * @param value Cookie value
 * @param path Cookie path (default: '/')
 */
export function setSessionCookie(name: string, value: string, path: string = '/') {
  if (typeof document !== 'undefined') {
    // Set cookie without an expiration date, which makes it a session cookie
    // Session cookies are automatically deleted when the browser tab is closed
    document.cookie = `${name}=${value}; path=${path}; SameSite=Lax`;
  }
}

/**
 * Gets a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * Deletes a cookie by setting its expiration date to the past
 * @param name Cookie name
 * @param path Cookie path (default: '/')
 */
export function deleteCookie(name: string, path: string = '/') {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  }
} 