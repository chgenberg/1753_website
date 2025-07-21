import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CreditCard, Shield, ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function BetalningPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#4A3428] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till startsidan
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Betalning & Säkerhet</h1>

            {/* Betalningsalternativ */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <CreditCard className="w-8 h-8 text-[#4A3428] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Betalningsalternativ</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Kort & Digitala plånböcker</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Visa, Mastercard, American Express</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Apple Pay</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Google Pay</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>PayPal</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Köp nu, betala senare</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Klarna - Delbetalning</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Klarna - Betala senare (30 dagar)</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Swish</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#4A3428] mr-3" />
                      <span>Bankgiro/Plusgiro</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                  <Lock className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Säker betalning</h3>
                    <p className="text-blue-700">
                      Alla betalningar sker via SSL-krypterad anslutning. Vi sparar aldrig dina kortuppgifter i våra system.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Säkerhet */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-[#4A3428] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Säkerhet & Certifieringar</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <Shield className="w-12 h-12 text-[#4A3428] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">SSL-kryptering</h3>
                  <p className="text-gray-700 text-sm">
                    256-bitars SSL-kryptering skyddar alla dina personuppgifter under betalning.
                  </p>
                </div>

                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <Lock className="w-12 h-12 text-[#4A3428] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">PCI DSS</h3>
                  <p className="text-gray-700 text-sm">
                    Vi följer PCI DSS-standarden för säker hantering av kortbetalningar.
                  </p>
                </div>

                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <CheckCircle className="w-12 h-12 text-[#4A3428] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">GDPR-kompatibel</h3>
                  <p className="text-gray-700 text-sm">
                    Fullständig efterlevnad av GDPR och svensk datalagstiftning.
                  </p>
                </div>
              </div>
            </section>

            {/* Priser & Avgifter */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Priser & Avgifter</h2>
              
              <div className="bg-[#F5F3F0] rounded-xl p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Inga dolda kostnader</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Inga avgifter för kortbetalning</li>
                      <li>• Inga avgifter för Swish</li>
                      <li>• Inga avgifter för PayPal</li>
                      <li>• Gratis frakt över 500 kr</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Prisgaranti</h3>
                    <p className="text-gray-700 mb-3">
                      Alla priser på vår webbshop inkluderar svensk moms (25%). 
                      Det pris du ser är det pris du betalar.
                    </p>
                    <p className="text-gray-700">
                      Priserna är i svenska kronor (SEK).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Klarna info */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Om Klarna</h2>
              
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
                <h3 className="font-semibold text-pink-800 mb-3">Betala senare med Klarna</h3>
                <div className="text-pink-700 space-y-2">
                  <p>
                    <strong>Betala senare (30 dagar):</strong> Få dina produkter först, betala inom 30 dagar. Inga avgifter om du betalar i tid.
                  </p>
                  <p>
                    <strong>Delbetalning:</strong> Dela upp betalningen i 3 räntefria delbetalningar. Första betalningen sker vid köp.
                  </p>
                  <p className="text-sm mt-3">
                    Klarna kan komma att ta ut avgifter vid försenad betalning. Läs mer på klarna.com
                  </p>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frågor om betalning?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Kontakta kundservice</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>📧 hej@1753skincare.com</p>
                    <p>📞 0732-305521</p>
                    <p>🕒 Måndag-Fredag 08:00-18:00</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Vanliga frågor</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Varför gick inte min betalning igenom?</li>
                    <li>• Hur ändrar jag betalmetod?</li>
                    <li>• När dras pengarna från kontot?</li>
                    <li>• Kan jag få kvitto via e-post?</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 