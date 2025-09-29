'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import InventoryDashboardDemo from '@/components/InventoryDashboardDemo'

export default function DemoDashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create a fake user session for demo purposes
    const createDemoUser = () => {
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@gmml.com',
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: null
        }
      }
      setUser(demoUser)
      setLoading(false)
    }

    // Try to get real user first, fallback to demo
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
        } else {
          createDemoUser()
        }
      } catch (error) {
        console.log('Auth check failed, using demo mode')
        createDemoUser()
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleLoginAttempt = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/demo-dashboard`
        }
      })
      
      if (error) {
        alert(`Login failed: ${error.message}. Continuing in demo mode.`)
      }
    } catch (err) {
      alert(`Login error: ${err.message}. Continuing in demo mode.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Demo mode banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-yellow-800 text-sm">
              {user?.email?.includes('demo') ? 
                '🧪 Demo Mode - ' + user.email : 
                '✅ Logged in as: ' + user?.email
              }
            </span>
          </div>
          <button
            onClick={handleLoginAttempt}
            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
          >
            Try Real Login
          </button>
        </div>
      </div>

      {/* Main dashboard */}
      <InventoryDashboardDemo user={user} />
    </div>
  )
}
