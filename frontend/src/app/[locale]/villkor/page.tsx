import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FileText, ArrowLeft, Scale, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function VillkorPage() {
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
              <FileText className="w-8 h-8 text-[#4A3428] mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Allmänna Villkor</h1>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Senast uppdaterat: 20 juli 2025</h3>
                  <p className="text-amber-700">
                    Genom att handla hos 1753 Skincare accepterar du dessa allmänna villkor.
                  </p>
                </div>
              </div>
            </div>

            {/* Företagsinformation */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Företagsinformation</h2>
              <div className="bg-[#F5F3F0] rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  <strong>1753 Skincare</strong><br />
                  Organisationsnummer: [Organisationsnummer]<br />
                  Adress: Södra Skjutbanevägen 10, 439 55 Åsa, Sverige<br />
                  E-post: hej@1753skincare.com<br />
                  Telefon: 0732-305521
                </p>
                <p className="text-gray-700">
                  Vi är registrerade för F-skatt och moms enligt svensk lagstiftning.
                </p>
              </div>
            </section>

            {/* Avtal */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Avtal och Beställning</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Avtalet mellan dig som kund och 1753 Skincare kommer till stånd när vi bekräftar din beställning via e-post. 
                  Vi förbehåller oss rätten att neka beställningar utan att ange skäl.
                </p>
                <p>
                  All information på vår webbshop utgör ett erbjudande som kan accepteras genom beställning. 
                  Priser och produktinformation kan ändras utan föregående meddelande.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Beställningsprocess:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Lägg produkter i varukorgen</li>
                    <li>Gå till checkout och fyll i dina uppgifter</li>
                    <li>Välj leverans- och betalmetod</li>
                    <li>Granska beställningen och genomför köp</li>
                    <li>Du får orderbekräftelse via e-post</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Priser och betalning */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Priser och Betalning</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Alla priser anges i svenska kronor (SEK) inklusive moms. Fraktkostnader tillkommer om inte 
                  annat anges. Vi förbehåller oss rätten att ändra priser utan förvarning.
                </p>
                <p>
                  Betalning ska ske vid beställningstillfället om inte annat avtalats (t.ex. Klarna). 
                  Vi accepterar följande betalmetoder:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Kort (Visa, Mastercard, American Express)</li>
                  <li>Swish</li>
                  <li>PayPal</li>
                  <li>Klarna (Betala senare/Delbetalning)</li>
                  <li>Apple Pay / Google Pay</li>
                </ul>
              </div>
            </section>

            {/* Leverans */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Leverans</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi levererar inom Sverige. Leveranstid är normalt 2-5 arbetsdagar från det att beställningen 
                  bekräftats och betalning mottagits.
                </p>
                <p>
                  Risken för produkterna övergår till dig när produkterna lämnats till transportföretaget. 
                  Vi ansvarar inte för förseningar som beror på transportföretag eller force majeure.
                </p>
                <div className="bg-[#F5F3F0] rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Leveransvillkor:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fri frakt över 500 kr</li>
                    <li>Leverans till hemadress eller utlämningsställe</li>
                    <li>Spårning ingår alltid</li>
                    <li>Packas säkert för att undvika skador</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Ångerrätt */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Ångerrätt och Retur</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Du har 30 dagars ångerrätt från det att du mottagit produkterna. För att utnyttja ångerrätten 
                  ska du meddela oss inom denna tid och returnera produkterna i originalförpackning.
                </p>
                <p>
                  Produkterna ska vara oanvända och i samma skick som när du mottog dem. Av hygienskäl 
                  accepteras inte retur av produkter som öppnats eller använts.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Undantag från ångerrätt:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Produkter som öppnats av hygienskäl</li>
                    <li>Specialbeställda eller personligt anpassade produkter</li>
                    <li>Produkter som skadats av kunden</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Reklamation */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Reklamation och Garanti</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi lämnar 2 års garanti på våra produkter enligt konsumentköplagen. Reklamation ska göras 
                  skyndsamt efter det att felet upptäckts.
                </p>
                <p>
                  Vid fel eller skada som inte beror på normal förslitning eller felaktig användning, 
                  erbjuder vi reparation, utbyte eller återbetalning enligt lag.
                </p>
              </div>
            </section>

            {/* Ansvarsbegränsning */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Ansvarsbegränsning</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vårt ansvar är begränsat till produktens värde. Vi ansvarar inte för indirekta skador 
                  eller följdskador som kan uppstå till följd av produktanvändning.
                </p>
                <p>
                  Vi ansvarar inte för skador som uppstår till följd av felaktig användning, 
                  vårdslöshet eller normal förslitning.
                </p>
              </div>
            </section>

            {/* Force Majeure */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Force Majeure</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi ansvarar inte för förseningar eller utebliven leverans som beror på omständigheter 
                  utanför vår kontroll såsom naturkatastrofer, krig, strejk, myndighetsbeslut eller 
                  liknande händelser.
                </p>
              </div>
            </section>

            {/* Tillämplig lag */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">9. Tillämplig Lag och Tvister</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Svensk lag tillämpas på avtalet. Tvister ska i första hand lösas genom förhandling. 
                  Om överenskommelse inte kan nås kan tvisten hänskjutas till Allmänna reklamationsnämnden (ARN) 
                  eller allmän domstol.
                </p>
                <div className="bg-[#F5F3F0] rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Kontakt vid tvister:</h3>
                  <p>
                    Kontakta först vår kundservice: hej@1753skincare.com eller 0732-305521
                  </p>
                </div>
              </div>
            </section>

            {/* Ändringar */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">10. Ändringar av Villkor</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vi förbehåller oss rätten att ändra dessa villkor. Ändringar träder i kraft när de 
                  publicerats på vår webbshop. Du kommer att informeras om väsentliga ändringar via e-post.
                </p>
              </div>
            </section>

            {/* Kontaktinfo */}
            <section className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <Scale className="w-6 h-6 text-[#4A3428] mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Frågor om villkoren?</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Om du har frågor om dessa allmänna villkor, kontakta oss gärna:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>📧 hej@1753skincare.com</p>
                <p>📞 0732-305521</p>
                <p>🕒 Måndag-Fredag 08:00-18:00</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 