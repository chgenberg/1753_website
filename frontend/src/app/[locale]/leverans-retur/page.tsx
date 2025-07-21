import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Truck, Package, ArrowLeft, Clock, CreditCard, Shield } from 'lucide-react'
import Link from 'next/link'

export default function LeveransReturPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Leverans & Retur</h1>

            {/* Leverans */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Truck className="w-8 h-8 text-[#4A3428] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Leverans</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Fri frakt över 500 kr</h3>
                  <p className="text-gray-700 mb-4">
                    Vi erbjuder fri frakt på alla beställningar över 500 kr inom Sverige.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Leveranstid: 2-5 arbetsdagar</li>
                    <li>• Spårning ingår alltid</li>
                    <li>• Säker förpackning</li>
                  </ul>
                </div>

                <div className="bg-[#F5F3F0] rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Leveransalternativ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>PostNord MyPack</span>
                      <span className="font-medium">49 kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DHL Hemleverans</span>
                      <span className="font-medium">79 kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Schenker Ombud</span>
                      <span className="font-medium">59 kr</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-amber-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Beställningar som läggs före 14:00</h3>
                    <p className="text-amber-700">
                      Beställningar som placeras vardagar före 14:00 skickas samma dag (förutsatt att produkterna finns i lager).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Retur */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Package className="w-8 h-8 text-[#4A3428] mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Retur & Återbetalning</h2>
              </div>

              <div className="bg-[#F5F3F0] rounded-xl p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">30 dagars öppet köp</h3>
                <p className="text-gray-700 mb-6">
                  Du har alltid 30 dagars öppet köp från det att du mottagit din beställning. 
                  Produkterna ska vara i originalförpackning och oanvända.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Så här gör du en retur:</h4>
                    <ol className="space-y-2 text-gray-700">
                      <li>1. Kontakta oss på hej@1753skincare.com</li>
                      <li>2. Ange ordernummer och returorsak</li>
                      <li>3. Vi skickar en returetikett</li>
                      <li>4. Packa produkterna i originalförpackning</li>
                      <li>5. Skicka tillbaka paketet</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Återbetalning:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Behandlas inom 5-10 arbetsdagar</li>
                      <li>• Återbetalas till ursprunglig betalmetod</li>
                      <li>• Fraktkostnad återbetalas vid fel från oss</li>
                      <li>• Returfrakt: 49 kr (dras från återbetalning)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-3">Undantag från returrätt</h3>
                <ul className="space-y-1 text-red-700">
                  <li>• Produkter som har öppnats eller använts av hygienskäl</li>
                  <li>• Produkter som har skadats av kunden</li>
                  <li>• Specialbeställda eller personligt anpassade produkter</li>
                </ul>
              </div>
            </section>

            {/* Kontaktinfo */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frågor om leverans eller retur?</h2>
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
                  <h3 className="font-semibold mb-3">Returadress</h3>
                  <div className="text-gray-700">
                    <p>1753 Skincare</p>
                    <p>Södra Skjutbanevägen 10</p>
                    <p>439 55 Åsa</p>
                    <p>Sverige</p>
                  </div>
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