'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Droplets, Shield, Heart, Zap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Lugnande anti-mikrobiell effekt',
    description: 'Skyddar huden från skadliga mikrober som bakterier, virus och svampar utan att täppa igen porerna.'
  },
  {
    icon: <Droplets className="w-8 h-8" />,
    title: 'Återfuktar huden',
    description: 'Djupt återfuktande egenskaper som hjälper till att bibehålla hudens naturliga fuktbalans och mjukhet.'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Perfekt symbios med CBD och CBG',
    description: 'Fungerar som en optimal bärare för cannabinoider och förstärker deras effektivitet i huden.'
  }
]

const mctBenefits = [
  'Lugnande och återfuktande egenskaper',
  'Antibakteriell utan att täppa igen porer',
  'Skyddar mot bakterier, virus och svampar',
  'Innehåller laurinsyra för hudstöd',
  'Optimal bärare för CBD och CBG',
  'Lätt konsistens som absorberas snabbt'
]

const mctVsRegular = [
  {
    aspect: 'Fettsyresammansättning',
    regular: 'Långkedjade + mellankedjade fettsyror',
    mct: 'Endast mellankedjade fettsyror (MCT)'
  },
  {
    aspect: 'MCT-innehåll',
    regular: 'Endast 15% MCT-olja',
    mct: '100% MCT-olja'
  },
  {
    aspect: 'Konsistens',
    regular: 'Tjockare konsistens',
    mct: 'Tunnare, lättare konsistens'
  },
  {
    aspect: 'Absorption',
    regular: 'Långsammare absorption',
    mct: 'Snabbare absorption'
  }
]

export default function MCTKokosOljaPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Medium-Chain Triglycerides</span>
                <h2 className="text-3xl font-semibold text-gray-700 mb-2">
                  Fantastiska
                </h2>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  MCT Kokosolja
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Den perfekta grundingrediensen för våra CBD- och CBG-produkter. Lugnande, återfuktande 
                  och antibakteriell - utan att täppa igen dina porer.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300 flex items-center"
                  >
                    Köp våra ansiktsoljor
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
                    src="/Ingredienser/MCT.jpg"
                    alt="MCT Kokosolja ingrediens"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-400/20 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-[#00937c]">MCT</span>
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
                MCT kokosolja erbjuder unika fördelar som gör den till den perfekta grundingrediensen
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
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#00937c] text-white rounded-2xl flex items-center justify-center group-hover:bg-[#E79C1A] transition-colors duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What is MCT Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Vad är MCT kokosolja?</h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Vi använder <strong>MCT kokosolja som en grundingrediens</strong> för våra CBD- och CBG-produkter. 
                  Denna fantastiska olja är lugnande, återfuktande och antibakteriell utan att täppa igen dina porer.
                </p>
                <p>
                  Dessutom så <strong>skyddar denna olja din hud</strong> från diverse olika elakartade mikrober 
                  som bakterier, virus, svampar och andra skadliga organismer.
                </p>
                <p>
                  MCT kokosolja innehåller även <strong>laurinsyra</strong> som är en välkänd ingrediens för att 
                  hjälpa och stötta upp en rad olika hudtillstånd.
                </p>
              </div>
            </motion.div>

            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">MCT Fördelar</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mctBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-[#00937c] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MCT vs Regular Coconut Oil */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">MCT vs Vanlig Kokosolja</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Så, vad är då skillnaden mellan "vanlig" kokosolja och MCT kokosolja?
              </p>
              <div className="bg-gradient-to-r from-[#00937c] to-[#00b89d] text-white rounded-2xl p-6 max-w-4xl mx-auto mb-12">
                <p className="text-lg">
                  <strong>MCT står för Medium-Chain Triglycerides</strong> - det betyder helt enkelt mättade fetter 
                  som kommer från kokosolja. Skillnaden ligger i de typer av mättade fetter de innehåller.
                </p>
              </div>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="bg-gray-50 p-6 font-semibold text-gray-800">
                    <h3 className="text-lg">Aspekt</h3>
                  </div>
                  <div className="bg-orange-50 p-6 font-semibold text-orange-800">
                    <h3 className="text-lg">Vanlig Kokosolja</h3>
                  </div>
                  <div className="bg-[#00937c] bg-opacity-10 p-6 font-semibold text-[#00937c]">
                    <h3 className="text-lg">MCT Kokosolja</h3>
                  </div>
                </div>
                {mctVsRegular.map((comparison, index) => (
                  <motion.div
                    key={comparison.aspect}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="grid md:grid-cols-3 gap-0 border-t border-gray-200"
                  >
                    <div className="p-6 bg-gray-50 font-medium text-gray-800">
                      {comparison.aspect}
                    </div>
                    <div className="p-6 bg-white text-gray-600">
                      {comparison.regular}
                    </div>
                    <div className="p-6 bg-white text-[#00937c] font-medium">
                      {comparison.mct}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Explanation */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Vetenskapen bakom MCT</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    <strong>Kokosolja</strong> innehåller både långkedjade och mellankedjade fettsyror, 
                    medan <strong>MCT kokosolja endast innehåller mellankedjade fettsyror</strong>.
                  </p>
                  <p>
                    Även om MCT-oljan kommer från kokosolja, så innehåller "vanlig" kokosolja bara 
                    <strong>15% MCT-olja</strong>. Våra produkter använder 100% ren MCT-olja för maximal effekt.
                  </p>
                  <p>
                    Båda oljorna är snarlika till utseendet, men <strong>MCT-oljan är något tunnare i konsistensen</strong>, 
                    vilket gör den perfekt för hudvård då den absorberas snabbare och känns lättare på huden.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Laurinsyra - Nyckelingrediensen</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Heart className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Hudstödjande egenskaper</h4>
                      <p className="text-sm opacity-90">Hjälper till att stödja olika hudtillstånd</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Antimikrobiell verkan</h4>
                      <p className="text-sm opacity-90">Naturligt skydd mot skadliga mikroorganismer</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Sparkles className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Förstärker CBD/CBG</h4>
                      <p className="text-sm opacity-90">Optimal bärare för cannabinoider</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Perfect Carrier Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Perfekt Symbios med CBD & CBG</h2>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    MCT
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500 mx-4" />
                  <div className="w-16 h-16 bg-[#00937c] rounded-full flex items-center justify-center text-white font-bold mr-2">
                    CBD
                  </div>
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold ml-2">
                    CBG
                  </div>
                </div>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  MCT kokosolja fungerar som den <strong>perfekta bäraren</strong> för CBD och CBG, 
                  vilket förbättrar deras absorption och effektivitet i huden.
                </p>
                <p className="text-lg text-gray-600">
                  Kombinationen skapar en synergistisk effekt som maximerar fördelarna av alla ingredienser 
                  för optimal hudvård och välbefinnande.
                </p>
              </div>
            </motion.div>
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
                Välkomna en frisk och strålande hud!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev kraften i MCT kokosolja kombinerat med CBD och CBG för ultimat hudvård.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300"
                  >
                    Köp ansiktsoljor
                  </motion.button>
                </Link>
                <Link href="/om-oss/ingredienser">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-[#00937c] text-[#00937c] rounded-full font-semibold hover:bg-[#00937c] hover:text-white transition-colors duration-300"
                  >
                    Alla ingredienser
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