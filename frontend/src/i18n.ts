import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Use the locale from the URL params, default to 'sv' if not provided
  const resolvedLocale = locale || 'sv'
  
  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  }
}) 