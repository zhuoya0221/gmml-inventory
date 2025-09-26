'use client'

import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import { type InventoryItem } from '@/lib/supabase'

interface StatsCardsProps {
  items: InventoryItem[]
}

export default function StatsCards({ items }: StatsCardsProps) {
  const totalItems = items.length
  const inStockItems = items.filter(item => item.status === 'In Stock').length
  const lowStockItems = items.filter(item => item.status === 'Low Stock').length
  const outOfStockItems = items.filter(item => item.status === 'Out of Stock').length

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
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className={`${stat.bgColor} p-6 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.name}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
