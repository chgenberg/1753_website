export type Currency = 'SEK' | 'EUR'

const exchangeRates: Record<Currency, number> = {
  SEK: 1,
  EUR: 0.089
}

export function convertFromSEK(amountSEK: number, target: Currency): number {
  const rate = exchangeRates[target] ?? 1
  const converted = amountSEK * rate
  if (target === 'SEK') {
    return Math.round(converted)
  }
  return Math.round(converted * 100) / 100
} 