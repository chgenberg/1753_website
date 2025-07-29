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
  setUserEmail: (email: string) => void
  setUserName: (name: string) => void
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
  const [userEmail, setUserEmailState] = useState<string>('')
  const [userName, setUserNameState] = useState<string>('')
  const [abandonedCartTimer, setAbandonedCartTimer] = useState<NodeJS.Timeout | null>(null)

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

    // Load user info from localStorage
    const savedEmail = localStorage.getItem('userEmail')
    const savedName = localStorage.getItem('userName')
    if (savedEmail) setUserEmailState(savedEmail)
    if (savedName) setUserNameState(savedName)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
    
    // Handle abandoned cart tracking
    if (items.length > 0 && userEmail) {
      // Clear existing timer
      if (abandonedCartTimer) {
        clearTimeout(abandonedCartTimer)
      }
      
      // Set new timer for 1 hour (3600000 ms)
      const timer = setTimeout(() => {
        triggerAbandonedCartWorkflow()
      }, 3600000) // 1 hour
      
      setAbandonedCartTimer(timer)
    } else if (abandonedCartTimer) {
      // Clear timer if cart is empty or no email
      clearTimeout(abandonedCartTimer)
      setAbandonedCartTimer(null)
    }

    return () => {
      if (abandonedCartTimer) {
        clearTimeout(abandonedCartTimer)
      }
    }
  }, [items, userEmail])

  const triggerAbandonedCartWorkflow = async () => {
    if (!userEmail || items.length === 0) return

    try {
      await fetch('/api/abandoned-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          userName: userName,
          cartItems: items.map(item => ({
            id: item.productId,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images?.[0] || ''
          })),
          cartTotal: total
        }),
      })
      
      console.log('Abandoned cart workflow triggered for:', userEmail)
    } catch (error) {
      console.error('Failed to trigger abandoned cart workflow:', error)
    }
  }

  const setUserEmail = (email: string) => {
    setUserEmailState(email)
    localStorage.setItem('userEmail', email)
  }

  const setUserName = (name: string) => {
    setUserNameState(name)
    localStorage.setItem('userName', name)
  }

  const addToCart = (product: Product, quantity: number = 1, variantId?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === product.id && item.variantId === variantId
      )

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
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
    // Clear abandoned cart timer when cart is cleared
    if (abandonedCartTimer) {
      clearTimeout(abandonedCartTimer)
      setAbandonedCartTimer(null)
    }
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
    total,
    setUserEmail,
    setUserName
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
} 