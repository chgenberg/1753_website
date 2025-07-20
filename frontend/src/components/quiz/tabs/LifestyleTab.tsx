'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Activity, Wind, Droplets, Flower2 } from 'lucide-react'

interface LifestyleTabProps {
  results: any
}

export function LifestyleTab({ results }: LifestyleTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Sömn */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Moon className="w-6 h-6 text-[#6366F1] mr-3" />
          <h3 className="text-2xl font-serif text-[#4A3428]">Sömn & Återhämtning</h3>
        </div>
        <p className="text-[#4A3428] mb-4">
          7-9 timmars kvalitetssömn är avgörande för hudens reparationsprocesser. 
          Under djupsömn produceras tillväxthormon som stimulerar kollagenproduktion.
        </p>
        <div className="bg-[#F5F3F0] p-4 rounded-lg">
          <ul className="text-[#6B5D54] space-y-2">
            <li>• Skapa en kvällsrutin utan skärmar 1h före sömn</li>
            <li>• Håll sovrummet svalt (16-18°C)</li>
            <li>• Använd dina 1753-produkter 30 min före sömn</li>
          </ul>
        </div>
      </div>
      
      {/* Träning */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Activity className="w-6 h-6 text-[#4A3428] mr-3" />
          <h3 className="text-2xl font-serif text-[#4A3428]">Fysisk Aktivitet</h3>
        </div>
        <p className="text-[#4A3428] mb-4">
          Regelbunden träning förbättrar blodcirkulationen vilket ger huden näring och syre.
        </p>
        <div className="bg-[#F5F3F0] p-4 rounded-lg">
          <ul className="text-[#6B5D54] space-y-2">
            <li>• 30 min måttlig aktivitet dagligen</li>
            <li>• Yoga för stresshantering</li>
            <li>• Rengör huden direkt efter träning</li>
          </ul>
        </div>
      </div>
      
      {/* Stresshantering */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Flower2 className="w-6 h-6 text-pink-600 mr-3" />
          <h3 className="text-2xl font-serif text-[#4A3428]">Stresshantering</h3>
        </div>
        <p className="text-[#4A3428] mb-4">
          Kronisk stress ökar kortisolnivåerna vilket bryter ner kollagen och ökar inflammation.
        </p>
        <div className="bg-[#F5F3F0] p-4 rounded-lg">
          <ul className="text-[#6B5D54] space-y-2">
            <li>• Daglig meditation 10-20 min</li>
            <li>• Djupandning 4-7-8 tekniken</li>
            <li>• Tid i naturen minst 20 min/dag</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
} 