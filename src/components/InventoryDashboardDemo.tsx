'use client'

import { useEffect, useState } from 'react'
import { supabase, type InventoryItem, type ActivityLog } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  LogOut, 
  User,
  BarChart3,
  History,
  Loader2 
} from 'lucide-react'
import InventoryTable from './InventoryTable'
import AddItemModal from './AddItemModal'
import EditItemModal from './EditItemModal'
import ActivityLogModal from './ActivityLogModal'
import Header from './Header'
import StatsCards from './StatsCards'

interface InventoryDashboardDemoProps {
  user?: any
}

export default function InventoryDashboardDemo({ user }: InventoryDashboardDemoProps) {
  console.log('📊 InventoryDashboardDemo component loaded!')
  const [loading, setLoading] = useState(false) // Start with false since we have demo user
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchActivityLogs()
    }
  }, [user])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, categoryFilter, locationFilter, statusFilter])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        // If database fetch fails, show demo data
        console.log('Database fetch failed, showing demo data')
        const demoItems: InventoryItem[] = [
          {
            id: 'demo-1',
            name: 'Demo Laptop',
            photo_url: null,
            category: 'Electronics',
            current_stock: 5,
            min_stock: 2,
            status: 'In Stock',
            date_updated: new Date().toISOString(),
            storage_location: 'Office A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || 'demo-user',
            updated_by: user?.id || 'demo-user'
          },
          {
            id: 'demo-2',
            name: 'Demo Mouse',
            photo_url: null,
            category: 'Electronics',
            current_stock: 1,
            min_stock: 3,
            status: 'Low Stock',
            date_updated: new Date().toISOString(),
            storage_location: 'Office B',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || 'demo-user',
            updated_by: user?.id || 'demo-user'
          }
        ]
        setItems(demoItems)
        setCategories(['Electronics'])
        setLocations(['Office A', 'Office B'])
        return
      }

      setItems(data || [])
      
      // Extract unique categories and locations
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
      const uniqueLocations = [...new Set(data?.map(item => item.storage_location) || [])]
      setCategories(uniqueCategories)
      setLocations(uniqueLocations)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch inventory items - showing demo data')
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) {
        console.log('Activity logs fetch failed')
        return
      }
      setActivityLogs(data || [])
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    }
  }

  const filterItems = () => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (locationFilter) {
      filtered = filtered.filter(item => item.storage_location === locationFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredItems(filtered)
  }

  const updateItemStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return 'Out of Stock'
    } else if (item.current_stock <= item.min_stock) {
      return 'Low Stock'
    } else {
      return 'In Stock'
    }
  }

  const addItem = async (newItem: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const itemWithStatus = {
        ...newItem,
        status: updateItemStatus(newItem as InventoryItem),
        created_by: user?.id || 'demo-user',
        updated_by: user?.id || 'demo-user'
      }

      // Try to add to database
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemWithStatus])
        .select()
        .single()

      if (error) {
        // If database insert fails, add to demo data
        const demoItem: InventoryItem = {
          ...itemWithStatus,
          id: 'demo-' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as InventoryItem
        
        setItems(prev => [demoItem, ...prev])
        toast.success('Item added to demo data')
        return
      }

      setItems(prev => [data, ...prev])
      toast.success('Item added successfully')

      // Log activity
      await supabase.from('activity_logs').insert([{
        item_id: data.id,
        item_name: data.name,
        user_id: user?.id || 'demo-user',
        user_email: user?.email || 'demo@gmml.com',
        action: 'created',
        changes: newItem,
        timestamp: new Date().toISOString()
      }])

      fetchActivityLogs()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const updateItem = async (updatedItem: InventoryItem) => {
    try {
      const itemWithStatus = {
        ...updatedItem,
        status: updateItemStatus(updatedItem),
        updated_by: user?.id || 'demo-user',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('inventory_items')
        .update(itemWithStatus)
        .eq('id', updatedItem.id)

      if (error) {
        // Update demo data
        setItems(prev => prev.map(item => 
          item.id === updatedItem.id ? itemWithStatus : item
        ))
        toast.success('Item updated in demo data')
        return
      }

      setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? itemWithStatus : item
      ))
      toast.success('Item updated successfully')

      // Log activity
      await supabase.from('activity_logs').insert([{
        item_id: updatedItem.id,
        item_name: updatedItem.name,
        user_id: user?.id || 'demo-user',
        user_email: user?.email || 'demo@gmml.com',
        action: 'updated',
        changes: updatedItem,
        timestamp: new Date().toISOString()
      }])

      fetchActivityLogs()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) {
        // Delete from demo data
        setItems(prev => prev.filter(item => item.id !== id))
        toast.success('Item deleted from demo data')
        return
      }

      setItems(prev => prev.filter(item => item.id !== id))
      toast.success('Item deleted successfully')
      fetchActivityLogs()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Current Stock', 'Min Stock', 'Status', 'Storage Location', 'Date Updated']
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.name,
        item.category,
        item.current_stock,
        item.min_stock,
        item.status,
        item.storage_location,
        new Date(item.date_updated).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Inventory exported to CSV')
  }

  const handleSignOut = () => {
    // For demo, just reload the page
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalItems = items.length
  const inStockItems = items.filter(item => item.status === 'In Stock').length
  const lowStockItems = items.filter(item => item.status === 'Low Stock').length
  const outOfStockItems = items.filter(item => item.status === 'Out of Stock').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center text-3xl font-bold text-gray-900 mb-2">
            <Package className="h-8 w-8 mr-3 text-indigo-600" />
            GMML Inventory Dashboard
          </h1>
          <p className="text-gray-600">
            {user?.email?.includes('demo') ? 
              'Demo mode - authentication in progress' : 
              'Manage your team\'s inventory efficiently'
            }
          </p>
        </div>

        <StatsCards 
          totalItems={totalItems}
          inStockItems={inStockItems}
          lowStockItems={lowStockItems}
          outOfStockItems={outOfStockItems}
        />

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Inventory Items</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <History className="h-4 w-4 mr-2" />
                  Activity Log
                </button>
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <InventoryTable 
            items={filteredItems}
            onEdit={(item) => {
              setEditingItem(item)
              setShowEditModal(true)
            }}
            onDelete={deleteItem}
          />
        </div>
      </main>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
        categories={categories}
        locations={locations}
      />

      <EditItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={updateItem}
        item={editingItem}
        categories={categories}
        locations={locations}
      />

      <ActivityLogModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        logs={activityLogs}
      />
    </div>
  )
}
