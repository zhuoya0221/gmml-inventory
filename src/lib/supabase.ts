import { createClient, PostgrestError } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Re-export PostgrestError for convenience
export type { PostgrestError };

// Database Types
export interface InventoryItem {
  id: string
  name: string
  photo_url?: string
  category: string
  current_stock: number
  min_stock: number
  unit: string
  expire_date?: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired'
  date_updated: string
  storage_location: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface ActivityLog {
  id: string
  item_id: string
  user_id: string
  user_email: string
  action: 'created' | 'updated' | 'deleted'
  changes: Record<string, unknown>
  timestamp: string
  item_name: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  role: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  created_by: string
}

export interface Location {
  id: string
  name: string
  description?: string
  created_at: string
  created_by: string
}
