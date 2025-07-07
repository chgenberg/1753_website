'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Sparkles, Shield, Zap, Heart, ArrowRight, CheckCircle, Sun, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Antioxidantrik',
    description: 'Kraftfull källa till antioxidanter inklusive superoxiddismutas (SOD) som bekämpar fria radikaler effektivt.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Immunstärkande egenskaper',
    description: 'Ökar produktionen av vita blodkroppar och stärker kroppens naturliga försvar mot infektioner.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Antiinflammatorisk effekt',
    description: 'Minskar inflammation i hela kroppen och kan vara fördelaktigt för inflammatoriska hudtillstånd.'
  }
]

const skinBenefits = [
  {
    title: 'Bekämpar hudåldrande',
    description: 'Antioxidanter bekämpar fria radikaler som bryter ner kollagen och elastin',
    icon: <Sun className="w-6 h-6" />
  },
  {
    title: 'UV-skydd',
    description: 'Innehåller melanin som skyddar huden mot solens skadliga UV-strålar',
    icon: <Shield className="w-6 h-6" />
  },
  {
    title: 'Ungdomlig hudton',
    description: 'Främjar en mer strålande och ungdomlig hudton genom antioxidativ verkan',
    icon: <Sparkles className="w-6 h-6" />
  }
]

const healthBenefits = [
  'Ökar produktionen av vita blodkroppar',
  'Stärker T-celler och makrofager',
  'Minskar risk för hudproblem som akne och eksem',
  'Balanserar immunsystemet',
  'Minskar inflammation i hela kroppen',
  'Stödjer hälsosam hormonbalans'
]

const holisticBenefits = [
  {
    category: 'Hudfördelar',
    points: [
      'Skyddar mot fria radikaler',
      'Förhindrar för tidigt åldrande',
      'Minskar rynkor och slapp hud',
      'Naturligt UV-skydd'
    ]
  },
  {
    category: 'Immunförsvar',
    points: [
      'Stärker immunsystemet',
      'Ökar vita blodkroppar',
      'Minskar infektionsrisk',
      'Balanserar immunrespons'
    ]
  },
  {
    category: 'Allmän hälsa',
    points: [
      'Antiinflammatorisk effekt',
      'Förbättrad matsmältning',
      'Stödjer hormonbalans',
      'Holistisk välbefinnande'
    ]
  }
]

export default function ChagaPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Medicinal Svamp</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  Chaga
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Fantastiska
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Kallas "Skogens Diamant" - en kraftfull antioxidantrik svamp som stödjer både 
                  hudskönhet och kroppens naturliga försvar.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300 flex items-center"
                  >
                    Upptäck Chaga-produkter
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
                    src="/Mushrooms/chaga.png"
                    alt="Chaga svamp - Skogens diamant"
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-[#00937c]">CHAGA</span>
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
              <h2 className="text-4xl font-bold mb-6">Tre fördelar med Chaga</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chaga erbjuder kraftfulla fördelar för både hud och kropp genom sina unika egenskaper
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
                Chaga är en kraftfull källa till antioxidanter som effektivt bekämpar fria radikaler - 
                huvudsakliga orsaker till hudens åldrande.
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
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
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
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">Superoxiddismutas (SOD)</h3>
              <p className="text-lg text-gray-700 text-center leading-relaxed mb-6">
                Chaga innehåller höga nivåer av <strong>superoxiddismutas (SOD)</strong>, ett av kroppens mest 
                kraftfulla antioxidanter. SOD bryter ned fria radikaler som annars skulle:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Utan SOD-skydd:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Bryta ned kollagen och elastin</li>
                    <li>• Orsaka rynkor och slapp hud</li>
                    <li>• Accelerera hudåldrande</li>
                  </ul>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Med Chaga SOD:</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Skyddar kollagen och elastin</li>
                    <li>• Bevarar hudens fasthet</li>
                    <li>• Främjar ungdomlig hudton</li>
                  </ul>
                </div>
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
                    Chaga är känt för sina <strong>immunstärkande egenskaper</strong>. Dess förmåga att öka 
                    produktionen av vita blodkroppar hjälper till att förstärka kroppens försvar.
                  </p>
                  <p>
                    Genom att <strong>stimulera T-celler och makrofager</strong> stärker Chaga immunsystemets 
                    förmåga att bekämpa infektioner och sjukdomar.
                  </p>
                  <p>
                    Ett starkt immunförsvar minskar också risken för <strong>hudproblem som akne och eksem</strong>, 
                    eftersom dessa ofta är resultatet av en obalans i immunsystemet.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Immunsystem fördelar</h3>
                <div className="space-y-4">
                  {healthBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-orange-500">
                  <div className="flex items-center justify-center">
                    <Users className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold">Balanserat immunsystem = Friskare hud</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Holistic Benefits */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Förbättrad kroppslig hälsa</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Förutom sina positiva effekter på huden kan Chaga-extrakt också främja en bättre allmän hälsa 
                genom sina antiinflammatoriska egenskaper.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {holisticBenefits.map((category, index) => (
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

        {/* Holistic Approach */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Holistisk metod för skönhet</h2>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
                <p className="text-xl leading-relaxed">
                  <strong>Sammanfattningsvis</strong> kan intag av Chaga-extrakt vara en <strong>mångsidig och 
                  holistisk metod</strong> för att främja både hudens skönhet och kroppens välbefinnande.
                </p>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                En balanserad inflammatorisk respons i kroppen bidrar till att förbättra matsmältningen 
                och stödja en hälsosam hormonbalans, vilket också avspeglar sig i hudens utseende och hälsa.
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
                Upptäck "Skogens Diamant"
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev Chagas kraftfulla antioxidanter och immunstärkande egenskaper för optimal hud och hälsa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300"
                  >
                    Köp Chaga-produkter
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