'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const galleryImages = [
  {
    id: 1,
    desktop: '/Porträtt_hemsidan/Kapitel 4-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 4.png',
    title: 'Naturlig skönhet',
    description: 'Ren och tidlös elegans'
  },
  {
    id: 2,
    desktop: '/Porträtt_hemsidan/Kapitel 3-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 3.png',
    title: 'Naturens kraft',
    description: 'Upptäck balansen i naturen'
  },
  {
    id: 3,
    desktop: '/Porträtt_hemsidan/Kapitel 5-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 5.png',
    title: 'Harmoni',
    description: 'I balans med naturen'
  },
  {
    id: 4,
    desktop: '/Porträtt_hemsidan/Kapitel 7-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 7.png',
    title: 'Vetenskap',
    description: 'Forskning möter tradition'
  },
  {
    id: 5,
    desktop: '/Porträtt_hemsidan/Kapitel 12-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 12.png',
    title: 'Innovation',
    description: 'Framtidens hudvård'
  },
  {
    id: 6,
    desktop: '/Porträtt_hemsidan/Kapitel 14-desktop.png',
    mobile: '/Porträtt_hemsidan/Kapitel 14.png',
    title: 'Tradition',
    description: 'Tidlös kunskap'
  }
]

export function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[var(--color-bg-secondary)]">
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
            UPPTÄCK VÅR VÄRLD
          </h2>
          <p className="text-lg text-[var(--color-gray-600)] max-w-2xl mx-auto font-light">
            En visuell resa genom naturens skönhet och vetenskapens kraft
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                {/* Desktop Image */}
                <Image
                  src={image.desktop}
                  alt={image.title}
                  fill
                  className="object-cover hidden md:block transform transition-transform duration-700 group-hover:scale-110"
                />
                {/* Mobile Image */}
                <Image
                  src={image.mobile}
                  alt={image.title}
                  fill
                  className="object-cover md:hidden transform transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: hoveredIndex === index ? 1 : 0,
                    y: hoveredIndex === index ? 0 : 20
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                >
                  <h3 className="text-2xl font-serif mb-2">{image.title}</h3>
                  <p className="text-white/90">{image.description}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-[var(--color-gray-700)] mb-8 max-w-3xl mx-auto">
            Varje bild berättar en historia om vår passion för naturlig hudvård och vårt engagemang 
            för att skapa produkter som verkligen gör skillnad för din hud.
          </p>
        </motion.div>
      </div>
    </section>
  )
} 