'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Droplets, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductsTabProps {
  results: any
}

export function ProductsTab({ results }: ProductsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Morgonrutin */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-6">
          <Sun className="w-6 h-6 text-[#F59E0B] mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Morgonrutin</h3>
        </div>
        
        <div className="space-y-6">
          {/* Steg 1 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Rengöring med Au Naturel</h4>
              <p className="text-[#6B5D54] mb-3">
                Massera försiktigt 2-3 pumptryck Au Naturel på fuktig hud i cirkulära rörelser. 
                Fokusera på områden med ojämn hudton. Skölj med ljummet vatten.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> Au Naturels unika kombination av MCT-olja och jojobaolja 
                  löser upp överflödig talg utan att störa hudens naturliga lipidbarriär. Detta är 
                  särskilt viktigt för din kombinerade hud.
                </p>
              </div>
            </div>
          </div>
          
          {/* Steg 2 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Behandling med The ONE</h4>
              <p className="text-[#6B5D54] mb-3">
                Applicera 3-4 droppar The ONE på ren, lätt fuktig hud. Tryck försiktigt in oljan 
                med fingertopparna, börja från mitten av ansiktet och arbeta utåt.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> CBG:n i The ONE aktiverar CB2-receptorerna i din hud, 
                  vilket hjälper till att reglera inflammationen som orsakar ojämn hudton och utbrott. 
                  Samtidigt stärker det hudbarriären där du har torrhet.
                </p>
              </div>
            </div>
          </div>
          
          {/* Steg 3 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Extra fukt med TA-DA (vid behov)</h4>
              <p className="text-[#6B5D54] mb-3">
                På torra områden, särskilt runt ögonen, applicera ett tunt lager TA-DA. 
                Klappa försiktigt in med ringfingret.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> TA-DA's koncentrerade formula med CBD och MCT-olja 
                  ger intensiv fukt till områden som behöver extra stöd utan att tynga ner huden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kvällsrutin */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-6">
          <Moon className="w-6 h-6 text-[#6366F1] mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Kvällsrutin</h3>
        </div>
        
        <div className="space-y-6">
          {/* Steg 1 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Dubbelrengöring med Au Naturel</h4>
              <p className="text-[#6B5D54] mb-3">
                Första rengöringen: Massera Au Naturel på torr hud för att lösa upp makeup och SPF. 
                Andra rengöringen: Applicera på fuktig hud för djuprengöring.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> Dubbelrengöring säkerställer att alla orenheter avlägsnas 
                  utan att överrengöra, vilket är viktigt för att behålla mikrobiombalansen.
                </p>
              </div>
            </div>
          </div>
          
          {/* Steg 2 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Nattbehandling med The ONE + TA-DA</h4>
              <p className="text-[#6B5D54] mb-3">
                Blanda 2 droppar The ONE med 1 pump TA-DA i handflatan. Värm blandningen mellan 
                händerna och tryck försiktigt in i huden.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> Denna kraftfulla kombination maximerar hudens 
                  regenereringsprocess under natten. CBG och CBD arbetar synergistiskt för 
                  att optimera cellförnyelsen och minska inflammation.
              </p>
              </div>
            </div>
          </div>
          
          {/* Steg 3 */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#8B7355] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#FCB237] mb-2">Ögonområdet</h4>
              <p className="text-[#6B5D54] mb-3">
                Applicera en extra droppe TA-DA runt ögonområdet. Klappa försiktigt in med 
                ringfingret från inre ögonvrån utåt.
              </p>
              <div className="bg-[#F5F3F0] p-4 rounded-lg">
                <p className="text-sm text-[#FCB237]">
                  <strong>Varför:</strong> Det känsliga ögonområdet behöver extra uppmärksamhet, 
                  särskilt när du upplever torrhet. TA-DA's koncentrerade formula ger intensiv 
                  näring utan irritation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Veckovis behandling */}
      <div className="bg-gradient-to-r from-[#F5F3F0] to-[#FAF9F7] rounded-2xl p-8 border border-[#E5DDD5]">
        <h3 className="text-2xl font-serif text-[#FCB237] mb-6">Veckovis Intensivbehandling</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl">
            <h4 className="font-semibold text-[#FCB237] mb-3">2x per vecka: Fungtastic Mask</h4>
            <p className="text-[#6B5D54] mb-3">
              Applicera ett generöst lager Fungtastic på ren hud. Låt verka i 15-20 minuter 
              innan du sköljer av med ljummet vatten.
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#8B7355] mt-0.5" />
                <p className="text-sm text-[#FCB237]">Chaga: Antioxidantskydd</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#8B7355] mt-0.5" />
                <p className="text-sm text-[#FCB237]">Lion's Mane: Kollagenstimulering</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#8B7355] mt-0.5" />
                <p className="text-sm text-[#FCB237]">Reishi: Inflammationsdämpning</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl">
            <h4 className="font-semibold text-[#FCB237] mb-3">1x per vecka: Oil Cleansing Method</h4>
            <p className="text-[#6B5D54] mb-3">
              Massera Au Naturel på torr hud i 5-10 minuter för djup porrengöring. 
              Avsluta med en varm kompress.
            </p>
            <p className="text-sm text-[#FCB237] bg-[#F5F3F0] p-3 rounded">
              Detta hjälper till att lösa upp ingrodd talg och döda hudceller som kan 
              blockera porer och orsaka ojämn hudton.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-[#FCB237] text-white rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-serif mb-4">Redo att börja din hudresa?</h3>
        <p className="text-[#E5DDD5] mb-6">
          Använd koden <span className="font-bold text-white">QUIZ15</span> för 15% rabatt på din första beställning
        </p>
        <Link 
          href="/sv/products"
          className="inline-flex items-center bg-white text-[#FCB237] px-8 py-3 rounded-full font-semibold hover:bg-[#F5F3F0] transition-colors"
        >
          Handla nu
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  )
} 