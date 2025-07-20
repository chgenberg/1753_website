'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Leaf, Shield, Droplets, Sparkles, Heart, Award, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Ökar elasticitet, fasthet och lyster',
    description: 'CBD stödjer hudens naturliga kollagenproduktion och förbättrar hudens struktur för en mer ungdomlig och spänstig känsla.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Dämpar inflammationer',
    description: 'Kraftfulla antiinflammatoriska egenskaper som lugnar irriterad, röd och känslig hud på ett naturligt sätt.'
  },
  {
    icon: <Droplets className="w-8 h-8" />,
    title: 'Minskar risken för oljig hud',
    description: 'Balanserar sebumproduktionen genom att optimera hudens endocannabinoidsystem för en jämnare hudton.'
  }
]

const scientificFacts = [
  {
    title: 'Över 100 cannabinoider',
    description: 'CBD är en av över 100 unika cannabinoider som finns i cannabisplantan'
  },
  {
    title: 'Endocannabinoidsystem',
    description: 'Arbetar med hudens naturliga ECS för optimal balans och funktion'
  },
  {
    title: 'Inga biverkningar',
    description: 'Säkert att använda dagligen utan kända negativa effekter på huden'
  },
  {
    title: 'Kliniskt testat',
    description: 'Vetenskapligt bevisade resultat för hudförbättring och inflammation'
  }
]

const howItWorks = [
  {
    step: '01',
    title: 'Penetrerar huden',
    description: 'CBD absorberas djupt ner i hudlagren där det kan utöva sin effekt'
  },
  {
    step: '02',
    title: 'Aktiverar receptorer',
    description: 'Interagerar med CB1 och CB2 receptorer i hudens endocannabinoidsystem'
  },
  {
    step: '03',
    title: 'Balanserar systemet',
    description: 'Minskar nedbrytningen av kroppens egna endocannabinoider'
  },
  {
    step: '04',
    title: 'Synliga resultat',
    description: 'Förbättrad hudstruktur, minskad inflammation och ökad elasticitet'
  }
]

export default function CBDPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-[#F5F3F0] via-[#F5F3F0] to-[#F5F3F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Cannabidiol</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  CBD
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Det fantastiska
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  En av de mest effektiva men underskattade ingredienserna i världen. 
                  CBD revolutionerar hudvård genom att arbeta med hudens naturliga system.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300 flex items-center"
                  >
                    Köp våra CBD-produkter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/Cannabis/CBD.jpg"
                    alt="CBD Cannabis ingrediens"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00937c]/20 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-[#00937c]">CBD</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Tre nyckelfunktioner</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                CBD:s unika egenskaper gör det till en revolutionerande ingrediens för hudvård
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center group"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#00937c] text-white rounded-2xl flex items-center justify-center group-hover:bg-[#007363] transition-colors duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What is CBD Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Vad är CBD?</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    <strong>Cannabidiol, eller CBD</strong>, är ett naturligt ämne som finns i cannabisplantan och är ett av de hundratals ämnen som kallas cannabinoider. Till skillnad från THC har CBD inga psykoaktiva effekter.
                  </p>
                  <p>
                    CBD fungerar genom att <strong>minska nedbrytandet av vår huds egna endocannabinoider</strong> och detta bidrar till att hudens endocannabinoidsystem hamnar i balans. På så vis har CBD en fantastisk positiv påverkan på huden.
                  </p>
                  <p>
                    CBD har dessutom visat sig ha <strong>antiinflammatoriska egenskaper</strong>, vilket gör det till ett bra val för att hjälpa en torr, känslig och/eller inflammerad hud. CBD kan även hjälpa till att förbättra hudens struktur och elasticitet.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-4"
              >
                {scientificFacts.map((fact, index) => (
                  <div
                    key={fact.title}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <h4 className="font-semibold text-[#00937c] mb-2">{fact.title}</h4>
                    <p className="text-sm text-gray-600">{fact.description}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cannabis Plant Video Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-6">Naturens kraft</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cannabis är en naturlig växt som växer kraftfullt och motståndskraftigt. 
                Denna naturliga styrka överförs till våra CBD-produkter för din hud.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://player.vimeo.com/video/1050527371?autoplay=1&loop=1&muted=1&background=1&controls=0"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Cannabis Plant Growing"
                  ></iframe>
                </div>
                
                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Naturlig motståndskraft</h3>
                    <p className="text-lg opacity-90">
                      Precis som denna cannabisplanta som växer genom asfalten, 
                      så är CBD naturligt kraftfullt och anpassningsbart för din hud.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#00937c]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#8B7355]/20 rounded-full blur-xl"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 max-w-2xl mx-auto">
                <em>
                  "Du får även gärna lägga denna film någonstans snyggt på fortsättningssidan med autoplay 
                  utan ljud. Det är en Cannabis-planta som växer upp snabbt ur asfalten i en gata för att 
                  symbolisera att Cannabis är naturligt och kraftfullt."
                </em>
              </p>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Så fungerar CBD på huden</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                En steg-för-steg genomgång av hur CBD interagerar med hudens endocannabinoidsystem
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00937c] to-[#00b89d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full">
                      <ArrowRight className="w-6 h-6 text-gray-300 mx-auto" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ECS Information Section */}
        <section className="py-20 bg-[#00937c]/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-8">Endocannabinoidsystemet (ECS)</h2>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Endocannabinoidsystemet är en komplex kombination av cellreceptorer som tar hand om flera 
                  <strong> viktiga funktioner</strong> i huden. Bland dessa ingår bland annat sebum-produktionen 
                  och melanocyternas funktion.
                </p>
                <p className="text-gray-600 mb-8">
                  Detta system är nyckeln till att förstå varför CBD är så effektivt för hudvård - 
                  det arbetar med kroppens egna processer istället för emot dem.
                </p>
                <Link href="/om-oss/ingredienser">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border-2 border-[#00937c] text-[#00937c] rounded-full font-medium hover:bg-[#00937c] hover:text-white transition-colors duration-300"
                  >
                    Läs mer om ECS
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Safety & Quality Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Säkerhet & Kvalitet</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Inga kända biverkningar</h4>
                      <p className="text-gray-600">CBD är säkert att använda dagligen på huden utan risk för negativa effekter.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Högkvalitativ extraktion</h4>
                      <p className="text-gray-600">Vårt CBD extraheras med CO2-metoden för att säkerställa renhet och potens.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Tredjepartstestat</h4>
                      <p className="text-gray-600">Varje batch testas av oberoende laboratorium för kvalitet och säkerhet.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#00937c] to-[#00b89d] rounded-3xl p-8 text-white text-center"
              >
                <Award className="w-16 h-16 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Premium Kvalitet</h3>
                <p className="text-lg opacity-90 mb-6">
                  Vårt CBD kommer från organiskt odlade hampaplantor och genomgår rigorös kvalitetskontroll.
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-sm">
                    "Vi använder endast det finaste CBD:t för att säkerställa optimala resultat för din hud."
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Upplev kraften i CBD
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ge din hud den revolutionerande vård den förtjänar med våra CBD-berikade produkter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300"
                  >
                    Köp CBD-produkter
                  </motion.button>
                </Link>
                <Link href="/om-oss/ingredienser/kallor">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-[#00937c] text-[#00937c] rounded-full font-semibold hover:bg-[#00937c] hover:text-white transition-colors duration-300"
                  >
                    Källor & Forskning
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 