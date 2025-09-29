'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthTestPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      console.log('🔍 Checking session...')
      
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('📊 Session:', session)
      console.log('❌ Session error:', sessionError)
      
      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('👤 User:', user)
      console.log('❌ User error:', userError)
      
      setSessionInfo({
        session,
        user,
        sessionError,
        userError,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('💥 Error:', error)
      setSessionInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="mb-4 space-x-4">
        <button 
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login with Google
        </button>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
        <button 
          onClick={checkSession}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Session Info
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Session Information:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>
    </div>
  )
}
