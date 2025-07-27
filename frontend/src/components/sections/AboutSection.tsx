'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Leaf, Heart, Shield } from 'lucide-react'

const values = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Naturlig',
    description: 'Endast naturliga ingredienser från naturen'
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Kärleksfull',
    description: 'Skapad med omsorg för din hud'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Säker',
    description: 'Testad och certifierad hudvård'
  }
]

export function AboutSection() {
  return (
    <section className="py-24 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-primary-dark)] mb-4 tracking-tight">
            VÅR FILOSOFI
          </h2>
          <p className="text-lg text-[var(--color-gray-600)] max-w-2xl mx-auto font-light">
            En tidlös tradition av naturlig hudvård, grundad på vetenskap och kärlek till naturen
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-6 tracking-tight">
              SEDAN 1753 HAR VI FÖRSTÅTT HUDENS NATURLIGA BEHOV
            </h3>
            <div className="space-y-4 text-[var(--color-gray-700)] leading-relaxed">
              <p>
                I hjärtat av svensk natur föddes vår vision om att skapa hudvård som 
                arbetar i harmoni med din huds naturliga processer. Vi kombinerar 
                traditionell kunskap med modern forskning.
              </p>
              <p>
                Våra produkter innehåller noggrant utvalda ingredienser som CBD och CBG, 
                kända för sina lugnande och balanserande egenskaper. Varje formula är 
                utvecklad för att ge din hud det den behöver - inget mer, inget mindre.
              </p>
            </div>
            
            {/* Values */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-[var(--color-accent-light)]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--color-accent)]">
                    {value.icon}
                  </div>
                  <h4 className="font-medium text-[var(--color-primary-dark)] mb-1">
                    {value.title}
                  </h4>
                  <p className="text-sm text-[var(--color-gray-600)]">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10"
            >
              <Link
                href="/om-oss"
                className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors group"
              >
                Läs mer om vår historia
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
              {/* Desktop Image */}
              <Image
                src="/Porträtt_hemsidan/kapitel-17-desktop.png"
                alt="Naturlig hudvård"
                fill
                sizes="100vw"
                className="object-cover hidden md:block"
              />
              {/* Mobile Image */}
              <Image
                src="/Porträtt_hemsidan/kapitel-17.png"
                alt="Naturlig hudvård"
                fill
                sizes="100vw"
                className="object-cover md:hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/20 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Founders Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg"
        >
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              {/* Desktop Image */}
              <Image
                src="/Porträtt_hemsidan/kapitel-40-desktop.png"
                alt="Grundare"
                fill
                sizes="100vw"
                className="object-cover hidden md:block"
              />
              {/* Mobile Image */}
              <Image
                src="/Porträtt_hemsidan/kapitel-40.png"
                alt="Grundare"
                fill
                sizes="100vw"
                className="object-cover md:hidden"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-4 tracking-tight">
                EN PASSION FÖR NATURLIG SKÖNHET
              </h3>
              <p className="text-[var(--color-gray-700)] leading-relaxed mb-6 font-light">
                "Vår resa började med en enkel tro - att naturen har alla svar för 
                en frisk och strålande hud. Efter år av forskning och utveckling har 
                vi skapat produkter som vi själva älskar att använda varje dag."
              </p>
              <div className="border-l-4 border-[var(--color-accent)] pl-6">
                <p className="font-medium text-[var(--color-primary)]">
                  Christopher & Ebba
                </p>
                <p className="text-sm text-[var(--color-gray-600)]">
                  Grundare, 1753 Skincare
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 