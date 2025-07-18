'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JudgeMeWidget } from '@/components/reviews/JudgeMeWidget'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { useCart } from '@/contexts/CartContext'
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Truck,
  Shield,
  Leaf,
  Info,
  Plus,
  Minus
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  price: number
  compareAtPrice?: number
  images: Array<{ url: string; alt: string; position: number }>
  category: { name: string; slug: string }
  tags: string[]
  ingredients: Array<{
    name: string
    description: string
    benefits: string[]
    concentration?: string
    image?: string
  }>
  skinTypes: string[]
  benefits: string[]
  howToUse: string
  featured: boolean
  bestseller: boolean
  newProduct: boolean
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

const skinTypeTranslations: Record<string, string> = {
  dry: 'Torr hud',
  oily: 'Fet hud',
  combination: 'Kombinerad hud',
  sensitive: 'Känslig hud',
  normal: 'Normal hud',
  acne: 'Aknebenägen hud',
  mature: 'Mogen hud'
}

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'usage' | 'reviews'>('description')

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    // Mock product data - replace with API call later
    const mockProducts = [
      {
        id: '1',
        name: 'The ONE Facial Oil',
        slug: 'the-one-facial-oil',
        description: 'Vår populäraste ansiktsolja med CBD och CBG för alla hudtyper',
        longDescription: `The ONE Facial Oil är vår mest populära ansiktsolja, utvecklad för att passa alla hudtyper. Med en kraftfull kombination av CBD och CBG ger denna olja din hud den balans och näring den behöver.

Denna unika formula innehåller:
• 500mg CBD för anti-inflammatorisk effekt
• 200mg CBG för antibakteriella egenskaper  
• Jojoba-olja för djup återfuktning
• MCT-kokosolja som bärarolja

The ONE har hjälpt tusentals kunder att uppnå en friskare, mer balanserad hud. Perfekt för daglig användning, morgon och kväll.`,
        price: 649,
        images: [
          { url: '/images/products/TheONE.png', alt: 'THE ONE Ansiktsolja', position: 0 }
        ],
        category: { name: 'Ansiktsolja', slug: 'ansiktsolja' },
        tags: ['CBD', 'CBG', 'Ansiktsolja'],
        ingredients: [
          {
            name: 'CBD (Cannabidiol)',
            description: 'Kraftfull anti-inflammatorisk ingrediens som lugnar huden',
            benefits: ['Minskar inflammationer', 'Lugnar irriterad hud', 'Balanserar sebumproduktion'],
            concentration: '500mg'
          },
          {
            name: 'CBG (Cannabigerol)', 
            description: 'Antibakteriell cannabinoid som förebygger orenheter',
            benefits: ['Antibakteriell effekt', 'Antioxidant', 'Stödjer hudens naturliga skydd'],
            concentration: '200mg'
          },
          {
            name: 'Jojoba-olja',
            description: 'Naturlig olja som efterliknar hudens egen sebum',
            benefits: ['Djup återfuktning', 'Icke-komedogen', 'Balanserar huden']
          }
        ],
        skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
        benefits: [
          'Minskar inflammationer och rodnad',
          'Balanserar hudens sebumproduktion', 
          'Återfuktar utan att täppa till porer',
          'Lugnar irriterad och känslig hud',
          'Förebygger orenheter och finnar'
        ],
        howToUse: 'Applicera 2-3 droppar på ren hud, morgon och kväll. Massera försiktigt tills oljan absorberats helt.',
        featured: true,
        bestseller: true,
        newProduct: false,
        seo: {
          title: 'THE ONE - Ansiktsolja med CBD & CBG',
          description: 'Vår populäraste ansiktsolja med CBD och CBG för alla hudtyper',
          keywords: ['cbd ansiktsolja', 'cbg hudvård', 'naturlig ansiktsolja']
        }
      },
      {
        id: '2',
        name: 'Au Naturel Makeup Remover',
        slug: 'au-naturel-makeup-remover',
        description: 'Mild makeupborttagare för känslig hud med naturliga ingredienser',
        longDescription: `Au Naturel Makeup Remover är speciellt utvecklad för känslig hud som behöver extra omtanke. Denna milda formula tar effektivt bort makeup utan att irritera huden.

Perfekt för dig som har:
• Känslig hud som reagerar på starka ingredienser
• Behov av skonsam men effektiv rengöring
• Önskan om naturlig makeupborttagning

Med sin milda sammansättning är Au Naturel idealisk för daglig användning, även på den mest känsliga huden.`,
        price: 399,
        images: [
          { url: '/images/products/Naturel.png', alt: 'NATUREL Ansiktsolja', position: 0 }
        ],
        category: { name: 'Ansiktsolja', slug: 'ansiktsolja' },
        tags: ['CBD', 'Känslig hud', 'Naturlig'],
        ingredients: [
          {
            name: 'CBD (Cannabidiol)',
            description: 'Mild anti-inflammatorisk ingrediens',
            benefits: ['Lugnar känslig hud', 'Minskar rodnad', 'Stärker hudbarriären'],
            concentration: '300mg'
          },
          {
            name: 'Kamomillolja',
            description: 'Traditionell lugnande ingrediens',
            benefits: ['Anti-inflammatorisk', 'Lugnar irritation', 'Mjukgör huden']
          }
        ],
        skinTypes: ['sensitive'],
        benefits: [
          'Extra mild för känslig hud',
          'Minskar rodnad och irritation',
          'Stärker hudens naturliga barriär',
          'Lugnar och mjukgör huden'
        ],
        howToUse: 'Applicera 2-3 droppar på ren hud. Perfekt för känslig hud, morgon och kväll.',
        featured: true,
        bestseller: false,
        newProduct: false,
        seo: {
          title: 'NATUREL - Mild ansiktsolja för känslig hud',
          description: 'Mild ansiktsolja med CBD för känslig hud',
          keywords: ['känslig hud', 'mild ansiktsolja', 'cbd känslig hud']
        }
      },
      {
        id: '3',
        name: 'TA-DA Serum',
        slug: 'ta-da-serum',
        description: 'Kraftfullt serum för problematisk hud',
        longDescription: `TA-DA Serum är utvecklat för dig som kämpar med problematisk hud och behöver extra kraft för att bekämpa orenheter och inflammationer.

Denna kraftfulla formula innehåller:
• Hög koncentration CBD för anti-inflammatorisk effekt
• CBG för antibakteriell verkan
• Tea Tree olja för djuprengöring
• Salicylsyra för pordjuprengöring

TA-DA hjälper dig att ta kontroll över din hud och säga "TA-DA!" till en klarare, friskare hy.`,
        price: 699,
        images: [
          { url: '/images/products/TA-DA.png', alt: 'TA-DA Ansiktsolja', position: 0 }
        ],
        category: { name: 'Ansiktsolja', slug: 'ansiktsolja' },
        tags: ['CBD', 'CBG', 'Problematisk hud'],
        ingredients: [
          {
            name: 'CBD (Cannabidiol)',
            description: 'Kraftfull anti-inflammatorisk ingrediens',
            benefits: ['Minskar inflammationer', 'Lugnar irriterad hud'],
            concentration: '600mg'
          },
          {
            name: 'Tea Tree olja',
            description: 'Naturlig antibakteriell ingrediens',
            benefits: ['Djuprengöring', 'Antibakteriell effekt', 'Minskar orenheter']
          }
        ],
        skinTypes: ['oily', 'acne', 'combination'],
        benefits: [
          'Bekämpar orenheter effektivt',
          'Minskar inflammationer',
          'Djuprengör porerna',
          'Förebygger nya utbrott'
        ],
        howToUse: 'Applicera på ren hud, främst på kvällen. Börja med 2-3 gånger per vecka.',
        featured: false,
        bestseller: false,
        newProduct: true,
        seo: {
          title: 'TA-DA - Ansiktsolja för problematisk hud',
          description: 'Kraftfull ansiktsolja för problematisk hud med CBD och CBG',
          keywords: ['problematisk hud', 'akne', 'cbd ansiktsolja']
        }
      },
      {
        id: '4',
        name: 'Fungtastic Mushroom Extract',
        slug: 'fungtastic-mushroom-extract',
        description: 'Kraftfulla medicinska svampar för hud och hälsa',
        longDescription: `Fungtastic Mushroom Extract innehåller fyra av världens mest kraftfulla medicinska svampar för optimal hud- och kroppshälsa.

Denna unika blandning innehåller:
• Chaga - "Skogens diamant" med antioxidanter
• Reishi - "Odödlighetens svamp" för stress och sömn
• Lion's Mane - "Den smarta svampen" för hjärnhälsa
• Cordyceps - "Energisvampen" för uthållighet

Fungtastic stödjer din hud inifrån och ut genom att stärka immunsystemet och minska inflammation.`,
        price: 399,
        images: [
          { url: '/images/products/Fungtastic.png', alt: 'FUNGTASTIC Svampextrakt', position: 0 }
        ],
        category: { name: 'Kosttillskott', slug: 'kosttillskott' },
        tags: ['Svamp', 'Kosttillskott', 'Antioxidanter'],
        ingredients: [
          {
            name: 'Chaga',
            description: '"Skogens diamant" - En kraftfull antioxidant från björkträd som stärker immunförsvaret',
            benefits: ['Stärker immunförsvaret', 'Minskar inflammation', 'Skyddar mot fria radikaler', 'Förbättrar hudens utseende'],
            image: '/Mushrooms/chaga.png'
          },
          {
            name: 'Reishi',
            description: '"Odödlighetens svamp" - Adaptogen som balanserar stress och förbättrar sömn',
            benefits: ['Minskar stress', 'Förbättrar sömn', 'Stärker immunsystemet', 'Balanserar cortisol'],
            image: '/Mushrooms/reiki.png'
          },
          {
            name: 'Lion\'s Mane',
            description: '"Den smarta svampen" - Stödjer kognitiv funktion och hjärnhälsa',
            benefits: ['Förbättrar fokus', 'Stödjer neuroplasticitet', 'Minskar stress', 'Hjärn-hud kopplingen'],
            image: '/Mushrooms/lionsmane.png'
          },
          {
            name: 'Cordyceps',
            description: '"Energisvampen" - Ökar uthållighet och syreupptagning i kroppen',
            benefits: ['Ökar energi', 'Förbättrar uthållighet', 'Stärker immunförsvaret', 'Förbättrar cirkulationen'],
            image: '/Mushrooms/cordyceps.png'
          }
        ],
        skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
        benefits: [
          'Stärker immunförsvaret',
          'Minskar inflammation i kroppen',
          'Förbättrar hudens utseende inifrån',
          'Ökar energi och uthållighet'
        ],
        howToUse: 'Ta 2 kapslar dagligen med mat. Bäst resultat efter 4-6 veckors användning.',
        featured: true,
        bestseller: false,
        newProduct: false,
        seo: {
          title: 'FUNGTASTIC - Medicinska svampar för hud och hälsa',
          description: 'Kraftfulla medicinska svampar för optimal hud- och kroppshälsa',
          keywords: ['medicinska svampar', 'chaga', 'reishi', 'kosttillskott']
        }
      },
      {
        id: '5',
        name: 'I LOVE Facial Oil',
        slug: 'i-love-facial-oil',
        description: 'Komplett ansiktsolja för alla hudtyper',
        longDescription: `I LOVE Facial Oil är vår mest omfattande ansiktsolja, perfekt för dig som vill ge din hud det allra bästa. Denna lyxiga formula kombinerar det bästa från alla våra oljor.

Fördelar:
• Komplett hudvård i en flaska
• Passar alla hudtyper
• Rik på CBD och CBG
• Djupt återfuktande

Med I LOVE får du en lyxig hudupplevelse varje dag.`,
        price: 849,
        images: [
          { url: '/images/products/ILOVE.png', alt: 'I LOVE Hudvårdskit', position: 0 }
        ],
        category: { name: 'Kit', slug: 'kit' },
        tags: ['Kit', 'Nybörjare', 'Komplett'],
        ingredients: [
          {
            name: 'THE ONE ansiktsolja',
            description: 'Vår populäraste ansiktsolja',
            benefits: ['Passar alla hudtyper', 'CBD & CBG', 'Balanserar huden']
          },
          {
            name: 'NATUREL ansiktsolja',
            description: 'Mild olja för känslig hud',
            benefits: ['Extra mild', 'Lugnar irritation', 'Perfekt för känslig hud']
          }
        ],
        skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
        benefits: [
          'Komplett hudvårdsrutin',
          'Perfekt för nybörjare',
          'Fantastiskt värde',
          'Detaljerad guide inkluderad'
        ],
        howToUse: 'Följ den inkluderade guiden för optimal hudvårdsrutin.',
        featured: true,
        bestseller: true,
        newProduct: false,
        seo: {
          title: 'I LOVE - Komplett hudvårdskit för nybörjare',
          description: 'Komplett hudvårdskit med THE ONE och NATUREL',
          keywords: ['hudvårdskit', 'nybörjare', 'komplett hudvård']
        }
      },
      {
        id: '6',
        name: 'DUO-kit',
        slug: 'duo-kit',
        description: 'Perfekt kombination för optimal hudvård',
        longDescription: `DUO-kit är den perfekta kombinationen av våra mest effektiva produkter för dig som vill maximera din hudvård.

Detta kit innehåller:
• The ONE Facial Oil (50ml) - För daglig användning
• TA-DA Serum (30ml) - För intensiv behandling
• Appliceringsguide
• Hudvårdsschema

DUO-kit ger dig flexibiliteten att anpassa din hudvård efter dina behov.`,
        price: 1099,
        images: [
          { url: '/images/products/DUO.png', alt: 'DUO Hudvårdskit', position: 0 }
        ],
        category: { name: 'Kit', slug: 'kit' },
        tags: ['Kit', 'Kombination', 'Flexibel'],
        ingredients: [
          {
            name: 'THE ONE ansiktsolja',
            description: 'Daglig hudvård för alla hudtyper',
            benefits: ['Balanserar huden', 'CBD & CBG', 'Daglig användning']
          },
          {
            name: 'TA-DA ansiktsolja',
            description: 'Intensiv behandling för problematisk hud',
            benefits: ['Kraftfull formula', 'Bekämpar orenheter', 'Intensiv vård']
          }
        ],
        skinTypes: ['normal', 'dry', 'oily', 'combination', 'acne'],
        benefits: [
          'Flexibel hudvårdsrutin',
          'Daglig och intensiv vård',
          'Anpassningsbar efter behov',
          'Bästa värdet för erfarna användare'
        ],
        howToUse: 'Använd THE ONE dagligen och TA-DA 2-3 gånger per vecka eller vid behov.',
        featured: false,
        bestseller: false,
        newProduct: false,
        seo: {
          title: 'DUO - Flexibelt hudvårdskit',
          description: 'Perfekt kombination av THE ONE och TA-DA för optimal hudvård',
          keywords: ['hudvårdskit', 'kombination', 'flexibel hudvård']
        }
      }
    ]

    const foundProduct = mockProducts.find(p => p.slug === params.slug)
    setProduct(foundProduct || null)
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Convert product to match the Product type expected by cart
    const cartProduct = {
      ...product,
      images: product.images.map((img, index) => ({
        id: `img-${index}`,
        url: img.url,
        alt: img.alt || product.name,
        position: img.position || 0
      })),
      variants: [],
      inventory: {
        quantity: 100,
        sku: product.slug,
        trackQuantity: false
      },
      saleProduct: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    addToCart(cartProduct as any, quantity)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Produkten kunde inte hittas.</p>
      </div>
    )
  }

  const discountPercentage = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600 transition-colors">Hem</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-green-600 transition-colors">Produkter</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {product.images[selectedImage]?.url && (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[selectedImage].url}
                      alt={product.images[selectedImage].alt || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.bestseller && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    Bästsäljare
                  </span>
                )}
                {product.newProduct && (
                  <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                    Nyhet
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => image.url && (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'ring-2 ring-green-600 ring-offset-2' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.category.name}
                </span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <p className="text-lg text-gray-600">
                {product.description}
              </p>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <span className="text-3xl font-bold text-green-600">
                {product.price} kr
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {product.compareAtPrice} kr
                  </span>
                  <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
                    Du sparar {product.compareAtPrice - product.price} kr
                  </span>
                </>
              )}
            </motion.div>

            {/* Skin Types */}
            {product.skinTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Passar hudtyper:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.skinTypes.map((type) => (
                    <span key={type} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {skinTypeTranslations[type]}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add to Cart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 border-t border-gray-200 pt-6"
            >
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Antal:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all transform ${
                    addedToCart
                      ? 'bg-green-600 text-white scale-105'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-100'
                  }`}
                >
                  {addedToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Tillagd i varukorgen
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Lägg i varukorg
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 text-center"
            >
              <div className="space-y-2">
                <Truck className="w-6 h-6 mx-auto text-green-600" />
                <p className="text-xs text-gray-600">Fri frakt över 500 kr</p>
              </div>
              <div className="space-y-2">
                <Shield className="w-6 h-6 mx-auto text-green-600" />
                <p className="text-xs text-gray-600">100% säker betalning</p>
              </div>
              <div className="space-y-2">
                <Leaf className="w-6 h-6 mx-auto text-green-600" />
                <p className="text-xs text-gray-600">100% naturligt</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'description'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Beskrivning
            {activeTab === 'description' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'ingredients'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ingredienser
            {activeTab === 'ingredients' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'usage'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Användning
            {activeTab === 'usage' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'reviews'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recensioner
            {activeTab === 'reviews' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl"
            >
              <div className="prose prose-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {product.longDescription}
                </p>
                
                {product.benefits.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Fördelar</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ingredients' && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {product.ingredients.map((ingredient, index) => (
                <div key={index} className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-start gap-6">
                    {ingredient.image ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={ingredient.image}
                          alt={ingredient.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-green-600 text-white p-3 rounded-lg">
                        <Info className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">
                        {ingredient.name}
                        {ingredient.concentration && (
                          <span className="ml-2 text-sm font-normal text-green-600">
                            ({ingredient.concentration})
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-700 mb-3">{ingredient.description}</p>
                      {ingredient.benefits.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-600">Fördelar:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {ingredient.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Special mushroom showcase for Fungtastic */}
              {product.slug === 'fungtastic-svampextrakt' && (
                <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                    Fyra kraftfulla medicinska svampar
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {product.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center group"
                      >
                        <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                          <Image
                            src={ingredient.image || '/images/products/Fungtastic.png'}
                            alt={ingredient.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{ingredient.name}</h4>
                        <p className="text-xs text-gray-600">
                          {ingredient.description.split(' - ')[0].replace(/"/g, '')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'usage' && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Så här använder du {product.name}</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.howToUse}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl"
            >
              <div className="space-y-8">
                {/* Review Stats */}
                <div className="text-center">
                  <JudgeMeWidget
                    shopDomain="1753skincare.myshopify.com"
                    productHandle={product.slug}
                    widgetType="preview-badge"
                    className="justify-center"
                  />
                </div>
                
                {/* Reviews List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold mb-6">Kundrecensioner</h3>
                  <ReviewsList
                    productId={product.slug}
                    showAll={true}
                    maxReviews={20}
                    showStats={true}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Related Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Du kanske också gillar</h2>
          {/* Add related products grid here */}
        </div>
      </section>
    </div>
    <Footer />
  </>
  )
} 