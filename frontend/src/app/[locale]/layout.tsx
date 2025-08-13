import {setRequestLocale} from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import CookieBanner from '@/components/cookies/CookieBanner'
import Script from 'next/script'

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
  const siteUrl = 'https://1753skincare.com'
  const orgLogo = `${siteUrl}/1753.png`
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: '1753 Skincare',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/blogg?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '1753 Skincare',
    url: siteUrl,
    logo: orgLogo
  }
  return (
    <NextIntlClientProvider messages={messages}>
      <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLdWebsite)}
      </Script>
      <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLdOrg)}
      </Script>
      {children as any}
      <CookieBanner />
    </NextIntlClientProvider>
  )
} 