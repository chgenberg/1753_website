'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { useState } from 'react'

import Image from 'next/image'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  User,
  FileText,
  Heart
} from 'lucide-react'
import type { Metadata } from 'next'




const contactInfo = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Telefon',
    details: '0732-305521',
    subtitle: 'Måndag-Fredag 08:00-18:00'
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'E-post',
    details: 'hej@1753skincare.com',
    subtitle: 'Vi svarar inom 24 timmar'
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Adress',
    details: 'Södra Skjutbanevägen 10',
    subtitle: '439 55, Åsa, Sverige'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Öppettider',
    details: 'Måndag-Fredag 08:00-18:00',
    subtitle: 'Lördag 10:00-14:00, Söndag Stängt'
  }
]

const departments = [
  {
    name: 'Allmänna frågor',
    email: 'info@1753skincare.com',
    description: 'Generella frågor om produkter och tjänster'
  },
  {
    name: 'Kundservice',
    email: 'kundservice@1753skincare.com',
    description: 'Support för beställningar och leveranser'
  },
  {
    name: 'Återförsäljare',
    email: 'partners@1753skincare.com',
    description: 'Frågor om återförsäljarmöjligheter'
  },
  {
    name: 'Press & Media',
    email: 'press@1753skincare.com',
    description: 'Pressförfrågningar och mediasamarbeten'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Send contact form to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        // Show success message
        alert('Tack för ditt meddelande! Vi svarar så snart som möjligt.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error(result.message || 'Kunde inte skicka meddelandet')
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Ett fel uppstod när meddelandet skulle skickas. Försök igen senare.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/Porträtt_hemsidan/kapitel-18-desktop.png"
              alt="Background"
              fill
              sizes="100vw"
              className="object-cover opacity-15 hidden md:block"
            />
            <Image
              src="/Porträtt_hemsidan/kapitel-18.png"
              alt="Background"
              fill
              sizes="100vw"
              className="object-cover opacity-15 md:hidden"
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <Heart className="w-16 h-16 text-[#00937c] mx-auto mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                Vi älskar när du hör av dig
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Om du har några frågor, idéer eller tankar, tveka inte att kontakta oss. 
                Använd formuläret nedan, skicka e-post, DM eller PM i våra sociala kanaler, 
                eller ring oss. Vi återkommer till dig inom 24 timmar.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">1753 SKINCARE</h2>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#00937c] text-white rounded-2xl flex items-center justify-center group-hover:bg-[#007363] transition-colors duration-300">
                    {info.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                  <p className="text-gray-900 font-medium mb-1">{info.details}</p>
                  <p className="text-gray-600 text-sm">{info.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Skicka ett meddelande</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Namn *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-colors"
                        placeholder="Ditt fullständiga namn"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-post *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-colors"
                        placeholder="din@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Ämne *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-colors"
                  >
                    <option value="">Välj ett ämne</option>
                    <option value="product-question">Produktfråga</option>
                    <option value="order-support">Beställningshjälp</option>
                    <option value="partnership">Återförsäljare</option>
                    <option value="press">Press & Media</option>
                    <option value="other">Övrigt</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Meddelande *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B47] focus:border-transparent outline-none transition-colors resize-none"
                      placeholder="Berätta vad vi kan hjälpa dig med..."
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-[#8B6B47] text-white rounded-lg font-semibold hover:bg-[#6B5337] transition-colors duration-300 flex items-center justify-center text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Skicka
                </motion.button>

                {/* hCaptcha Notice */}
                <div className="text-center text-sm text-gray-600 mt-6">
                  <p>
                    Denna webbplats är skyddad av hCaptcha och hCaptchas{' '}
                    <a 
                      href="https://www.hcaptcha.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#8B6B47] hover:text-[#6B5337] underline"
                    >
                      integritetspolicy
                    </a>
                    {' '}och{' '}
                    <a 
                      href="https://www.hcaptcha.com/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#8B6B47] hover:text-[#6B5337] underline"
                    >
                      användarvillkor
                    </a>
                    {' '}gäller.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Opening Hours Details */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Clock className="w-16 h-16 text-[#8B6B47] mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-8">Öppettider</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-3">Måndag - Fredag</h3>
                  <p className="text-2xl font-bold text-[#8B6B47]">08:00 - 18:00</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-3">Lördag</h3>
                  <p className="text-2xl font-bold text-[#8B6B47]">10:00 - 14:00</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-3">Söndag</h3>
                  <p className="text-2xl font-bold text-gray-500">Stängt</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  )
} 