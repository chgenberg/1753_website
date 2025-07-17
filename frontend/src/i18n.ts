import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

export default getRequestConfig(async () => {
  // Get locale from headers or default to 'sv'
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  
  // Simple locale detection - default to 'sv' if not found
  let locale = 'sv'
  if (acceptLanguage) {
    if (acceptLanguage.includes('en')) {
      locale = 'en'
    } else if (acceptLanguage.includes('sv')) {
      locale = 'sv'
    }
  }
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
}) 