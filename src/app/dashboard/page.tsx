'use client'

import { useEffect, useState } from 'react'
import { supabase, type InventoryItem } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Package, Plus, Search, Filter, Download, LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  
  console.log('🎯 Dashboard page loaded!')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    console.log('🔍 Checking user in dashboard...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 User in dashboard:', user?.email || 'none')
      
      if (user) {
        setUser(user)
        fetchItems()
      } else {
        console.log('❌ No user found in dashboard')
        // Don't redirect, just show a message
      }
    } catch (error) {
      console.error('💥 Error checking user in dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    console.log('📊 Fetching items...')
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      console.log('✅ Items fetched:', data?.length || 0)
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch inventory items')
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">GMML Inventory</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="text-sm text-red-600">
                  Not authenticated - showing demo mode
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-indigo-600" />
                GMML Inventory Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {user ? 'Manage your team\'s inventory and track changes' : 'Demo mode - authentication in progress'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => toast.success('Feature coming soon!')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => toast.success('Feature coming soon!')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Items</p>
                <p className="text-3xl font-bold text-blue-700">{items.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">In Stock</p>
                <p className="text-3xl font-bold text-green-700">
                  {items.filter(item => item.status === 'In Stock').length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Low Stock</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {items.filter(item => item.status === 'Low Stock').length}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Out of Stock</p>
                <p className="text-3xl font-bold text-red-700">
                  {items.filter(item => item.status === 'Out of Stock').length}
                </p>
              </div>
              <div className="bg-red-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
          </div>
          <div className="overflow-x-auto">
            {items.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user ? 'Get started by adding your first inventory item.' : 'Authentication required to view items.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.current_stock} / {item.min_stock} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                          item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.storage_location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Debug Info */}
        {!user && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-800">Authentication Status</h4>
            <p className="mt-1 text-sm text-yellow-700">
              User authentication is in progress. Once logged in, you'll be able to add and manage inventory items.
            </p>
            <div className="mt-2">
              <button
                onClick={() => window.location.href = '/login'}
                className="text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Go back to login
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
