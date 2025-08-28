import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Hudremsa - Quiz',
  description: 'Få personliga rekommendationer baserade på din unika hud',
}

export default async function QuizPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('Quiz')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F0E8]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-center">Quiz kommer snart</h1>
        <p className="text-center text-gray-600 mt-4">Vi arbetar på att återställa quiz-funktionaliteten.</p>
      </div>
    </div>
  )
} 