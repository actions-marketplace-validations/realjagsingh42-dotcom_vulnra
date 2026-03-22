import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guard: if env vars are not set (e.g. Railway build without variables
  // configured), let the request through unchanged rather than crashing on
  // every single middleware invocation.
  if (!url || !key) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth token — wrapped in try-catch so a Supabase network hiccup
  // or malformed cookie does not throw from middleware and crash every request.
  try {
    await supabase.auth.getUser()
  } catch {
    // Token refresh failed — session may be stale, but we let the request through.
    // The individual page's requireAuth() / createClient() call will handle it.
  }

  return supabaseResponse
}
