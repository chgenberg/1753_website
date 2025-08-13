'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Leaf, Sparkles, Droplets, Shield, Heart, Award, Zap } from 'lucide-react'
import Link from 'next/link'

const cannabinoidSources = [
  {
    title: "Cannabinoid Signaling in the Skin: Therapeutic Potential of the \"C(ut)annabinoid\" System",
    url: "https://www.mdpi.com/1420-3049/24/5/918/htm",
    description: "Omfattande översikt av cannabinoidernas terapeutiska potential för huden"
  },
  {
    title: "The Anti-Inflammatory Effects of Cannabidiol (CBD) on Acne",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9078861/",
    description: "Studie om CBD:s antiinflammatoriska effekter på akne"
  },
  {
    title: "Cannabis-Based Products for the Treatment of Skin Inflammatory Diseases: A Timely Review",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8878527/",
    description: "Aktuell översikt av cannabisbaserade produkter för inflammatoriska hudsjukdomar"
  },
  {
    title: "Endocannabinoids and immune regulation",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3044336/",
    description: "Forskning om endocannabinoider och immunreglering"
  },
  {
    title: "A therapeutic effect of cbd-enriched ointment in inflammatory skin diseases and cutaneous scars",
    url: "https://www.clinicaterapeutica.it/2019/170/2/05_PALMIERI-VADALA.pdf",
    description: "Terapeutisk effekt av CBD-berikad salva på inflammatoriska hudsjukdomar"
  },
  {
    title: "Phytocannabinoids Stimulate Rejuvenation and Prevent Cellular Senescence in Human Dermal Fibroblasts",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9738082/",
    description: "Fytocannabinoider stimulerar föryngring och förhindrar cellulär åldrande"
  },
  {
    title: "TRP Channel Cannabinoid Receptors in Skin Sensation, Homeostasis, and Inflammation",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4240254/",
    description: "TRP-kanaler och cannabinoidreceptorer i hudkänslighet och inflammation"
  },
  {
    title: "Therapeutic Potential of Cannabidiol (CBD) for Skin Health and Disorders",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7736837/",
    description: "Terapeutisk potential för CBD inom hudvård och hudsjukdomar"
  },
  {
    title: "Cannabinoids for the Treatment of Dermatologic Conditions",
    url: "https://www.sciencedirect.com/science/article/pii/S2667026722000017",
    description: "Cannabinoider för behandling av dermatologiska tillstånd"
  },
  {
    title: "The endocannabinoid system: Essential and mysterious",
    url: "https://www.health.harvard.edu/blog/the-endocannabinoid-system-essential-and-mysterious-202108112569",
    description: "Harvard Health om endocannabinoidsystemet"
  },
  {
    title: "Antioxidative and anti-inflammatory properties of cannabidiol",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7023045/",
    description: "Atalay S, et al. (2019) - Antioxidativa och antiinflammatoriska egenskaper hos CBD"
  },
  {
    title: "In Vitro and Clinical Evaluation of Cannabigerol (CBG)",
    url: "https://www.mdpi.com/1420-3049/27/2/491",
    description: "In vitro och klinisk utvärdering av CBG:s antiinflammatoriska egenskaper"
  },
  {
    title: "Cannabidiol exerts sebostatic and antiinflammatory effects on human sebocytes",
    url: "https://www.researchgate.net/publication/264247540_Cannabidiol_exerts_sebostatic_and_antiinflammatory_effects_on_human_sebocytes",
    description: "CBD:s sebostatic och antiinflammatoriska effekter på sebocyter"
  },
  {
    title: "Endocannabinoid Tone Regulates Human Sebocyte Biology",
    url: "https://www.sciencedirect.com/science/article/pii/S0022202X18301477",
    description: "Endocannabinoidton reglerar mänsklig sebocytbiologi"
  },
  {
    title: "The endocannabinoid system of the skin in health and disease",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2757311/",
    description: "Bíró T, et al. (2009) - Hudens endocannabinoidsystem i hälsa och sjukdom"
  },
  {
    title: "Impact of Cannabinoid Compounds on Skin Cancer",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8997154/",
    description: "Påverkan av cannabinoidföreningar på hudcancer"
  },
  {
    title: "Positive Effect of Cannabis sativa L. Herb Extracts on Skin Cells",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7913911/",
    description: "Positiv effekt av Cannabis sativa extrakt på hudceller"
  },
  {
    title: "Dosage, efficacy and safety of cannabidiol administration in adults",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7092763/",
    description: "Larsen, C et al. (2020) - Dosering, effektivitet och säkerhet av CBD"
  },
  {
    title: "Oxidative stress, aging, and diseases",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5927356/",
    description: "Liguori I, et al. (2018) - Oxidativ stress, åldrande och sjukdomar"
  },
  {
    title: "Cannabinoids for the prevention of aging",
    url: "https://cellular-goods.com/learn/articles/research/white-paper-cannabinoids-for-the-prevention-of-aging-whitepaper",
    description: "Cannabinoider för förebyggande av åldrande"
  },
  {
    title: "WHO Cannabidiol (CBD) pre-review report",
    url: "https://www.who.int/medicines/access/controlled-substances/5.2_CBD.pdf",
    description: "World Health Organization (2017) - CBD förhandsgranskningsrapport"
  }
]

const mctSources = [
  {
    title: "A randomized double-blind controlled trial comparing extra virgin coconut oil with mineral oil as a moisturizer",
    url: "https://pubmed.ncbi.nlm.nih.gov/15724344/",
    description: "Randomiserad dubbelblind kontrollerad studie av kokosolja som fuktkräm"
  },
  {
    title: "The Nutrition Source - Coconut Oil",
    url: "https://www.hsph.harvard.edu/nutritionsource/food-features/coconut-oil/",
    description: "Harvard T.H. Chan School of Public Health om kokosolja"
  },
  {
    title: "7 Science-Based Benefits of MCT Oil",
    url: "https://www.healthline.com/nutrition/mct-oil-benefits#TOC_TITLE_HDR_6",
    description: "Vetenskapligt baserade fördelar med MCT-olja"
  }
]

const jojobaSources = [
  {
    title: "Jojoba in dermatology: a succinct review",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3614059/",
    description: "Omfattande översikt av Jojoba-olja inom dermatologi och hudvård"
  },
  {
    title: "Anti-inflammatory and skin barrier repair effects of topical application of some plant oils",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4885180/",
    description: "Antiinflammatoriska och hudbarriär-reparerande effekter av växtoljor"
  },
  {
    title: "Jojoba Oil: An Updated Comprehensive Review on Chemistry, Pharmaceutical Uses, and Toxicity",
    url: "https://www.mdpi.com/1420-3049/24/21/3929",
    description: "Uppdaterad omfattande översikt av Jojoba-oljans kemi och farmaceutiska användning"
  },
  {
    title: "The effect of topical virgin coconut oil on SCORAD index, transepidermal water loss, and skin capacitance",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4382606/",
    description: "Effekter av topisk oljeapplikation på hudbarriär och fuktförlust"
  },
  {
    title: "Moisturizing effect of topical lipids: comparison of single compounds and lipid mixtures",
    url: "https://pubmed.ncbi.nlm.nih.gov/2031726/",
    description: "Jämförelse av fuktigheteffekter mellan olika lipider och oljeblandningar"
  }
]

const mushroomSources = [
  {
    title: "Edible Mushrooms: Improving Human Health and Promoting Quality Life",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4320875/",
    description: "María Elena Valverde et al. - Ätbara svampar för förbättrad hälsa"
  },
  {
    title: "Medicinal Mushrooms: Their Bioactive Components, Nutritional Value and Application",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10384337/",
    description: "Medicinska svampar: bioaktiva komponenter och näringsværde"
  },
  {
    title: "Medicinal Mushrooms: Bioactive Compounds, Use, and Clinical Trials",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7826851/",
    description: "Medicinska svampar: bioaktiva föreningar och kliniska studier"
  }
]

const chagaSources = [
  {
    title: "Therapeutic properties of Inonotus obliquus (Chaga mushroom): a review",
    url: "https://www.tandfonline.com/doi/full/10.1080/21501203.2023.2260408",
    description: "Terapeutiska egenskaper hos Chaga-svamp - omfattande översikt"
  },
  {
    title: "Molecular insights and cell cycle assessment upon exposure to Chaga polysaccharides",
    url: "https://www.nature.com/articles/s41598-020-64157-3",
    description: "Molekylära insikter och cellcykelanalys av Chaga-polysackarider"
  },
  {
    title: "Study on the anti-inflammatory activity of chaga mushroom aqueous extract",
    url: "https://www.sciencedirect.com/science/article/pii/S270736882300016X",
    description: "Studie av antiinflammatorisk aktivitet hos Chaga-extrakt"
  },
  {
    title: "Recent Developments in Inonotus obliquus Polysaccharides",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8124789/",
    description: "Senaste utvecklingen inom Chaga-polysackarider och biologisk aktivitet"
  }
]

const reishiSources = [
  {
    title: "6 Benefits of Reishi Mushroom",
    url: "https://www.healthline.com/nutrition/reishi-mushroom-benefits",
    description: "Sex fördelar med Reishi-svamp enligt Healthline"
  },
  {
    title: "Ganoderma lucidum (Lingzhi or Reishi)",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK92757/",
    description: "NCBI Bookshelf om Ganoderma lucidum (Reishi)"
  },
  {
    title: "Exploring the Potential Medicinal Benefits of Ganoderma lucidum",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10094145/",
    description: "Utforska potentiella medicinska fördelar med Ganoderma lucidum"
  },
  {
    title: "Health Benefits of Reishi Mushrooms",
    url: "https://www.webmd.com/diet/health-benefits-reishi-mushrooms",
    description: "WebMD om hälsofördelar med Reishi-svampar"
  }
]

const lionsManeSource = [
  {
    title: "9 Health Benefits of Lion's Mane Mushroom",
    url: "https://www.healthline.com/nutrition/lions-mane-mushroom",
    description: "Nio hälsofördelar med Lion's Mane-svamp"
  },
  {
    title: "Neurotrophic properties of the Lion's mane medicinal mushroom",
    url: "https://pubmed.ncbi.nlm.nih.gov/24266378/",
    description: "Neurotrofiska egenskaper hos Lion's Mane medicinalsvamp från Malaysia"
  },
  {
    title: "Health Benefits Of Lion's Mane",
    url: "https://www.forbes.com/health/supplements/health-benefits-of-lions-mane/",
    description: "Forbes om hälsofördelar med Lion's Mane"
  },
  {
    title: "What are the benefits of lion's mane mushrooms?",
    url: "https://www.medicalnewstoday.com/articles/323400",
    description: "Medical News Today om fördelar med Lion's Mane-svampar"
  },
  {
    title: "Lion's Mane Mushrooms May Boost Brain Health",
    url: "https://www.healthline.com/health-news/latest-study-suggests-lions-mane-mushrooms-may-boost-brain-heath",
    description: "Senaste studien antyder att Lion's Mane kan förbättra hjärnhälsan"
  }
]

const cordycepsSources = [
  {
    title: "Pharmacological and therapeutic potential of Cordyceps with special reference to Cordycepin",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3909570/",
    description: "Farmakologisk och terapeutisk potential hos Cordyceps"
  },
  {
    title: "Cordyceps as an Herbal Drug",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK92758/",
    description: "NCBI Bookshelf om Cordyceps som örtmedicin"
  },
  {
    title: "Cordyceps militaris: An Overview of Its Chemical Constituents",
    url: "https://www.mdpi.com/2304-8158/10/11/2634",
    description: "Översikt av kemiska beståndsdelar i Cordyceps militaris"
  },
  {
    title: "Cordyceps spp.: A Review on Its Immune-Stimulatory and Other Biological Potentials",
    url: "https://www.frontiersin.org/articles/10.3389/fphar.2020.602364/full",
    description: "Översikt av Cordyceps immunstimulerande och biologiska potential"
  }
]

const sourceCategories = [
  {
    title: "CBD & CBG",
    icon: <Leaf className="w-6 h-6" />,
    color: "from-[#F5F3F0]0 to-[#6B5D54]",
    sources: cannabinoidSources,
    description: "Vetenskapliga studier om cannabinoider och hudvård"
  },
  {
    title: "MCT Kokosolja",
    icon: <Droplets className="w-6 h-6" />,
    color: "from-orange-500 to-yellow-600",
    sources: mctSources,
    description: "Forskning om MCT-olja och hudvård"
  },
  {
    title: "Jojoba Olja",
    icon: <Heart className="w-6 h-6" />,
    color: "from-yellow-500 to-amber-600",
    sources: jojobaSources,
    description: "Vetenskaplig forskning om Jojoba-olja och hudvård"
  },
  {
    title: "Medicinska Svampar (Allmänt)",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-purple-500 to-pink-600",
    sources: mushroomSources,
    description: "Övergripande forskning om medicinska svampar"
  },
  {
    title: "Chaga",
    icon: <Shield className="w-6 h-6" />,
    color: "from-amber-500 to-orange-600",
    sources: chagaSources,
    description: "Specifik forskning om Chaga-svamp"
  },
  {
    title: "Reishi",
    icon: <Heart className="w-6 h-6" />,
    color: "from-purple-500 to-pink-600",
    sources: reishiSources,
    description: "Specifik forskning om Reishi-svamp"
  },
  {
    title: "Lion's Mane",
    icon: <Award className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-600",
    sources: lionsManeSource,
    description: "Specifik forskning om Lion's Mane-svamp"
  },
  {
    title: "Cordyceps",
    icon: <Zap className="w-6 h-6" />,
    color: "from-red-500 to-orange-600",
    sources: cordycepsSources,
    description: "Specifik forskning om Cordyceps-svamp"
  }
]

export default function KallorPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <span className="text-[#00937c] font-medium text-sm uppercase tracking-wider">Vetenskaplig Grund</span>
              <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                Källor
              </h1>
              <h2 className="text-3xl font-semibold text-gray-700 mb-6">
                Här är våra
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Alla våra påståenden om ingrediensernas effekter är baserade på vetenskaplig forskning. 
                Här hittar du samtliga källor som stödjer informationen på vår webbplats.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {sourceCategories.map((category, index) => (
                <motion.a
                  key={category.title}
                  href={`#${category.title.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace('&', 'och')}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center`}
                >
                  {category.icon}
                  <span className="ml-2 text-sm">{category.title}</span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sources Sections */}
        {sourceCategories.map((category, categoryIndex) => (
          <section
            key={category.title}
            id={category.title.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace('&', 'och')}
            className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${category.color} text-white rounded-2xl flex items-center justify-center`}>
                  {category.icon}
                </div>
                <h2 className="text-4xl font-bold mb-4">{category.title}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{category.description}</p>
              </motion.div>

              <div className="grid gap-6 max-w-5xl mx-auto">
                {category.sources.map((source, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                          {source.title}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          {source.description}
                        </p>
                        <motion.a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center px-4 py-2 bg-[#00937c] text-white rounded-lg font-medium hover:bg-[#E79C1A] transition-colors duration-300 text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Läs studien
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Academic Disclaimer */}
        <section className="py-20 bg-gradient-to-br from-[#00937c] to-[#00b89d] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <BookOpen className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Vetenskaplig Transparens</h2>
              <p className="text-lg leading-relaxed mb-6">
                Vi tror på vetenskaplig transparens och evidensbaserad information. Alla påståenden om våra 
                ingredienser baseras på peer-reviewed forskning från välrenommerade vetenskapliga tidskrifter 
                och institutioner.
              </p>
              <p className="text-base opacity-90">
                Observera att dessa studier är för informationsändamål och utgör inte medicinsk rådgivning. 
                Konsultera alltid en läkare innan du använder produkter för medicinska ändamål.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Back to Ingredients */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/om-oss/ingredienser">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-[#00937c] text-white rounded-full font-semibold hover:bg-[#E79C1A] transition-colors duration-300 flex items-center mx-auto"
                >
                  <Leaf className="w-5 h-5 mr-2" />
                  Tillbaka till Ingredienser
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 