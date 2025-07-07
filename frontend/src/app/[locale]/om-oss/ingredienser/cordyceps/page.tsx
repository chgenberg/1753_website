'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Zap, Heart, Shield, Sparkles, ArrowRight, CheckCircle, Activity, Wind } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Ökad energi och uthållighet',
    description: 'Förbättrar syreupptagning i cellerna och ökar aerob kapacitet för mer energi och minskad trötthet.'
  },
  {
    icon: <Wind className="w-8 h-8" />,
    title: 'Förbättrad syreupptagning och lungfunktion',
    description: 'Optimerar kroppens syreupptagning vilket leder till bättre cirkulation och syresättning av huden.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Immunstärkande egenskaper',
    description: 'Stimulerar vita blodkroppar och förbättrar kroppens försvar mot infektioner och inflammationer.'
  }
]

const skinBenefits = [
  {
    title: 'Förbättrad elasticitet',
    description: 'Bidrar till att förbättra hudens elasticitet och flexibilitet',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    title: 'Optimal fuktighetsnivå',
    description: 'Hjälper till att bibehålla hudens naturliga fuktbalans',
    icon: <Heart className="w-6 h-6" />
  },
  {
    title: 'Strålande hudton',
    description: 'Resulterar i en jämnare och mer strålande hud',
    icon: <Zap className="w-6 h-6" />
  }
]

const energyBenefits = [
  'Förbättrar syreupptagning i cellerna',
  'Ökar aerob kapacitet',
  'Minskar känslor av trötthet',
  'Reducerar utmattning',
  'Främjar aktiv livsstil',
  'Förbättrar cirkulation'
]

const immuneHealthBenefits = [
  {
    category: 'Immunförsvar',
    points: [
      'Stimulerar vita blodkroppar',
      'Förbättrar infektionsförsvar',
      'Stärker immunsystemet',
      'Balanserar immunrespons'
    ]
  },
  {
    category: 'Hudfördelar',
    points: [
      'Minskar inflammationsrisk',
      'Förhindrar hudinfektioner',
      'Reducerar akne och eksem',
      'Främjar hälsosam hudflora'
    ]
  },
  {
    category: 'Allmän Hälsa',
    points: [
      'Minskar allergiska reaktioner',
      'Förbättrar hudbarriär',
      'Stödjer läkningsprocesser',
      'Balanserar mikrobiom'
    ]
  }
]

const oxygenationBenefits = [
  {
    process: 'Syreupptagning',
    normal: 'Begränsad syretillförsel',
    withCordyceps: 'Optimerad syreupptagning'
  },
  {
    process: 'Cirkulation',
    normal: 'Långsam blodcirkulation',
    withCordyceps: 'Förbättrad blodcirkulation'
  },
  {
    process: 'Hudnäring',
    normal: 'Otillräcklig näring till hudceller',
    withCordyceps: 'Optimal näring och syresättning'
  },
  {
    process: 'Energinivå',
    normal: 'Trötthet och utmattning',
    withCordyceps: 'Ökad energi och vitalitet'
  }
]

const adaptogenicBenefits = [
  'Skyddar mot fria radikaler',
  'Minskar oxidativ stress',
  'Förhindrar för tidigt åldrande',
  'Förbättrar hudens återhämtning',
  'Stödjer cellförnyelse',
  'Främjar ungdomlig hudton'
]

export default function CordycepsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Cordyceps Sinensis</span>
                <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                  Cordyceps
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                  Otroliga
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Den "energigivande" svampen som traditionellt använts för att öka energi och uthållighet, 
                  nu erkänd för sina hudvårdande och adaptogena egenskaper.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300 flex items-center"
                  >
                    Upptäck Cordyceps
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
                    src="/Mushrooms/cordyceps.png"
                    alt="Cordyceps svamp - Den energigivande svampen"
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-[#00937c]">CORDYCEPS</span>
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
              <h2 className="text-4xl font-bold mb-6">Tre fördelar med Cordyceps</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cordyceps erbjuder kraftfulla fördelar för energi, syreupptagning och immunförsvar
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
                Cordyceps är rikt på antioxidanter och adaptogena föreningar som stödjer hudens hälsa 
                på flera olika sätt.
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
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
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
              <h3 className="text-2xl font-bold text-center mb-6 text-[#00937c]">Adaptogena Hudfördelar</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {adaptogenicBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-[#00937c] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Energy & Endurance Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Ökad energi och uthållighet</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Cordyceps har traditionellt använts för att <strong>öka energinivåer och förbättra uthålligheten</strong>, 
                    särskilt under fysisk aktivitet.
                  </p>
                  <p>
                    Genom att <strong>förbättra syreupptagningen i cellerna</strong> kan Cordyceps öka den aeroba 
                    kapaciteten och minska känslor av trötthet och utmattning.
                  </p>
                  <p>
                    Denna ökade energi kan också bidra till att främja en <strong>mer aktiv livsstil</strong>, 
                    vilket gynnar hudens hälsa genom förbättrad cirkulation och syresättning.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Energi fördelar</h3>
                <div className="space-y-4">
                  {energyBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-red-400">
                  <div className="flex items-center justify-center">
                    <Activity className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold">Mer energi = Bättre cirkulation</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Oxygenation Process */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Förbättrad syreupptagning</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Cordyceps optimerar kroppens syreupptagning vilket direkt påverkar hudens hälsa och utseende.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="bg-gray-50 p-6 font-semibold text-gray-800">
                    <h3 className="text-lg">Process</h3>
                  </div>
                  <div className="bg-red-50 p-6 font-semibold text-red-800">
                    <h3 className="text-lg">Utan Cordyceps</h3>
                  </div>
                  <div className="bg-[#00937c] bg-opacity-10 p-6 font-semibold text-[#00937c]">
                    <h3 className="text-lg">Med Cordyceps</h3>
                  </div>
                </div>
                {oxygenationBenefits.map((item, index) => (
                  <motion.div
                    key={item.process}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="grid md:grid-cols-3 gap-0 border-t border-gray-200"
                  >
                    <div className="p-6 bg-gray-50 font-medium text-gray-800">
                      {item.process}
                    </div>
                    <div className="p-6 bg-white text-red-600">
                      {item.normal}
                    </div>
                    <div className="p-6 bg-white text-[#00937c] font-medium">
                      {item.withCordyceps}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Immune System Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Immunstärkande egenskaper</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Cordyceps är känt för att stimulera vita blodkroppar och förbättra kroppens försvar 
                mot infektioner och sjukdomar.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {immuneHealthBenefits.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-gray-50 rounded-2xl p-8 shadow-lg"
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
              className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white max-w-4xl mx-auto mt-12"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Immunbalans för hudskönhet</h3>
              <p className="text-lg text-center leading-relaxed">
                En starkare immunförsvar kan också ha <strong>positiva effekter på hudens hälsa</strong> genom att 
                minska risken för inflammation och infektioner som kan bidra till hudproblem som akne och eksem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Holistic Benefits */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Holistisk Energi & Skönhet</h2>
              <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Zap className="w-12 h-12 mr-4" />
                  <Heart className="w-12 h-12 mr-4" />
                  <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-xl leading-relaxed">
                  En <strong>balanserad immunrespons</strong> kan främja en hälsosam hudflora och minska risken 
                  för hudirritationer och allergiska reaktioner.
                </p>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Cordyceps arbetar på flera nivåer - från att öka energi och syreupptagning till att stärka 
                immunförsvaret och skydda mot oxidativ stress, allt för att främja både inre vitalitet och yttre skönhet.
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
                Upptäck den "Energigivande" Svampen
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Upplev Cordyceps kraftfulla energigivande och hudvårdande egenskaper för optimal vitalitet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#007363] transition-colors duration-300"
                  >
                    Köp Cordyceps-produkter
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