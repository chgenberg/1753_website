import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: '1753 Skincare - Naturlig hudvård med CBD',
    template: '%s | 1753 Skincare'
  },
  description: 'Upptäck kraften i CBD och CBG för din hud. Naturliga hudvårdsprodukter som stödjer hudens egen läkningsprocess.',
  keywords: ['CBD hudvård', 'naturlig hudvård', 'CBG', 'cannabinoider', 'hudvård', 'skincare'],
  authors: [{ name: '1753 Skincare' }],
  creator: '1753 Skincare',
  publisher: '1753 Skincare',
  metadataBase: new URL('https://1753skincare.com'),
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  alternates: {
    canonical: '/',
    languages: {
      'sv': '/sv',
      'en': '/en',
      'es': '/es',
      'de': '/de',
      'fr': '/fr',
    },
  },
  openGraph: {
    title: '1753 Skincare - Naturlig hudvård med CBD',
    description: 'Upptäck kraften i CBD och CBG för din hud.',
    url: 'https://1753skincare.com',
    siteName: '1753 Skincare',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '1753 Skincare Products',
      },
    ],
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1753 Skincare - Naturlig hudvård med CBD',
    description: 'Upptäck kraften i CBD och CBG för din hud.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

interface Props {
  children: React.ReactNode
  params?: { locale?: string }
}

export default function RootLayout({ children, params }: Props) {
  const locale = params?.locale || 'sv'
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 