'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TableTestPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const testTableStructure = async () => {
    setResults([])
    addResult('🔍 Testing table structure...')
    
    try {
      // Test 1: Get table info
      addResult('📋 Getting table information...')
      const { data: tableInfo, error: tableError } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(1)
      
      if (tableError) {
        addResult(`❌ Table access error: ${tableError.message}`)
        return
      }
      
      if (tableInfo && tableInfo.length > 0) {
        addResult('✅ Table structure:')
        const sampleItem = tableInfo[0]
        Object.keys(sampleItem).forEach(key => {
          addResult(`  - ${key}: ${typeof sampleItem[key]} (${sampleItem[key]})`)
        })
      } else {
        addResult('⚠️ Table is empty, testing with insert...')
      }
      
      // Test 2: Try a minimal insert
      addResult('🧪 Testing minimal insert...')
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
      
      addResult(`📦 Test item: ${JSON.stringify(testItem, null, 2)}`)
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([testItem])
        .select()
        .single()
      
      if (error) {
        addResult(`❌ Insert failed: ${error.message}`)
        addResult(`📋 Error details: ${error.details || 'None'}`)
        addResult(`💡 Error hint: ${error.hint || 'None'}`)
        addResult(`🔢 Error code: ${error.code || 'None'}`)
        
        // Try to identify the issue
        if (error.message.includes('null value')) {
          addResult('🔍 Issue: NULL value constraint violation')
          addResult('💡 Check: created_by and updated_by fields might be required')
        }
        if (error.message.includes('violates check constraint')) {
          addResult('🔍 Issue: Check constraint violation')
          addResult('💡 Check: status field must be one of: In Stock, Low Stock, Out of Stock')
        }
        if (error.message.includes('violates not-null constraint')) {
          addResult('🔍 Issue: NOT NULL constraint violation')
          addResult('💡 Check: All required fields must have values')
        }
      } else {
        addResult(`✅ Insert successful!`)
        addResult(`📦 Inserted item: ${JSON.stringify(data)}`)
        
        // Clean up
        await supabase.from('inventory_items').delete().eq('id', data.id)
        addResult(`🧹 Cleaned up test item`)
      }
      
    } catch (err) {
      addResult(`💥 Exception: ${err.message}`)
    }
  }

  const testWithAllFields = async () => {
    addResult('🧪 Testing with all possible fields...')
    
    const fullItem = {
      name: 'Full Test Item ' + Date.now(),
      photo_url: null,
      category: 'Test',
      current_stock: 5,
      min_stock: 2,
      status: 'In Stock',
      storage_location: 'Test Location',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'test-user',
      updated_by: 'test-user'
    }
    
    addResult(`📦 Full item: ${JSON.stringify(fullItem, null, 2)}`)
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([fullItem])
      .select()
      .single()
    
    if (error) {
      addResult(`❌ Full insert failed: ${error.message}`)
      addResult(`📋 Details: ${error.details || 'None'}`)
    } else {
      addResult(`✅ Full insert successful!`)
      addResult(`📦 Result: ${JSON.stringify(data)}`)
      
      // Clean up
      await supabase.from('inventory_items').delete().eq('id', data.id)
      addResult(`🧹 Cleaned up full test item`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Table Structure Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testTableStructure}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Test Table Structure
          </button>
          
          <button
            onClick={testWithAllFields}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 ml-4"
          >
            Test Full Insert
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Results:</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
            {results.length === 0 ? (
              <div className="text-gray-400">Click "Test Table Structure" to start...</div>
            ) : (
              results.map((result, i) => (
                <div key={i} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
