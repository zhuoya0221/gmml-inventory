'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import type { InventoryItem } from '@/lib/supabase'

interface EditItemModalProps {
  item: InventoryItem
  onClose: () => void
  onSuccess: () => void
}

export default function EditItemModal({ item, onClose, onSuccess }: EditItemModalProps) {
  const [formData, setFormData] = useState({ ...item })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updates = {
      name: formData.name,
      category: formData.category,
      current_stock: Number(formData.current_stock),
      min_stock: Number(formData.min_stock),
      storage_location: formData.storage_location,
      unit: formData.unit,
      expire_date: formData.expire_date || null
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_by: user.email })
        .eq('id', item.id)

      if (error) throw error

      toast.success('Item updated successfully!')
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      toast.error(`Failed to update item: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Edit Item: {item.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="current_stock" className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input type="number" name="current_stock" id="current_stock" value={formData.current_stock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700">Min Stock</label>
              <input type="number" name="min_stock" id="min_stock" value={formData.min_stock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="storage_location" className="block text-sm font-medium text-gray-700">Storage Location</label>
              <input type="text" name="storage_location" id="storage_location" value={formData.storage_location} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
              <input type="text" name="unit" id="unit" value={formData.unit || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="expire_date" className="block text-sm font-medium text-gray-700">Expire Date</label>
              <input type="date" name="expire_date" id="expire_date" value={formData.expire_date?.split('T')[0] || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
