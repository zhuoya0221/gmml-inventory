import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🔄 Auth callback received')
  console.log('📍 Full URL:', request.url)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  console.log('🔐 Auth code present:', !!code)
  console.log('🔐 Auth code (first 20 chars):', code ? code.substring(0, 20) + '...' : 'None')
  console.log('❌ Error:', error)
  console.log('📝 Error description:', errorDescription)
  console.log('🌍 Origin:', origin)
  console.log('🗂️ All params:', Object.fromEntries(searchParams.entries()))

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )
      
      console.log('🔄 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data?.session) {
        console.log('✅ Session exchange successful!')
        console.log('👤 User:', data.user?.email)
        
        // Create response and set cookies manually
        const response = NextResponse.redirect(`${origin}/dashboard`)
        
        // Set authentication cookies manually
        if (data.session.access_token) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
        }
        
        if (data.session.refresh_token) {
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
          })
        }
        
        return response
      } else {
        console.error('💥 Session exchange failed:', error?.message)
      }
    } catch (err) {
      console.error('💥 Exception during session exchange:', err)
    }
  }

  console.log('🚨 Redirecting to login with error')
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}