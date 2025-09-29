'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTestPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const testConnection = async () => {
    setResults([])
    addResult('🔍 Starting database connection test...')
    
    // Test 1: Environment variables
    addResult(`🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}`)
    addResult(`🔑 Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'MISSING'}`)
    
    // Test 2: Basic connection
    try {
      addResult('🧪 Testing basic connection...')
      const { data, error } = await supabase
        .from('inventory_items')
        .select('count')
        .limit(1)
      
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`)
        addResult(`📋 Error details: ${error.details || 'None'}`)
        addResult(`💡 Error hint: ${error.hint || 'None'}`)
        addResult(`🔢 Error code: ${error.code || 'None'}`)
      } else {
        addResult(`✅ Connection successful!`)
        addResult(`📊 Result: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      addResult(`💥 Exception during connection test: ${err.message}`)
    }
    
    // Test 3: List tables
    try {
      addResult('📋 Testing table access...')
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(3)
      
      if (error) {
        addResult(`❌ Table access failed: ${error.message}`)
      } else {
        addResult(`✅ Table access successful! Found ${data?.length || 0} items`)
        if (data && data.length > 0) {
          addResult(`📦 Sample item: ${JSON.stringify(data[0], null, 2)}`)
        }
      }
    } catch (err) {
      addResult(`💥 Exception during table test: ${err.message}`)
    }
    
    // Test 4: Insert test
    try {
      addResult('➕ Testing insert capability...')
      const testItem = {
        name: 'Test Item ' + Date.now(),
        category: 'Test',
        current_stock: 1,
        min_stock: 1,
        status: 'In Stock',
        storage_location: 'Test Location',
        created_by: 'test-user',
        updated_by: 'test-user'
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([testItem])
        .select()
        .single()
      
      if (error) {
        addResult(`❌ Insert failed: ${error.message}`)
        addResult(`📋 Insert error details: ${error.details || 'None'}`)
      } else {
        addResult(`✅ Insert successful!`)
        addResult(`📦 Inserted item: ${JSON.stringify(data)}`)
        
        // Clean up test item
        await supabase.from('inventory_items').delete().eq('id', data.id)
        addResult(`🧹 Cleaned up test item`)
      }
    } catch (err) {
      addResult(`💥 Exception during insert test: ${err.message}`)
    }
  }

  const testRLS = async () => {
    addResult('🔒 Testing Row Level Security policies...')
    
    try {
      // Check if we can read without authentication
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('policy')) {
          addResult(`🔒 RLS is active and blocking access: ${error.message}`)
          addResult(`💡 You may need to adjust RLS policies for team access`)
        } else {
          addResult(`❌ Other error: ${error.message}`)
        }
      } else {
        addResult(`✅ RLS allows access (good for team use)`)
      }
    } catch (err) {
      addResult(`💥 Exception during RLS test: ${err.message}`)
    }
  }

  const fixRLS = async () => {
    addResult('🔧 Attempting to fix RLS policies...')
    
    try {
      // This would need to be done via SQL, but we can suggest it
      addResult(`💡 To fix RLS issues, run this SQL in Supabase:`)
      addResult(`DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON public.inventory_items;`)
      addResult(`CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);`)
      addResult(`🚨 Note: This allows unrestricted access - adjust for production!`)
    } catch (err) {
      addResult(`💥 Exception: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testConnection}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Run Full Database Test
          </button>
          
          <button
            onClick={testRLS}
            className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 ml-4"
          >
            Test RLS Policies
          </button>
          
          <button
            onClick={fixRLS}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 ml-4"
          >
            Show RLS Fix
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Results:</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
            {results.length === 0 ? (
              <div className="text-gray-400">Click "Run Full Database Test" to start testing...</div>
            ) : (
              results.map((result, i) => (
                <div key={i} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-4">Common Issues & Solutions:</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>❌ Connection failed:</strong> Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local</p>
            <p><strong>❌ Table doesn't exist:</strong> Run the SQL scripts in Supabase SQL Editor</p>
            <p><strong>❌ RLS blocking access:</strong> Update Row Level Security policies to allow team access</p>
            <p><strong>❌ Insert failed:</strong> Check table constraints and required fields</p>
          </div>
        </div>
      </div>
    </div>
  )
}
