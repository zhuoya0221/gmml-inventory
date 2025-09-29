'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import type { UserProfile } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/team-dashboard') // Redirect home if not logged in
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
        router.push('/team-dashboard') // Redirect to dashboard
        return
      }

      setProfile(userProfile)

      if (userProfile.role !== 'admin') {
        toast.error("You don't have permission to view this page.")
        router.push('/team-dashboard') // Redirect non-admins
        return
      }

      // If we've reached here, user is an admin.
      fetchAllUsers()
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent admin from accidentally removing their own admin status
    if (userId === user?.id && newRole !== 'admin') {
      toast.error("You cannot remove your own admin status.")
      return
    }

    // Call the Supabase Edge Function
    const { error } = await supabase.functions.invoke('set-user-role', {
      body: { userId, role: newRole },
    })
    
    if (error) {
      toast.error(`Failed to update role: ${error.message}`)
    } else {
      toast.success('User role updated successfully!')
      // Refresh the user list
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Admin - User Management</h1>
              <button onClick={() => router.push('/team-dashboard')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
          </div>
        </main>
      </div>
    </>
  )
}
