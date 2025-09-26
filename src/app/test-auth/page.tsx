'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [authUrl, setAuthUrl] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Generate auth URL manually
    const generateAuthUrl = async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        setAuthUrl(data.url)
      }
      
      if (error) {
        console.error('Auth URL generation error:', error)
      }
    }
    
    generateAuthUrl()
  }, [])

  const testDirectAuth = () => {
    window.location.href = `https://ydamkailcnhfmutdvmsk.supabase.co/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`
  }

  const testNormalAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Normal auth error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Authentication Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Generated Auth URL</h2>
          <div className="bg-gray-100 p-4 rounded text-xs break-all">
            {authUrl || 'Loading...'}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={testDirectAuth}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Test Direct Auth (Known Working)
          </button>
          
          <button
            onClick={testNormalAuth}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test Normal Auth (App Method)
          </button>
        </div>
      </div>
    </div>
  )
}
