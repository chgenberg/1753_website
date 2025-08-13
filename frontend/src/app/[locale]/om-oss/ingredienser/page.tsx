'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Leaf, Shield, Droplets, Sparkles, Heart, Award } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'



const keyIngredients = [
  {
    name: 'CBD',
    icon: <Leaf className="w-8 h-8" />,
    description: 'En av de mest effektiva men underskattade ingredienserna i världen.',
    category: 'cannabinoid'
  },
  {
    name: 'CBG',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'En mindre känd cannabinoid som har en fantastisk effekt för din huds ECS.',
    category: 'cannabinoid'
  },
  {
    name: 'MCT Kokosolja',
    icon: <Droplets className="w-8 h-8" />,
    description: 'Vi använder denna olja som basolja för vår CBD and CBG. Detta är en enastående ingrediens för att optimera din hudshälsa.',
    category: 'base'
  },
  {
    name: 'Jojoba Olja',
    icon: <Heart className="w-8 h-8" />,
    description: 'Naturens egen efterlikning av hudens sebum - en flytande vaxester som ger djup återfuktning utan att täppa porer.',
    category: 'base'
  }
]

const mushroomIngredients = [
  {
    name: 'Chaga',
    icon: <Shield className="w-8 h-8" />,
    description: 'Chaga är en fantastisk medicinsk svamp som b.la. hjälper till att balansera immunförsvaret!',
    category: 'mushroom'
  },
  {
    name: 'Reishi',
    icon: <Heart className="w-8 h-8" />,
    description: 'Reishi är en enastående medicinsk svamp som b.la. stödjer sömn och ger avslappning!',
    category: 'mushroom'
  },
  {
    name: "Lion's Mane",
    icon: <Award className="w-8 h-8" />,
    description: "Lion's Mane har under tusentals år använts för dess strålande egenskaper. Den stödjer b.la. fokus och minne!",
    category: 'mushroom'
  },
  {
    name: 'Cordyceps',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Cordyceps är en verklig unik medicinsk svamp som b.la. stödjer energi och fysisk prestation!',
    category: 'mushroom'
  }
]



export default function IngredientsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/Porträtt_hemsidan/Ingredienser-desktop.png"
              alt="Ingredienser hero"
              fill
              sizes="100vw"
              className="object-cover hidden md:block"
              priority
            />
            <Image
              src="/Porträtt_hemsidan/Ingredienser.png"
              alt="Ingredienser hero"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <span className="text-[#FCB237] font-medium text-sm uppercase tracking-wider">Ingredienser</span>
              <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                Låt oss prata växter
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Vi har noggrant valt ut de mest effektiva naturliga ingredienserna för att optimera 
                din hudshälsa genom att stödja hudens endocannabinoidsystem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Ingredients Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Nyckelingredienser</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dessa kraftfulla ingredienser bildar grunden i våra mest effektiva produkter.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {keyIngredients.map((ingredient, index) => (
                <motion.a
                  key={ingredient.name}
                  href={
                    ingredient.name === 'MCT Kokosolja' ? '/om-oss/ingredienser/mct-kokosolja' :
                    ingredient.name === 'Jojoba Olja' ? '/om-oss/ingredienser/jojoba-olja' :
                    `/om-oss/ingredienser/${ingredient.name.toLowerCase()}`
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="block bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-center">
                    {/* Image or Icon */}
                    {(ingredient.name === 'CBD' || ingredient.name === 'CBG') ? (
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={`/Cannabis/${ingredient.name}.jpg`}
                          alt={`${ingredient.name} ingrediens`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (ingredient.name === 'MCT Kokosolja' || ingredient.name === 'Jojoba Olja') ? (
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={`/Ingredienser/${ingredient.name === 'MCT Kokosolja' ? 'MCT' : 'jojoba'}.jpg`}
                          alt={`${ingredient.name} ingrediens`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-[#FCB237] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#E79C1A] transition-colors duration-300">
                        {ingredient.icon}
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-[#FCB237] transition-colors">{ingredient.name}</h3>
                    <p className="text-gray-600 mb-6">{ingredient.description}</p>
                    <span className="inline-block px-6 py-2 bg-[#FCB237] text-white rounded-full font-medium group-hover:bg-[#E79C1A] transition-colors duration-300">
                      Läs mer
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Medicinal Mushrooms Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Medicinsvampar
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Våra noggrant utvalda medicinsvampar har använts i tusentals år för sina kraftfulla hälsofrämjande egenskaper.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
              {/* Chaga */}
              <motion.a
                href="/om-oss/ingredienser/chaga"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/Mushrooms/chaga.png"
                    alt="Chaga svamp"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FCB237] transition-colors">Chaga</h3>
                  <p className="text-gray-600 mb-4">
                    "Skogens diamant" - Rik på antioxidanter och stärker immunförsvaret
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      Antioxidanter
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Immunförsvar
                    </span>
                  </div>
                  <span className="text-[#FCB237] hover:text-[#E79C1A] font-medium flex items-center">
                    Läs mer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </motion.a>

              {/* Reishi */}
              <motion.a
                href="/om-oss/ingredienser/reishi"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/Mushrooms/reiki.png"
                    alt="Reishi svamp"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FCB237] transition-colors">Reishi</h3>
                  <p className="text-gray-600 mb-4">
                    "Odödlighetens svamp" - Adaptogen som balanserar stress och sömn
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Adaptogen
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Stressbalans
                    </span>
                  </div>
                  <span className="text-[#FCB237] hover:text-[#E79C1A] font-medium flex items-center">
                    Läs mer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </motion.a>

              {/* Lion's Mane */}
              <motion.a
                href="/om-oss/ingredienser/lions-mane"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/Mushrooms/lionsmane.png"
                    alt="Lion's Mane svamp"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FCB237] transition-colors">Lion's Mane</h3>
                  <p className="text-gray-600 mb-4">
                    "Den smarta svampen" - Stödjer kognitiv funktion och fokus
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Kognition
                    </span>
                    <span className="px-3 py-1 bg-[#E5DDD5] text-[#2A1A14] rounded-full text-sm">
                      Fokus
                    </span>
                  </div>
                  <span className="text-[#FCB237] hover:text-[#E79C1A] font-medium flex items-center">
                    Läs mer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </motion.a>

              {/* Cordyceps */}
              <motion.a
                href="/om-oss/ingredienser/cordyceps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/Mushrooms/cordyceps.png"
                    alt="Cordyceps svamp"
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FCB237] transition-colors">Cordyceps</h3>
                  <p className="text-gray-600 mb-4">
                    "Energigivande svamp" - Ökar uthållighet och syreupptagning
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Energi
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      Uthållighet
                    </span>
                  </div>
                  <span className="text-[#FCB237] hover:text-[#E79C1A] font-medium flex items-center">
                    Läs mer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </motion.a>
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Källor</h2>
              <p className="text-xl text-gray-600 mb-8">
                Om du vill fördjupa dig inom ämnena Cannabinoid-hudvård och vår huds ECS…
              </p>
              <Link href="/om-oss/ingredienser/kallor">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300"
                >
                  Läs mer
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 