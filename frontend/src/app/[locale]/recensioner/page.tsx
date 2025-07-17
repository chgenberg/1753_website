import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ReviewsPageContent from './ReviewsPageContent'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Reviews' })
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    openGraph: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    }
  }
}

export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ReviewsPageContent />
      </main>
      <Footer />
    </>
  )
} 