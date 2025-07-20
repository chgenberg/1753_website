'use client';

import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Star,
  Clock,
  Download,
  Users,
  Target,
  Lightbulb,
  Sparkles
} from 'lucide-react'

export default function KunskapPage() {
  const t = useTranslations()

  const featuredArticles = [
    {
      title: "10 fördelar med vatten för en strålande hud",
      excerpt: "Upptäck hur rätt vattenintag kan transformera din hud inifrån och ut.",
      readTime: "5 min",
      category: "Grundläggande",
      slug: "10-fordelar-med-vatten-for-en-stralande-hud"
    },
    {
      title: "CBG - Världens bästa hudvårdsingrediens",
      excerpt: "Lär dig varför CBG är revolutionerande för hudvård och anti-aging.",
      readTime: "8 min",
      category: "Ingredienser",
      slug: "cbg-varldens-basta-hudvardsingrediens"
    },
    {
      title: "Endocannabinoidsystemet i huden",
      excerpt: "Förstå hur ditt naturliga endocannabinoidsystem påverkar din hudvård.",
      readTime: "12 min",
      category: "Vetenskap",
      slug: "endocannabinoidsystemet-i-huden"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Kunskapscentral
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Fördjupa dina kunskaper om hudvård, ingredienser och vetenskapen 
              bakom frisk, strålande hud. Allt du behöver veta på ett ställe.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">150+</div>
                <div className="text-gray-600">Artiklar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">1</div>
                <div className="text-gray-600">Komplett E-bok</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">10k+</div>
                <div className="text-gray-600">Läsare</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* E-bok Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 mr-3" />
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    Exklusiv E-bok
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  Weed Your Skin
                </h2>
                
                <p className="text-amber-100 mb-6 text-lg">
                  Vår omfattande guide med djup kunskap om hudvård, 
                  naturliga ingredienser och vetenskapsbaserade metoder.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-amber-100">
                    <Target className="w-5 h-5 mr-3" />
                    <span>200+ sidor med expertkunskap</span>
                  </div>
                  <div className="flex items-center text-amber-100">
                    <Lightbulb className="w-5 h-5 mr-3" />
                    <span>Praktiska tips och tekniker</span>
                  </div>
                  <div className="flex items-center text-amber-100">
                    <Sparkles className="w-5 h-5 mr-3" />
                    <span>Exklusivt innehåll från 1753</span>
                  </div>
                </div>
                
                <Link 
                  href="/kunskap/e-bok"
                  className="inline-flex items-center bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors group"
                >
                  Läs E-boken
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10"></div>
            </motion.div>

            {/* Blogg Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-sm border"
            >
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Blogg</h2>
              </div>
              
              <p className="text-gray-600 mb-8">
                Senaste artiklarna om hudvård, ingredienser och hälsa. 
                Regelbundet uppdaterat med ny forskning och insikter.
              </p>

              {/* Featured Articles */}
              <div className="space-y-4 mb-8">
                {featuredArticles.map((article, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                ))}
              </div>

              <Link 
                href="/blogg"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors group"
              >
                Se alla artiklar
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Utbildningsvägar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Strukturerad kunskap som bygger på varandra för optimal lärning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beginner Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#F5F3F0] rounded-xl p-6 border border-[#D5CCC4]"
            >
              <div className="w-12 h-12 bg-[#F5F3F0]0 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nybörjare</h3>
              <p className="text-gray-600 mb-4">
                Grunderna i hudvård, hudtyper och hur du skapar en effektiv rutin.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Hudtyper och hudproblem</div>
                <div>• Grundläggande ingredienser</div>
                <div>• Din första hudvårdsrutin</div>
              </div>
            </motion.div>

            {/* Intermediate Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-xl p-6 border border-blue-200"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fortsättning</h3>
              <p className="text-gray-600 mb-4">
                Avancerade ingredienser, problemlösning och optimering av din rutin.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• CBD & CBG i hudvård</div>
                <div>• Endocannabinoidsystemet</div>
                <div>• Medicinska svampar</div>
              </div>
            </motion.div>

            {/* Expert Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-50 rounded-xl p-6 border border-purple-200"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert</h3>
              <p className="text-gray-600 mb-4">
                Djup vetenskap, biohacking och avancerade tekniker för optimal hudvård.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Hudvårdens vetenskap</div>
                <div>• Biohacking för huden</div>
                <div>• Framtidens hudvård</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Redo att fördjupa dina kunskaper?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Börja din resa mot expertkunskap inom hudvård idag
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/kunskap/e-bok"
                className="inline-flex items-center bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Börja med E-boken
              </Link>
              <Link 
                href="/blogg"
                className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Utforska Bloggen
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 