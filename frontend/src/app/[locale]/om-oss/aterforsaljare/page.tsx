'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MapPin, Phone, Globe, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Retailer {
  name: string
  phone?: string
  website?: string
  address: string
  postalCode: string
  city: string
}

const retailers: Retailer[] = [
  {
    name: "Hel Hud",
    phone: "0733-71 21 00",
    website: "https://www.bokadirekt.se/places/hel-hud-1580",
    address: "Kungsgatan 43",
    postalCode: "441 3",
    city: "Alingsås"
  },
  {
    name: "ALittlebitGreener",
    website: "Hemsida",
    address: "Rudboda Krogsbol 9",
    postalCode: "741 97",
    city: "Almunge"
  },
  {
    name: "Jennys Vackra",
    phone: "0739-192342",
    website: "https://www.jennysvackra.se/",
    address: "Skogsbovägen 11",
    postalCode: "774 60",
    city: "Avesta"
  },
  {
    name: "Livsriktig",
    phone: "0768 431161",
    website: "www.livsriktig.se",
    address: "Lillforsvägen 30",
    postalCode: "774 63",
    city: "Avesta"
  },
  {
    name: "Excellent Skin",
    phone: "08- 26 04 40",
    website: "www.excellentskin.se",
    address: "Brommaplan 403, 2tr",
    postalCode: "168 76",
    city: "Bromma"
  },
  {
    name: "Care of M",
    phone: "033-10 10 99",
    website: "https://careofm.nu/",
    address: "Lilla Brogatan 26",
    postalCode: "503 35",
    city: "Borås"
  },
  {
    name: "Mojo Organic SPA",
    website: "Hemsida",
    address: "Räpplinge bygata 27",
    postalCode: "387 94",
    city: "Borgholm"
  },
  {
    name: "Tindered SPA",
    website: "https://www.tindered.se/tindered-spa/",
    address: "E22",
    postalCode: "594 75",
    city: "Edsbruk"
  },
  {
    name: "Rådhuspraktiken",
    phone: "0708-75 80 95",
    website: "https://www.radhuspraktiken.se",
    address: "Rådhusgatan 6",
    postalCode: "745 31",
    city: "Enköping"
  },
  {
    name: "New Living",
    phone: "0706-00 96 74",
    website: "https://newliving.se/",
    address: "Bruksgatan 8B",
    postalCode: "632 20",
    city: "Eskilstuna"
  },
  {
    name: "MariCare AB",
    phone: "073-352 42 34",
    website: "www.maricare.nu",
    address: "Lysviksgatan 63",
    postalCode: "123 42",
    city: "Farsta"
  },
  {
    name: "Care Hudvård i Gislaved",
    website: "http://www.carehudvard.se",
    address: "Södra Storgatan 13",
    postalCode: "332 33",
    city: "Gislaved"
  },
  {
    name: "Care of Christel",
    website: "www.careofchristel.se",
    address: "Aggetorpsvägen 11",
    postalCode: "44340",
    city: "Gråbo"
  },
  {
    name: "Salong Plisa",
    phone: "0703-833274",
    website: "https://www.bokadirekt.se/places/lisa-olsson-45615",
    address: "Västerrottna 224",
    postalCode: "686 98",
    city: "Gräsmark"
  },
  {
    name: "SPA Halmstad",
    phone: "035 - 260 77 60",
    website: "https://spahalmstad.se",
    address: "Brogatan 3",
    postalCode: "434 32",
    city: "Halmstad"
  },
  {
    name: "Hudikliniken",
    phone: "070 229 17 80",
    website: "info@hudikliniken.se",
    address: "Djupegatan 30B",
    postalCode: "824 50",
    city: "Hudiksvall"
  },
  {
    name: "L'anima hudvård",
    phone: "070-336 28 57",
    website: "info@laima.se",
    address: "Magasinsgatan 5",
    postalCode: "824 43",
    city: "Hudiksvall"
  },
  {
    name: "Hälsokällan Hud & Kroppsvård",
    website: "http://halsokallanshudvard.se",
    address: "Nygatan 13",
    postalCode: "242 30",
    city: "Hörby"
  },
  {
    name: "Sana Lifestyle",
    website: "https://www.sanaklubben.se",
    address: "Brahegatan 7",
    postalCode: "553 34",
    city: "Jönköping"
  },
  {
    name: "Skin&Care By Amanda",
    phone: "0735319050",
    website: "https://skinandcare.se",
    address: "Banarpsgatan 3",
    postalCode: "553 16",
    city: "Jönköping"
  },
  {
    name: "BMs Hud & Spa AB",
    phone: "054- 15 05 30",
    website: "https://hud-spa.se/",
    address: "Ulvsbygatan 2",
    postalCode: "654 64",
    city: "Karlstad"
  },
  {
    name: "Ekolea Ekologisk Hud & Hårvård",
    website: "www.ekolea.se",
    address: "Tingvallagatan 19",
    postalCode: "652 25",
    city: "Karlstad"
  },
  {
    name: "Care of MOA",
    phone: "054-563410",
    website: "https://www.careofmoa.se/",
    address: "Hagalundsvägen 42",
    postalCode: "653 44",
    city: "Karlstad"
  },
  {
    name: "Frisörverkstan Af Sjövik",
    website: "www.frisörverkstan.se",
    address: "Amiralitetsgatan 1A",
    postalCode: "371 30",
    city: "Karlskrona"
  },
  {
    name: "Wholesome - Holistic Beauty",
    phone: "0730-58 62 00",
    website: "https://www.wholesome.se/",
    address: "Grytnäs Bystugevägen 9",
    postalCode: "793 92",
    city: "Leksand"
  },
  {
    name: "Lenakliniken",
    phone: "0709-658785",
    website: "Hemsida",
    address: "Kinnegatan 21",
    postalCode: "531 35",
    city: "Lidköping"
  },
  {
    name: "Linn Skincare",
    phone: "0706-331439",
    website: "https://linnskincare.se/",
    address: "Vällebergsvägen 7",
    postalCode: "459 30",
    city: "Ljungskile"
  },
  {
    name: "Salong Bella",
    phone: "0725-19 38 02",
    website: "https://www.salongbella.com/",
    address: "Norra Järnvägsgatan 23B",
    postalCode: "827 31",
    city: "Ljusdal"
  },
  {
    name: "Complete Skincare",
    phone: "0763-26 20 88",
    website: "https://completeskincare.se/",
    address: "Kungsgatan 14",
    postalCode: "591 30",
    city: "Motala"
  },
  {
    name: "Ecohud",
    phone: "0704-60 21 53",
    website: "https://www.ecohud.com/",
    address: "Krokslätts Parkgata 58E",
    postalCode: "431 68",
    city: "Mölndal"
  },
  {
    name: "Lyx Skincare",
    website: "www.lyxskincare.se",
    address: "Biblioteksgatan 16D",
    postalCode: "435 30",
    city: "Mölnlycke"
  },
  {
    name: "Roxenmo Skincare",
    website: "https://www.roxenmoskincare.se",
    address: "Bangårdsgatan 6",
    postalCode: "761 31",
    city: "Norrtälje"
  },
  {
    name: "The Skin Clinic Sweden",
    phone: "0725- 72 87 28",
    website: "https://www.theskinclinicsweden.se/",
    address: "Östra Längdgatan 1",
    postalCode: "611 35",
    city: "Nyköping"
  },
  {
    name: "Visage – Hudvård & Skönhet",
    website: "https://klinikvisage.se/online-bokning/",
    address: "Prästgatan 18B",
    postalCode: "432 44",
    city: "Nyköping"
  },
  {
    name: "Vital Laserklinik",
    website: "https://vitallaserklinik.se",
    address: "Östra Storgatan 34",
    postalCode: "611 44",
    city: "Nyköping"
  },
  {
    name: "Hudterapeut Emma Hildesson",
    phone: "0703-02 12 58",
    website: "https://www.hudterapeutemmahildesson.com/",
    address: "Paradisvägen 9",
    postalCode: "433 31",
    city: "Partille"
  },
  {
    name: "Parelle Cosmetics",
    website: "www.parellepitea.se",
    address: "Storgatan 45",
    postalCode: "941 32",
    city: "Piteå"
  },
  {
    name: "Salong Storgatan25",
    phone: "026-25 34 26",
    website: "https://salongstorgatan25.valei.com",
    address: "Storgatan 25",
    postalCode: "811 34",
    city: "Sandviken"
  },
  {
    name: "Elements with Emma",
    website: "https://www.bokadirekt.se/places/elements-with-emma-saltsjoqvarn-57229",
    address: "Saltsjöqvarn",
    postalCode: "",
    city: "Stockholm"
  },
  {
    name: "Riddarkliniken",
    phone: "08-662 09 90",
    website: "http://www.riddarkliniken.net/",
    address: "Riddargatan 54",
    postalCode: "114 57",
    city: "Stockholm"
  },
  {
    name: "Salong Grand",
    phone: "0708-453465",
    website: "https://www.salonggrand.se",
    address: "Fleminggatan 34",
    postalCode: "112 32",
    city: "Stockholm"
  },
  {
    name: "DUNA STUDIOS",
    phone: "0734-321512",
    website: "https://www.bokadirekt.se/places/duna-studios-40437",
    address: "Högbergsgatan 66B",
    postalCode: "118 54",
    city: "Stockholm"
  },
  {
    name: "Din Tid skönhetssalong",
    website: "www.dintid.se",
    address: "Banérgatan 25, bv",
    postalCode: "115 22",
    city: "Stockholm"
  },
  {
    name: "Skin Unlimited",
    website: "https://skinunlimited.se",
    address: "Rådmansgatan 1B",
    postalCode: "114 25",
    city: "Stockholm"
  },
  {
    name: "Well Being",
    phone: "0703-303265",
    address: "Klintvägen 6",
    postalCode: "923 32",
    city: "Storuman"
  },
  {
    name: "FFantastic",
    phone: "0709-393121",
    website: "https://www.ffantastic.se/",
    address: "Gärdesvägen 2-4, Plan 2",
    postalCode: "444 31",
    city: "Stenungsund"
  },
  {
    name: "Hudstudion",
    website: "https://hudstudion.com",
    address: "Trädgårdsgatan 19",
    postalCode: "645 31",
    city: "Strängnäs"
  },
  {
    name: "Fresh Effect",
    website: "https://www.fresheffect.se",
    address: "Gjuteribacken 15",
    postalCode: "172 65",
    city: "Sundbyberg"
  },
  {
    name: "Kamomillgården",
    phone: "0738460341",
    address: "Ebbarp 6109",
    postalCode: "243 73",
    city: "Tjörnarp"
  },
  {
    name: "Dig i Fokus",
    website: "www.digifokus.se",
    address: "Kvällsvägen 5",
    postalCode: "146 31",
    city: "Tullinge"
  },
  {
    name: "Vackrast med Helene",
    website: "https://vackrastmedhelene.se",
    address: "Diamantgången 85",
    postalCode: "135 49",
    city: "Tyresö"
  },
  {
    name: "Viktoriasalongen",
    phone: "0522-355 40",
    website: "http://www.viktoriasalongen.se",
    address: "Strömstadsvägen 3",
    postalCode: "451 50",
    city: "Uddevalla"
  },
  {
    name: "Evas Hudvård",
    phone: "0702-669559",
    website: "www.evashudvard.com",
    address: "Storgatan 23A",
    postalCode: "592 39",
    city: "Vadstena"
  },
  {
    name: "Face and Body Care i Vallentuna",
    website: "www.faceandbodycare.se",
    address: "Banvägen 27B",
    postalCode: "186 32",
    city: "Vallentuna"
  },
  {
    name: "Hudvårdskompaniet",
    phone: "0761-26 21 17",
    website: "https://www.hudvardskompaniet.se",
    address: "Norrtullsgatan 3",
    postalCode: "598 37",
    city: "Vimmerby"
  },
  {
    name: "Prana Centr",
    phone: "0733-95 24 55",
    website: "https://www.pranacentr.se/",
    address: "Humlegårdsvägen 17",
    postalCode: "621 46",
    city: "Visby"
  },
  {
    name: "Art of Beauty",
    website: "https://artofbeauty.se/",
    address: "Siggesborgsgatan 5",
    postalCode: "722 26",
    city: "Västerås"
  },
  {
    name: "Face and Soul",
    website: "http://faceandsoul.se",
    address: "Västra Ringvägen 21",
    postalCode: "724 61",
    city: "Västerås"
  },
  {
    name: "Milles Växjö",
    phone: "0767 - 65 47 08",
    website: "https://milleko.se/",
    address: "Klostergatan 6",
    postalCode: "352 30",
    city: "Växjö"
  },
  {
    name: "Holistisk Hälsa med Nina Jonasson",
    phone: "0704-97 35 60",
    website: "https://www.holistiskhalsa.nu/",
    address: "Österleden 33",
    postalCode: "271 42",
    city: "Ystad"
  },
  {
    name: "Buenosdiaz Hudvård & Hälsa",
    website: "https://buenosdiaz.se",
    address: "Kristianstadsvägen 2",
    postalCode: "271 34",
    city: "Ystad"
  },
  {
    name: "Wickma Hudvård & Skönhet",
    phone: "0476-18 20 14",
    website: "https://wickma.se/",
    address: "Södra Torggatan 4",
    postalCode: "343 32",
    city: "Älmhult"
  },
  {
    name: "Nygatan SPA",
    phone: "0706269143",
    website: "www.nygatansspa.se",
    address: "Nygatan",
    postalCode: "702 11",
    city: "Örebro"
  },
  {
    name: "Care of Moa",
    website: "https://www.careofmoa.se/",
    address: "Älvdalsvägen 27",
    postalCode: "669 30",
    city: "Deje"
  }
]

export default function RetailersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Group retailers by city and sort alphabetically
  const retailersByCity = useMemo(() => {
    const filtered = retailers.filter(retailer => 
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const grouped = filtered.reduce((acc, retailer) => {
      if (!acc[retailer.city]) {
        acc[retailer.city] = []
      }
      acc[retailer.city].push(retailer)
      return acc
    }, {} as Record<string, Retailer[]>)

    // Sort cities alphabetically
    const sortedCities = Object.keys(grouped).sort()
    const result: Record<string, Retailer[]> = {}
    
    sortedCities.forEach(city => {
      result[city] = grouped[city].sort((a, b) => a.name.localeCompare(b.name))
    })

    return result
  }, [searchTerm])

  const formatWebsite = (website: string) => {
    if (website === 'Hemsida') return null
    if (website.includes('@')) return `mailto:${website}`
    if (!website.startsWith('http')) return `https://${website}`
    return website
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#F5F3F0] to-[#F5F3F0] py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                VÅRA FANTASTISKA ÅTERFÖRSÄLJARE
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Vi har handplockat ett antal återförsäljare som har ett genuint intresse av att hjälpa människor att uppnå en fantastisk hudhälsa.
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök stad eller återförsäljare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5F3F0]0"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Retailers Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {Object.keys(retailersByCity).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Inga återförsäljare hittades för din sökning.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(retailersByCity).map(([city, cityRetailers], cityIndex) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: cityIndex * 0.1 }}
                  >
                    {/* City Header */}
                    <div className="border-b border-gray-200 pb-4 mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-[#4A3428]" />
                        {city}
                        <span className="text-lg font-normal text-gray-500">
                          ({cityRetailers.length} {cityRetailers.length === 1 ? 'återförsäljare' : 'återförsäljare'})
                        </span>
                      </h2>
                    </div>

                    {/* Retailers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cityRetailers.map((retailer, index) => (
                        <motion.div
                          key={`${retailer.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                        >
                          <div className="space-y-4">
                            {/* Retailer Name */}
                            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                              {retailer.name}
                            </h3>

                            {/* Address */}
                            <div className="flex items-start gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 mt-1 text-[#4A3428] flex-shrink-0" />
                              <div className="text-sm">
                                <p>{retailer.address}</p>
                                {retailer.postalCode && (
                                  <p>{retailer.postalCode} {retailer.city}</p>
                                )}
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                              {retailer.phone && (
                                <a
                                  href={`tel:${retailer.phone}`}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4A3428] transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                  {retailer.phone}
                                </a>
                              )}

                              {retailer.website && formatWebsite(retailer.website) && (
                                <a
                                  href={formatWebsite(retailer.website)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-[#4A3428] hover:text-[#3A2A1E] transition-colors"
                                >
                                  <Globe className="w-4 h-4" />
                                  Besök webbplats
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-br from-[#F5F3F0] to-[#F5F3F0] py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vill du bli återförsäljare?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Är du intresserad av att sälja våra produkter i din salong eller butik? 
                Vi söker alltid nya partners som delar vår passion för naturlig hudvård.
              </p>
              <a
                href="/kontakt"
                className="inline-flex items-center px-8 py-3 bg-[#4A3428] text-white font-semibold rounded-lg hover:bg-[#3A2A1E] transition-colors"
              >
                Kontakta oss
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 