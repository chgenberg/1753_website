import {setRequestLocale} from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import CookieBanner from '@/components/cookies/CookieBanner'
import { LanguagePopup } from '@/components/layout/LanguagePopup'
import Script from 'next/script'
import type { Metadata } from 'next'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function generateStaticParams() {
  return [{locale: 'sv'}, {locale: 'en'}, {locale: 'es'}, {locale: 'de'}, {locale: 'fr'}]
}

export async function generateMetadata({ params }: { params: { locale?: string } }): Promise<Metadata> {
  const { locale } = await params
  const actualLocale = locale || 'sv'
  const metaByLocale: Record<string, { title: string; description: string; keywords: string[]; ogLocale: string }> = {
    sv: {
      title: '1753 SKINCARE - CBD & CBG',
      description: 'Upptäck kraften i CBD och CBG för din hud. Naturliga hudvårdsprodukter som stödjer hudens egen läkningsprocess.',
      keywords: ['CBD hudvård', 'naturlig hudvård', 'CBG', 'cannabinoider', 'hudvård', 'skincare'],
      ogLocale: 'sv_SE'
    },
    en: {
      title: '1753 SKINCARE - CBD & CBG',
      description: "Discover the power of CBD and CBG for your skin. Natural skincare that supports the skin's own healing process.",
      keywords: ['CBD skincare', 'natural skincare', 'CBG', 'cannabinoids', 'skin care', 'skincare'],
      ogLocale: 'en_US'
    },
    de: {
      title: '1753 SKINCARE - CBD & CBG',
      description: 'Entdecke die Kraft von CBD und CBG für deine Haut. Natürliche Hautpflege, die den eigenen Heilungsprozess der Haut unterstützt.',
      keywords: ['CBD Hautpflege', 'natürliche Hautpflege', 'CBG', 'Cannabinoide', 'Hautpflege'],
      ogLocale: 'de_DE'
    },
    es: {
      title: '1753 SKINCARE - CBD & CBG',
      description: 'Descubre el poder del CBD y CBG para tu piel. Cuidado natural que apoya el proceso de curación de la piel.',
      keywords: ['cuidado de la piel CBD', 'cuidado natural', 'CBG', 'cannabinoides', 'piel'],
      ogLocale: 'es_ES'
    },
    fr: {
      title: '1753 SKINCARE - CBD & CBG',
      description: 'Découvrez la puissance du CBD et du CBG pour votre peau. Des soins naturels qui soutiennent le processus de guérison de la peau.',
      keywords: ['soin de la peau CBD', 'soins naturels', 'CBG', 'cannabinoïdes', 'soin de la peau'],
      ogLocale: 'fr_FR'
    }
  }
  const m = metaByLocale[actualLocale] || metaByLocale.sv
  return {
    title: {
      default: m.title,
      template: `%s | ${m.title}`
    },
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: m.title,
      description: m.description,
      url: `https://1753skincare.com/${actualLocale}`,
      siteName: '1753 Skincare',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: '1753 Skincare Products' }],
      locale: m.ogLocale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/og-image.jpg']
    }
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale?: string }>
}) {
  const resolvedParams = await params
  const locale = resolvedParams?.locale ?? 'sv'
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
      <LanguagePopup />
      <CartDrawer />
    </NextIntlClientProvider>
  )
} 