'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
  Minus,
  Share2,
  Package,
  MessageCircle
} from 'lucide-react'
import ProductReviews from '@/components/reviews/ProductReviews'
import RelatedProducts from '@/components/sections/RelatedProducts'

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
    setLoading(true)
    try {
      // Fetch product from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/products`)
      const data = await response.json()
      
      if (data.success) {
        // Find product by slug
        const foundProduct = data.data.find((p: any) => p.slug === params.slug)
        
        if (foundProduct) {
          // Transform API product to match our interface
          const transformedProduct: Product = {
            id: foundProduct.id,
            name: foundProduct.name,
            slug: foundProduct.slug,
            description: foundProduct.description || '',
            longDescription: foundProduct.description || 'En fantastisk produkt från 1753 Skincare.',
            price: foundProduct.price,
            compareAtPrice: foundProduct.compareAtPrice,
            images: foundProduct.images?.map((img: string, index: number) => ({
              url: img,
              alt: `${foundProduct.name} bild ${index + 1}`,
              position: index
            })) || [{ url: '/images/products/default.png', alt: foundProduct.name, position: 0 }],
            category: { name: foundProduct.category || 'Hudvård', slug: foundProduct.category?.toLowerCase() || 'hudvard' },
            tags: foundProduct.tags || [],
            ingredients: foundProduct.keyIngredients?.map((ing: string) => ({
              name: ing,
              description: `${ing} är en kraftfull ingrediens för huden.`,
              benefits: ['Närande', 'Återfuktande', 'Lugnande'],
              concentration: '2-5%'
            })) || [],
            skinTypes: foundProduct.skinTypes || ['normal', 'dry', 'oily', 'combination', 'sensitive'],
            benefits: foundProduct.skinConcerns?.map((c: string) => `Hjälper mot ${c.toLowerCase()}`) || [
              'Ger djup återfuktning',
              'Stärker hudbarriären', 
              'Ger naturlig lyster'
            ],
            howToUse: foundProduct.howToUse || 'Applicera på ren hud morgon och kväll. Massera försiktigt tills produkten absorberats.',
            featured: foundProduct.isFeatured || false,
            bestseller: foundProduct.tags?.includes('bestseller') || false,
            newProduct: foundProduct.tags?.includes('new') || false,
            seo: {
              title: foundProduct.metaTitle || foundProduct.name,
              description: foundProduct.metaDescription || foundProduct.description || '',
              keywords: foundProduct.seoKeywords || []
            }
          }
          
          setProduct(transformedProduct)
        } else {
          // Product not found, redirect to products page
          window.location.href = '/products'
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      // Fallback to products page
      window.location.href = '/products'
    } finally {
      setLoading(false)
    }
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4A3428]"></div>
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
          <Link href="/" className="hover:text-[#4A3428] transition-colors">Hem</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-[#4A3428] transition-colors">Produkter</Link>
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
              className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5F3F0] to-[#F5F3F0]"
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
                        ? 'ring-2 ring-[#4A3428] ring-offset-2' 
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
              <span className="text-3xl font-bold text-[#4A3428]">
                {product.price} kr
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {product.compareAtPrice} kr
                  </span>
                  <span className="bg-[#E5DDD5] text-[#3A2A1E] text-sm px-2 py-1 rounded">
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
                    <span key={type} className="bg-[#E5DDD5] text-[#3A2A1E] px-3 py-1 rounded-full text-sm">
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
                      ? 'bg-[#4A3428] text-white scale-105'
                      : 'bg-[#4A3428] text-white hover:bg-[#3A2A1E] hover:scale-105 active:scale-100'
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
                <Truck className="w-6 h-6 mx-auto text-[#4A3428]" />
                <p className="text-xs text-gray-600">Fri frakt över 500 kr</p>
              </div>
              <div className="space-y-2">
                <Shield className="w-6 h-6 mx-auto text-[#4A3428]" />
                <p className="text-xs text-gray-600">100% säker betalning</p>
              </div>
              <div className="space-y-2">
                <Leaf className="w-6 h-6 mx-auto text-[#4A3428]" />
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
                ? 'text-[#4A3428]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Beskrivning
            {activeTab === 'description' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A3428]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'ingredients'
                ? 'text-[#4A3428]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ingredienser
            {activeTab === 'ingredients' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A3428]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'usage'
                ? 'text-[#4A3428]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Användning
            {activeTab === 'usage' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A3428]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'reviews'
                ? 'text-[#4A3428]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recensioner
            {activeTab === 'reviews' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A3428]"
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
                          <Check className="w-5 h-5 text-[#4A3428] flex-shrink-0 mt-0.5" />
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
                <div key={index} className="bg-[#F5F3F0] rounded-xl p-6">
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
                      <div className="bg-[#4A3428] text-white p-3 rounded-lg">
                        <Info className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">
                        {ingredient.name}
                        {ingredient.concentration && (
                          <span className="ml-2 text-sm font-normal text-[#4A3428]">
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
                                <span className="w-1.5 h-1.5 bg-[#4A3428] rounded-full"></span>
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
                <div className="mt-12 bg-gradient-to-r from-[#F5F3F0] to-[#F5F3F0] rounded-xl p-8">
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
              <div className="bg-gradient-to-r from-[#F5F3F0] to-[#F5F3F0] rounded-xl p-8">
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
              className="max-w-4xl mx-auto w-full"
            >
              <ProductReviews 
                productId={product.id}
                productSlug={product.slug}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Related Products */}
      <RelatedProducts currentProductSlug={product.slug} locale={params.locale as string} />
    </div>
    <Footer />
  </>
  )
} 