'use client'

import { useState } from 'react'

export default function WorkingLoginPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const testDirectSupabase = () => {
    addLog('🚀 Testing direct Supabase OAuth...')
    
    const supabaseUrl = 'https://ydamkailcnhfmutdvmsk.supabase.co'
    const redirectTo = 'http://localhost:3000/working-login'
    
    const url = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
    
    addLog(`🔗 URL: ${url}`)
    
    window.location.href = url
  }

  // Check if we have returned from OAuth
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    
    if (code && logs.length === 0) {
      setLogs([`${new Date().toISOString()}: ✅ SUCCESS! Got auth code: ${code.substring(0, 20)}...`])
    } else if (error && logs.length === 0) {
      setLogs([`${new Date().toISOString()}: ❌ ERROR: ${error}`])
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Working Login Test</h1>
        
        <button
          onClick={testDirectSupabase}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        >
          Test Supabase OAuth
        </button>

        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-bold mb-2">Logs:</h3>
          <div className="text-sm space-y-1 max-h-32 overflow-auto">
            {logs.map((log, i) => (
              <div key={i} className="font-mono text-xs">{log}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>First update Supabase URL Configuration to include:</p>
          <code className="block bg-gray-100 p-1 mt-1 text-xs">
            http://localhost:3000/working-login
          </code>
        </div>
      </div>
    </div>
  )
}
