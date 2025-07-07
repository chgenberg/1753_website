'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Droplets, Shield, Heart, Sparkles, ArrowRight, CheckCircle, Leaf, Sun } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Droplets className="w-8 h-8" />,
    title: 'Djup återfuktning utan att täppa porer',
    description: 'Jojoba-olja har en molekylstruktur som liknar hudens naturliga sebum, vilket gör den perfekt för alla hudtyper.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Naturlig hudbarriär',
    description: 'Stärker hudens skyddsbarriär och hjälper till att bevara fukt samtidigt som den skyddar mot miljöpåfrestningar.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Antiinflammatorisk och lugnande',
    description: 'Innehåller naturliga antiinflammatoriska föreningar som lugnar irriterad hud och minskar rodnad.'
  }
]

const uniqueProperties = [
  {
    title: 'Tekniskt sett inte en olja',
    description: 'Jojoba är faktiskt en flytande vaxester, inte en traditionell olja',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    title: 'Liknar hudens sebum',
    description: 'Molekylstrukturen efterliknar hudens naturliga oljor perfekt',
    icon: <Heart className="w-6 h-6" />
  },
  {
    title: 'Extremt stabil',
    description: 'Oxiderar inte och håller sig färsk mycket längre än andra oljor',
    icon: <Shield className="w-6 h-6" />
  },
  {
    title: 'Komedogen rating: 0-1',
    description: 'Täpper inte igen porer och är säker för aknebenägen hud',
    icon: <Droplets className="w-6 h-6" />
  }
]

const skinBenefits = [
  'Balanserar sebumproduktion',
  'Minskar synligheten av fina linjer',
  'Förbättrar hudens elasticitet',
  'Lugnar inflammationer och rodnad',
  'Skyddar mot fukttorka',
  'Främjar cellförnyelse'
]

const howItWorks = [
  {
    step: '01',
    title: 'Penetrerar djupt',
    description: 'Tränger ner i hudlagren utan att lämna en oljig känsla'
  },
  {
    step: '02',
    title: 'Efterliknar sebum',
    description: 'Integreras seamlessly med hudens naturliga oljor'
  },
  {
    step: '03',
    title: 'Balanserar produktion',
    description: 'Signalerar till huden att minska överproduktion av sebum'
  },
  {
    step: '04',
    title: 'Långvarig effekt',
    description: 'Ger bestående fukt och skydd utan att bygga upp lager'
  }
]

const comparisonData = [
  {
    aspect: 'Absorption',
    jojoba: 'Snabb absorption, ingen oljig känsla',
    other: 'Långsam absorption, kan kännas oljig'
  },
  {
    aspect: 'Porblockering',
    jojoba: 'Täpper aldrig igen porer (komedogen 0-1)',
    other: 'Kan täppa porer (komedogen 2-5)'
  },
  {
    aspect: 'Stabilitet',
    jojoba: 'Extremt stabil, oxiderar inte',
    other: 'Kan härskna och oxidera över tid'
  },
  {
    aspect: 'Hudtyper',
    jojoba: 'Passar alla hudtyper, även känslig',
    other: 'Kan orsaka reaktioner på känslig hud'
  }
]

const nutritionalProfile = [
  {
    component: 'Vitamin E',
    benefit: 'Kraftfull antioxidant som skyddar mot fria radikaler',
    percentage: 'Naturligt förekommande'
  },
  {
    component: 'Gadoleinsyra',
    benefit: 'Antiinflammatorisk omega-9 fettsyra',
    percentage: '65-80%'
  },
  {
    component: 'Erukasyra',
    benefit: 'Främjar cellregenerering och läkning',
    percentage: '10-15%'
  },
  {
    component: 'Oleinsyra',
    benefit: 'Mjukgörande och återfuktande egenskaper',
    percentage: '5-15%'
  }
]

export default function JojobaOljaPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Simmondsia Chinensis</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  Jojoba Olja
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Den perfekta
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Naturens egen efterlikning av hudens sebum - en flytande vaxester som ger djup återfuktning 
                  utan att täppa porer eller lämna oljig känsla.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300 flex items-center"
                  >
                    Upptäck Jojoba-produkter
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
                    src="/Ingredienser/jojoba.jpg"
                    alt="Jojoba olja ingrediens"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-[#00937c]">JOJOBA</span>
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
                Jojoba-olja erbjuder unika fördelar som gör den till den perfekta hudvårdsingrediensen
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

        {/* What Makes Jojoba Unique */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Vad gör Jojoba så unik?</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Till skillnad från andra "oljor" är Jojoba faktiskt en flytande vaxester som har 
                en molekylstruktur nästan identisk med hudens naturliga sebum.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {uniqueProperties.map((property, index) => (
                <motion.div
                  key={property.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                    {property.icon}
                  </div>
                  <h3 className="text-lg font-bold text-center mb-3 text-[#00937c]">{property.title}</h3>
                  <p className="text-gray-600 text-center text-sm">{property.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">Hudfördelar</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {skinBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-[#00937c] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How Jojoba Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Så fungerar Jojoba på huden</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                En steg-för-steg genomgång av hur Jojoba integreras med hudens naturliga processer
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
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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

        {/* Jojoba vs Other Oils */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Jojoba vs Andra Oljor</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Se varför Jojoba överträffar traditionella hudvårdsoljor på alla viktiga områden.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="bg-gray-50 p-6 font-semibold text-gray-800">
                    <h3 className="text-lg">Aspekt</h3>
                  </div>
                  <div className="bg-[#00937c] bg-opacity-10 p-6 font-semibold text-[#00937c]">
                    <h3 className="text-lg">Jojoba-olja</h3>
                  </div>
                  <div className="bg-orange-50 p-6 font-semibold text-orange-800">
                    <h3 className="text-lg">Andra oljor</h3>
                  </div>
                </div>
                {comparisonData.map((comparison, index) => (
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
                    <div className="p-6 bg-white text-[#00937c] font-medium">
                      {comparison.jojoba}
                    </div>
                    <div className="p-6 bg-white text-orange-600">
                      {comparison.other}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nutritional Profile */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Näringssammansättning</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Jojoba-olja innehåller en unik blandning av fettsyror och antioxidanter som gynnar hudens hälsa.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {nutritionalProfile.map((component, index) => (
                <motion.div
                  key={component.component}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#00937c]">{component.component}</h3>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                      {component.percentage}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{component.benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Perfect Carrier Oil */}
        <section className="py-20 bg-gradient-to-br from-[#00937c] to-[#00b89d] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Sun className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-8">Den perfekta bäraroljan</h2>
              <p className="text-xl leading-relaxed mb-8">
                Jojoba-olja fungerar som en <strong>idealisk bärare för CBD, CBG och andra aktiva ingredienser</strong>, 
                vilket förbättrar deras absorption och effektivitet i huden.
              </p>
              <div className="bg-white/20 rounded-2xl p-6">
                <p className="text-lg">
                  "Dess unika molekylstruktur gör att aktiva ingredienser kan penetrera djupare 
                  och verka mer effektivt än med traditionella oljor."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sustainability & Origin */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Hållbarhet & Ursprung</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Leaf className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Ökenresistent växt</h4>
                      <p className="text-gray-600">Jojoba-busken växer i torra klimat och kräver minimal vattenresurs.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Koldioxidneutral</h4>
                      <p className="text-gray-600">Jojoba-plantor absorberar mer koldioxid än de producerar.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-[#00937c] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Etisk odling</h4>
                      <p className="text-gray-600">Vårt Jojoba kommer från certifierat hållbara odlingar.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl p-8 text-white text-center"
              >
                <h3 className="text-2xl font-bold mb-6">Från öken till hud</h3>
                <p className="text-lg opacity-90 mb-6">
                  Jojoba har använts av ursprungsbefolkningen i Sonora-öknen i över 400 år för 
                  sina exceptionella hudvårdande egenskaper.
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-sm">
                    Idag odlas Jojoba hållbart i Arizona, Argentina och Australien med modern 
                    teknik som bevarar dess naturliga egenskaper.
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
                Upptäck naturens perfekta hudvårdsolja
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev Jojoba-oljans unika förmåga att efterlikna hudens naturliga processer för optimal hudvård.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300"
                  >
                    Köp Jojoba-produkter
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