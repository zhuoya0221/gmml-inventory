'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      
      console.log('🚀 Starting OAuth login...')
      console.log('🌍 Window origin:', window.location.origin)
      console.log('🔗 Redirect URL:', `${window.location.origin}/auth/callback`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      console.log('📤 OAuth response:', { data, error })
      
      if (error) {
        console.error('OAuth Error:', error)
        toast.error(`Error logging in with Google: ${error.message}`)
      } else if (data?.url) {
        console.log('🔗 OAuth URL generated:', data.url)
        // The browser should redirect automatically
      }
    } catch (error) {
      console.error('Error during login:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            GMML Inventory
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the inventory management system
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Main Google OAuth button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign in with Google
              </>
            )}
          </button>

          {/* Direct dashboard access for testing - remove this in production */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Demo Mode (Skip Authentication)
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Only authorized team members can access this system
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}