'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addToCart: (product: Product, quantity?: number, variantId?: string) => void
  removeFromCart: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  cartCount: number
  subtotal: number
  shipping: number
  tax: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity: number = 1, variantId?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === product.id && item.variantId === variantId
      )

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        // Removed toast notification - cart drawer provides feedback
        return updatedItems
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product.id,
          variantId,
          quantity,
          price: product.price,
          product: {
            id: product.id,
            name: product.name,
            images: product.images,
            slug: product.slug
          }
        }
        // Removed toast notification - cart drawer provides feedback
        return [...prevItems, newItem]
      }
    })
    setIsOpen(true)
  }

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems(prevItems => {
      const filteredItems = prevItems.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      )
      // Removed toast notification
      return filteredItems
    })
  }

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId)
      return
    }

    setItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity }
        }
        return item
      })
      return updatedItems
    })
  }

  const clearCart = () => {
    setItems([])
    // Removed toast notification
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen(prev => !prev)

  // Calculate totals
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 500 ? 0 : 59 // Free shipping over 500kr
  const tax = subtotal * 0.25 // 25% VAT
  const total = subtotal + shipping

  const value: CartContextType = {
    items,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    cartCount,
    subtotal,
    shipping,
    tax,
    total
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
} 