'use client'

import { Package, TrendingUp, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { type InventoryItem } from '@/lib/supabase'

interface StatsCardsProps {
  items: InventoryItem[]
}

export default function StatsCards({ items }: StatsCardsProps) {
  const totalItems = items.length
  const inStockItems = items.filter(item => item.status === 'In Stock').length
  const lowStockItems = items.filter(item => item.status === 'Low Stock').length
  const outOfStockItems = items.filter(item => item.status === 'Out of Stock').length
  const expiredItems = items.filter(item => item.status === 'Expired').length

  const stats = [
    {
      name: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'In Stock',
      value: inStockItems,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'Low Stock',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      name: 'Out of Stock',
      value: outOfStockItems,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      name: 'Expired',
      value: expiredItems,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ]

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="text-center">
              <div className={`${stat.color} p-3 rounded-lg mx-auto mb-2 w-fit`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.name}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
