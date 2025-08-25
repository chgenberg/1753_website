import fs from 'fs'
import path from 'path'

interface Retailer {
  name: string
  phone?: string
  website?: string
  address: string
  postalCode: string
  city: string
}

// Scraped data from https://www.1753skincare.com/pages/aterforsaljare
const scrapedRetailers: Retailer[] = [
  // Alingsås
  { name: "Hel Hud", phone: "0733-71 21 00", website: "https://www.bokadirekt.se/places/hel-hud-1580", address: "Kungsgatan 43", postalCode: "441 30", city: "Alingsås" },

  // Almunge
  { name: "ALittlebitGreener", address: "Rudboda Krogsbol 9", postalCode: "741 97", city: "Almunge" },

  // Avesta
  { name: "Jennys Vackra", phone: "0739-192342", website: "https://www.jennysvackra.se/", address: "Skogsbovägen 11", postalCode: "774 60", city: "Avesta" },
  { name: "Livsriktig", phone: "0768 431161", website: "www.livsriktig.se", address: "Lillforsvägen 30", postalCode: "774 63", city: "Avesta" },

  // Bromma
  { name: "Excellent Skin", phone: "08- 26 04 40", website: "www.excellentskin.se", address: "Brommaplan 403, 2tr", postalCode: "168 76", city: "Bromma" },

  // Borås
  { name: "Care of M", phone: "033-10 10 99", website: "https://careofm.nu/", address: "Lilla Brogatan 26", postalCode: "503 35", city: "Borås" },

  // Borgholm
  { name: "Mojo Organic SPA", address: "Räpplinge bygata 27", postalCode: "387 94", city: "Borgholm" },

  // Edsbruk
  { name: "Tindered SPA", website: "https://www.tindered.se/tindered-spa/", address: "E22", postalCode: "594 75", city: "Edsbruk" },

  // Enköping
  { name: "Rådhuspraktiken", phone: "0708-75 80 95", website: "https://www.radhuspraktiken.se", address: "Rådhusgatan 6", postalCode: "745 31", city: "Enköping" },

  // Eskilstuna
  { name: "New Living", phone: "0706-00 96 74", website: "https://newliving.se/", address: "Bruksgatan 8B", postalCode: "632 20", city: "Eskilstuna" },

  // Farsta
  { name: "MariCare AB", phone: "073-352 42 34", website: "www.maricare.nu", address: "Lysviksgatan 63", postalCode: "123 42", city: "Farsta" },

  // Gislaved
  { name: "Care Hudvård i Gislaved", website: "http://www.carehudvard.se", address: "Södra Storgatan 13", postalCode: "332 33", city: "Gislaved" },

  // Gråbo
  { name: "Care of Christel", website: "www.careofchristel.se", address: "Aggetorpsvägen 11", postalCode: "443 40", city: "Gråbo" },

  // Gräsmark
  { name: "Salong Plisa", phone: "0703-833274", website: "https://www.bokadirekt.se/places/lisa-olsson-45615", address: "Västerrottna 224", postalCode: "686 98", city: "Gräsmark" },

  // Halmstad
  { name: "SPA Halmstad", phone: "035 - 260 77 60", website: "https://spahalmstad.se", address: "Brogatan 3", postalCode: "434 32", city: "Halmstad" },

  // Hudiksvall
  { name: "Hudikliniken", phone: "070 229 17 80", address: "Djupegatan 30B", postalCode: "824 50", city: "Hudiksvall" },
  { name: "L'anima hudvård", phone: "070-336 28 57", address: "Magasinsgatan 5", postalCode: "824 43", city: "Hudiksvall" },

  // Hörby
  { name: "Hälsokällan Hud & Kroppsvård", website: "http://halsokallanshudvard.se", address: "Nygatan 13", postalCode: "242 30", city: "Hörby" },

  // Jönköping
  { name: "Sana Lifestyle", website: "https://www.sanaklubben.se", address: "Brahegatan 7", postalCode: "553 34", city: "Jönköping" },
  { name: "Skin&Care By Amanda", website: "https://skinandcare.se", phone: "0735319050", address: "Banarpsgatan 3", postalCode: "553 16", city: "Jönköping" },

  // Karlstad
  { name: "BMs Hud & Spa AB", phone: "054- 15 05 30", website: "https://hud-spa.se/", address: "Ulvsbygatan 2", postalCode: "654 64", city: "Karlstad" },
  { name: "Ekolea Ekologisk Hud & Hårvård", website: "www.ekolea.se", address: "Tingvallagatan 19", postalCode: "652 25", city: "Karlstad" },
  { name: "Care of MOA", website: "https://www.careofmoa.se/", phone: "054-563410", address: "Hagalundsvägen 42", postalCode: "653 44", city: "Karlstad" },

  // Karlskrona
  { name: "Frisörverkstan Af Sjövik", website: "www.frisörverkstan.se", address: "Amiralitetsgatan 1A", postalCode: "371 30", city: "Karlskrona" },

  // Leksand
  { name: "Wholesome - Holistic Beauty", phone: "0730-58 62 00", website: "https://www.wholesome.se/", address: "Grytnäs Bystugevägen 9", postalCode: "793 92", city: "Leksand" },

  // Lidköping
  { name: "Lenakliniken", phone: "0709-658785", address: "Kinnegatan 21", postalCode: "531 35", city: "Lidköping" },

  // Ljungskile
  { name: "Linn Skincare", phone: "0706-331439", website: "https://linnskincare.se/", address: "Vällebergsvägen 7", postalCode: "459 30", city: "Ljungskile" },

  // Ljusdal
  { name: "Salong Bella", phone: "0725-19 38 02", website: "https://www.salongbella.com/", address: "Norra Järnvägsgatan 23B", postalCode: "827 31", city: "Ljusdal" },

  // Motala
  { name: "Complete Skincare", phone: "0763-26 20 88", website: "https://completeskincare.se/", address: "Kungsgatan 14", postalCode: "591 30", city: "Motala" },

  // Mölndal
  { name: "Ecohud", phone: "0704-60 21 53", website: "https://www.ecohud.com/", address: "Krokslätts Parkgata 58E", postalCode: "431 68", city: "Mölndal" },

  // Nyköping
  { name: "Nyköpings Laserklinik", website: "www.nykopingslaserklinik.se", address: "Östra Storgatan 34", postalCode: "611 44", city: "Nyköping" },

  // Partille
  { name: "Hudterapeut Emma Hildesson", phone: "0703-02 12 58", website: "https://www.hudterapeutemmahildesson.com/", address: "Paradisvägen 9", postalCode: "433 31", city: "Partille" },

  // Piteå
  { name: "Parelle Cosmetics", website: "www.parellepitea.se", address: "Storgatan 45", postalCode: "941 32", city: "Piteå" },

  // Sandviken
  { name: "Salong Storgatan25", phone: "026-25 34 26", website: "https://salongstorgatan25.valei.com", address: "Storgatan 25", postalCode: "811 34", city: "Sandviken" },

  // Stockholm
  { name: "Elements with Emma", website: "https://www.bokadirekt.se/places/elements-with-emma-saltsjoqvarn-57229", address: "Saltsjöqvarn", postalCode: "000 00", city: "Stockholm" },
  { name: "Riddarkliniken", phone: "08-662 09 90", website: "http://www.riddarkliniken.net/", address: "Riddargatan 54", postalCode: "114 57", city: "Stockholm" },
  { name: "Salong Grand", phone: "0708-453465", website: "https://www.salonggrand.se", address: "Fleminggatan 34", postalCode: "112 32", city: "Stockholm" },
  { name: "DUNA STUDIOS", phone: "0734-321512", website: "https://www.bokadirekt.se/places/duna-studios-40437", address: "Högbergsgatan 66B", postalCode: "118 54", city: "Stockholm" },
  { name: "Din Tid skönhetssalong", website: "www.dintid.se", address: "Banérgatan 25, bv", postalCode: "115 22", city: "Stockholm" },
  { name: "Skin Unlimited", website: "https://skinunlimited.se", address: "Rådmansgatan 1B", postalCode: "114 25", city: "Stockholm" },

  // Storuman
  { name: "Well Being", phone: "0703-303265", address: "Klintvägen 6", postalCode: "923 32", city: "Storuman" },

  // Stenungsund
  { name: "FFantastic", phone: "0709-393121", website: "https://www.ffantastic.se/", address: "Gärdesvägen 2-4, Plan 2", postalCode: "444 31", city: "Stenungsund" },

  // Strängnäs
  { name: "Hudstudion", website: "https://hudstudion.com", address: "Trädgårdsgatan 19", postalCode: "645 31", city: "Strängnäs" },

  // Sundbyberg
  { name: "Fresh Effect", website: "https://www.fresheffect.se", address: "Gjuteribacken 15", postalCode: "172 65", city: "Sundbyberg" },

  // Tjörnarp
  { name: "Kamomillgården", phone: "0738460341", address: "Ebbarp 6109", postalCode: "243 73", city: "Tjörnarp" },

  // Tullinge
  { name: "Dig i Fokus", website: "www.digifokus.se", address: "Kvällsvägen 5", postalCode: "146 31", city: "Tullinge" },

  // Tyresö
  { name: "Vackrast med Helene", website: "https://vackrastmedhelene.se", address: "Diamantgången 85", postalCode: "135 49", city: "Tyresö" },

  // Uddevalla
  { name: "Viktoriasalongen", phone: "0522-355 40", website: "http://www.viktoriasalongen.se", address: "Strömstadsvägen 3", postalCode: "451 50", city: "Uddevalla" },

  // Vadstena
  { name: "Evas Hudvård", phone: "0702-669559", website: "www.evashudvard.com", address: "Storgatan 23A", postalCode: "592 39", city: "Vadstena" },

  // Vallentuna
  { name: "Face and Body Care i Vallentuna", website: "www.faceandbodycare.se", address: "Banvägen 27B", postalCode: "186 32", city: "Vallentuna" },

  // Vimmerby
  { name: "Hudvårdskompaniet", phone: "0761-26 21 17", website: "https://www.hudvardskompaniet.se", address: "Norrtullsgatan 3", postalCode: "598 37", city: "Vimmerby" },

  // Visby
  { name: "Prana Centr", phone: "0733-95 24 55", website: "https://www.pranacentr.se/", address: "Humlegårdsvägen 17", postalCode: "621 46", city: "Visby" },

  // Västerås
  { name: "Art of Beauty", website: "https://artofbeauty.se/", address: "Siggesborgsgatan 5", postalCode: "722 26", city: "Västerås" },
  { name: "Face and Soul", website: "http://faceandsoul.se", address: "Västra Ringvägen 21", postalCode: "724 61", city: "Västerås" },

  // Växjö
  { name: "Milles Växjö", phone: "0767 - 65 47 08", website: "https://milleko.se/", address: "Klostergatan 6", postalCode: "352 30", city: "Växjö" },

  // Ystad
  { name: "Holistisk Hälsa med Nina Jonasson", phone: "0704-97 35 60", website: "https://www.holistiskhalsa.nu/", address: "Österleden 33", postalCode: "271 42", city: "Ystad" },
  { name: "Buenosdiaz Hudvård & Hälsa", website: "https://buenosdiaz.se", address: "Kristianstadsvägen 2", postalCode: "271 34", city: "Ystad" },

  // Älmhult
  { name: "Wickma Hudvård & Skönhet", phone: "0476-18 20 14", website: "https://wickma.se/", address: "Södra Torggatan 4", postalCode: "343 32", city: "Älmhult" },

  // Örebro
  { name: "Nygatan SPA", phone: "0706269143", website: "www.nygatansspa.se", address: "Nygatan", postalCode: "702 11", city: "Örebro" },

  // Deje
  { name: "Care of Moa", website: "https://www.careofmoa.se/", address: "Älvdalsvägen 27", postalCode: "669 30", city: "Deje" }
]

function updateRetailersFile() {
  const filePath = path.resolve(__dirname, '../data/retailers.json')
  
  try {
    // Write the scraped data to the file
    fs.writeFileSync(filePath, JSON.stringify(scrapedRetailers, null, 2), 'utf-8')
    console.log(`✅ Successfully updated retailers.json with ${scrapedRetailers.length} retailers`)
    
    // Log some statistics
    const cities = [...new Set(scrapedRetailers.map(r => r.city))].sort()
    console.log(`📍 Cities covered: ${cities.length}`)
    console.log(`🏪 Total retailers: ${scrapedRetailers.length}`)
    console.log(`📞 With phone: ${scrapedRetailers.filter(r => r.phone).length}`)
    console.log(`🌐 With website: ${scrapedRetailers.filter(r => r.website).length}`)
    
  } catch (error) {
    console.error('❌ Error updating retailers file:', error)
  }
}

// Run the update
updateRetailersFile() 