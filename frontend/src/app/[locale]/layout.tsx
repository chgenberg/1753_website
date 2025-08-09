import {setRequestLocale} from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import CookieBanner from '@/components/cookies/CookieBanner'

export function generateStaticParams() {
  return [{locale: 'sv'}, {locale: 'en'}, {locale: 'es'}, {locale: 'de'}, {locale: 'fr'}]
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode
  params: any
}) {
  const locale = params?.locale ?? 'sv'
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      {children as any}
      <CookieBanner />
    </NextIntlClientProvider>
  )
} 