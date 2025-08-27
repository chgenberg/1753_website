import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const supported = ['sv', 'en', 'es', 'de', 'fr'] as const
  const active = (supported as readonly string[]).includes(requested || '') ? (requested as string) : 'sv'
  return {
    locale: active,
    messages: (await import(`../messages/${active}.json`)).default
  }
}) 