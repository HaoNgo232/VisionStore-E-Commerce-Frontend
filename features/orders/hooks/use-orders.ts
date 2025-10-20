"use client"

import { useState, useEffect } from "react"
import type { Order } from "@/types"
import { ordersApi } from "@/lib/api-client"

export function useOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ordersApi.getAll(userId)
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  return {
    orders,
    loading,
    error,
  }
}
