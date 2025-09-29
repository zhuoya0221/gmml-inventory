'use client'


import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import type { InventoryItem, UserProfile, ActivityLog, Category, Location } from '@/lib/supabase'
import { getFullPath, getRouterPath } from '@/lib/config'
import type { User } from '@supabase/supabase-js'
import ActivityLogModal from '@/components/ActivityLogModal'

export default function FinalTeamDashboard() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState('Initializing...')
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
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
  const [dataLoaded, setDataLoaded] = useState(false)

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

  const fetchCategories = async () => {
    try {
      // Try direct database query first (faster than Edge Functions)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (!error && data) {
        setCategories(data)
        return
      }
      
      // Fallback to Edge Function if direct query fails
      const { data: functionData, error: functionError } = await supabase.functions.invoke('manage-categories?action=list')
      if (!functionError && functionData?.data) {
        setCategories(functionData.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      // Try direct database query first (faster than Edge Functions)
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')

      if (!error && data) {
        setLocations(data)
        return
      }
      
      // Fallback to Edge Function if direct query fails
      const { data: functionData, error: functionError } = await supabase.functions.invoke('manage-locations?action=list')
      if (!functionError && functionData?.data) {
        setLocations(functionData.data)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    setLoadingStage('Checking authentication...')
    
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

      setLoadingStage('Loading user profile...')
      
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

      setLoadingStage('Loading inventory data...');

      // Fetch all data in parallel for maximum speed
      const [inventoryResult, logsResult, categoriesResult, locationsResult] = await Promise.all([
        supabase
          .from('inventory_items')
          .select('*')
          .order('name', { ascending: true }),
        supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
          .limit(50),
        supabase
          .from('categories')
          .select('*')
          .order('name'),
        supabase
          .from('locations')
          .select('*')
          .order('name')
      ])

      // Process results
      if (inventoryResult.error) {
        throw inventoryResult.error
      }
      setItems(inventoryResult.data || [])
      setFilteredItems(inventoryResult.data || [])

      if (!logsResult.error) {
        setActivityLogs(logsResult.data || [])
      }

      // Set categories and locations (with fallback if tables don't exist yet)
      if (!categoriesResult.error && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        // Fallback to Edge Function if direct query fails
        fetchCategories()
      }

      if (!locationsResult.error && locationsResult.data) {
        setLocations(locationsResult.data)
      } else {
        // Fallback to Edge Function if direct query fails
        fetchLocations()
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      toast.error(`Error fetching data: ${errorMessage}`)
      console.error("Data fetch error:", error)
    } finally {
      setLoading(false)
      setDataLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!dataLoaded) {
      fetchInitialData()
  }
  }, [dataLoaded, fetchInitialData])

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

  const handleDeleteActivityLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        throw error
      }

      // Remove the log from the local state
      setActivityLogs(activityLogs.filter(log => log.id !== logId))
      toast.success('Activity log deleted successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete activity log"
      toast.error(`Error: ${errorMessage}`)
      console.error("Delete activity log error:", error)
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

    // Get the complete item information before deletion
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) {
      toast.error("Item not found");
      return;
    }

    // Prepare complete item data for activity log
    const deletedItemData = {
      id: itemToDelete.id,
      name: itemToDelete.name,
      category: itemToDelete.category,
      current_stock: itemToDelete.current_stock,
      min_stock: itemToDelete.min_stock,
      status: itemToDelete.status,
      storage_location: itemToDelete.storage_location,
      unit: itemToDelete.unit,
      expire_date: itemToDelete.expire_date,
      photo_url: itemToDelete.photo_url,
      created_at: itemToDelete.created_at,
      updated_at: itemToDelete.updated_at,
      created_by: itemToDelete.created_by,
      updated_by: itemToDelete.updated_by
    };

    // Log the activity BEFORE deleting the item to avoid foreign key constraint issues
    await logActivity(itemId, itemName, 'deleted', deletedItemData);

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error(`Error deleting item: ${error.message}`);
    } else {
      const updatedItems = items.filter(i => i.id !== itemId);
      setItems(updatedItems);
      setFilteredItems(updatedItems);
      toast.success(`"${itemName}" has been deleted.`);
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
    
    // Handle both local development and GitHub Pages deployment
    window.location.href = getFullPath('/');
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
  
  // Stats should be based on category and location filters, but not status filter
  const baseFilteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesLocation = !filters.location || item.storage_location === filters.location;
    // Don't include status filter for stats calculation
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const totalItems = baseFilteredItems.length;
  const inStockCount = baseFilteredItems.filter(i => i.status === 'In Stock').length;
  const lowStockCount = baseFilteredItems.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = baseFilteredItems.filter(i => i.status === 'Out of Stock').length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-700">{loadingStage}</p>
          <p className="text-sm text-gray-500 mt-2">This usually takes just a few seconds...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8 sm:py-6">
            {/* Mobile-optimized header layout */}
            <div className="flex items-center justify-between">
              {/* Logo and title */}
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-lg">G</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    <span className="sm:hidden">GMML Inventory</span>
                    <span className="hidden sm:inline">GMML Inventory System</span>
                  </h1>
                </div>
              </div>
              
              {/* User actions */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Admin Panel - responsive display */}
                {userProfile?.role === 'admin' && (
                  <button 
                    onClick={() => router.push(getRouterPath('/admin'))} 
                    className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50"
                  >
                    Admin Panel
                  </button>
                )}
                
                {/* User email - responsive display */}
                <span className="hidden sm:inline text-sm text-gray-600 max-w-32 lg:max-w-none truncate">
                  {user?.email || "Team Mode"}
                </span>
                
                {/* Login/Logout button */}
                {user && user.id ? (
                  <button 
                    onClick={handleLogout} 
                    className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={handleLogin} 
                    className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50"
                  >
                    <span className="sm:hidden">Login</span>
                    <span className="hidden sm:inline">Login with Google</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile user info row */}
            <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-gray-600">
              <span className="truncate flex-1">{user?.email || "Team Mode"}</span>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => router.push(getRouterPath('/admin'))} 
                  className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 px-6 sm:px-6 lg:px-8">
          {/* Stats - Single Card */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {/* Total Items - Clickable */}
              <button 
                onClick={() => setFilters({...filters, status: ''})}
                className={`flex items-center gap-2 lg:gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 ${filters.status === '' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Items</p>
                  <p className="text-lg lg:text-2xl font-bold text-blue-700">{totalItems}</p>
                </div>
              </button>
              
              {/* In Stock - Clickable */}
              <button 
                onClick={() => setFilters({...filters, status: 'In Stock'})}
                className={`flex items-center gap-2 lg:gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 ${filters.status === 'In Stock' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">In Stock</p>
                  <p className="text-lg lg:text-2xl font-bold text-green-700">{inStockCount}</p>
                </div>
              </button>
              
              {/* Low Stock - Clickable */}
              <button 
                onClick={() => setFilters({...filters, status: 'Low Stock'})}
                className={`flex items-center gap-2 lg:gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 ${filters.status === 'Low Stock' ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''}`}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Low Stock</p>
                  <p className="text-lg lg:text-2xl font-bold text-yellow-700">{lowStockCount}</p>
                </div>
              </button>
              
              {/* Out of Stock - Clickable */}
              <button 
                onClick={() => setFilters({...filters, status: 'Out of Stock'})}
                className={`flex items-center gap-2 lg:gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 ${filters.status === 'Out of Stock' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Out of Stock</p>
                  <p className="text-lg lg:text-2xl font-bold text-red-700">{outOfStockCount}</p>
                </div>
              </button>
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
                  <div className="relative">
                  <select
                    id="filter-category"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                  <select
                    id="filter-location"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                  </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="relative">
                  <select
                    id="filter-status"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-3 py-4 sm:px-6 border-b border-gray-200">
              {/* Mobile-optimized header */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                {/* Title and count */}
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Inventory Items</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Showing {filteredItems.length} of {items.length} items</p>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                  {/* Primary action - Add Item */}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={!user || !user.id}
                    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto ${
                      !user || !user.id || userProfile?.role === 'user'
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="sm:hidden">{!user || !user.id ? 'Login to Add' : 'Add Item'}</span>
                    <span className="hidden sm:inline">{!user || !user.id ? 'Login to Add Items' : 'Add Item'}</span>
                  </button>
                  
                  {/* Secondary actions */}
                  <div className="flex space-x-2 sm:space-x-3">
                  <button
                      onClick={() => setShowActivityModal(true)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1 sm:flex-none"
                  >
                      <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                      <span className="hidden sm:inline">Activity Log</span>
                  </button>
                  <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1 sm:flex-none"
                    >
                      <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                      <span className="hidden sm:inline">Export CSV</span>
                  </button>
                  </div>
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
                    <div className="relative mt-1">
                    <select
                      id="item-category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="storage-location" className="block text-sm font-medium text-gray-700">
                      Storage Location *
                    </label>
                    <div className="relative mt-1">
                      <select
                        id="storage-location"
                        value={newItem.storage_location}
                        onChange={(e) => setNewItem({...newItem, storage_location: e.target.value})}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="">Select location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="current-stock" className="block text-sm font-medium text-gray-700">
                      Current Stock
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setNewItem({...newItem, current_stock: Math.max(0, newItem.current_stock - 1)})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      id="current-stock"
                      value={newItem.current_stock}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setNewItem({...newItem, current_stock: parseInt(value) || 0});
                        }}
                        className="block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setNewItem({...newItem, current_stock: newItem.current_stock + 1})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="min-stock" className="block text-sm font-medium text-gray-700">
                      Min Stock
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setNewItem({...newItem, min_stock: Math.max(0, newItem.min_stock - 1)})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      id="min-stock"
                      value={newItem.min_stock}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setNewItem({...newItem, min_stock: parseInt(value) || 0});
                        }}
                        className="block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setNewItem({...newItem, min_stock: newItem.min_stock + 1})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
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
                    <div className="relative mt-1">
                    <select
                      id="edit-item-category"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-storage-location" className="block text-sm font-medium text-gray-700">
                      Storage Location *
                    </label>
                    <div className="relative mt-1">
                      <select
                        id="edit-storage-location"
                        value={editingItem.storage_location}
                        onChange={(e) => setEditingItem({...editingItem, storage_location: e.target.value})}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="">Select location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-current-stock" className="block text-sm font-medium text-gray-700">
                      Current Stock
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setEditingItem({...editingItem, current_stock: Math.max(0, editingItem.current_stock - 1)})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      id="edit-current-stock"
                      value={editingItem.current_stock}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setEditingItem({...editingItem, current_stock: parseInt(value) || 0});
                        }}
                        className="block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingItem({...editingItem, current_stock: editingItem.current_stock + 1})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-min-stock" className="block text-sm font-medium text-gray-700">
                      Min Stock
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setEditingItem({...editingItem, min_stock: Math.max(0, editingItem.min_stock - 1)})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      id="edit-min-stock"
                      value={editingItem.min_stock}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setEditingItem({...editingItem, min_stock: parseInt(value) || 0});
                        }}
                        className="block w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingItem({...editingItem, min_stock: editingItem.min_stock + 1})}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
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
            <ActivityLogModal
              logs={activityLogs}
              userProfile={userProfile}
              onClose={() => setShowActivityModal(false)}
              onDeleteLog={handleDeleteActivityLog}
            />
          )}
        </main>
      </div>
    </>
  )
}
