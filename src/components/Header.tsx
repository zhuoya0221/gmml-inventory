'use client'

import { type User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User | null
  onSignOut: () => void
}

export default function Header({ user, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* You can add a logo here if you want */}
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={onSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
