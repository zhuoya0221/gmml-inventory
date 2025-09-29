'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import type { InventoryItem, UserProfile, ActivityLog } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function FinalTeamDashboard() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    current_stock: 0,
    min_stock: 0,
    storage_location: '',
    unit: '',
    expire_date: ''
  })
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    location: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Filter items based on current filters and search
  useEffect(() => {
    let filtered = items

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    if (filters.location) {
      filtered = filtered.filter(item => item.storage_location === filters.location)
    }

    setFilteredItems(filtered)
  }, [items, filters, searchTerm])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        // If no user, clear data and show the login button
        setUserProfile(null)
        setItems([])
        setFilteredItems([])
        setLoading(false)
        return
      }

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error("Could not fetch user profile.");
      }
      setUserProfile(profile);

      const { data: inventoryItems, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }
      setItems(inventoryItems || [])
      setFilteredItems(inventoryItems || [])

      // Fetch activity logs
      const { data: logs, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (!logsError) {
        setActivityLogs(logs || [])
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      toast.error(`Error fetching data: ${errorMessage}`)
      console.error("Data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    // Check if user is logged in
    if (!user || !user.id) {
      toast.error("Please login to add items")
      return
    }

    // Validate form
    if (!newItem.name || !newItem.category || !newItem.storage_location) {
      toast.error("Please fill in all required fields")
      return
    }

    const itemData = {
      name: newItem.name,
      category: newItem.category,
      current_stock: newItem.current_stock,
      min_stock: newItem.min_stock,
      storage_location: newItem.storage_location,
      unit: newItem.unit || null,
      expire_date: newItem.expire_date || null,
      status: newItem.current_stock > newItem.min_stock ? 'In Stock' : (newItem.current_stock === 0 ? 'Out of Stock' : 'Low Stock'),
      created_by: user.email,
      updated_by: user.email
    }

    console.log('🔍 Adding item:', itemData)

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemData])
      .select()
      .single()

    console.log('📊 Insert result:', { data, error })

    if (error) {
      console.error("Insert error:", error)
      toast.error(`Error: ${error.message}`)
    } else {
      console.log('✅ Success:', data)
      const updatedItems = [...items, data].sort((a, b) => a.name.localeCompare(b.name))
      setItems(updatedItems)
      setFilteredItems(updatedItems)
      toast.success(`"${newItem.name}" added!`)
      
      // Reset form and hide it
      setNewItem({ name: '', category: '', current_stock: 0, min_stock: 0, storage_location: '', unit: '', expire_date: '' })
      setShowAddForm(false)
      
      // Log the activity
      await logActivity(data.id, data.name, 'created', itemData)
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowEditForm(true)
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !user || !user.id) {
      toast.error("Please login to update items")
      return
    }

    // Validate form
    if (!editingItem.name || !editingItem.category || !editingItem.storage_location) {
      toast.error("Please fill in all required fields")
      return
    }

    const updates = {
      name: editingItem.name,
      category: editingItem.category,
      current_stock: editingItem.current_stock,
      min_stock: editingItem.min_stock,
      storage_location: editingItem.storage_location,
      unit: editingItem.unit || null,
      expire_date: editingItem.expire_date || null,
      status: editingItem.current_stock > editingItem.min_stock ? 'In Stock' : (editingItem.current_stock === 0 ? 'Out of Stock' : 'Low Stock'),
      updated_by: user.email,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', editingItem.id)
      .select()
      .single()

    if (error) {
      toast.error(`Error: ${error.message}`)
    } else {
      const updatedItems = items.map(i => (i.id === editingItem.id ? data : i))
      setItems(updatedItems)
      setFilteredItems(updatedItems)
      toast.success(`"${editingItem.name}" updated!`)
      
      // Reset form and hide it
      setEditingItem(null)
      setShowEditForm(false)
      
      // Log the activity
      await logActivity(editingItem.id, editingItem.name, 'updated', updates)
    }
  }

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    if (!user || !user.id) {
      toast.error("Please login to delete items");
      return;
    }

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error(`Error deleting item: ${error.message}`);
    } else {
      const updatedItems = items.filter(i => i.id !== itemId);
      setItems(updatedItems);
      toast.success(`"${itemName}" has been deleted.`);
      
      // Log the activity
      await logActivity(itemId, itemName, 'deleted', { id: itemId, name: itemName });
    }
  };


  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    })
    if (error) toast.error(`Login failed: ${error.message}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success("Logged out.")
    window.location.href = '/';
  }

  const logActivity = async (itemId: string, itemName: string, action: string, changes: Record<string, unknown>) => {
    if (!user || !user.id) return

    try {
      const logEntry = {
        item_id: itemId,
        user_id: user.id,
        user_email: user.email,
        action,
        changes,
        item_name: itemName,
        timestamp: new Date().toISOString()
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert([logEntry])

      if (!error) {
        // Refresh activity logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)
        
        if (logs) {
          setActivityLogs(logs)
        }
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const handleExportCSV = () => {
    const csvData = filteredItems.map(item => ({
      'Item Name': item.name,
      'Category': item.category,
      'Current Stock': item.current_stock,
      'Min Stock': item.min_stock,
      'Unit': item.unit || '',
      'Expire Date': item.expire_date ? new Date(item.expire_date).toLocaleDateString() : '',
      'Status': item.status,
      'Location': item.storage_location,
      'Updated': new Date(item.updated_at).toLocaleDateString()
    }));
  
    if (csvData.length === 0) {
      toast.error("No data to export.");
      return;
    }
  
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV exported successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800'
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const totalItems = filteredItems.length;
  const inStockCount = filteredItems.filter(i => i.status === 'In Stock').length;
  const lowStockCount = filteredItems.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = filteredItems.filter(i => i.status === 'Out of Stock').length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading Team Dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">GMML Inventory System</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {userProfile?.role === 'admin' && (
                  <button 
                    onClick={() => router.push('/admin')} 
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Admin Panel
                  </button>
                )}
                <span className="text-sm text-gray-600">{user?.email || "Team Mode"}</span>
                {user && user.id ? (
                  <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800">Logout</button>
                ) : (
                  <button onClick={handleLogin} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Login with Google</button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
            <div className="overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-900">Total Items</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalItems}</dd>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-900">In Stock</dt>
                  <dd className="text-2xl font-semibold text-green-600">{inStockCount}</dd>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-900">Low Stock</dt>
                  <dd className="text-2xl font-semibold text-yellow-600">{lowStockCount}</dd>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-900">Out of Stock</dt>
                  <dd className="text-2xl font-semibold text-red-600">{outOfStockCount}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search by name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search items..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="filter-category"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  >
                    <option value="">All Categories</option>
                            <option value="Studying Consumables">Studying Consumables</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    id="filter-location"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  >
                    <option value="">All Locations</option>
                    <option value="GTR">GTR</option>
                    <option value="MD6 LEVEL9">MD6 LEVEL9</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="filter-status"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  >
                    <option value="">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
                  <p className="text-sm text-gray-600">Showing {filteredItems.length} of {items.length} items</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Activity Log
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={!user || !user.id}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      !user || !user.id || userProfile?.role === 'user'
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {!user || !user.id ? 'Login to Add Items' : 'Add Item'}
                  </button>
                </div>
              </div>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="item-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label htmlFor="item-category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      id="item-category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="">Select category</option>
                            <option value="Studying Consumables">Studying Consumables</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Others">Others</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="storage-location" className="block text-sm font-medium text-gray-700">
                      Storage Location *
                    </label>
                    <select
                      id="storage-location"
                      value={newItem.storage_location}
                      onChange={(e) => setNewItem({...newItem, storage_location: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="">Select location</option>
                      <option value="GTR">GTR</option>
                      <option value="MD6 LEVEL9">MD6 LEVEL9</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="current-stock" className="block text-sm font-medium text-gray-700">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      id="current-stock"
                      value={newItem.current_stock}
                      onChange={(e) => setNewItem({...newItem, current_stock: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="min-stock" className="block text-sm font-medium text-gray-700">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      id="min-stock"
                      value={newItem.min_stock}
                      onChange={(e) => setNewItem({...newItem, min_stock: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="item-unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <input
                      type="text"
                      id="item-unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      placeholder="e.g., pcs, kg, L"
                    />
                  </div>

                  <div>
                    <label htmlFor="item-expire-date" className="block text-sm font-medium text-gray-700">
                      Expire Date
                    </label>
                    <input
                      type="date"
                      id="item-expire-date"
                      value={newItem.expire_date}
                      onChange={(e) => setNewItem({...newItem, expire_date: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewItem({ name: '', category: '', current_stock: 0, min_stock: 0, storage_location: '', unit: '', expire_date: '' })
                      setShowAddForm(false)
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            )}

            {/* Edit Item Form - will be removed from here */}

            {/* Responsive Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white shadow rounded-lg p-4 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{item.category}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-700 flex-grow">
                    <p><span className="font-medium">Stock:</span> {item.current_stock} / {item.min_stock} {item.unit || ''}</p>
                    <p><span className="font-medium">Location:</span> {item.storage_location}</p>
                    <div className="grid grid-cols-2 gap-x-4">
                      <p><span className="font-medium">Expire Date:</span> {item.expire_date ? new Date(item.expire_date).toLocaleDateString() : '-'}</p>
                      <p><span className="font-medium">Updated:</span> {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    {userProfile?.role !== 'user' && (
                      <>
                        <button 
                          onClick={() => handleEditItem(item)} 
                          disabled={!user || !user.id}
                          className={`inline-flex items-center p-1.5 rounded-md ${!user || !user.id ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'}`}
                          title="Edit"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id, item.name)} 
                          disabled={!user || !user.id}
                          className={`inline-flex items-center p-1.5 rounded-md ${!user || !user.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`}
                          title="Delete"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Item Modal */}
          {showEditForm && editingItem && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Edit Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    <label htmlFor="edit-item-name" className="block text-sm font-medium text-gray-700">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      id="edit-item-name"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-item-category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      id="edit-item-category"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="">Select category</option>
                            <option value="Studying Consumables">Studying Consumables</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-storage-location" className="block text-sm font-medium text-gray-700">
                      Storage Location *
                    </label>
                    <select
                      id="edit-storage-location"
                      value={editingItem.storage_location}
                      onChange={(e) => setEditingItem({...editingItem, storage_location: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    >
                      <option value="">Select location</option>
                      <option value="GTR">GTR</option>
                      <option value="MD6 LEVEL9">MD6 LEVEL9</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-current-stock" className="block text-sm font-medium text-gray-700">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      id="edit-current-stock"
                      value={editingItem.current_stock}
                      onChange={(e) => setEditingItem({...editingItem, current_stock: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-min-stock" className="block text-sm font-medium text-gray-700">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      id="edit-min-stock"
                      value={editingItem.min_stock}
                      onChange={(e) => setEditingItem({...editingItem, min_stock: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-item-unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <input
                      type="text"
                      id="edit-item-unit"
                      value={editingItem.unit || ''}
                      onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      placeholder="e.g., pcs, kg, L"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-item-expire-date" className="block text-sm font-medium text-gray-700">
                      Expire Date
                    </label>
                    <input
                      type="date"
                      id="edit-item-expire-date"
                      value={editingItem.expire_date ? editingItem.expire_date.split('T')[0] : ''}
                      onChange={(e) => setEditingItem({...editingItem, expire_date: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null)
                      setShowEditForm(false)
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateItem}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Update Item
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Activity Log Modal */}
          {showActivityModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {activityLogs.length === 0 ? (
                    <p className="text-gray-900 text-center py-4">No activity logs yet</p>
                  ) : (
                    <div className="space-y-3">
                      {activityLogs.map((log, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.action === 'created' ? 'bg-green-100 text-green-800' :
                              log.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {log.action}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {log.user_email} {log.action} &quot;{log.item_name}&quot;
                            </p>
                            <p className="text-xs text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                            {log.changes && (
                              <div className="mt-1 text-xs text-gray-900">
                                <details>
                                  <summary className="cursor-pointer hover:text-gray-800">View changes</summary>
                                  <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-x-auto">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
