'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugOAuthPage() {
  const [oauthUrl, setOauthUrl] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const testOAuth = async () => {
    try {
      addLog('🚀 Starting OAuth test...')
      addLog(`🌍 Current origin: ${window.location.origin}`)
      addLog(`🔗 Redirect URL: ${window.location.origin}/auth/callback`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true // Don't redirect, just get the URL
        }
      })
      
      addLog(`📤 OAuth response: ${JSON.stringify({ data, error }, null, 2)}`)
      
      if (error) {
        addLog(`❌ Error: ${error.message}`)
        alert(`OAuth Error: ${error.message}`)
      } else if (data?.url) {
        addLog(`✅ OAuth URL generated successfully`)
        setOauthUrl(data.url)
        addLog(`🔗 Full URL: ${data.url}`)
        alert(`OAuth URL generated! Check the logs for the full URL.`)
      } else {
        addLog(`⚠️ No URL generated`)
        alert('No OAuth URL was generated!')
      }
    } catch (err) {
      addLog(`💥 Exception: ${err.message}`)
    }
  }

  const testManualRedirect = () => {
    if (oauthUrl) {
      addLog('🌐 Manually redirecting to OAuth URL...')
      window.location.href = oauthUrl
    }
  }

  const testSupabaseOAuth = async () => {
    try {
      addLog('🧪 Testing direct Supabase OAuth...')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const directUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}`
      addLog(`🔗 Direct Supabase URL: ${directUrl}`)
      
      const shouldRedirect = confirm('Test direct Supabase OAuth URL?')
      if (shouldRedirect) {
        window.location.href = directUrl
      }
    } catch (err) {
      addLog(`💥 Exception: ${err.message}`)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Page</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={testOAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test OAuth URL Generation
        </button>
        
        <button 
          onClick={testManualRedirect}
          disabled={!oauthUrl}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Manual Redirect to OAuth URL
        </button>
        
        <button 
          onClick={testSupabaseOAuth}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Test Direct Supabase OAuth
        </button>
      </div>

      {oauthUrl && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">Generated OAuth URL:</h3>
          <div className="text-sm break-all font-mono bg-white p-2 rounded">
            {oauthUrl}
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Logs:</h2>
        <div className="text-sm space-y-1 max-h-96 overflow-auto">
          {logs.map((log, i) => (
            <div key={i} className="font-mono">{log}</div>
          ))}
        </div>
        <button 
          onClick={() => setLogs([])}
          className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
        >
          Clear Logs
        </button>
      </div>
    </div>
  )
}
