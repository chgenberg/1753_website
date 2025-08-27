// Currency configuration and utilities

export type Currency = 'SEK' | 'EUR'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  locale: string
  exchangeRate: number // Rate from SEK
}

// Currency configurations
export const currencies: Record<Currency, CurrencyConfig> = {
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Svenska kronor',
    locale: 'sv-SE',
    exchangeRate: 1
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.089 // 1 SEK = 0.089 EUR (example rate)
  }
}

// Map locales to currencies
export const localeToCurrency: Record<string, Currency> = {
  'sv': 'SEK',
  'en': 'EUR', // Default to EUR for non-Swedish locales in EU
  'de': 'EUR',
  'es': 'EUR',
  'fr': 'EUR'
}

// Get currency based on locale
export function getCurrencyByLocale(locale: string): Currency {
  // Extract language code from locale (e.g., 'sv' from 'sv-SE')
  const languageCode = locale.split('-')[0].toLowerCase()
  return localeToCurrency[languageCode] || 'EUR'
}

// Convert price from SEK to target currency
export function convertPrice(priceInSEK: number, targetCurrency: Currency): number {
  const currency = currencies[targetCurrency]
  const convertedPrice = priceInSEK * currency.exchangeRate
  
  // Round to 2 decimal places for EUR, whole numbers for SEK
  if (targetCurrency === 'SEK') {
    return Math.round(convertedPrice)
  }
  return Math.round(convertedPrice * 100) / 100
}

// Format price with currency
export function formatPrice(price: number, currency: Currency, locale?: string): string {
  const config = currencies[currency]
  const formatter = new Intl.NumberFormat(locale || config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'SEK' ? 0 : 2,
    maximumFractionDigits: currency === 'SEK' ? 0 : 2
  })
  
  return formatter.format(price)
}

// Get currency symbol
export function getCurrencySymbol(currency: Currency): string {
  return currencies[currency].symbol
}

// Check if price should show decimals
export function shouldShowDecimals(currency: Currency): boolean {
  return currency !== 'SEK'
} 