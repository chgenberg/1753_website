'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBag, 
  BookOpen, 
  PlayCircle, 
  Sparkles,
  X,
  RefreshCw,
  ArrowRight,
  Package,
  Calendar,
  ChevronRight,
  User
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: string
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }>
}

// Mock data - replace with API call
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-08-20',
    status: 'Levererad',
    total: 1299,
    items: [
      { id: '1', name: 'DUO-kit', quantity: 1, price: 899, image: '/products_2025/DUO.png' },
      { id: '2', name: 'TA-DA', quantity: 1, price: 400, image: '/products_2025/TA-DA.png' }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-07-15',
    status: 'Levererad',
    total: 599,
    items: [
      { id: '3', name: 'The ONE Facial Oil', quantity: 1, price: 599, image: '/products_2025/The_ONE_bottle.png' }
    ]
  }
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'knowledge' | 'videos' | 'quiz'>('overview')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Fetch user orders from API
    const fetchOrders = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setOrders(mockOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleReorderAll = async (order: Order) => {
    // For reordering, we'll need to fetch the actual products from API
    // For now, just navigate to cart with a message
    router.push('/cart')
  }

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: User },
    { id: 'orders', label: 'Mina ordrar', icon: ShoppingBag },
    { id: 'knowledge', label: 'Kunskapscentral', icon: BookOpen },
    { id: 'videos', label: 'Videoguider', icon: PlayCircle },
    { id: 'quiz', label: 'Hudanalys', icon: Sparkles }
  ]

  const videos = [
    { id: '1', title: 'MORGONRUTIN MED DUO-KIT', thumbnail: '/products_2025/DUO.png', duration: '5:23' },
    { id: '2', title: 'APPLICERA THE ONE', thumbnail: '/products_2025/The_ONE_bottle.png', duration: '3:45' },
    { id: '3', title: 'TA-DA FÖR PERFEKT FINISH', thumbnail: '/products_2025/TA-DA.png', duration: '4:12' },
    { id: '4', title: 'MAKEUP REMOVER TEKNIKEN', thumbnail: '/products_2025/MakeupRemover_bottle.png', duration: '2:30' }
  ]

  const dashboardActions = [
    {
      id: 'orders',
      title: 'MINA ORDRAR',
      description: 'Se och hantera dina beställningar',
      icon: ShoppingBag,
      bgColor: 'from-[#FCB237] to-[#e79c1a]',
      action: () => setActiveTab('orders')
    },
    {
      id: 'knowledge',
      title: 'KUNSKAPSCENTRAL',
      description: 'Utforska våra guider och tips',
      icon: BookOpen,
      bgColor: 'from-[#4CAF50] to-[#45a049]',
      action: () => setActiveTab('knowledge')
    },
    {
      id: 'videos',
      title: 'VIDEOGUIDER',
      description: 'Se instruktionsvideor',
      icon: PlayCircle,
      bgColor: 'from-[#E91E63] to-[#C2185B]',
      action: () => setActiveTab('videos')
    },
    {
      id: 'quiz',
      title: 'HUDANALYS',
      description: 'Gör om din hudanalys',
      icon: Sparkles,
      bgColor: 'from-[#2196F3] to-[#1976D2]',
      action: () => router.push('/quiz')
    }
  ]

  if (activeTab === 'overview') {
    return (
      <>
        <Header />
        <div className="relative min-h-screen">
          {/* Background Image */}
          <div className="fixed inset-0 -z-10">
            <Image
              src={isMobile ? '/background/inlogg_mobile.png' : '/background/inlogg.png'}
              alt="Dashboard Background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-light text-white mb-4">
                Välkommen tillbaka
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-12">
                {user?.email ? `${user.email.split('@')[0]}` : 'till ditt konto'}
              </p>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {dashboardActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={action.action}
                    className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-105"
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <action.icon className="w-8 h-8 text-white mb-3" />
                      <h3 className="text-xl font-medium text-white mb-1">
                        {action.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {action.description}
                      </p>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-wrap justify-center gap-8 text-white"
              >
                <div className="text-center">
                  <p className="text-3xl font-light">{orders.length}</p>
                  <p className="text-sm text-white/80">Ordrar</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light">85%</p>
                  <p className="text-sm text-white/80">Hudpoäng</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light">3</p>
                  <p className="text-sm text-white/80">Favoriter</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Rest of the component for other tabs
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] pt-20">
        {/* Back to overview button */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Tillbaka till översikt</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-20 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.filter(tab => tab.id !== 'overview').map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${isActive 
                        ? 'border-[#FCB237] text-gray-900' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Inga ordrar ännu</h3>
                    <p className="text-gray-600 mb-6">När du gör din första beställning kommer den synas här.</p>
                    <Link 
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCB237] text-white rounded-lg hover:bg-[#E79C1A] transition-colors"
                    >
                      Utforska produkter
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.date).toLocaleDateString('sv-SE')}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-light">{order.total} kr</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} x {item.price} kr
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t flex gap-3">
                            <button
                              onClick={() => handleReorderAll(order)}
                              className="flex-1 py-2 px-4 bg-[#FCB237] text-white rounded-lg hover:bg-[#E79C1A] transition-colors flex items-center justify-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Beställ igen
                            </button>
                            <Link
                              href={`/orders/${order.id}`}
                              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                            >
                              Visa detaljer
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  { title: 'CBD & CBG GUIDE', description: 'Lär dig mer om cannabinoider', link: '/kunskap', color: 'from-[#FCB237] to-[#e79c1a]' },
                  { title: 'HUDVÅRDSRUTINER', description: 'Skapa din perfekta rutin', link: '/kunskap', color: 'from-[#4CAF50] to-[#45a049]' },
                  { title: 'INGREDIENSLEXIKON', description: 'Förstå våra ingredienser', link: '/om-oss/ingredienser', color: 'from-[#E91E63] to-[#C2185B]' },
                  { title: 'FAQ', description: 'Vanliga frågor och svar', link: '/om-oss/faq', color: 'from-[#2196F3] to-[#1976D2]' },
                  { title: 'E-BOK', description: 'Ladda ner vår gratisbok', link: '/kunskap/e-bok', color: 'from-[#9C27B0] to-[#7B1FA2]' },
                  { title: 'BLOGG', description: 'Senaste nyheterna', link: '/blogg', color: 'from-[#FF9800] to-[#F57C00]' }
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center text-[#FCB237] text-sm font-medium">
                        Läs mer
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setShowVideoModal(true)}
                    className="group bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-[#FCB237] transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-4xl w-full bg-black rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="relative aspect-video bg-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white">Video kommer snart...</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  )
} 