import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Cookie, ArrowLeft, Settings, Eye, Target, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CookiesPage() {
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
            <div className="flex items-center mb-8">
              <Cookie className="w-8 h-8 text-[#4A3428] mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Cookiepolicy</h1>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <Cookie className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Senast uppdaterat: 20 juli 2025</h3>
                  <p className="text-blue-700">
                    Vi använder cookies för att förbättra din upplevelse på vår webbshop.
                  </p>
                </div>
              </div>
            </div>

            {/* Vad är cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vad är cookies?</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Cookies är små textfiler som lagras på din enhet (dator, surfplatta eller mobil) när du besöker vår webbshop. 
                  De hjälper oss att komma ihåg dina preferenser och förbättra din användarupplevelse.
                </p>
                <p className="text-gray-700">
                  Cookies innehåller inte personlig information som kan identifiera dig direkt, utan fungerar snarare som 
                  en unik identifierare för din webbläsarsession.
                </p>
              </div>
            </section>

            {/* Typer av cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Typer av cookies vi använder</h2>
              
              <div className="space-y-6">
                {/* Nödvändiga */}
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-[#4A3428] mr-3" />
                    <h3 className="text-lg font-semibold">1. Nödvändiga cookies (krävs alltid)</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Dessa cookies är absolut nödvändiga för att webbshopen ska fungera korrekt. 
                    De kan inte stängas av utan att det påverkar webbshopens funktionalitet.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Vad de gör:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Hantera inloggning och användarautentisering</li>
                        <li>• Komma ihåg produkter i varukorgen</li>
                        <li>• Säkerställa säker betalning</li>
                        <li>• Språk- och valutainställningar</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exempel på cookies:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• <code>session_id</code> - Sessionshantering</li>
                        <li>• <code>cart_items</code> - Varukorg</li>
                        <li>• <code>csrf_token</code> - Säkerhet</li>
                        <li>• <code>locale</code> - Språkval</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Funktionella */}
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Settings className="w-6 h-6 text-[#4A3428] mr-3" />
                    <h3 className="text-lg font-semibold">2. Funktionella cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Dessa cookies möjliggör förbättrad funktionalitet och personalisering. 
                    De kan sättas av oss eller av tredjepartsleverantörer.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Vad de gör:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Komma ihåg dina preferenser</li>
                        <li>• Förbättra användarupplevelsen</li>
                        <li>• Anpassa innehåll baserat på tidigare besök</li>
                        <li>• Chat- och supportfunktioner</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Giltighetstid:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• 30 dagar till 2 år</li>
                        <li>• Kan raderas när som helst</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Analys */}
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-[#4A3428] mr-3" />
                    <h3 className="text-lg font-semibold">3. Analyscookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Dessa cookies hjälper oss att förstå hur besökare använder vår webbshop genom att samla in och 
                    rapportera information anonymt.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Vad de gör:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Räkna besökare och sidvisningar</li>
                        <li>• Förstå hur användare navigerar</li>
                        <li>• Identifiera populära sidor och produkter</li>
                        <li>• Förbättra webbshopens prestanda</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Leverantörer:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Google Analytics</li>
                        <li>• Hotjar (användarupplevelse)</li>
                        <li>• Facebook Pixel</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Marknadsföring */}
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-[#4A3428] mr-3" />
                    <h3 className="text-lg font-semibold">4. Marknadsföringscookies</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Dessa cookies används för att visa relevanta annonser och mäta effektiviteten av våra marknadsföringskampanjer.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Vad de gör:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Visa relevanta annonser</li>
                        <li>• Begränsa antalet gånger du ser samma annons</li>
                        <li>• Mäta annonsers effektivitet</li>
                        <li>• Retargeting på andra webbplatser</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Partners:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Google Ads</li>
                        <li>• Facebook</li>
                        <li>• Instagram</li>
                        <li>• Pinterest</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Hantera cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hur hanterar du cookies?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Via vår cookie-banner</h3>
                  <p className="text-gray-700 mb-4">
                    När du besöker vår webbshop första gången ser du en cookie-banner där du kan:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Acceptera alla cookies</li>
                    <li>• Acceptera endast nödvändiga cookies</li>
                    <li>• Anpassa dina inställningar</li>
                    <li>• Ändra dina val när som helst</li>
                  </ul>
                </div>

                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Via webbläsarinställningar</h3>
                  <p className="text-gray-700 mb-4">
                    Du kan också hantera cookies direkt i din webbläsare:
                  </p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• <strong>Chrome:</strong> Inställningar → Sekretess → Cookies</li>
                    <li>• <strong>Firefox:</strong> Inställningar → Sekretess → Cookies</li>
                    <li>• <strong>Safari:</strong> Inställningar → Sekretess → Cookies</li>
                    <li>• <strong>Edge:</strong> Inställningar → Sekretess → Cookies</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
                <h3 className="font-semibold text-amber-800 mb-3">⚠️ Viktigt att veta</h3>
                <p className="text-amber-700">
                  Om du blockerar eller raderar cookies kan vissa funktioner på vår webbshop sluta fungera korrekt. 
                  Du kan fortfarande handla, men din användarupplevelse kan påverkas.
                </p>
              </div>
            </section>

            {/* Tredjepartscookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tredjepartscookies</h2>
              
              <div className="bg-[#F5F3F0] rounded-xl p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Vi använder även tjänster från tredje part som kan sätta sina egna cookies. 
                  Dessa styrs av respektive företags integritetspolicies.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Analys & Spårning:</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• <strong>Google Analytics:</strong> <a href="https://policies.google.com/privacy" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">policies.google.com/privacy</a></li>
                      <li>• <strong>Hotjar:</strong> <a href="https://www.hotjar.com/privacy" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">hotjar.com/privacy</a></li>
                      <li>• <strong>Facebook Pixel:</strong> <a href="https://www.facebook.com/privacy" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">facebook.com/privacy</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Betalning & Support:</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• <strong>Klarna:</strong> <a href="https://www.klarna.com/se/integritet" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">klarna.com/se/integritet</a></li>
                      <li>• <strong>PayPal:</strong> <a href="https://www.paypal.com/privacy" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">paypal.com/privacy</a></li>
                      <li>• <strong>Stripe:</strong> <a href="https://stripe.com/privacy" className="text-[#4A3428] hover:underline" target="_blank" rel="noopener">stripe.com/privacy</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Uppdateringar */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Uppdateringar av denna policy</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Vi kan komma att uppdatera denna cookiepolicy från tid till annan för att återspegla ändringar 
                  i vår användning av cookies eller gällande lagstiftning.
                </p>
                <p className="text-gray-700">
                  Väsentliga ändringar kommer att meddelas på vår webbshop och via e-post om du är registrerad kund. 
                  Vi rekommenderar att du regelbundet läser igenom denna policy.
                </p>
              </div>
            </section>

            {/* Opt-out länkar */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Avanmäl dig från spårning</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-blue-700 mb-4">
                  Om du vill avanmäla dig från spårning från specifika leverantörer kan du använda dessa länkar:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Google:</h4>
                    <a href="https://adssettings.google.com" className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener">
                      adssettings.google.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Facebook:</h4>
                    <a href="https://www.facebook.com/settings?tab=ads" className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener">
                      facebook.com/settings?tab=ads
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frågor om cookies?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Kontakta oss:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>📧 hej@1753skincare.com</p>
                    <p>📞 0732-305521</p>
                    <p>🕒 Måndag-Fredag 08:00-18:00</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Relaterade policys:</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/integritetspolicy" className="text-[#4A3428] hover:underline">
                        Integritetspolicy
                      </Link>
                    </li>
                    <li>
                      <Link href="/villkor" className="text-[#4A3428] hover:underline">
                        Allmänna villkor
                      </Link>
                    </li>
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