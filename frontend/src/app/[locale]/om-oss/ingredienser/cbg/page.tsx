'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Sparkles, Shield, Droplets, Heart, Award, ArrowRight, CheckCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const keyBenefits = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Anti-bakteriell',
    description: 'CBG har kraftfulla antibakteriella egenskaper som hjälper till att bekämpa skadliga bakterier och främjar en hälsosam hudflora.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Anti-inflammatoriskt',
    description: 'Minskar inflammation i huden och lugnar irritationer, vilket resulterar i en mer balanserad och frisk hudton.'
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Antioxidant',
    description: 'Skyddar huden mot fria radikaler och oxidativ stress, vilket förhindrar för tidigt åldrande och bevarar hudens ungdomlighet.'
  }
]

const ecsComponents = [
  {
    title: 'Receptorer',
    description: 'CB1, CB2 och TRPV4 receptorer finns i varje del av huden - hudceller, talgkörtlar, svettkörtlar, melanocyter',
    detail: 'Dessa receptorer påverkar cellförnyelse, sebumproduktion, svettproduktion, hyaluronsyraproduktion, mikrobiell mångfald och immunsystem'
  },
  {
    title: 'Endocannabinoider',
    description: 'Naturliga "nycklar" som produceras av huden för att aktivera receptorerna',
    detail: 'Helt nödvändiga för att ECS ska vara i balans och huden ska vara frisk'
  },
  {
    title: 'Enzymer',
    description: 'Tar bort endocannabinoiderna när de inte längre behövs',
    detail: 'Säkerställer att systemet fungerar optimalt utan överaktivering'
  }
]

const problemSolution = [
  {
    problem: 'Västerländsk livsstil',
    effect: 'Minskad produktion av endocannabinoider',
    solution: 'CBG fungerar som identisk kopia av kroppens egna endocannabinoider'
  }
]

const cbgResults = [
  'Friskare hud med mer elasticitet och fasthet',
  'Mer naturlig glow och lyster',
  'Lägre risk för inflammationer',
  'Balanserat endocannabinoidsystem',
  'Förbättrad hudstruktur och textur'
]

export default function CBGPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Cannabigerol</span>
                <h2 className="text-3xl font-semibold text-gray-700 mb-2">
                  Det enastående
                </h2>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  CBG
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Kallad "Mother of All Cannabinoids" - CBG är förmodligen världens bästa hudvårdsingrediens 
                  för optimal hudhälsa och balanserat endocannabinoidsystem.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300 flex items-center"
                  >
                    Köp våra CBG-produkter
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
                    src="/Cannabis/CBG.jpg"
                    alt="CBG Cannabis ingrediens"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-[#00937c]">CBG</span>
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
                CBG:s mångsidiga egenskaper gör det till en revolutionerande ingrediens för hudbalans
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

        {/* What is CBG Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-8">Vad är CBG?</h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Om du vill uppnå en optimal hudhälsa så är <strong>CBG förmodligen världens bästa hudvårdsingrediens</strong>. 
                  CBG (Cannabigerol) kallas för <strong>"Mother of All Cannabinoids"</strong> och hjälper din huds 
                  endocannabinoidsystem att komma i balans.
                </p>
                <p>
                  För att förstå storheten i CBG så måste vi kort repetera hur vårt huds endocannabinoidsystem fungerar.
                </p>
              </div>
            </motion.div>

            {/* ECS Components */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {ecsComponents.map((component, index) => (
                <motion.div
                  key={component.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00937c] to-[#00b89d] text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-4 text-[#00937c]">{component.title}</h3>
                  <p className="text-gray-700 mb-4 text-center">{component.description}</p>
                  <p className="text-sm text-gray-600 text-center">{component.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-8">Problemet & Lösningen</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Så länge vår hud producerar tillräckligt många <strong>endocannabinoider</strong> så är allt frid och fröjd - 
                    huden är balanserad, icke-inflammerad med så få ålderstecken som möjligt.
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Men...</h4>
                    <p className="text-red-700">
                      Tyvärr så har vår västerländska livsstil bidragit till att vi tappat vår förmåga att producera 
                      tillräckligt många endocannabinoider. Detta leder till negativa hudtillstånd och inflammationer.
                    </p>
                  </div>
                  <div className="bg-[#F5F3F0] border-l-4 border-[#8B7355] p-6 rounded-r-lg">
                    <h4 className="font-semibold text-[#2A1A14] mb-2">Lösningen: CBG</h4>
                    <p className="text-[#3A2A1E]">
                      CBG är en <strong>identisk kopia</strong> av de endocannabinoider som vår hud själv producerar. 
                      CBG kan fungera som "nycklar" för våra hudreceptorer när vi inte har tillräckligt med egna.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#00937c] to-[#00b89d] rounded-3xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">CBG Resultat</h3>
                <div className="space-y-4">
                  {cbgResults.map((result, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                      <span className="text-lg">{result}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CBG + CBD Synergy */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Kraftfull Kombination</h2>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-[#00937c] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    CBG
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500 mx-4" />
                  <div className="w-20 h-20 bg-[#FCB237] rounded-full flex items-center justify-center text-white font-bold text-xl ml-4">
                    CBD
                  </div>
                </div>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  Detta är en ingrediens som i <strong>kombination med CBD</strong> ger resultat i huden 
                  som du aldrig tidigare upplevt.
                </p>
                <p className="text-lg text-gray-600">
                  Tillsammans skapar CBG och CBD en synergistisk effekt som optimerar hudens 
                  endocannabinoidsystem för maximal hälsa och skönhet.
                </p>
              </div>
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
                Upplev "Mother of All Cannabinoids"
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ge din hud den ultimata balansen med CBG - världens mest avancerade hudvårdsingrediens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300"
                  >
                    Köp CBG-produkter
                  </motion.button>
                </Link>
                <Link href="/om-oss/ingredienser/cbd">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-[#00937c] text-[#00937c] rounded-full font-semibold hover:bg-[#00937c] hover:text-white transition-colors duration-300"
                  >
                    Läs om CBD
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