import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const supported = ['sv', 'en', 'es', 'de', 'fr'] as const
  const active = (supported as readonly string[]).includes(locale) ? locale : 'sv'
  return {
    locale: active,
    messages: (await import(`../messages/${active}.json`)).default
  }
}) 