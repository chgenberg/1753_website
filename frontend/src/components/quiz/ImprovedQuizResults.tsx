'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, ShoppingBag, Heart, Sun, Utensils, Activity, 
  Moon, Brain, ChevronRight, Check, Clock, Package,
  Star, TrendingUp, Leaf, Book, Mail, Phone, 
  MessageCircle, Calendar, Zap, Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import type { ImageMetricsResult } from './FacePhotoAnalyzer'

interface QuizResultsProps {
  results: any
  userInfo: any
  imageMetrics?: ImageMetricsResult | null
}

const TabButton = ({ active, onClick, icon: Icon, label, notification = false }: any) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`relative flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
      active 
        ? 'bg-[#FCB237] text-white shadow-lg' 
        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
    {notification && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    )}
  </motion.button>
)

export default function ImprovedQuizResults({ results, userInfo, imageMetrics }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [tier, setTier] = useState<'budget' | 'standard' | 'premium'>('standard')
  const { addToCart } = useCart()
  const [metric, setMetric] = useState<'rednessIndex' | 'highlightRatio' | 'textureVariance'>('rednessIndex')

  // Map results.products into a flat list for selected tier
  const getRecommendedProducts = () => {
    const buckets = [results.products?.morning, results.products?.evening, results.products?.weekly].filter(Boolean)
    const all = buckets.flatMap((b: any) => (b?.steps || []).map((s: any) => s.product).filter(Boolean))
    // If products include tier options, pick by current tier; otherwise include as-is
    return all.map((p: any) => {
      if (!p) return null
      if (p.variants && p.variants[tier]) return { ...p, ...p.variants[tier] }
      return p
    }).filter(Boolean)
  }

  const addRoutineToCart = () => {
    const products = getRecommendedProducts()
    products.forEach((p: any) => {
      try {
        addToCart({
          id: p.id || p.slug || p.name,
          name: p.name,
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g,'-'),
          price: Number(p.price || p.compareAtPrice || 0),
          images: (p.images || p.image ? [p.image || p.images?.[0]] : []),
        } as any, 1)
      } catch (e) {
        console.warn('Failed to add product', p, e)
      }
    })
  }

  const heatColor = (value: number, max: number) => {
    // value normalized 0..1
    const t = Math.max(0, Math.min(1, value / max))
    // simple gradient from #22c55e (green) -> #eab308 (amber) -> #ef4444 (red)
    const interp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k)
    let r, g, b
    if (t < 0.5) {
      const k = t / 0.5
      // green to amber
      r = interp(34, 234, k)
      g = interp(197, 179, k)
      b = interp(94, 8, k)
    } else {
      const k = (t - 0.5) / 0.5
      // amber to red
      r = interp(234, 239, k)
      g = interp(179, 68, k)
      b = interp(8, 68, k)
    }
    return `rgb(${r}, ${g}, ${b})`
  }

  const metricMax: Record<string, number> = {
    rednessIndex: 40, // typical upper seen
    highlightRatio: 20,
    textureVariance: 2000
  }

  const getZone = (z: any, key: string) => (z ? z[key] ?? 0 : 0)

  const HeatMap = () => {
    if (!imageMetrics?.zones) return null
    const z = imageMetrics.zones
    const max = metricMax[metric]
    // Simple schematic with labeled rectangles
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">Välj metrisk:</span>
          <button onClick={() => setMetric('rednessIndex')} className={`px-2 py-1 text-xs rounded-full ${metric==='rednessIndex'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Rodnad</button>
          <button onClick={() => setMetric('highlightRatio')} className={`px-2 py-1 text-xs rounded-full ${metric==='highlightRatio'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Glans</button>
          <button onClick={() => setMetric('textureVariance')} className={`px-2 py-1 text-xs rounded-full ${metric==='textureVariance'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Textur</button>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          <div className="col-span-3 h-12 rounded" style={{ background: heatColor(getZone(z.forehead, metric), max) }} />
          <div className="h-16 rounded" style={{ background: heatColor(getZone(z.leftCheek, metric), max) }} />
          <div className="h-16 rounded" style={{ background: heatColor(getZone(z.nose, metric), max) }} />
          <div className="h-16 rounded" style={{ background: heatColor(getZone(z.rightCheek, metric), max) }} />
          <div className="col-span-3 h-12 rounded" style={{ background: heatColor(getZone(z.chin, metric), max) }} />
        </div>
        <div className="mt-2 text-xs text-gray-500">Överst: panna • Mitten vänster: vänster kind • Mitten: näsa • Mitten höger: höger kind • Nederst: haka</div>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Översikt', icon: Sparkles },
    { id: 'products', label: 'Produkter', icon: ShoppingBag, notification: true },
    { id: 'lifestyle', label: 'Livsstil', icon: Heart },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'protocol', label: 'Protokoll', icon: Calendar },
    { id: 'education', label: 'Lär mer', icon: Book }
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userInfo.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F3F0]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/1753.png"
                alt="1753 Skincare"
                width={100}
                height={33}
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={copyToClipboard}
                className="text-sm text-gray-600 hover:text-[#8B6B47] transition-colors"
              >
                {copiedEmail ? 'Kopierat!' : userInfo.email}
              </button>
              <Link 
                href="/"
                className="px-4 py-2 bg-[#FCB237] text-white rounded-full text-sm hover:bg-[#E79C1A] transition-colors"
              >
                Till startsidan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            {results.summary?.greeting || `Hej ${userInfo.name}!`}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Din personliga hudvårdsplan är klar! Baserat på din unika profil har vi skapat en holistisk plan som kombinerar naturlig hudvård med livsstilsoptimering.
          </p>
        </motion.div>

        {/* Score Display */}
        {results.summary?.holisticScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto"
          >
            <div className="text-center mb-4">
              <div className="text-5xl font-light text-[#8B6B47] mb-2">
                {results.summary.holisticScore}/100
              </div>
              <div className="text-gray-600">Din holistiska hudpoäng</div>
            </div>
            
            {results.summary.scoreBreakdown && (
              <div className="grid grid-cols-4 gap-4 mt-6">
                {Object.entries(results.summary.scoreBreakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-light text-gray-700">{value}/25</div>
                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              notification={tab.notification}
            />
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            {/* Summary Tab */}
            {activeTab === 'summary' && results.summary && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Din hudanalys</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {results.summary.skinAnalysis}
                  </p>
                </div>

                {results.summary.primaryConcerns && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Huvudfokus</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.summary.primaryConcerns.map((concern: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#8B6B47]/10 text-[#6B5337] rounded-full text-sm"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.summary.evolutionaryInsight && (
                  <div className="bg-[#FAF8F5] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Leaf className="w-5 h-5 text-[#8B6B47] mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Evolutionär insikt</h3>
                        <p className="text-gray-600 text-sm">
                          {results.summary.evolutionaryInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {results.quickTips && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Snabba tips</h3>
                    <div className="grid gap-3">
                      {results.quickTips.slice(0, 5).map((tip: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-[#8B6B47] text-white rounded-full flex items-center justify-center text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{tip.tip}</p>
                              <p className="text-[#8B6B47] text-xs">{tip.why}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Heatmap (if provided) */}
                {imageMetrics && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Zonkarta</h3>
                    <p className="text-sm text-gray-600">Värmekarta per zon (högre värden = mer intensitet).</p>
                    <HeatMap />
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && results.products && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-1">Dina produktrekommendationer</h2>
                    <p className="text-gray-600">Baserat på din hudanalys har vi valt ut de perfekta produkterna för dig.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setTier('budget')} className={`px-3 py-1 rounded-full text-sm ${tier==='budget'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Budget</button>
                    <button onClick={() => setTier('standard')} className={`px-3 py-1 rounded-full text-sm ${tier==='standard'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Standard</button>
                    <button onClick={() => setTier('premium')} className={`px-3 py-1 rounded-full text-sm ${tier==='premium'?'bg-[#FCB237] text-white':'bg-gray-100'}`}>Premium</button>
                  </div>
                </div>

                {/* Add full routine CTA */}
                <div className="flex items-center justify-between p-4 border rounded-xl bg-[#FAF8F5]">
                  <div>
                    <div className="font-medium text-gray-900">Lägg hela rutinen i varukorgen</div>
                    <div className="text-sm text-gray-600">Välj nivå ovan. Du kan justera i varukorgen.</div>
                  </div>
                  <button onClick={addRoutineToCart} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FCB237] text-white rounded-full">
                    <ShoppingBag className="w-4 h-4" /> Lägg till allt
                  </button>
                </div>

                {/* Morning Routine */}
                {results.products.morning && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-orange-500" />
                      Morgonrutin ({results.products.morning.totalTime})
                    </h3>
                    <div className="space-y-3">
                      {results.products.morning.routine.map((step: any) => (
                        <div key={step.step} className="flex gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-medium">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{step.product}</h4>
                            <p className="text-sm text-gray-600">{step.instruction}</p>
                            {step.benefit && (
                              <p className="text-xs text-orange-600 mt-1">{step.benefit}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {results.products.morning.proTip && (
                      <div className="mt-4 p-3 bg-white/50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>💡 Tips:</strong> {results.products.morning.proTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Evening Routine */}
                {results.products.evening && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-indigo-600" />
                      Kvällsrutin ({results.products.evening.totalTime})
                    </h3>
                    <div className="space-y-3">
                      {results.products.evening.routine.map((step: any) => (
                        <div key={step.step} className="flex gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-medium">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{step.product}</h4>
                            <p className="text-sm text-gray-600">{step.instruction}</p>
                            {step.benefit && (
                              <p className="text-xs text-indigo-600 mt-1">{step.benefit}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {results.products.evening.proTip && (
                      <div className="mt-4 p-3 bg-white/50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>💡 Tips:</strong> {results.products.evening.proTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Recommendations */}
                {results.products.recommendations && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Rekommenderade produkter</h3>
                    <div className="grid gap-4">
                      {results.products.recommendations.map((product: any) => (
                        <motion.div
                          key={product.priority}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-[#8B6B47] text-white text-xs rounded-full">
                                  Prioritet {product.priority}
                                </span>
                                {product.savings && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {product.savings}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-lg font-medium text-gray-900">{product.product}</h4>
                              <p className="text-2xl font-light text-[#8B6B47] mt-1">{product.price}</p>
                            </div>
                            <Link
                              href="/products"
                              className="px-4 py-2 bg-[#FCB237] text-white rounded-full text-sm hover:bg-[#E79C1A] transition-colors"
                            >
                              Se produkt
                            </Link>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Varför denna produkt?</h5>
                              <p className="text-sm text-gray-600">{product.why}</p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Användning</h5>
                              <p className="text-sm text-gray-600">{product.usage}</p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Förväntade resultat</h5>
                              <p className="text-sm text-gray-600">{product.expectedResults}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {results.products.budgetOption && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Budget-alternativ:</strong> {results.products.budgetOption}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCB237] text-white rounded-full hover:bg-[#E79C1A] transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Se alla produkter
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && results.lifestyle && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Livsstilsoptimering</h2>
                  <p className="text-gray-600">
                    Din livsstil har en enorm påverkan på din hud. Här är dina personliga rekommendationer.
                  </p>
                </div>

                {/* Sleep */}
                {results.lifestyle.sleep && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-blue-600" />
                      Sömn
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700">Rekommendation</h4>
                        <p className="text-gray-600">{results.lifestyle.sleep.target || results.lifestyle.sleep.recommendation}</p>
                      </div>
                      
                      {results.lifestyle.sleep.protocol && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Kvällsprotokoll</h4>
                          <div className="space-y-1">
                            {results.lifestyle.sleep.protocol.map((step: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-blue-600" />
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Movement */}
                {results.lifestyle.movement && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Rörelse
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-600">{results.lifestyle.movement.principle}</p>
                      
                      {results.lifestyle.movement.daily && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Daglig rutin</h4>
                          <div className="space-y-1">
                            {results.lifestyle.movement.daily.map((activity: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-600" />
                                {activity}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sun Exposure */}
                {results.lifestyle.sunExposure && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-600" />
                      Solexponering
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-600 font-medium">{results.lifestyle.sunExposure.philosophy}</p>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Riktlinjer</h4>
                        <div className="space-y-1">
                          {results.lifestyle.sunExposure.guidelines.map((guideline: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Zap className="w-4 h-4 text-amber-600" />
                              {guideline}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stress Management */}
                {results.lifestyle.stress && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Stresshantering
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-600">{results.lifestyle.stress.impact}</p>
                      
                      {results.lifestyle.stress.techniques && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Tekniker</h4>
                          <div className="grid gap-3">
                            {results.lifestyle.stress.techniques.map((technique: any, index: number) => (
                              <div key={index} className="bg-white/50 rounded-lg p-3">
                                <h5 className="font-medium text-gray-800">{technique.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">{technique.how}</p>
                                <p className="text-xs text-purple-600 mt-1">När: {technique.when}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition Tab */}
            {activeTab === 'nutrition' && results.lifestyle?.nutrition && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Nutritionsplan</h2>
                  <p className="text-gray-600">
                    {results.lifestyle.nutrition.philosophy}
                  </p>
                </div>

                {results.lifestyle.nutrition.skinFoods && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hudvänlig mat</h3>
                    <div className="grid gap-4">
                      {results.lifestyle.nutrition.skinFoods.map((category: any, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {category.foods.map((food: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                                {food}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-emerald-700">
                            Frekvens: {category.frequency}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.lifestyle.nutrition.avoid && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Undvik
                    </h4>
                    <div className="space-y-1">
                      {results.lifestyle.nutrition.avoid.map((item: string, index: number) => (
                        <div key={index} className="text-sm text-gray-700">• {item}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Protocol Tab */}
            {activeTab === 'protocol' && results.holisticProtocol && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Ditt protokoll</h2>
                  <p className="text-gray-600">
                    En steg-för-steg plan för att implementera dina nya rutiner.
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(results.holisticProtocol).map(([phase, details]: [string, any]) => (
                    <div key={phase} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                        {phase.replace(/_/g, ' ')}
                      </h3>
                      {details.focus && (
                        <p className="text-gray-700 font-medium mb-2">Fokus: {details.focus}</p>
                      )}
                      {Object.entries(details).map(([key, value]: [string, any]) => {
                        if (key === 'focus') return null
                        return (
                          <div key={key} className="mt-2">
                            <h4 className="text-sm font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {Array.isArray(value) ? value.join(', ') : value}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && results.education && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Fördjupning</h2>
                  <p className="text-gray-600">
                    Lär dig mer om vetenskapen bakom dina rekommendationer.
                  </p>
                </div>

                <div className="grid gap-4">
                  {Object.entries(results.education).map(([topic, content]: [string, any]) => {
                    if (topic === 'bookRecommendations') {
                      return (
                        <div key={topic} className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Rekommenderad läsning</h3>
                          <div className="space-y-2">
                            {content.map((book: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-gray-700">
                                <Book className="w-4 h-4 text-[#8B6B47]" />
                                <span className="text-sm">{book}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div key={topic} className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 capitalize">
                          {topic.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-gray-700">{content}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next Steps */}
        {results.nextSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-[#8B6B47] to-[#6B5337] text-white rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-2xl font-light mb-4">Nästa steg</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {results.nextSteps.immediate && (
                <div>
                  <h3 className="font-medium mb-2">Idag</h3>
                  <ul className="space-y-1">
                    {results.nextSteps.immediate.map((step: string, index: number) => (
                      <li key={index} className="text-sm opacity-90">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.nextSteps.thisWeek && (
                <div>
                  <h3 className="font-medium mb-2">Denna vecka</h3>
                  <ul className="space-y-1">
                    {results.nextSteps.thisWeek.map((step: string, index: number) => (
                      <li key={index} className="text-sm opacity-90">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="font-medium mb-2">Support</h3>
                <p className="text-sm opacity-90 mb-3">{results.nextSteps.support}</p>
                <div className="flex gap-2">
                  <Link href="/kontakt" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <Mail className="w-4 h-4" />
                  </Link>
                  <Link href="/kontakt" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <Phone className="w-4 h-4" />
                  </Link>
                  <Link href="/kontakt" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Results */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vi har skickat din kompletta plan till {userInfo.email}
          </p>
          <button
            onClick={() => window.print()}
            className="text-[#8B6B47] hover:text-[#6B5337] underline text-sm"
          >
            Skriv ut din plan
          </button>
        </div>
      </div>
    </div>
  )
} 