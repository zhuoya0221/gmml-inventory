'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function InventoryDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
  
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchActivityLogs()
    }
  }, [user])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, categoryFilter, locationFilter, statusFilter])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
      
      // Extract unique categories and locations
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
      const uniqueLocations = [...new Set(data?.map(item => item.storage_location) || [])]
      setCategories(uniqueCategories)
      setLocations(uniqueLocations)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch inventory items')
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      router.push('/login')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Item deleted successfully')
      fetchItems()
      fetchActivityLogs()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Name', 'Category', 'Current Stock', 'Min Stock', 
      'Status', 'Storage Location', 'Date Updated'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        `"${item.name}"`,
        `"${item.category}"`,
        item.current_stock,
        item.min_stock,
        `"${item.status}"`,
        `"${item.storage_location}"`,
        `"${new Date(item.updated_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Inventory exported to CSV')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-indigo-600" />
                GMML Inventory
              </h1>
              <p className="text-gray-600 mt-1">Manage your team's inventory and track changes</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowActivityModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <History className="h-4 w-4" />
                Activity Log
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        <StatsCards items={items} />

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search items..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <InventoryTable 
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchItems()
            fetchActivityLogs()
          }}
        />
      )}

      {showEditModal && editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => {
            setShowEditModal(false)
            setEditingItem(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingItem(null)
            fetchItems()
            fetchActivityLogs()
          }}
        />
      )}

      {showActivityModal && (
        <ActivityLogModal
          logs={activityLogs}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </div>
  )
}
