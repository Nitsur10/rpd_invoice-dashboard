import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getRequiredEnv } from '@/lib/env'

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

const AUTH_PATH = '/auth/login'
const PUBLIC_PATHS = new Set<string>([
  '/auth/login',
  '/api/auth/set',
  '/api/auth/signout',
  '/api/health',
])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api/public')) {
    return true
  }
  return false
}

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!session && !isAuthRoute) {
    const redirectUrl = new URL(AUTH_PATH, request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAuthRoute) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/invoices/:path*',
    '/kanban/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/status/:path*',
    '/test/:path*',
    '/api/(.*)',
  ],
}
