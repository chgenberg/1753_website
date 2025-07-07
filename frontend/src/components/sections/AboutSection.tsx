'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Leaf, Shield, Heart, Award } from 'lucide-react'

const features = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: '100% Naturligt',
    description: 'Alla våra produkter är tillverkade av naturliga ingredienser utan skadliga kemikalier'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Laboratorietestade',
    description: 'Varje produkt genomgår rigorösa tester för att säkerställa högsta kvalitet och säkerhet'
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Hudvänligt',
    description: 'Utvecklat i samarbete med dermatologer för alla hudtyper, även känslig hud'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Svensk kvalitet',
    description: 'Stolt svensk tradition sedan 1753 med fokus på hållbarhet och innovation'
  }
]

export function AboutSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Om 1753 Skincare</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Naturens kraft möter <span className="text-[#00937c]">modern vetenskap</span>
            </h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>
                Sedan 1753 har vi varit dedikerade till att skapa hudvårdsprodukter som kombinerar det bästa från naturen med den senaste vetenskapliga forskningen.
              </p>
              <p>
                Våra CBD- och CBG-berikade formler är resultatet av årtionden av forskning och utveckling, där varje ingrediens är noggrant utvald för sin effektivitet och säkerhet.
              </p>
            </div>
            
            <Link href="/om-oss">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors duration-300"
              >
                Läs mer om vår historia
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-[#00937c] group-hover:bg-[#00937c] group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '270+', label: 'År av erfarenhet' },
            { value: '50k+', label: 'Nöjda kunder' },
            { value: '99%', label: 'Naturliga ingredienser' },
            { value: '15+', label: 'Prisbelönta produkter' }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-4xl md:text-5xl font-bold text-[#00937c] mb-2"
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 