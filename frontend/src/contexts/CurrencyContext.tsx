'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Currency, getCurrencyByLocale, convertPrice, formatPrice } from '@/lib/currency'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertFromSEK: (priceInSEK: number) => number
  formatMoney: (price: number, inSEK?: boolean) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [currency, setCurrency] = useState<Currency>('SEK')

  // Update currency based on locale from URL
  useEffect(() => {
    const locale = pathname.split('/')[1] || 'sv'
    const newCurrency = getCurrencyByLocale(locale)
    setCurrency(newCurrency)
  }, [pathname])

  // Convert price from SEK to current currency
  const convertFromSEK = (priceInSEK: number): number => {
    return convertPrice(priceInSEK, currency)
  }

  // Format price in current currency
  const formatMoney = (price: number, inSEK = true): string => {
    const finalPrice = inSEK ? convertFromSEK(price) : price
    return formatPrice(finalPrice, currency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertFromSEK, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
} 