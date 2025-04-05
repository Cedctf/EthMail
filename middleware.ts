import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has('auth_token')

  // Always allow access to landing page and root path
  if (pathname === '/landing' || pathname === '/') {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/auth/callback') {
    // Redirect to login page instead of landing page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated and trying to access login page or landing page
  if (isAuthenticated && (pathname === '/login' || pathname === '/landing')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // For all other routes, proceed
  return NextResponse.next()
}

// Configure the middleware to run on all routes except for API routes and static files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 