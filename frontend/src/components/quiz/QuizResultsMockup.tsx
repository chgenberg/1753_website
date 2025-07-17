'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, CheckCircle, ArrowRight, ShoppingBag, Leaf, Sun, Moon, Heart, Brain, Droplets, Award } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SummaryTab } from './tabs/SummaryTab'
import { LifestyleTab } from './tabs/LifestyleTab'
import { ProductsTab } from './tabs/ProductsTab'
import { NutritionTab } from './tabs/NutritionTab'
import { SourcesTab } from './tabs/SourcesTab'

interface QuizResultsMockupProps {
  answers?: any
}

type TabType = 'summary' | 'lifestyle' | 'products' | 'sources' | 'nutrition'

export function QuizResultsMockup({ answers }: QuizResultsMockupProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  
  // Mock data för demonstration
  const mockResults = {
    skinType: "Kombinerad hud med känsliga partier",
    primaryConcerns: ["Ojämn hudton", "Periodiska utbrott", "Torrhet kring ögonen"],
    skinScore: 85,
    ecosystemBalance: {
      microbiome: 75,
      endocannabinoid: 80,
      barrier: 70
    }
  }

  const tabs = [
    { id: 'summary' as TabType, label: 'Summering', icon: Sparkles },
    { id: 'lifestyle' as TabType, label: 'Livsstilsval', icon: Heart },
    { id: 'products' as TabType, label: 'Produkter', icon: Droplets },
    { id: 'nutrition' as TabType, label: 'Kostval', icon: Leaf },
    { id: 'sources' as TabType, label: 'Källor', icon: Brain }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F0] via-white to-[#F5F3F0]">
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <Image
          src="/Porträtt_hemsidan/Kapitel 22-desktop.png"
          alt="Skin ecosystem"
          fill
          sizes="100vw"
          className="object-cover hidden md:block"
          priority
        />
        <Image
          src="/Porträtt_hemsidan/Kapitel 22.png"
          alt="Skin ecosystem"
          fill
          sizes="100vw"
          className="object-cover md:hidden"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif mb-4"
            >
              Din Personliga Hudanalys
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/90"
            >
              Baserat på 19 miljoner års evolution och modern vetenskap
            </motion.p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        {/* Skin Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif text-[#4A3428] mb-2">Din Hudpoäng</h2>
              <p className="text-[#6B5D54]">{mockResults.skinType}</p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5DDD5"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#8B7355"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - mockResults.skinScore / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-[#4A3428]">{mockResults.skinScore}</span>
                    <span className="text-sm text-[#6B5D54] block">av 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-wrap border-b border-[#E5DDD5]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-4 flex items-center justify-center space-x-2 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#4A3428] text-white' 
                      : 'bg-white text-[#6B5D54] hover:bg-[#F5F3F0]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{tab.label}</span>
                </button>
              )
            })}
          </div>
          
          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && <SummaryTab key="summary" results={mockResults} />}
              {activeTab === 'lifestyle' && <LifestyleTab key="lifestyle" results={mockResults} />}
              {activeTab === 'products' && <ProductsTab key="products" results={mockResults} />}
              {activeTab === 'nutrition' && <NutritionTab key="nutrition" results={mockResults} />}
              {activeTab === 'sources' && <SourcesTab key="sources" results={mockResults} />}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-16"
        >
          <p className="text-[#6B5D54] mb-4">
            Vill du få en mer personlig analys?
          </p>
          <Link 
            href="/sv/kontakt"
            className="inline-flex items-center text-[#8B7355] hover:text-[#4A3428] font-medium"
          >
            Boka en kostnadsfri hudkonsultation
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 