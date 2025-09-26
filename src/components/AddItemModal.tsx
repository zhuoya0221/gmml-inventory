'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'

interface AddItemModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddItemModal({ onClose, onSuccess }: AddItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_stock: '',
    min_stock: '',
    storage_location: '',
    photo_url: ''
  })

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
        toast.error('You must be logged in to add items')
        return
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([
          {
            name: formData.name,
            category: formData.category,
            current_stock: parseInt(formData.current_stock) || 0,
            min_stock: parseInt(formData.min_stock) || 0,
            storage_location: formData.storage_location,
            photo_url: formData.photo_url || null,
            created_by: user.id,
            updated_by: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert([
          {
            item_id: data.id,
            user_id: user.id,
            user_email: user.email || '',
            action: 'created',
            item_name: formData.name,
            changes: {
              created: formData
            }
          }
        ])

      toast.success('Item added successfully')
      onSuccess()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
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
          <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
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
                  Adding...
                </div>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
