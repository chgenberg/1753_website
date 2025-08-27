'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'

const STORAGE_KEY = 'recentlyViewedProducts'
const MAX_RECENT_PRODUCTS = 10

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])

  // Load recently viewed products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const products = JSON.parse(stored)
        setRecentProducts(products)
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error)
    }
  }, [])

  // Add a product to recently viewed
  const addToRecentlyViewed = (product: Product) => {
    try {
      setRecentProducts(prev => {
        // Remove if already exists
        const filtered = prev.filter(p => p.id !== product.id)
        
        // Add to beginning
        const updated = [product, ...filtered].slice(0, MAX_RECENT_PRODUCTS)
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        
        return updated
      })
    } catch (error) {
      console.error('Error adding to recently viewed:', error)
    }
  }

  // Remove a product from recently viewed
  const removeFromRecentlyViewed = (productId: string) => {
    try {
      setRecentProducts(prev => {
        const updated = prev.filter(p => p.id !== productId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error removing from recently viewed:', error)
    }
  }

  // Clear all recently viewed products
  const clearRecentlyViewed = () => {
    try {
      setRecentProducts([])
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing recently viewed:', error)
    }
  }

  return {
    recentProducts,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed
  }
} 