import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  const isProtected =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/analytics') ||
    request.nextUrl.pathname.startsWith('/history') ||
    request.nextUrl.pathname.startsWith('/exams') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/onboarding') ||
    request.nextUrl.pathname.startsWith('/analysis') ||
    request.nextUrl.pathname.startsWith('/exam') ||
    request.nextUrl.pathname.startsWith('/weak-topics')

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
