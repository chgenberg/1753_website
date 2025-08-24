'use client'

import { motion } from 'framer-motion'
import { Leaf, Coffee, Fish, Heart, Brain, Droplets, AlertCircle } from 'lucide-react'

interface NutritionTabProps {
  results: any
}

export function NutritionTab({ results }: NutritionTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Gut-Skin Axis Förklaring */}
      <div className="bg-gradient-to-r from-[#F5F3F0] to-[#FAF9F7] rounded-2xl p-8 border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-[#8B7355] mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Tarm-Hud Axeln</h3>
        </div>
        <p className="text-[#FCB237] leading-relaxed">
          Din tarmhälsa påverkar direkt din hudhälsa genom det som kallas "gut-skin axis". 
          En balanserad tarmmikrobiom producerar kortkedjiga fettsyror och signalsubstanser 
          som reglerar inflammation i hela kroppen, inklusive huden. Genom att äta rätt 
          funktionella livsmedel kan du stödja både din tarm och hud samtidigt.
        </p>
      </div>

      {/* Nordiska Superfoods från 1753 */}
      <div className="bg-gradient-to-r from-[#FCB237]/10 to-[#8B7355]/10 rounded-2xl p-8 border border-[#FCB237]/20">
        <div className="flex items-center mb-4">
          <Leaf className="w-6 h-6 text-[#FCB237] mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Nordiska Funktionella Råvaror</h3>
        </div>
        <p className="text-[#6B5D54] mb-6">
          Baserat på vår forskning om funktionella råvaror rekommenderar vi dessa kraftfulla 
          naturliga ingredienser för optimal hudhälsa via gut-skin-axeln:
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🫐 Blåbär & Lingon</h4>
            <p className="text-sm text-[#6B5D54]">Antocyaniner som motverkar oxidativ stress och minskar hudinflammation</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🌿 Havtorn</h4>
            <p className="text-sm text-[#6B5D54]">Omega-7 för starkare hudbarriär och förbättrad elasticitet</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🍃 Grönt Te</h4>
            <p className="text-sm text-[#6B5D54]">Katechiner som skyddar mot UV-stress och förhindrar för tidig hudåldrande</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🧄 Gurkmeja</h4>
            <p className="text-sm text-[#6B5D54]">Curcumin dämpar inflammation och ger huden naturlig lyster</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🥬 Kimchi & Kefir</h4>
            <p className="text-sm text-[#6B5D54]">Probiotika för balanserad gut-skin-axel och stärkt mikrobiom</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">🌰 Chiafrön & Valnötter</h4>
            <p className="text-sm text-[#6B5D54]">Omega-3 för hudens fuktbalans och antiinflammatorisk effekt</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#FCB237]/10 rounded-lg">
          <p className="text-sm text-[#6B5D54]">
            <strong>💡 Tips:</strong> Läs mer om funktionella råvaror och deras vetenskapliga bakgrund på vår 
            <a href="/sv/kunskap/funktionella-ravaror" className="text-[#FCB237] hover:underline ml-1">
              kunskapssida om funktionella råvaror
            </a>
          </p>
        </div>
      </div>
      
      {/* Funktionella Livsmedel */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <h3 className="text-2xl font-serif text-[#FCB237] mb-6">Funktionella Livsmedel för Din Hudtyp</h3>
        
        <div className="space-y-6">
          {/* Omega-3 */}
          <div className="border-b border-[#E5DDD5] pb-6">
            <div className="flex items-center mb-3">
              <Fish className="w-5 h-5 text-[#8B7355] mr-2" />
              <h4 className="font-semibold text-[#FCB237]">Omega-3 Rika Livsmedel</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-[#FCB237] mb-2">Rekommenderade:</p>
                <ul className="text-sm text-[#6B5D54] space-y-1">
                  <li>• Vild lax (2-3 ggr/vecka)</li>
                  <li>• Sardiner och ansjovis</li>
                  <li>• Valnötter (handfulll dagligen)</li>
                  <li>• Chiafrön (1-2 msk/dag)</li>
                  <li>• Hampafrön (2-3 msk/dag)</li>
                </ul>
              </div>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Effekt:</strong> Omega-3 fettsyror minskar inflammatoriska cytokiner 
                  som IL-1β och TNF-α, vilket direkt hjälper mot dina periodiska utbrott och 
                  ojämna hudton.
                </p>
              </div>
            </div>
          </div>
          
          {/* Probiotiska Livsmedel */}
          <div className="border-b border-[#E5DDD5] pb-6">
            <div className="flex items-center mb-3">
              <Heart className="w-5 h-5 text-[#8B7355] mr-2" />
              <h4 className="font-semibold text-[#FCB237]">Probiotiska Livsmedel</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-[#FCB237] mb-2">Rekommenderade:</p>
                <ul className="text-sm text-[#6B5D54] space-y-1">
                  <li>• Kimchi (2-3 msk/dag)</li>
                  <li>• Sauerkraut (opastöriserad)</li>
                  <li>• Kefir (1 glas/dag)</li>
                  <li>• Kombucha (max 250ml/dag)</li>
                  <li>• Miso (i soppa/dressing)</li>
                </ul>
              </div>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Effekt:</strong> Lactobacillus och Bifidobacterium stammar 
                  producerar bakteriociner som balanserar hudens mikrobiom och stärker 
                  barriärfunktionen.
                </p>
              </div>
            </div>
          </div>
          
          {/* Prebiotiska Fibrer */}
          <div className="border-b border-[#E5DDD5] pb-6">
            <div className="flex items-center mb-3">
              <Leaf className="w-5 h-5 text-[#8B7355] mr-2" />
              <h4 className="font-semibold text-[#FCB237]">Prebiotiska Fibrer</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-[#FCB237] mb-2">Rekommenderade:</p>
                <ul className="text-sm text-[#6B5D54] space-y-1">
                  <li>• Jerusalemsärtskocka</li>
                  <li>• Vitlök & lök (lätt kokta)</li>
                  <li>• Grön banan</li>
                  <li>• Sparris</li>
                  <li>• Havre (över natten)</li>
                </ul>
              </div>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Effekt:</strong> Prebiotika närer goda tarmbakterier som 
                  producerar butyrat - en kortkedjig fettsyra som minskar systemisk 
                  inflammation.
                </p>
              </div>
            </div>
          </div>
          
          {/* Antioxidantrika Livsmedel */}
          <div className="pb-6">
            <div className="flex items-center mb-3">
              <Coffee className="w-5 h-5 text-[#8B7355] mr-2" />
              <h4 className="font-semibold text-[#FCB237]">Antioxidantrika Livsmedel</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-[#FCB237] mb-2">Rekommenderade:</p>
                <ul className="text-sm text-[#6B5D54] space-y-1">
                  <li>• Blåbär (1 dl/dag)</li>
                  <li>• Grönt te (2-3 koppar)</li>
                  <li>• Kakao (&gt;70%, 20-30g)</li>
                  <li>• Granatäpple</li>
                  <li>• Spenat & grönkål</li>
                </ul>
              </div>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Effekt:</strong> Polyfenolor och flavonoider skyddar mot 
                  oxidativ stress och stödjer hudens naturliga reparationsmekanismer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Daglig Måltidsplan */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <h3 className="text-2xl font-serif text-[#FCB237] mb-6">Exempel på Daglig Måltidsplan</h3>
        
        <div className="space-y-4">
          <div className="bg-[#F5F3F0] p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">Frukost</h4>
            <p className="text-[#6B5D54]">
              Overnight oats med chiafrön, blåbär och valnötter. Grönt te med citron.
            </p>
          </div>
          
          <div className="bg-[#F5F3F0] p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">Lunch</h4>
            <p className="text-[#6B5D54]">
              Vild lax med kimchi, sparris och quinoa. Kombucha som dryck.
            </p>
          </div>
          
          <div className="bg-[#F5F3F0] p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">Mellanmål</h4>
            <p className="text-[#6B5D54]">
              Mörk choklad (70%) med en handfull hampafrön.
            </p>
          </div>
          
          <div className="bg-[#F5F3F0] p-4 rounded-lg">
            <h4 className="font-semibold text-[#FCB237] mb-2">Middag</h4>
            <p className="text-[#6B5D54]">
              Miso-soppa med shiitake, grönkålssallad med granatäppelkärnor och olivolja.
            </p>
          </div>
        </div>
      </div>
      
      {/* Livsmedel att Undvika */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Livsmedel att Minimera</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-[#FCB237] mb-3">Inflammatoriska Livsmedel:</h4>
            <ul className="text-[#6B5D54] space-y-2">
              <li>• Raffinerat socker och vitt mjöl</li>
              <li>• Mejeriprodukter (särskilt mjölk)</li>
              <li>• Processade livsmedel</li>
              <li>• Transfetter och vegetabiliska oljor</li>
              <li>• Överdrivet koffeinintag (&gt;3 koppar/dag)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#FCB237] mb-3">Varför undvika:</h4>
            <p className="text-[#6B5D54]">
              Dessa livsmedel kan trigga inflammatoriska processer som förvärrar akne, 
              ojämn hudton och störa hudens naturliga barriärfunktion. De kan också 
              mata skadliga bakterier i tarmen som producerar endotoxiner.
            </p>
          </div>
        </div>
      </div>
      
      {/* Hydration */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Droplets className="w-6 h-6 text-blue-500 mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Hydration & Mineraler</h3>
        </div>
        
        <p className="text-[#FCB237] mb-4">
          Adekvat hydrering är avgörande för hudens barriärfunktion och cellförnyelse. 
          Sikta på minst 2-3 liter vatten dagligen, fördelat över dagen.
        </p>
        
        <div className="bg-[#F5F3F0] p-4 rounded-lg">
          <h4 className="font-semibold text-[#FCB237] mb-2">Optimera din hydration:</h4>
          <ul className="text-[#6B5D54] space-y-1">
            <li>• Tillsätt en nypa havssalt i ditt morgonvatten för elektrolytbalans</li>
            <li>• Drick örtteer som kamomille och grönt te mellan måltiderna</li>
            <li>• Ät vattenrika livsmedel som gurka, vattenmelon och selleri</li>
            <li>• Undvik uttorkande drycker som alkohol och överdrivet koffein</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
} 