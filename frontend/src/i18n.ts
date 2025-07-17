import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Hardcode to Swedish to avoid header issues in development
  // The locale will be handled by the middleware and URL structure
  const locale = 'sv'
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
}) 