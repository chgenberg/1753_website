'use client'

import { Footer } from '@/components/layout/Footer'
import { HeroNavigation } from '@/components/layout/HeroNavigation'
import { motion } from 'framer-motion'
import { Users, Award, Heart, Leaf, Globe, Shield } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const values = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: 'Naturlig kvalitet',
    description: 'Vi använder endast de finaste naturliga ingredienserna i våra produkter.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Vetenskaplig grund',
    description: 'Varje produkt är utvecklad med stöd av den senaste hudvårdsforskningen.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Hållbarhet',
    description: 'Vi tar ansvar för miljön och arbetar för en hållbar framtid.'
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Tradition',
    description: 'Vi bygger på århundraden av cannabis kunskap och innovation.'
  }
]

const timeline = [
  {
    year: '1753',
    title: 'Carl Von Linné namnger Cannabis Sativa',
    description: 'En av Sveriges mest framstående personer någonsin namnger Cannabis Sativa.'
  },
  {
    year: '1839',
    title: 'Cannabis introduceras till västerländsk medicin',
    description: 'Den irländska läkaren William B. O\'Shaughnessy introducerar cannabis till västerländsk medicin efter studier i Indien.'
  },
  {
    year: '1925',
    title: 'International reglering',
    description: 'Cannabis regleras internationellt genom Genevekonventionen som del av begränsning av narkotika.'
  },
  {
    year: '1992',
    title: 'Upptäckten av endocannabinoidsystemet',
    description: 'Upptäckten av det endocannabinoida systemet revolutionerar förståelsen av cannabisens effekt på kroppen.'
  },
  {
    year: '2022',
    title: 'CBD-innovation',
    description: 'Lanserade vår revolutionerande CBD-hudvårdsserie.'
  }
]

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <> 
      <main>
        {/* Hero Section with Full Height Image */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Navigation */}
          <HeroNavigation />
          
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/Porträtt/c-and-e-2.jpg"
              alt="Christopher och Ebba Genberg"
              fill
              className="object-cover hidden md:block"
              priority
            />
            <Image
              src="/Porträtt/c-and-e-mobile.png"
              alt="Christopher och Ebba Genberg"
              fill
              className="object-cover md:hidden"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wider mb-6">
                VILKA ÄR VI?
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
                Vi är en familj och en rörelse som vågar ifrågasätta hudvårdsindustrin. 
                Med forskning om hudens endocannabinoidsystem som grund skapar vi produkter för långsiktig hudhälsa.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Welcome Section - Minimalist Design */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-12 tracking-wide">VÄLKOMMEN TILL VÅR FAMILJ</h2>
              <div className="space-y-6 text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed font-light">
                <p>
                  Vi är inte bara ett hudvårdsmärke – vi är en familj och en rörelse som vill förändra framtidens syn på hälsa och skönhet.
                </p>
                <p>
                  Med rötterna i forskningen om hudens endocannabinoidsystem och hjärtat i ett orubbligt engagemang för mänskligt välmående, vågar vi vara annorlunda.
                </p>
                <p className="text-xl md:text-2xl font-light text-[#00937c] pt-8">
                  Välkommen att vara en del av något större.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section - Clean Grid Layout */}
        <section className="py-24 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide">MÖTE GRUNDARNA</h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Christopher */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg p-8 shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-light mb-2">Christopher Genberg</h3>
                  <p className="text-[#00937c] font-light">CBD-nörd / Founder</p>
                </div>
                <div className="space-y-4 text-gray-600 font-light">
                  <p>
                    Jag har i över 10 år bokstavligen varit besatt av hudens hälsa. Jag har ägnat hundratals timmar åt att studera huden och dess komplexitet samtidigt som jag, tillsammans med min mamma, byggde ett Probiotiskt Hudvårdsmärke i Sverige.
                  </p>
                  <p>
                    Det var först nyligen som jag upptäckte kraften hos hudens endocannabinoidsystem. Detta komplexa signalsystem påverkar nästan alla funktioner i vår hud – hela vägen från översta hudlagret (epidermis) ner till hypodermis.
                  </p>
                  <p>
                    <strong className="text-[#00937c] font-medium">Endocannabinoidsystemet</strong> och dess alla fantastiska funktioner har lagt grunden till 1753 Skincare. Vi vill förbättra självkänslan för alla människor runt om i världen.
                  </p>
                </div>
              </motion.div>

              {/* Ebba */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg p-8 shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-light mb-2">Ebba Genberg</h3>
                  <p className="text-[#00937c] font-light">Färg, ljus och formexpert</p>
                </div>
                <div className="space-y-4 text-gray-600 font-light">
                  <p>
                    Jag är i grunden utbildad socionom och har sedan 10 år tillbaka arbetat inom socialt arbete. Tack vare vårt 1753 får jag arbeta med det bästa av två världar - att få arbeta med människor och att parallellt med detta också få uttrycka mig kreativt.
                  </p>
                  <p>
                    Mitt mål med 1753 Skincares sociala medier och marknadsföring är att på bästa möjliga sätt motivera, inspirera och lära ut hur du med enkla medel kan förbättra hudhälsan genom att optimera hudens naturliga funktioner.
                  </p>
                  <p>
                    Tillsammans med Christopher har jag förstått vad hudhälsa innebär och jag ser fram emot att dela detta med er!
                  </p>
                  <p>
                    Har du idéer, tankar eller frågor kring hur vi kommunicerar vårt budskap så älskar vi när du hör av dig. Du hittar våra kontaktuppgifter{' '}
                    <Link href="/kontakt" className="text-[#00937c] hover:text-[#00b89d] underline transition-colors duration-300">
                      här!
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-12 tracking-wide">VAD VI DRÖMMER OM</h2>
              <div className="max-w-3xl mx-auto space-y-6 text-base md:text-lg text-gray-700 leading-relaxed font-light">
                <p>
                  Vår vision är att förbättra självkänslan för alla, på både kort- och lång sikt, runt om i världen. Vi är övertygade om att nyckeln till en perfekt hudhälsa (hög elasticitet & fasthet utan inflammationer) är att ge en boost till och balansera upp hudens endocannabinoidsystem.
                </p>
                <p>
                  Vår hud har utvecklats under 1,9 miljoner år av evolution och är ett av de mest fantastiska, unika och smarta organ vi människor har. Det är dags att vi börjar använda dess naturliga funktioner i detta extraordinära system.
                </p>
                <div className="bg-gray-50 rounded-lg p-8 mt-12">
                  <p className="text-lg md:text-xl font-light text-[#00937c]">
                    Om du har en känslig eller obalanserad hud så ge vårt hudvårdskoncept en chans. Du kommer att häpna över resultatet.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 tracking-wide">VÅRA VÄRDERINGAR</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light">
                Dessa grundläggande principer guidar allt vi gör och varje produkt vi skapar.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center text-[#00937c] shadow-sm">
                    {value.icon}
                  </div>
                  <h3 className="font-light text-xl mb-3">{value.title}</h3>
                  <p className="text-gray-600 font-light text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 tracking-wide">VÅR RESA GENOM TIDEN</h2>
              <p className="text-lg md:text-xl text-gray-600 font-light">
                Viktiga milstolpar i cannabis historia och vår resa.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200"></div>
              
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-[#00937c] font-light text-2xl mb-2">{item.year}</div>
                      <h3 className="font-light text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 font-light text-sm">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#00937c] rounded-full border-4 border-white shadow-sm"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-[#00937c]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-wide">
                REDO ATT UPPLEVA SKILLNADEN?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 font-light">
                Upptäck våra prisbelönta produkter och se varför tusentals kunder litar på 1753 Skincare.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/products"
                  className="inline-block px-8 py-4 bg-white text-[#00937c] rounded-full font-light text-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  Utforska våra produkter
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 