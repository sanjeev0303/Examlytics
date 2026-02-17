import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = new Set([
  'dashboard',
  'analytics',
  'history',
  'exams',
  'settings',
  'onboarding',
  'analysis',
  'exam',
  'weak-topics'
]);

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  const firstSegment = segments[1];

  const isAuthPage = firstSegment === 'login' || firstSegment === 'register'
  const isProtected = PROTECTED_ROUTES.has(firstSegment)

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analytics/:path*',
    '/history/:path*',
    '/exams/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/analysis/:path*',
    '/exam/:path*',
    '/weak-topics/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
