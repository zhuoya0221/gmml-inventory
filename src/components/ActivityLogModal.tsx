'use client'

import { X, Plus, Edit, Trash2 } from 'lucide-react'
import { type ActivityLog } from '@/lib/supabase'
import { format } from 'date-fns'

interface ActivityLogModalProps {
  logs: ActivityLog[]
  onClose: () => void
}

export default function ActivityLogModal({ logs, onClose }: ActivityLogModalProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800'
      case 'updated':
        return 'bg-blue-100 text-blue-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatChanges = (changes: Record<string, any>) => {
    if (!changes) return ''
    
    if (changes.created) {
      return 'Item created'
    }
    
    const changeItems = Object.entries(changes).map(([key, value]) => {
      if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
        return `${key}: "${value.from}" → "${value.to}"`
      }
      return `${key}: ${JSON.stringify(value)}`
    })
    
    return changeItems.join(', ')
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No activity logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {log.item_name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          by {log.user_email}
                        </p>
                        {log.changes && (
                          <div className="text-sm text-gray-500">
                            {formatChanges(log.changes)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
