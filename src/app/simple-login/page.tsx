'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SimpleLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSimpleLogin = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting simple login...')

      // Use a different approach - try to sign in with just basic settings
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/simple-login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      console.log('📤 Simple OAuth response:', { data, error })

      if (error) {
        console.error('❌ Error:', error)
        alert(`Error: ${error.message}`)
      } else {
        console.log('✅ OAuth URL:', data?.url)
      }
    } catch (err) {
      console.error('💥 Exception:', err)
      alert(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectSupabaseLogin = () => {
    console.log('🚀 Trying direct Supabase OAuth...')
    const directUrl = `https://ydamkailcnhfmutdvmsk.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/simple-login')}`
    console.log('🔗 Direct URL:', directUrl)
    
    const proceed = confirm('Try direct Supabase OAuth?')
    if (proceed) {
      window.location.href = directUrl
    }
  }

  // Check for OAuth return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    
    if (code) {
      console.log('✅ Got auth code:', code.substring(0, 20) + '...')
      alert(`Success! Got auth code: ${code.substring(0, 20)}...`)
      // Try to manually handle the session
      handleAuthCode(code)
    } else if (error) {
      console.error('❌ OAuth error:', error)
      alert(`OAuth error: ${error}`)
    }
  }, [])

  const handleAuthCode = async (code: string) => {
    try {
      console.log('🔄 Exchanging code for session...')
      
      // Try to exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('💥 Session exchange error:', error)
        alert(`Session exchange error: ${error.message}`)
      } else {
        console.log('✅ Session established:', data)
        alert('Login successful! Redirecting to dashboard...')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('💥 Exception during session exchange:', err)
      alert(`Exception: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Simple Login Test
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Testing simplified OAuth flow
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSimpleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Simple Supabase OAuth'}
          </button>

          <button
            onClick={handleDirectSupabaseLogin}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Direct Supabase OAuth
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Skip to Dashboard (Demo)
          </button>
        </div>
      </div>
    </div>
  )
}
