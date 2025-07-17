'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Droplets, Sparkles, Shield } from 'lucide-react'
import Image from 'next/image'

interface SummaryTabProps {
  results: any
}

export function SummaryTab({ results }: SummaryTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hudanalys Översikt */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Din Hudprofil</h3>
        
        {/* Ekosystem Balance */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.ecosystemBalance.microbiome / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#4A3428]">{results.ecosystemBalance.microbiome}%</span>
              </div>
            </div>
            <h4 className="font-semibold text-[#4A3428] mb-2">Mikrobiom Balans</h4>
            <p className="text-sm text-[#6B5D54]">Dina hudbakteriers hälsotillstånd</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.ecosystemBalance.endocannabinoid / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#4A3428]">{results.ecosystemBalance.endocannabinoid}%</span>
              </div>
            </div>
            <h4 className="font-semibold text-[#4A3428] mb-2">Endocannabinoid Balans</h4>
            <p className="text-sm text-[#6B5D54]">Hudens interna kommunikationssystem</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
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
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.ecosystemBalance.barrier / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#4A3428]">{results.ecosystemBalance.barrier}%</span>
              </div>
            </div>
            <h4 className="font-semibold text-[#4A3428] mb-2">Hudbarriär Styrka</h4>
            <p className="text-sm text-[#6B5D54]">Hudens skyddande funktion</p>
          </div>
        </div>
        
        {/* Huvudsakliga Hudutmaningar */}
        <div className="border-t border-[#E5DDD5] pt-6">
          <h4 className="font-semibold text-[#4A3428] mb-4">Dina Huvudsakliga Hudutmaningar:</h4>
          <div className="space-y-3">
            {results.primaryConcerns.map((concern: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#8B7355] mt-0.5" />
                <div>
                  <p className="text-[#4A3428] font-medium">{concern}</p>
                  <p className="text-sm text-[#6B5D54] mt-1">
                    {concern === "Ojämn hudton" && "Orsakas ofta av obalans i hudens melaninproduktion och inflammation"}
                    {concern === "Periodiska utbrott" && "Kopplat till hormonella svängningar och sebumproduktion"}
                    {concern === "Torrhet kring ögonen" && "Indikerar nedsatt barriärfunktion i detta känsliga område"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Holistisk Analys */}
      <div className="bg-gradient-to-r from-[#F5F3F0] to-[#FAF9F7] rounded-2xl p-8 border border-[#E5DDD5]">
        <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Holistisk Hudanalys</h3>
        <div className="prose prose-stone max-w-none">
          <p className="text-[#4A3428] leading-relaxed">
            Din hudprofil visar tecken på ett ekosystem som behöver återställas till sin naturliga balans. 
            Kombinationen av ojämn hudton, periodiska utbrott och lokal torrhet tyder på att din huds 
            endocannabinoidsystem behöver stöd för att optimera cellkommunikationen.
          </p>
          <p className="text-[#4A3428] leading-relaxed mt-4">
            Genom att fokusera på att stärka din hudbarriär, balansera mikrobiomen och aktivera det 
            endocannabinoida systemet kan vi skapa förutsättningar för långsiktig hudhälsa. Detta kräver 
            en kombination av rätt hudvård, livsstilsval och näringsintag.
          </p>
        </div>
      </div>
      
      {/* Evolutionär Kontext */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-[#8B7355] mr-3" />
          <h3 className="text-xl font-serif text-[#4A3428]">Evolutionär Förståelse</h3>
        </div>
        <p className="text-[#4A3428] leading-relaxed">
          Din hud är resultatet av 19 miljoner års evolution. Endocannabinoidsystemet har utvecklats 
          som ett sofistikerat kommunikationsnätverk som reglerar inflammation, sebumproduktion och 
          cellförnyelse. När detta system är i balans, fungerar huden optimalt - precis som naturen 
          avsett.
        </p>
      </div>
    </motion.div>
  )
} 