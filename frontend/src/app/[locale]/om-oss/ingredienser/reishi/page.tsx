'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Shield, Heart, Moon, Sparkles, ArrowRight, CheckCircle, Zap, Brain } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Immunstärkande egenskaper',
    description: 'Balanserar och stärker immunsystemets funktion genom att stimulera vita blodkroppar som T-celler och makrofager.'
  },
  {
    icon: <Moon className="w-8 h-8" />,
    title: 'Stresshantering och avslappning',
    description: 'Adaptogen som hjälper kroppen hantera stress och reglerar stresshormoner som kortisol för bättre välbefinnande.'
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Antioxidantaktivitet',
    description: 'Rik på antioxidanter som polysackarider och triterpener som skyddar mot fria radikaler och miljöskador.'
  }
]

const skinBenefits = [
  {
    title: 'Förhindrar för tidigt åldrande',
    description: 'Antioxidanter minskar bildandet av fina linjer, rynkor och pigmentfläckar',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    title: 'Lugnar hudirritationer',
    description: 'Antiinflammatoriska egenskaper lindrar rodnad och inflammation',
    icon: <Heart className="w-6 h-6" />
  },
  {
    title: 'Balanserad hudton',
    description: 'Bidrar till en klarare och mer jämn hudton genom att minska irritationer',
    icon: <Shield className="w-6 h-6" />
  }
]

const immuneBenefits = [
  'Stimulerar T-celler och makrofager',
  'Förbättrar kroppens infektionsförsvar',
  'Minskar risk för hudproblem som akne',
  'Balanserar immunsystemets funktion',
  'Minskar eksem och psoriasis risk',
  'Stärker hudens naturliga barriär'
]

const stressBenefits = [
  {
    category: 'Stressreglering',
    points: [
      'Reglerar kortisolproduktion',
      'Minskar ångest och spänning',
      'Förbättrar stresshantering',
      'Adaptogen egenskaper'
    ]
  },
  {
    category: 'Sömnkvalitet',
    points: [
      'Främjar djupare sömn',
      'Förbättrar återhämtning',
      'Minskar sömnstörningar',
      'Naturlig avslappning'
    ]
  },
  {
    category: 'Hudfördelar',
    points: [
      'Minskar stressrelaterad akne',
      'Reducerar hudrodnad',
      'Främjar strålande hud',
      'Förbättrar hudtextur'
    ]
  }
]

const antioxidantCompounds = [
  {
    name: 'Polysackarider',
    benefit: 'Immunstärkande och hudskyddande',
    description: 'Stärker immunsystemet och skyddar huden från yttre påfrestningar'
  },
  {
    name: 'Triterpener',
    benefit: 'Antiinflammatorisk verkan',
    description: 'Minskar inflammation och främjar läkning av hudirritationer'
  },
  {
    name: 'Beta-glukaner',
    benefit: 'Cellförnyelse',
    description: 'Stimulerar cellförnyelse och förbättrar hudens struktur'
  }
]

export default function ReishiPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Ganoderma Lucidum</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  Reishi
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Otroliga
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Kallas "Odödlighetens Svamp" - en kraftfull adaptogen som balanserar stress, 
                  stärker immunförsvaret och främjar ungdomlig hudskönhet.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300 flex items-center"
                  >
                    Upptäck Reishi-produkter
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
                    src="/Mushrooms/reiki.png"
                    alt="Reishi svamp - Odödlighetens svamp"
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-[#00937c]">REISHI</span>
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
              <h2 className="text-4xl font-bold mb-6">Tre fördelar med Reishi</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Reishi erbjuder unika fördelar som gör den till en av världens mest värdefulla medicinalsvampar
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

        {/* Skin Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Fördelar för huden</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Reishi innehåller en rad bioaktiva föreningar som kan gynna hudens hälsa genom 
                kraftfulla antioxidanter och antiinflammatoriska egenskaper.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {skinBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4 text-[#00937c]">{benefit.title}</h3>
                  <p className="text-gray-600 text-center">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Antioxidant Compounds */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg max-w-5xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-center mb-8 text-[#00937c]">Kraftfulla Antioxidanter</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {antioxidantCompounds.map((compound, index) => (
                  <div key={compound.name} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">{index + 1}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{compound.name}</h4>
                    <p className="text-[#00937c] font-semibold text-sm mb-2">{compound.benefit}</p>
                    <p className="text-gray-600 text-sm">{compound.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Immune System Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Immunstärkande effekt</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Reishi är känd för att vara en kraftfull <strong>immunmodulator</strong>, vilket innebär att 
                    den kan balansera och stärka immunsystemets funktion.
                  </p>
                  <p>
                    Genom att <strong>stimulera T-celler och makrofager</strong> förbättrar Reishi-extrakt 
                    kroppens förmåga att bekämpa infektioner och sjukdomar.
                  </p>
                  <p>
                    En starkare immunförsvar kan även ha en <strong>positiv inverkan på hudens hälsa</strong> 
                    genom att minska risken för hudproblem som ofta är kopplade till immunobalans.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Immunsystem fördelar</h3>
                <div className="space-y-4">
                  {immuneBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-purple-400">
                  <div className="flex items-center justify-center">
                    <Shield className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold">Balanserat immunsystem = Friskare hud</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stress Management Benefits */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Stresshantering och avslappning</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Reishi är en adaptogen ört som hjälper kroppen att anpassa sig till och hantera stress 
                på ett mer effektivt sätt.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {stressBenefits.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-center mb-6 text-[#00937c]">{category.category}</h3>
                  <div className="space-y-3">
                    {category.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 text-[#00937c] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto mt-12"
            >
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">Kortisol-reglering</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                  <h4 className="font-semibold text-red-800 mb-3">Höga kortisolnivåer:</h4>
                  <ul className="text-red-700 text-sm space-y-2">
                    <li>• Stressrelaterad akne</li>
                    <li>• Hudrodnad och inflammation</li>
                    <li>• Försämrad sömn</li>
                    <li>• Ökad ångest</li>
                  </ul>
                </div>
                <div className="bg-[#F5F3F0] border-l-4 border-[#8B7355] p-6 rounded-r-lg">
                  <h4 className="font-semibold text-[#2A1A14] mb-3">Med Reishi-reglering:</h4>
                  <ul className="text-[#3A2A1E] text-sm space-y-2">
                    <li>• Klarare, mer strålande hud</li>
                    <li>• Minskad inflammation</li>
                    <li>• Förbättrad sömn</li>
                    <li>• Naturlig avslappning</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Holistic Wellness */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Holistisk Skönhet & Välbefinnande</h2>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Brain className="w-12 h-12 mr-4" />
                  <Heart className="w-12 h-12 mr-4" />
                  <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-xl leading-relaxed">
                  En sundare stressrespons kan minska risken för stressrelaterade hudproblem och 
                  främja en mer <strong>strålande och ungdomlig hud</strong>.
                </p>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reishi arbetar holistiskt genom att balansera stress, stärka immunförsvaret och 
                skydda mot oxidativ stress - allt för att främja både inre välbefinnande och yttre skönhet.
              </p>
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
                Upptäck "Odödlighetens Svamp"
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev Reishis kraftfulla adaptogena egenskaper för balanserad stress och strålande hud.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300"
                  >
                    Köp Reishi-produkter
                  </motion.button>
                </Link>
                <Link href="#sources">
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