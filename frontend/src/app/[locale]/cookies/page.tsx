'use client'

import { motion } from 'framer-motion'
import { Cookie, Shield, Eye, BarChart3, Megaphone, Settings } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00937C] bg-opacity-10 rounded-full mb-6">
                <Cookie className="w-8 h-8 text-[#00937C]" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie-policy</h1>
              <p className="text-lg text-gray-600">
                Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Vad är cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Cookies är små textfiler som lagras på din enhet när du besöker vår webbplats. 
                  De hjälper oss att förbättra din upplevelse genom att komma ihåg dina preferenser 
                  och förstå hur du använder vår webbplats.
                </p>
              </div>

              <div className="space-y-8">
                {/* Necessary Cookies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Nödvändiga cookies</h3>
                      <p className="text-gray-600 mb-4">
                        Dessa cookies är väsentliga för att webbplatsen ska fungera korrekt. 
                        De kan inte stängas av i våra system.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Exempel:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Sessionshantering och inloggning</li>
                          <li>Varukorgsinnehåll</li>
                          <li>Cookie-samtycke</li>
                          <li>Säkerhetsåtgärder</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics Cookies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Analyserande cookies</h3>
                      <p className="text-gray-600 mb-4">
                        Dessa cookies hjälper oss att förstå hur besökare interagerar med vår webbplats 
                        genom att samla in och rapportera anonym information.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Vi använder:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Google Analytics 4 - för att mäta trafik och användarbeteende</li>
                          <li>Anonymiserad IP-adress</li>
                          <li>Ingen personlig information samlas in</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Marketing Cookies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Marknadsföringscookies</h3>
                      <p className="text-gray-600 mb-4">
                        Dessa cookies används för att visa relevanta annonser och mäta effektiviteten 
                        av våra marknadsföringskampanjer.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Vi använder:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Drip - för e-postmarknadsföring och kundkommunikation</li>
                          <li>Facebook Pixel - för annonsmätning (om aktiverad)</li>
                          <li>Google Ads - för annonsmätning (om aktiverad)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* How to manage cookies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Settings className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hantera cookies</h3>
                      <p className="text-gray-600 mb-4">
                        Du kan när som helst ändra dina cookie-inställningar:
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            localStorage.removeItem('cookieConsent')
                            window.location.reload()
                          }}
                          className="w-full sm:w-auto px-6 py-3 bg-[#FCB237] text-white rounded-full font-medium hover:bg-[#E79C1A] transition-colors"
                        >
                          Ändra cookie-inställningar
                        </button>
                        <p className="text-sm text-gray-500">
                          Du kan också blockera eller ta bort cookies genom din webbläsares inställningar. 
                          Observera att detta kan påverka webbplatsens funktionalitet.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-[#00937C] text-white rounded-2xl shadow-lg p-8"
                >
                  <h3 className="text-xl font-bold mb-4">Har du frågor?</h3>
                  <p className="mb-4">
                    Om du har frågor om vår cookie-policy eller hur vi hanterar dina uppgifter, 
                    tveka inte att kontakta oss.
                  </p>
                  <div className="space-y-2">
                    <p>📧 E-post: hej@1753skincare.com</p>
                    <p>📱 Telefon: +46 73 230 55 21</p>
                    <p>📍 Adress: Åsa, Sverige</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 