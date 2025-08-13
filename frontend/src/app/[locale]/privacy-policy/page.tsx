'use client';

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, User } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Integritetspolicy
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Så här skyddar vi din information när du använder vår kostnadsfria hudanalys
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-8 shadow-lg mb-8"
              >
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">Vilken information vi samlar in</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  När du genomför vår kostnadsfria hudanalys samlar vi in:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Ditt förnamn - för att personalisera dina resultat</li>
                  <li>Din e-postadress - för att skicka dina hudanalysresultat</li>
                  <li>Dina svar på hudrelaterade frågor - för att skapa personliga rekommendationer</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-8 shadow-lg mb-8"
              >
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-[#FCB237] mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">Hur vi använder din information</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Vi använder din information för att:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Skapa personliga hudvårdsrekommendationer baserat på dina svar</li>
                  <li>Skicka dina resultat till din angivna e-postadress</li>
                  <li>Förbättra våra algoritmer och rekommendationer (anonymiserat)</li>
                  <li>Erbjuda dig relevanta produkter och tips (endast om du samtycker)</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-8 shadow-lg mb-8"
              >
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">Datasäkerhet</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Vi tar datasäkerhet på största allvar:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>All data överförs krypterat (HTTPS/SSL)</li>
                  <li>Vi lagrar aldrig känslig information längre än nödvändigt</li>
                  <li>Endast auktoriserad personal har tillgång till data</li>
                  <li>Vi säljer aldrig din information till tredje part</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dina rättigheter</h2>
                <p className="text-gray-700 mb-4">
                  Du har alltid rätt att:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Begära utdrag av vilken data vi har om dig</li>
                  <li>Begära att vi raderar din data</li>
                  <li>Säga upp prenumerationer när som helst</li>
                  <li>Kontakta oss med frågor om din integritet</li>
                </ul>
                <p className="text-gray-700">
                  Kontakta oss på <a href="mailto:privacy@1753skincare.com" className="text-blue-600 hover:underline">privacy@1753skincare.com</a> för alla integritetsrelaterade frågor.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center mt-12"
              >
                <p className="text-gray-500 text-sm">
                  Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  © 2024 1753 Skincare. Vi respekterar din integritet.
                </p>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 