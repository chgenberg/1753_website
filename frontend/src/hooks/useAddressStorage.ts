'use client'

import { useState, useEffect } from 'react'

export interface SavedAddress {
  id: string
  label: string
  firstName: string
  lastName: string
  address: string
  apartment?: string
  city: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface ShippingPreferences {
  preferredShippingMethod?: string
  deliveryInstructions?: string
  newsletter?: boolean
}

const ADDRESSES_KEY = 'savedAddresses'
const PREFERENCES_KEY = 'shippingPreferences'

export function useAddressStorage() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [shippingPreferences, setShippingPreferences] = useState<ShippingPreferences>({})

  // Load saved data on mount
  useEffect(() => {
    try {
      const addresses = localStorage.getItem(ADDRESSES_KEY)
      if (addresses) {
        setSavedAddresses(JSON.parse(addresses))
      }

      const preferences = localStorage.getItem(PREFERENCES_KEY)
      if (preferences) {
        setShippingPreferences(JSON.parse(preferences))
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error)
    }
  }, [])

  // Save address
  const saveAddress = (address: Omit<SavedAddress, 'id'>) => {
    try {
      const newAddress: SavedAddress = {
        ...address,
        id: Date.now().toString()
      }

      setSavedAddresses(prev => {
        let updated = [...prev]

        // If this is set as default, remove default from others
        if (newAddress.isDefault) {
          updated = updated.map(addr => ({ ...addr, isDefault: false }))
        }

        // If this is the first address, make it default
        if (updated.length === 0) {
          newAddress.isDefault = true
        }

        updated.push(newAddress)
        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated))
        return updated
      })

      return newAddress.id
    } catch (error) {
      console.error('Error saving address:', error)
      return null
    }
  }

  // Update address
  const updateAddress = (id: string, updates: Partial<SavedAddress>) => {
    try {
      setSavedAddresses(prev => {
        let updated = prev.map(addr => 
          addr.id === id ? { ...addr, ...updates } : addr
        )

        // If setting as default, remove default from others
        if (updates.isDefault) {
          updated = updated.map(addr => 
            addr.id === id ? addr : { ...addr, isDefault: false }
          )
        }

        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  // Delete address
  const deleteAddress = (id: string) => {
    try {
      setSavedAddresses(prev => {
        const updated = prev.filter(addr => addr.id !== id)
        
        // If we deleted the default address, make the first one default
        if (updated.length > 0 && !updated.some(addr => addr.isDefault)) {
          updated[0].isDefault = true
        }

        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  // Get default address
  const getDefaultAddress = (): SavedAddress | null => {
    return savedAddresses.find(addr => addr.isDefault) || savedAddresses[0] || null
  }

  // Save shipping preferences
  const saveShippingPreferences = (preferences: ShippingPreferences) => {
    try {
      setShippingPreferences(prev => {
        const updated = { ...prev, ...preferences }
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error saving shipping preferences:', error)
    }
  }

  // Auto-fill form with saved address
  const fillFormWithAddress = (addressId: string) => {
    const address = savedAddresses.find(addr => addr.id === addressId)
    if (!address) return null

    return {
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      apartment: address.apartment || '',
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || ''
    }
  }

  return {
    savedAddresses,
    shippingPreferences,
    saveAddress,
    updateAddress,
    deleteAddress,
    getDefaultAddress,
    saveShippingPreferences,
    fillFormWithAddress
  }
} 