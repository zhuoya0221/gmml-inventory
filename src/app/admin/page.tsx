'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import type { UserProfile, Category, Location } from '@/lib/supabase'
import { getRouterPath } from '@/lib/config'
import type { User } from '@supabase/supabase-js'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'locations'>('users')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | Location | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push(getRouterPath('/team-dashboard'))
        return
      }
      setUser(user)

      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !userProfile) {
        toast.error('Could not fetch your user profile.')
        router.push(getRouterPath('/team-dashboard'))
        return
      }

      setProfile(userProfile)

      if (userProfile.role !== 'admin') {
        toast.error("You don't have permission to view this page.")
        router.push(getRouterPath('/team-dashboard'))
        return
      }

      // If we've reached here, user is an admin.
      await Promise.all([
        fetchAllUsers(),
        fetchCategories(),
        fetchLocations()
      ])
      setLoading(false)
    }

    fetchUserAndProfile()
  }, [router])

  const fetchAllUsers = async () => {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email', { ascending: true })

    if (error) {
      toast.error('Failed to fetch user list.')
    } else {
      setAllUsers(users || [])
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.functions.invoke('manage-categories?action=list')

    if (error) {
      toast.error('Failed to fetch categories.')
    } else {
      setCategories(data.data || [])
    }
  }

  const fetchLocations = async () => {
    const { data, error } = await supabase.functions.invoke('manage-locations?action=list')

    if (error) {
      toast.error('Failed to fetch locations.')
    } else {
      setLocations(data.data || [])
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === user?.id && newRole !== 'admin') {
      toast.error("You cannot remove your own admin status.")
      return
    }

    const { error } = await supabase.functions.invoke('set-user-role', {
      body: { userId, role: newRole },
    })
    
    if (error) {
      toast.error(`Failed to update role: ${error.message}`)
    } else {
      toast.success('User role updated successfully!')
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
  }

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error('Name is required')
      return
    }

    const endpoint = activeTab === 'categories' ? 'manage-categories?action=create' : 'manage-locations?action=create'
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: { 
        name: newItemName.trim(), 
        description: newItemDescription.trim() || null 
      }
    })

    if (error) {
      toast.error(`Failed to add ${activeTab.slice(0, -1)}: ${error.message}`)
    } else {
      toast.success(`${activeTab.slice(0, -1)} added successfully!`)
      if (activeTab === 'categories') {
        setCategories([...categories, data.data])
      } else {
        setLocations([...locations, data.data])
      }
      setShowAddModal(false)
      setNewItemName('')
      setNewItemDescription('')
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !newItemName.trim()) {
      toast.error('Name is required')
      return
    }

    const endpoint = activeTab === 'categories' ? 'manage-categories?action=update' : 'manage-locations?action=update'
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: { 
        id: editingItem.id,
        name: newItemName.trim(), 
        description: newItemDescription.trim() || null 
      }
    })

    if (error) {
      toast.error(`Failed to update ${activeTab.slice(0, -1)}: ${error.message}`)
    } else {
      toast.success(`${activeTab.slice(0, -1)} updated successfully!`)
      if (activeTab === 'categories') {
        setCategories(categories.map(c => c.id === editingItem.id ? data.data : c))
      } else {
        setLocations(locations.map(l => l.id === editingItem.id ? data.data : l))
      }
      setEditingItem(null)
      setNewItemName('')
      setNewItemDescription('')
    }
  }

  const handleDeleteItem = async (item: Category | Location) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return
    }

    const endpoint = activeTab === 'categories' ? 'manage-categories?action=delete' : 'manage-locations?action=delete'
    const { error } = await supabase.functions.invoke(endpoint, {
      body: { id: item.id }
    })

    if (error) {
      toast.error(`Failed to delete ${activeTab.slice(0, -1)}: ${error.message}`)
    } else {
      toast.success(`${activeTab.slice(0, -1)} deleted successfully!`)
      if (activeTab === 'categories') {
        setCategories(categories.filter(c => c.id !== item.id))
      } else {
        setLocations(locations.filter(l => l.id !== item.id))
      }
    }
  }

  const openAddModal = () => {
    setShowAddModal(true)
    setNewItemName('')
    setNewItemDescription('')
  }

  const openEditModal = (item: Category | Location) => {
    setEditingItem(item)
    setNewItemName(item.name)
    setNewItemDescription(item.description || '')
  }

  const closeModals = () => {
    setShowAddModal(false)
    setEditingItem(null)
    setNewItemName('')
    setNewItemDescription('')
  }

  if (loading || !profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading Admin Dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button onClick={() => router.push(getRouterPath('/team-dashboard'))} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'users', name: 'User Management' },
                { id: 'categories', name: 'Categories' },
                { id: 'locations', name: 'Locations' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user?.id}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                          >
                            <option value="admin">admin</option>
                            <option value="member">member</option>
                            <option value="user">user</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'categories' || activeTab === 'locations') && (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add {activeTab.slice(0, -1)}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(activeTab === 'categories' ? categories : locations).map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Enter ${activeTab.slice(0, -1)} name`}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Enter ${activeTab.slice(0, -1)} description`}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleEditItem : handleAddItem}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}