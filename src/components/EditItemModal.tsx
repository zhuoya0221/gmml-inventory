'use client'

import { useState, useEffect } from 'react'
import { supabase, type InventoryItem } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'

interface EditItemModalProps {
  item: InventoryItem
  onClose: () => void
  onSuccess: () => void
}

export default function EditItemModal({ item, onClose, onSuccess }: EditItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_stock: '',
    min_stock: '',
    storage_location: '',
    photo_url: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        current_stock: item.current_stock.toString(),
        min_stock: item.min_stock.toString(),
        storage_location: item.storage_location,
        photo_url: item.photo_url || ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.storage_location) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to edit items')
        return
      }

      // Create a changes object for logging
      const changes: Record<string, any> = {}
      const newData = {
        name: formData.name,
        category: formData.category,
        current_stock: parseInt(formData.current_stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        storage_location: formData.storage_location,
        photo_url: formData.photo_url || null,
        updated_by: user.id
      }

      // Track what changed
      if (item.name !== newData.name) changes.name = { from: item.name, to: newData.name }
      if (item.category !== newData.category) changes.category = { from: item.category, to: newData.category }
      if (item.current_stock !== newData.current_stock) changes.current_stock = { from: item.current_stock, to: newData.current_stock }
      if (item.min_stock !== newData.min_stock) changes.min_stock = { from: item.min_stock, to: newData.min_stock }
      if (item.storage_location !== newData.storage_location) changes.storage_location = { from: item.storage_location, to: newData.storage_location }
      if (item.photo_url !== newData.photo_url) changes.photo_url = { from: item.photo_url, to: newData.photo_url }

      const { error } = await supabase
        .from('inventory_items')
        .update(newData)
        .eq('id', item.id)

      if (error) throw error

      // Log the activity if there were changes
      if (Object.keys(changes).length > 0) {
        await supabase
          .from('activity_logs')
          .insert([
            {
              item_id: item.id,
              user_id: user.id,
              user_email: user.email || '',
              action: 'updated',
              item_name: formData.name,
              changes
            }
          ])
      }

      toast.success('Item updated successfully')
      onSuccess()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter item name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Furniture">Furniture</option>
              <option value="Equipment">Equipment</option>
              <option value="Software">Software</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Location *
            </label>
            <input
              type="text"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Warehouse A, Office Storage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL (optional)
            </label>
            <input
              type="url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                'Update Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
