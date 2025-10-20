"use client"

import { useState, useEffect } from "react"
import type { Product, ProductFilters } from "@/types"
import { productsApi } from "@/lib/api-client"

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productsApi.getAll(filters)
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  return {
    products,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
  }
}
