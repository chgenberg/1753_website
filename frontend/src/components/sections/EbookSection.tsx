'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react'

export function EbookSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">KOSTNADSFRI</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              weed your skin
            </h2>
            
            <h3 className="text-2xl lg:text-3xl font-bold text-amber-600">
              E-BOK
            </h3>
            
            <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
              Vi älskar utbildning och har därför skrivit en e-bok som förklarar allt du behöver 
              veta om hud, hudhälsa och hur du kan använda CBD för att uppnå en optimal hudhälsa!
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link 
                href="/kunskap/e-bok"
                className="inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                LADDA HEM BOKEN HÄR!
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <p className="text-sm text-gray-500 italic mt-6">
              cultivating living skin since linnaeus
            </p>
          </motion.div>

          {/* Book Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect behind book */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg blur-2xl opacity-30 animate-pulse"></div>
              
              {/* Book image */}
              <motion.div
                whileHover={{ y: -10, rotate: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <Image
                  src="/bok.jpg"
                  alt="Weed Your Skin E-bok"
                  width={400}
                  height={550}
                  className="rounded-lg shadow-2xl"
                  priority
                />
                
                {/* Floating badge */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  GRATIS!
                </motion.div>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-xl"></div>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-300/20 rounded-full blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 