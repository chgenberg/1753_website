'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'

const galleryImages = [
  {
    id: 1,
    desktop: '/Porträtt_hemsidan/kapitel-4-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-4.png',
    title: 'Naturlig skönhet',
    description: 'Ren och tidlös elegans',
    detailedDescription: `
      <h3>Naturlig skönhet - En filosofi för livet</h3>
      
      <p>I en värld full av konstgjorda lösningar och snabba fixar, står vi fast vid vår övertygelse om naturlig skönhet. Det handlar inte bara om att se bra ut - det handlar om att må bra inifrån och ut.</p>
      
      <p>Vår filosofi bygger på tre grundpelare:</p>
      
      <p><strong>1. Respekt för huden</strong><br/>
      Din hud är ett levande ekosystem med miljontals mikroorganismer som arbetar i harmoni. Våra produkter är designade för att stödja, inte störa, denna naturliga balans.</p>
      
      <p><strong>2. Kraft från naturen</strong><br/>
      Vi använder endast ingredienser som CBD, CBG och adaptogena svampar - naturens egna kraftkällor som har använts i århundraden för sina helande egenskaper.</p>
      
      <p><strong>3. Hållbar skönhet</strong><br/>
      Äkta skönhet är hållbar. Det handlar om att bygga upp hudens hälsa över tid, inte att dölja problem med kortvariga lösningar.</p>
      
      <p>När du väljer naturlig hudvård väljer du en livsstil som respekterar både din kropp och vår planet. Det är en investering i din framtida hudhälsa och välbefinnande.</p>
    `
  },
  {
    id: 2,
    desktop: '/Porträtt_hemsidan/kapitel-3-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-3.png',
    title: 'Naturens kraft',
    description: 'Upptäck balansen i naturen',
    detailedDescription: `
      <h3>Naturens kraft - Vetenskapen bakom våra ingredienser</h3>
      
      <p>Naturen har alltid haft svaren. Genom miljontals år av evolution har växter och svampar utvecklat kraftfulla föreningar för att skydda sig själva - och nu kan dessa skydda din hud också.</p>
      
      <p><strong>Endocannabinoidsystemet (ECS)</strong><br/>
      Din hud har ett eget endocannabinoidsystem som reglerar viktiga funktioner som:</p>
      <ul>
        <li>Cellförnyelse och tillväxt</li>
        <li>Talgproduktion och fuktbalans</li>
        <li>Inflammation och immunrespons</li>
        <li>Hudens barriärfunktion</li>
      </ul>
      
      <p><strong>CBD & CBG - Naturens balanserare</strong><br/>
      Våra cannabinoider arbetar i perfekt harmoni med ditt ECS för att återställa balansen i din hud. CBD lugnar och minskar inflammation, medan CBG stimulerar cellförnyelse och stärker hudbarriären.</p>
      
      <p><strong>Adaptogena svampar - Stresshantering för huden</strong><br/>
      Precis som adaptogener hjälper kroppen hantera stress, hjälper våra svampextrakt huden att anpassa sig till miljöpåfrestningar. Chaga, Reishi och Lion's Mane ger antioxidantskydd och stärker hudens motståndskraft.</p>
      
      <p>Genom att kombinera dessa naturliga kraftkällor skapar vi produkter som inte bara behandlar symptom, utan som faktiskt förbättrar hudens grundläggande hälsa och funktion.</p>
    `
  },
  {
    id: 3,
    desktop: '/Porträtt_hemsidan/kapitel-5-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-5.png',
    title: 'Harmoni',
    description: 'I balans med naturen',
    detailedDescription: `
      <h3>Harmoni - Balansen mellan vetenskap och tradition</h3>
      
      <p>Harmoni är mer än ett ord för oss - det är grunden för allt vi gör. Det handlar om att skapa perfekt balans mellan:</p>
      
      <p><strong>Tradition möter innovation</strong><br/>
      Vi hedrar urgamla traditioner från växtmedicin och kombinerar dem med modern forskning. Resultatet är produkter som är både tidlösa och banbrytande.</p>
      
      <p><strong>Hudens mikrobiom i balans</strong><br/>
      Din hud är hem för miljarder bakterier som skyddar mot patogener och håller huden frisk. Våra produkter är formulerade för att:</p>
      <ul>
        <li>Bevara den naturliga pH-balansen</li>
        <li>Stödja goda bakterier</li>
        <li>Inte störa hudens naturliga ekosystem</li>
        <li>Främja mikrobiell mångfald</li>
      </ul>
      
      <p><strong>Inre och yttre harmoni</strong><br/>
      Vacker hud börjar inifrån. Våra produkter arbetar både på ytan och på djupet för att skapa långvarig förändring. När din hud är i balans syns det - du strålar av hälsa och vitalitet.</p>
      
      <p><strong>Hållbarhet i varje steg</strong><br/>
      Från ingrediensval till förpackning, varje beslut fattas med hänsyn till både din hud och vår planet. Det är harmoni i praktiken.</p>
    `
  },
  {
    id: 4,
    desktop: '/Porträtt_hemsidan/kapitel-7-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-7.png',
    title: 'Vetenskap',
    description: 'Forskning möter tradition',
    detailedDescription: `
      <h3>Vetenskap - Evidensbaserad hudvård</h3>
      
      <p>På 1753 Skincare tar vi vetenskap på allvar. Varje produkt är resultatet av omfattande forskning och noggranna tester. Vi kombinerar det bästa från modern dermatologi med traditionell växtkunskap.</p>
      
      <p><strong>Forskning om cannabinoider</strong><br/>
      De senaste årens genombrott inom cannabinoidforskning har revolutionerat vår förståelse av hudhälsa:</p>
      <ul>
        <li>2019: Studier visar att CBD minskar talgproduktion med upp till 40%</li>
        <li>2020: CBG identifieras som potent antibakteriell mot aknebakterier</li>
        <li>2021: Forskning bekräftar cannabinoiders roll i sårläkning</li>
        <li>2022: Nya rön om ECS roll i hudåldrande</li>
      </ul>
      
      <p><strong>Svampars läkande kraft</strong><br/>
      Medicinska svampar har använts i tusentals år, men först nu förstår vi verkligen varför de fungerar. Våra svampextrakt innehåller:</p>
      <ul>
        <li>Beta-glukaner för immunstöd</li>
        <li>Triterpener för antiinflammation</li>
        <li>Antioxidanter för skydd mot fria radikaler</li>
        <li>Polysackarider för fukt och läkning</li>
      </ul>
      
      <p><strong>Kliniska resultat</strong><br/>
      Våra kunder rapporterar konsekvent förbättringar inom 2-4 veckor. Men den verkliga magin händer över tid - kontinuerlig användning leder till fundamental förbättring av hudhälsan.</p>
    `
  },
  {
    id: 5,
    desktop: '/Porträtt_hemsidan/kapitel-12-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-12.png',
    title: 'Innovation',
    description: 'Framtidens hudvård',
    detailedDescription: `
      <h3>Innovation - Banbrytande hudvårdsteknologi</h3>
      
      <p>Innovation driver oss framåt. Vi är inte nöjda med status quo - vi vill ständigt utveckla och förbättra hur hudvård kan fungera i harmoni med kroppen.</p>
      
      <p><strong>Vår unika extraktionsprocess</strong><br/>
      Vi använder en patenterad CO2-extraktion som bevarar alla aktiva komponenter utan att använda skadliga lösningsmedel. Detta ger:</p>
      <ul>
        <li>Högre koncentration av aktiva ämnen</li>
        <li>Bättre biotillgänglighet</li>
        <li>Renare slutprodukt</li>
        <li>Bevarade terpener och flavonoider</li>
      </ul>
      
      <p><strong>Framtidens ingredienser</strong><br/>
      Vi forskar konstant på nya sätt att förbättra våra formler:</p>
      
      <p><em>Nano-enkapsulering</em> - För djupare penetration av aktiva ingredienser<br/>
      <em>Liposomteknologi</em> - För tidsstyrd frisättning av näringsämnen<br/>
      <em>Biomimetiska peptider</em> - Som efterliknar hudens naturliga processer<br/>
      <em>Fermenterade extrakt</em> - För ökad bioaktivitet</p>
      
      <p><strong>Personaliserad hudvård</strong><br/>
      Framtiden är personlig. Vi utvecklar AI-drivna hudanalyser som kan skräddarsy produktrekommendationer baserat på din unika hudprofil, livsstil och miljö.</p>
      
      <p>Innovation handlar inte bara om ny teknologi - det handlar om att hitta bättre sätt att stödja din huds naturliga intelligens.</p>
    `
  },
  {
    id: 6,
    desktop: '/Porträtt_hemsidan/kapitel-14-desktop.png',
    mobile: '/Porträtt_hemsidan/kapitel-14.png',
    title: 'Tradition',
    description: 'Tidlös kunskap',
    detailedDescription: `
      <h3>Tradition - Visdom genom generationer</h3>
      
      <p>Sedan 1753, när Carl von Linné systematiserade växtriket, har Sverige varit en ledande kraft inom botanisk vetenskap. Vi bär detta arv vidare genom att kombinera traditionell kunskap med modern innovation.</p>
      
      <p><strong>Urgammal växtkunskap</strong><br/>
      Långt innan moderna laboratorier fanns, visste våra förfäder vilka växter som läkte och vårdade. Denna kunskap, förmedlad genom generationer, ligger till grund för våra formuleringar:</p>
      <ul>
        <li>Hampa - Använd i 5000 år för hudvård</li>
        <li>Jojoba - Aztekernas heliga olja</li>
        <li>Chaga - Sibiriens "svarta guld"</li>
        <li>MCT - Polynesiens skönhetshemlighet</li>
      </ul>
      
      <p><strong>Svensk hudvårdstradition</strong><br/>
      Den svenska traditionen av ren, enkel och effektiv hudvård genomsyrar allt vi gör. Vi tror på:</p>
      <ul>
        <li>Kvalitet framför kvantitet</li>
        <li>Naturliga ingredienser</li>
        <li>Minimalistisk approach</li>
        <li>Hållbarhet och respekt för naturen</li>
      </ul>
      
      <p><strong>Tidlösa ritualer</strong><br/>
      Hudvård är mer än produkter - det är en ritual av självomhändertagande. Vi uppmuntrar dig att ta dig tid, vara närvarande och njuta av stunden när du vårdar din hud.</p>
      
      <p>Genom att hedra traditionen medan vi omfamnar framtiden, skapar vi hudvård som står tidens test.</p>
    `
  }
]

export function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)

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
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                {/* Desktop Image */}
                <Image
                  src={image.desktop}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover hidden md:block transform transition-transform duration-700 group-hover:scale-110"
                />
                {/* Mobile Image */}
                <Image
                  src={image.mobile}
                  alt={image.title}
                  fill
                  sizes="100vw"
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
                  <p className="text-sm text-white/70 mt-2">Klicka för att läsa mer →</p>
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

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* Image side */}
                <div className="relative w-full md:w-2/5 h-64 md:h-full flex-shrink-0">
                  <Image
                    src={selectedImage.desktop}
                    alt={selectedImage.title}
                    fill
                    className="object-cover md:object-contain"
                  />
                </div>

                {/* Content side */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-full">
                  <div 
                    className="prose prose-base md:prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedImage.detailedDescription }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
} 