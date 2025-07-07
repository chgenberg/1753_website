'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'


export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const cannabinoidsFAQ = [
    {
      question: "Vad är CBD?",
      answer: (
        <div className="space-y-4">
          <p>
            <strong>Cannabidiol (CBD)</strong> är ett ämne som utvinns från växten Cannabis Sativa. 
            CBD har ingen ruseffekt, dvs man kan inte bli "hög" av CBD.
          </p>
          <p>
            CBD har, tillsammans med andra cannabinoider, använts som hälsotillskott i mer än 5000 år 
            och har en effekt på hudens endocannabinoidsystem (ECS), vilket kontrollerar alla funktioner 
            i din hud. Ett ECS i balans är avgörande för att uppnå optimal hudhälsa.
          </p>
          <Link href="/om-oss/ingredienser/cbd" className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium">
            Läs mer om CBD <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )
    },
    {
      question: "Vad är CBG?",
      answer: (
        <div className="space-y-4">
          <p>
            <strong>Cannabigerol (CBG)</strong> kallas för "the mother of all cannabinoids" eftersom 
            det är den första cannabinoiden som bildas i cannabisplantan (inclusive CBD).
          </p>
          <p>
            Cannabigerol (CBG) har många nyttiga funktioner för din hud. CBG är antiinflammatoriskt, 
            antibakteriellt och antioxidant. CBG har också en positiv effekt på endocannabinoidsystemet, 
            vilket är avgörande för optimal hudhälsa.
          </p>
          <Link href="/om-oss/ingredienser/cbg" className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium">
            Läs mer om CBG <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )
    },
    {
      question: "Finns det någon föreläsning om CBD hudvård?",
      answer: (
        <div className="space-y-4">
          <p>
            Ja, här är en av föreläsningarna som vår grundare, Christopher Genberg, har spelat in:
          </p>
          <a 
            href="#" 
            className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Se föreläsningen <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      )
    },
    {
      question: "Hur kan CBD och CBG förbättra min hudhälsa?",
      answer: (
        <div className="space-y-4">
          <p>
            CBD och CBG är två komponenter från den fantastiska växten Cannabis Sativa. De kan förbättra 
            din hudhälsa på många olika sätt. Här hade vi kunnat skriva sida upp och sida ner om vårt 
            mänskliga endocannabinoidsystem (ECS), dess receptorer (CB1 och CB2) och hur en perfekt 
            homeostas kan förbättra din hud på ett fantastiskt sätt.
          </p>
          <p>Men för att göra en lång historia kort, det här kan CBD och CBG göra för din hud:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Balansera din sebum-produktion</li>
            <li>Minska inflammationer</li>
            <li>Återfukta torr hud</li>
          </ol>
          <p>Om du vill veta mer om hur CBD och CBG kan påverka din hud, besök vår CBD sida!</p>
          <Link href="/om-oss/ingredienser/cbd" className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium">
            Läs mer om CBD och CBG <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )
    },
    {
      question: "Vilka hudtyper passar 1753 Skincare till?",
      answer: (
        <div className="space-y-4">
          <p>
            Vårt hudkoncept passar <strong>alla hudtyper</strong>. Cannabinoider (CBD och CBG) i hudvård 
            ger en mycket lindrande, återfuktande och lugnande effekt.
          </p>
          <p>
            CBD har också visat sig balansera produktionen och kvalitén av hudens sebum. 
            Detta gör det perfekt för de som har en fet hud.
          </p>
        </div>
      )
    },
    {
      question: "Kan jag bli hög av produkterna?",
      answer: "Nej, våra produkter innehåller inget THC. Det är THC i cannabisplantan som ger 'ruseffekten'."
    },
    {
      question: "Är det lagligt med CBD och CBG?",
      answer: "Ja, både CBD och CBG är lagliga ingredienser i kosmetiska produkter."
    },
    {
      question: "Varför nämner ni hela tiden inflammerad hud?",
      answer: (
        <div className="space-y-4">
          <p>
            En inflammerad hud åldras snabbare än en icke-inflammerad hud. Om man vill uppnå en optimal 
            hudhälsa på både lång och kort sikt, med färre rynkor och fina linjer samt mindre känslighet, 
            så är det helt avgörande att undvika inflammationer i huden.
          </p>
        </div>
      )
    },
    {
      question: "Innehåller produkterna THC?",
      answer: "Nej, produkterna innehåller inte THC."
    },
    {
      question: "Är CBD lagligt i hela världen?",
      answer: (
        <div className="space-y-4">
          <p>
            CBD (utan THC) är lagligt i nästan alla världens länder. Dock så finns det fortfarande 
            ett fåtal länder där detta ämne är förbjudet. Ska du ut och resa så bör du därför ta reda 
            på landets lagar innan du tar med dig ansiktsoljan.
          </p>
        </div>
      )
    },
    {
      question: "Vart kan jag ladda hem er e-bok?",
      answer: (
        <div className="space-y-4">
          <p>Du hittar vår kostnadsfria e-bok här:</p>
          <a 
            href="#" 
            className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ladda ner e-boken <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          <p>Boken består av 140 sidor och beskriver allt du behöver veta om hud, hudvård och hudhälsa.</p>
        </div>
      )
    }
  ]

  const companyFAQ = [
    {
      question: "Varför namnet 1753 SKINCARE?",
      answer: (
        <div className="space-y-4">
          <p>
            Vårt varumärkesnamn är en hyllning till den svenska botanikern Carl Von Linné och samtidigt 
            växten Cannabis Sativa. Det var år 1753 som Linné namngav denna fantastiska växt.
          </p>
        </div>
      )
    },
    {
      question: "Är produkterna anpassade för känslig hy?",
      answer: "Ja, produkterna är anpassade för känslig hud."
    },
    {
      question: "Jag är vegan, är produkterna det?",
      answer: "Ja, produkterna är vegan."
    },
    {
      question: "Vilka är ni?",
      answer: (
        <div className="space-y-4">
          <p>
            Vi är en familj med målet att förbättra människors hudhälsa på både kort- och lång sikt.
          </p>
          <Link href="/om-oss" className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium">
            Läs vår historia <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )
    },
    {
      question: "Kan jag använda era produkter tillsammans med mina favoritprodukter?",
      answer: (
        <div className="space-y-4">
          <p>
            Självklart, men kika gärna igenom ingredienserna på dina produkter. Om du vill använda våra 
            produkter tillsammans med andra produkter så rekommenderar vi att du inte använder produkter 
            som ökar risken för inflammation.
          </p>
        </div>
      )
    },
    {
      question: "Behöver era produkter förvaras i kylskåp?",
      answer: "Nej, de kan förvaras i badrumsskåpet."
    },
    {
      question: "Kan jag använda produkterna när jag är gravid eller ammar?",
      answer: "Ja, det är helt riskfritt att använda produkterna under graviditet eller under amning."
    },
    {
      question: "Har produkterna något SPF?",
      answer: (
        <div className="space-y-4">
          <p>
            Nej, vi har inga SPF produkter (ännu). Om du vill använda produkten tillsammans med solskydd, 
            så rekommenderar vi ett fysikaliskt solskydd.
          </p>
        </div>
      )
    },
    {
      question: "Var tillverkas produkterna?",
      answer: "Våra produkter tillverkas i underbara Kroatien och förpackningarna i Sverige."
    },
    {
      question: "Vilken hållbarhet har produkterna?",
      answer: "Vi rekommenderar användning inom 12 månader efter öppning."
    },
    {
      question: "Var hittar jag er returpolicy?",
      answer: (
        <div className="space-y-4">
          <a 
            href="#" 
            className="inline-flex items-center text-[#00937c] hover:text-[#007363] font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Läs vår returpolicy <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      )
    }
  ]

  return (
    <>
      <Header />
      <main className="pt-32 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Q&A
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vi älskar frågor
            </p>
          </motion.div>

          {/* Cannabinoids 101 Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Cannabinoids 101
            </h2>
            <div className="space-y-4">
              {cannabinoidsFAQ.map((item, index) => (
                <motion.div
                  key={`cannabinoids-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-[#00937c] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#00937c] flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <div className="text-gray-700 leading-relaxed">
                        {typeof item.answer === 'string' ? (
                          <p>{item.answer}</p>
                        ) : (
                          item.answer
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 1753 SKINCARE 101 Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              1753 SKINCARE 101
            </h2>
            <div className="space-y-4">
              {companyFAQ.map((item, index) => (
                <motion.div
                  key={`company-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(cannabinoidsFAQ.length + index)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {openItems.includes(cannabinoidsFAQ.length + index) ? (
                      <ChevronUp className="w-5 h-5 text-[#00937c] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#00937c] flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(cannabinoidsFAQ.length + index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <div className="text-gray-700 leading-relaxed">
                        {typeof item.answer === 'string' ? (
                          <p>{item.answer}</p>
                        ) : (
                          item.answer
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center bg-gray-50 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Har du fler frågor?
            </h2>
            <p className="text-gray-600 mb-8">
              Vi ❤️ frågor, tveka inte att skicka ett meddelande på{' '}
              <a 
                href="mailto:christopher@1753skincare.com" 
                className="text-[#00937c] hover:text-[#007363] font-medium"
              >
                christopher@1753skincare.com
              </a>
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center px-8 py-4 bg-[#00937c] text-white rounded-full hover:bg-[#007363] transition-colors duration-300 font-medium"
            >
              Kontakta oss
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
} 