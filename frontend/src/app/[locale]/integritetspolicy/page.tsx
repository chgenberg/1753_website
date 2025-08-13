import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Shield, ArrowLeft, Eye, Lock, Database, UserCheck } from 'lucide-react'
import Link from 'next/link'

export default function IntegritetspolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#FCB237] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till startsidan
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Shield className="w-8 h-8 text-[#FCB237] mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Integritetspolicy</h1>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Senast uppdaterat: 20 juli 2025</h3>
                  <p className="text-blue-700">
                    Vi värnar om din integritet och följer GDPR samt svensk datalagstiftning.
                  </p>
                </div>
              </div>
            </div>

            {/* Personuppgiftsansvarig */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Personuppgiftsansvarig</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  <strong>1753 Skincare</strong><br />
                  Organisationsnummer: [Organisationsnummer]<br />
                  Adress: Södra Skjutbanevägen 10, 439 55 Åsa, Sverige<br />
                  E-post: hej@1753skincare.com<br />
                  Telefon: 0732-305521
                </p>
                <p className="text-gray-700">
                  Vi är personuppgiftsansvariga för behandlingen av dina personuppgifter och ansvarar för att 
                  behandlingen sker i enlighet med gällande dataskyddslagstiftning.
                </p>
              </div>
            </section>

            {/* Vilka uppgifter */}
            <section className="mb-8">
              <div className="flex items-center mb-6">
                <Database className="w-8 h-8 text-[#FCB237] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">2. Vilka Personuppgifter Samlar Vi In?</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">När du handlar:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Namn och kontaktuppgifter</li>
                    <li>• Leverans- och fakturaadress</li>
                    <li>• E-post och telefonnummer</li>
                    <li>• Beställningshistorik</li>
                    <li>• Betalningsinformation (ej kortnummer)</li>
                  </ul>
                </div>

                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">När du använder sajten:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• IP-adress och enhetsinfo</li>
                    <li>• Cookies och webbanalys</li>
                    <li>• Vilka sidor du besöker</li>
                    <li>• Hudanalysresultat (om du gör quiz)</li>
                    <li>• Kommunikation med kundservice</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-amber-800 mb-3">Känsliga personuppgifter</h3>
                <p className="text-amber-700">
                  Vid hudanalys kan vi behandla hälsouppgifter (hudtyp, hudproblem). Detta sker endast med ditt 
                  uttryckliga samtycke och för att ge dig personliga rekommendationer.
                </p>
              </div>
            </section>

            {/* Varför */}
            <section className="mb-8">
              <div className="flex items-center mb-6">
                <Eye className="w-8 h-8 text-[#FCB237] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">3. Varför Behandlar Vi Dina Uppgifter?</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Rättslig grund och ändamål:</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-[#FCB237]">Avtalsuppfyllelse:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Behandla och leverera beställningar</li>
                        <li>• Kundservice och support</li>
                        <li>• Hantera retur och reklamationer</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#FCB237]">Berättigat intresse:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Marknadsföring till befintliga kunder</li>
                        <li>• Förbättra vår webbshop och tjänster</li>
                        <li>• Bedrägeriskydd och säkerhet</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-3">Samtycke krävs för:</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Nyhetsbrev och marknadsföring via e-post</li>
                    <li>• Behandling av hälsouppgifter (hudanalys)</li>
                    <li>• Vissa cookies och spårning</li>
                    <li>• Personliga produktrekommendationer</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Delning */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Delar Vi Dina Uppgifter?</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi säljer eller hyr aldrig ut dina personuppgifter till tredje part. Vi delar endast 
                  uppgifter när det är nödvändigt för att fullfölja våra tjänster:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#F5F3F0] rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Våra partners:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Leveranspartners:</strong> PostNord, DHL, Schenker</li>
                      <li>• <strong>Betalning:</strong> Klarna, PayPal, Stripe</li>
                      <li>• <strong>E-post:</strong> Drip (marknadsföring)</li>
                      <li>• <strong>Analys:</strong> Google Analytics</li>
                      <li>• <strong>Support:</strong> Kundserviceplattform</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-semibold text-red-800 mb-3">Vi delar aldrig för:</h3>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Försäljning till andra företag</li>
                      <li>• Reklam från tredje part</li>
                      <li>• Kommersiella syften utöver våra tjänster</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Säkerhet */}
            <section className="mb-8">
              <div className="flex items-center mb-6">
                <Lock className="w-8 h-8 text-[#FCB237] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">5. Hur Skyddar Vi Dina Uppgifter?</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <Lock className="w-12 h-12 text-[#FCB237] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Kryptering</h3>
                  <p className="text-gray-700 text-sm">
                    All dataöverföring sker via SSL-kryptering (HTTPS).
                  </p>
                </div>

                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <Shield className="w-12 h-12 text-[#FCB237] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Säker lagring</h3>
                  <p className="text-gray-700 text-sm">
                    Data lagras säkert hos certifierade molntjänstleverantörer.
                  </p>
                </div>

                <div className="text-center p-6 bg-[#F5F3F0] rounded-xl">
                  <UserCheck className="w-12 h-12 text-[#FCB237] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Begränsad åtkomst</h3>
                  <p className="text-gray-700 text-sm">
                    Endast auktoriserad personal har åtkomst till personuppgifter.
                  </p>
                </div>
              </div>
            </section>

            {/* Lagringstid */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Hur Länge Sparar Vi Uppgifterna?</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Kunduppgifter:</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• <strong>Aktiva kunder:</strong> Så länge kontot är aktivt</li>
                      <li>• <strong>Inaktiva kunder:</strong> 3 år efter sista köp</li>
                      <li>• <strong>Bokföringsuppgifter:</strong> 7 år (enligt lag)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Övriga uppgifter:</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• <strong>Webbanalys:</strong> 26 månader</li>
                      <li>• <strong>Marknadsföring:</strong> Tills samtycke återkallas</li>
                      <li>• <strong>Kundservice:</strong> 2 år</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Dina rättigheter */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Dina Rättigheter</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📄 Rätt till information</h3>
                    <p className="text-gray-700 text-sm">
                      Du har rätt att få information om vilka uppgifter vi behandlar om dig.
                    </p>
                  </div>

                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">✏️ Rätt till rättelse</h3>
                    <p className="text-gray-700 text-sm">
                      Du kan begära att vi rättar felaktiga eller ofullständiga uppgifter.
                    </p>
                  </div>

                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🗑️ Rätt till radering</h3>
                    <p className="text-gray-700 text-sm">
                      Du kan begära att vi raderar dina personuppgifter under vissa förutsättningar.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🚫 Rätt till begränsning</h3>
                    <p className="text-gray-700 text-sm">
                      Du kan begära att vi begränsar behandlingen av dina uppgifter.
                    </p>
                  </div>

                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📦 Rätt till dataportabilitet</h3>
                    <p className="text-gray-700 text-sm">
                      Du kan begära att få ut dina uppgifter i ett strukturerat format.
                    </p>
                  </div>

                  <div className="bg-[#F5F3F0] rounded-lg p-4">
                    <h3 className="font-semibold mb-2">❌ Rätt att invända</h3>
                    <p className="text-gray-700 text-sm">
                      Du kan invända mot behandling som grundar sig på berättigat intresse.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Cookies</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Vi använder cookies för att förbättra din upplevelse på vår webbshop. 
                  Läs mer om våra cookies i vår <Link href="/cookies" className="text-[#FCB237] hover:underline">cookiepolicy</Link>.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Nödvändiga cookies</h4>
                    <p className="text-gray-600">Krävs för webbshopens grundfunktioner</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Analyscookies</h4>
                    <p className="text-gray-600">Hjälper oss förstå hur sajten används</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Marknadsföringscookies</h4>
                    <p className="text-gray-600">För relevanta annonser och innehåll</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Kontakta Oss</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">För dataskyddsfrågor:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>📧 hej@1753skincare.com</p>
                    <p>📞 0732-305521</p>
                    <p>📍 Södra Skjutbanevägen 10, 439 55 Åsa</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Klagomål:</h3>
                  <p className="text-gray-700 text-sm">
                    Om du är missnöjd med hur vi behandlar dina personuppgifter kan du klaga 
                    till Integritetsskyddsmyndigheten (IMY).
                  </p>
                  <p className="text-[#FCB237] text-sm mt-2">
                    imy.se | 08-657 61 00
                  </p>
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