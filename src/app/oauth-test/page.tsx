'use client'

import { useState, useEffect } from 'react'

export default function OAuthTestPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  useEffect(() => {
    // Check if we're coming back from OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const state = urlParams.get('state')
    
    if (code || error) {
      addLog(`🔙 Returned from OAuth with:`)
      addLog(`  - Code: ${code ? code.substring(0, 20) + '...' : 'None'}`)
      addLog(`  - Error: ${error || 'None'}`)
      addLog(`  - State: ${state || 'None'}`)
    }
  }, [])

  const testDirectGoogleOAuth = () => {
    addLog('🧪 Testing direct Google OAuth...')
    
    // Direct Google OAuth URL with our client ID
    const clientId = '914161930041-0c7rm4tr2u218vs5oafc1qoitfkfg4jh.apps.googleusercontent.com'
    const redirectUri = 'http://localhost:3000/oauth-test' // This page itself
    const scope = 'openid email profile'
    const responseType = 'code'
    const state = 'test_state_' + Date.now()
    
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}`
    
    addLog(`🔗 Direct Google OAuth URL: ${googleOAuthUrl}`)
    
    const shouldRedirect = confirm('Test direct Google OAuth (this will redirect to Google)?')
    if (shouldRedirect) {
      window.location.href = googleOAuthUrl
    }
  }

  const testSupabaseFlow = () => {
    addLog('🧪 Testing Supabase OAuth flow...')
    
    const supabaseUrl = 'https://ydamkailcnhfmutdvmsk.supabase.co'
    const redirectTo = 'http://localhost:3000/oauth-test'
    
    const supabaseOAuthUrl = `${supabaseUrl}/auth/v1/authorize?` +
      `provider=google&` +
      `redirect_to=${encodeURIComponent(redirectTo)}`
    
    addLog(`🔗 Supabase OAuth URL: ${supabaseOAuthUrl}`)
    
    const shouldRedirect = confirm('Test Supabase OAuth flow?')
    if (shouldRedirect) {
      window.location.href = supabaseOAuthUrl
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Flow Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={testDirectGoogleOAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Direct Google OAuth
        </button>
        
        <button 
          onClick={testSupabaseFlow}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Test Supabase OAuth Flow
        </button>
        
        <button 
          onClick={() => {
            addLog('📍 Current URL: ' + window.location.href)
            addLog('🌍 Current origin: ' + window.location.origin)
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Log Current URL Info
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Test Logs:</h2>
        <div className="text-sm space-y-1 max-h-96 overflow-auto">
          {logs.map((log, i) => (
            <div key={i} className="font-mono text-xs">{log}</div>
          ))}
        </div>
        <button 
          onClick={() => setLogs([])}
          className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">Important:</h3>
        <p className="text-sm">
          For the direct Google OAuth test to work, you need to add this URL to your Google Console:
          <br />
          <code className="bg-white p-1 rounded">http://localhost:3000/oauth-test</code>
        </p>
      </div>
    </div>
  )
}
