'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Brain, Shield, Heart, Sparkles, ArrowRight, CheckCircle, Zap, Activity } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'Kognitiva fördelar',
    description: 'Stimulerar nervtillväxt och främjar neuroplasticitet för förbättrad mental skärpa och kognitiv funktion.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Neuroskyddande egenskaper',
    description: 'Skyddar nervceller och nervbanor, stödjer sund nerv-muskelförbindelse för fastare och mer tonad hud.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Mag- och tarmhälsa',
    description: 'Stödjer en hälsosam tarmflora och matsmältningssystem, vilket avspeglas i hudens utseende och hälsa.'
  }
]

const skinBenefits = [
  {
    title: 'Förhindrar oxidativ stress',
    description: 'Antioxidanter skyddar mot fria radikaler och förebygger tidigt åldrande',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    title: 'Lugnar hudirritationer',
    description: 'Antiinflammatoriska egenskaper reducerar rodnad och inflammation',
    icon: <Heart className="w-6 h-6" />
  },
  {
    title: 'Jämnare hudton',
    description: 'Bidrar till en mer balanserad och strålande hudton',
    icon: <Shield className="w-6 h-6" />
  }
]

const neuroprotectiveBenefits = [
  'Stimulerar nervtillväxt',
  'Främjar neuroplasticitet',
  'Skyddar nervceller',
  'Stödjer nervbanor',
  'Förbättrar nerv-muskelförbindelse',
  'Bidrar till fastare hudstruktur'
]

const cognitiveWellness = [
  {
    category: 'Mental Skärpa',
    points: [
      'Förbättrad koncentration',
      'Ökad mental klarhet',
      'Bättre minnesförmåga',
      'Stärkt fokus'
    ]
  },
  {
    category: 'Neurologisk Hälsa',
    points: [
      'Nervskydd och reparation',
      'Förbättrad neuroplasticitet',
      'Stödjer nervtillväxt',
      'Balanserar nervsystemet'
    ]
  },
  {
    category: 'Hudfördelar',
    points: [
      'Strålande hudton',
      'Fastare hudstruktur',
      'Förbättrad textur',
      'Ungdomlig utstrålning'
    ]
  }
]

const stressAdaptation = [
  {
    problem: 'Stress och oro',
    effect: 'Höga kortisolnivåer',
    solution: 'Lion\'s Mane reglerar stresshormoner'
  },
  {
    problem: 'Mental trötthet',
    effect: 'Nedsatt kognitiv funktion',
    solution: 'Förbättrar mental skärpa och fokus'
  },
  {
    problem: 'Stressrelaterade hudproblem',
    effect: 'Akne och rodnad',
    solution: 'Minskar stressrelaterade hudutbrott'
  }
]

const holisticBenefits = [
  'Skyddar mot oxidativ stress',
  'Minskar tidigt åldrande',
  'Förhindrar rynkor och fina linjer',
  'Skyddar mot pigmentfläckar',
  'Förbättrar neurologisk funktion',
  'Främjar strålande hudton'
]

export default function LionsManeePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Hericium Erinaceus</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  Lion's Mane
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Helt unika
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Den "smarta" svampen som stödjer både hjärnans och hudens hälsa genom kraftfulla 
                  neuroskyddande egenskaper och adaptogena fördelar.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300 flex items-center"
                  >
                    Upptäck Lion's Mane
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
                    src="/Mushrooms/lionsmane.png"
                    alt="Lion's Mane svamp - Den smarta svampen"
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-[#00937c]">LION'S</span>
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
              <h2 className="text-4xl font-bold mb-6">Tre fördelar med Lion's Mane</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Lion's Mane erbjuder unika neuroskyddande egenskaper som gynnar både mental hälsa och hudskönhet
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
                Lion's Mane är rikt på antioxidanter och föreningar som skyddar huden från skador 
                orsakade av fria radikaler och yttre faktorer.
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
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4 text-[#00937c]">{benefit.title}</h3>
                  <p className="text-gray-600 text-center">{benefit.description}</p>
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
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">Antioxidativ Hudskydd</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {holisticBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-[#00937c] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Neuroprotective Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Neuroprotektiva egenskaper</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Lion's Mane innehåller föreningar som <strong>stimulerar nervtillväxt och främjar neuroplasticitet</strong>, 
                    vilket är avgörande för att bibehålla en frisk och ungdomlig hud.
                  </p>
                  <p>
                    Genom att <strong>skydda nervceller och nervbanor</strong> i hjärnan och nervsystemet kan 
                    Lion's Mane-extrakt stödja en sund nerv-muskelförbindelse.
                  </p>
                  <p>
                    En förbättrad neurologisk funktion och mental skärpa kan <strong>avspeglas i hudens utseende</strong>, 
                    vilket ger en mer strålande och ungdomlig hudton.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Neuroskyddande fördelar</h3>
                <div className="space-y-4">
                  {neuroprotectiveBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-orange-400">
                  <div className="flex items-center justify-center">
                    <Activity className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold">Frisk hjärna = Frisk hud</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cognitive & Wellness Benefits */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Kognitiv Hälsa & Välbefinnande</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Lion's Mane stödjer både mental skärpa och hudskönhet genom sina unika neuroskyddande egenskaper.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {cognitiveWellness.map((category, index) => (
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
          </div>
        </section>

        {/* Stress Management */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Stresshantering och mental balans</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Lion's Mane är känd för sina adaptogena egenskaper som hjälper kroppen att hantera 
                och anpassa sig till stressiga situationer.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="bg-gray-50 p-6 font-semibold text-gray-800">
                    <h3 className="text-lg">Problem</h3>
                  </div>
                  <div className="bg-red-50 p-6 font-semibold text-red-800">
                    <h3 className="text-lg">Effekt</h3>
                  </div>
                  <div className="bg-[#00937c] bg-opacity-10 p-6 font-semibold text-[#00937c]">
                    <h3 className="text-lg">Lion's Mane Lösning</h3>
                  </div>
                </div>
                {stressAdaptation.map((item, index) => (
                  <motion.div
                    key={item.problem}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="grid md:grid-cols-3 gap-0 border-t border-gray-200"
                  >
                    <div className="p-6 bg-gray-50 text-gray-800">
                      {item.problem}
                    </div>
                    <div className="p-6 bg-white text-red-600">
                      {item.effect}
                    </div>
                    <div className="p-6 bg-white text-[#00937c] font-medium">
                      {item.solution}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mind-Skin Connection */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Hjärn-Hud Kopplingen</h2>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Brain className="w-12 h-12 mr-4" />
                  <Zap className="w-8 h-8 mr-4" />
                  <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-xl leading-relaxed">
                  En regelbunden konsumtion av Lion's Mane-extrakt kan främja en <strong>klarare, friskare 
                  och mer strålande hud</strong> genom att stödja både neurologisk funktion och stresshantering.
                </p>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Denna avslappnande effekt förbättrar inte bara sömnen och främjar välbefinnande, utan har också 
                positiva effekter på hudens hälsa genom att minska stressrelaterade hudproblem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Upptäck den "Smarta" Svampen
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev Lion's Manes unika neuroskyddande egenskaper för både mental skärpa och hudskönhet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300"
                  >
                    Köp Lion's Mane
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