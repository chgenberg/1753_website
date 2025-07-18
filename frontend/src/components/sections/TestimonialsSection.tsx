'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Anna Lindberg',
    age: '34 år',
    location: 'Stockholm',
    rating: 5,
    text: 'Jag har kämpat med torr hud i åratal, men efter att ha använt DUO-kit i bara två veckor är min hud helt förvandlad. Den känns mjuk, återfuktad och ser strålande ut!',
          product: 'DUO-kit',
    image: '/images/testimonials/anna.jpg'
  },
  {
    id: 2,
    name: 'Erik Johansson',
    age: '28 år',
    location: 'Göteborg',
    rating: 5,
    text: 'Som man var jag skeptisk till hudvård, men The ONE Facial Oil har blivit en del av min dagliga rutin. Min hud har aldrig sett bättre ut och jag får komplimanger hela tiden.',
    product: 'The ONE Facial Oil',
    image: '/images/testimonials/erik.jpg'
  },
  {
    id: 3,
    name: 'Maria Svensson',
    age: '45 år',
    location: 'Malmö',
    rating: 5,
    text: 'Fungtastic har gjort underverk för min mogna hud. Fina linjer har minskat och min hud känns fastare. Jag älskar att det är helt naturligt!',
    product: 'Fungtastic Mushroom Extract',
    image: '/images/testimonials/maria.jpg'
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Porträtt_hemsidan/Kapitel 13-desktop.png"
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover opacity-10 hidden md:block"
        />
        <Image
          src="/Porträtt_hemsidan/Kapitel 13.png"
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover opacity-10 md:hidden"
        />
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00937c]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00937c]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Kundrecensioner</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Vad våra kunder säger
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tusentals nöjda kunder har upplevt den transformerande kraften i våra CBD-berikade hudvårdsprodukter
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <div className="backdrop-blur-md bg-white/80 rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow duration-300">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-[#00937c]/20 mb-4" />
                
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#00937c] text-[#00937c]" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Product */}
                <p className="text-sm text-[#00937c] font-medium mb-4">
                  Använder: {testimonial.product}
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.age}, {testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00937c]">4.9/5</div>
            <p className="text-gray-600">Genomsnittligt betyg</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00937c]">50,000+</div>
            <p className="text-gray-600">Nöjda kunder</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00937c]">98%</div>
            <p className="text-gray-600">Skulle rekommendera</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 