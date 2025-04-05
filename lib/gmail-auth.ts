// Simplified Gmail authentication utility functions
import { clientEnv } from '../env';
import { setSessionCookie, deleteCookie } from './cookie-utils';

// Get client ID from client-side env or fallback to process.env
const CLIENT_ID = clientEnv.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

// Get redirect URI - use the absolute URL
function getFullRedirectUri() {
  if (typeof window !== 'undefined') {
    // Use window.location to build absolute URL when in browser
    return `${window.location.protocol}//${window.location.host}/auth/callback`;
  }
  
  // Fallback to configured value
  return clientEnv.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';
}

// Define the scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose'
].join(' ');

// Get redirect URI (public facing function)
export function getRedirectUri() {
  return getFullRedirectUri();
}

// Generate a state parameter to prevent CSRF attacks
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Generate the OAuth URL for authentication
export function getAuthUrl() {
  // For debugging
  console.log('Using client ID:', CLIENT_ID);
  console.log('Using redirect URI:', getRedirectUri());
  
  // Make sure CLIENT_ID is available
  if (!CLIENT_ID) {
    console.error('No client ID found! Make sure GOOGLE_CLIENT_ID is set in .env.local and server is restarted.');
    return '#error-no-client-id';
  }
  
  const redirectUri = encodeURIComponent(getRedirectUri());
  const scopesEncoded = encodeURIComponent(SCOPES);
  const state = generateState();
  
  // Store state in localStorage for validation
  if (typeof window !== 'undefined') {
    localStorage.setItem('oauth_state', state);
  }
  
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scopesEncoded}&access_type=offline&prompt=consent&state=${state}`;
}

// Store the token in localStorage and as a session cookie
export function storeToken(token: string) {
  if (typeof window !== 'undefined') {
    // Store in localStorage
    localStorage.setItem('gmail_access_token', token);
    localStorage.setItem('gmail_token_timestamp', Date.now().toString());
    
    // Also store as a session cookie for middleware
    setSessionCookie('auth_token', token);
  }
}

// Get the stored token
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gmail_access_token');
  }
  return null;
}

// Check if token is expired (tokens typically last 1 hour)
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  const timestamp = localStorage.getItem('gmail_token_timestamp');
  if (!timestamp) return true;
  
  // Token expiration time (1 hour = 3600000 ms)
  const expirationTime = 3600000;
  return (Date.now() - parseInt(timestamp)) > expirationTime;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token && !isTokenExpired();
}

// Logout user
export function logout() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_token_timestamp');
    localStorage.removeItem('gmail_user_info');
    
    // Clear auth cookie
    deleteCookie('auth_token');
    
    window.location.href = '/login';
  }
}

// Get user info from token (basic implementation)
export function getUserInfo() {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('gmail_user_info');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
  }
  return null;
}

// Store user info
export function storeUserInfo(userInfo: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gmail_user_info', JSON.stringify(userInfo));
  }
} 