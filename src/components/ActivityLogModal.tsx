'use client'

import { type ActivityLog, type UserProfile } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogModalProps {
  logs: ActivityLog[]
  userProfile: UserProfile | null
  onClose: () => void
  onDeleteLog?: (logId: string) => Promise<void>
}

export default function ActivityLogModal({ logs, userProfile, onClose, onDeleteLog }: ActivityLogModalProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800'
      case 'updated': return 'bg-blue-100 text-blue-800'
      case 'deleted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatChanges = (changes: Record<string, unknown>) => {
    // Format key names to be more readable
    const formatKey = (key: string) => {
      const keyMap: Record<string, string> = {
        'current_stock': 'Current Stock',
        'min_stock': 'Min Stock',
        'storage_location': 'Storage Location',
        'expire_date': 'Expire Date',
        'photo_url': 'Photo URL',
        'created_at': 'Created At',
        'updated_at': 'Updated At',
        'created_by': 'Created By',
        'updated_by': 'Updated By'
      }
      return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
    }

    // Format values to be more readable
    const formatValue = (value: unknown) => {
      if (value === null || value === undefined) return 'N/A'
      if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        // Format timestamps
        try {
          return new Date(value).toLocaleString()
        } catch {
          return value
        }
      }
      return String(value)
    }

    return Object.entries(changes)
      .filter(([key]) => !['id'].includes(key)) // Hide ID field as it's not user-friendly
      .map(([key, value]) => `${formatKey(key)}: ${formatValue(value)}`)
      .join(', ')
  }

  const handleDeleteLog = async (logId: string) => {
    if (!onDeleteLog) return
    
    if (confirm('Are you sure you want to delete this activity log entry? This action cannot be undone.')) {
      try {
        await onDeleteLog(logId)
      } catch (error) {
        console.error('Failed to delete log:', error)
      }
    }
  }

  const isAdmin = userProfile?.role === 'admin'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Activity Log</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activity to display.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">{log.user_email}</span> {log.action} item: <span className="font-semibold">{log.item_name}</span>
                      </p>
                      <p className="text-xs text-gray-500" title={new Date(log.timestamp).toLocaleString()}>
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </p>
                      {log.changes && (
                        <p className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border">
                          Changes: {formatChanges(log.changes)}
                        </p>
                      )}
                    </div>
                    {isAdmin && onDeleteLog && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Delete this log entry (Admin only)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
