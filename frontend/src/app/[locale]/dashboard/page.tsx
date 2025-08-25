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
  ChevronRight
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
  const [activeTab, setActiveTab] = useState<'orders' | 'knowledge' | 'videos' | 'quiz'>('orders')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
    { id: 'orders', label: 'Mina ordrar', icon: ShoppingBag },
    { id: 'knowledge', label: 'Kunskapscentral', icon: BookOpen },
    { id: 'videos', label: 'Videoguider', icon: PlayCircle },
    { id: 'quiz', label: 'Hudanalys', icon: Sparkles }
  ]

  const videos = [
    { id: '1', title: 'Morgonrutin med DUO-kit', thumbnail: '/products_2025/DUO.png', duration: '5:23' },
    { id: '2', title: 'Applicera The ONE', thumbnail: '/products_2025/The_ONE_bottle.png', duration: '3:45' },
    { id: '3', title: 'TA-DA för perfekt finish', thumbnail: '/products_2025/TA-DA.png', duration: '4:12' },
    { id: '4', title: 'Makeup Remover tekniken', thumbnail: '/products_2025/MakeupRemover_bottle.png', duration: '2:30' }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-light tracking-wider text-gray-900">
              Välkommen tillbaka{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-2 text-gray-600 font-light">
              Hantera dina ordrar och utforska vårt kunskapscentrum
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-4 px-1 border-b-2 font-light text-sm tracking-wider
                      flex items-center gap-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-[#FCB237] text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-light">Inga ordrar ännu</p>
                    <Link 
                      href="/products"
                      className="mt-4 inline-flex items-center gap-2 text-[#FCB237] hover:text-[#E8A230] font-light"
                    >
                      Börja handla <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 font-light">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.date).toLocaleDateString('sv-SE')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-green-600 font-light">{order.status}</p>
                              <p className="text-lg font-light mt-1">{order.total} kr</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-2"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-light">{item.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} x {item.price} kr
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reorder Button */}
                          <button
                            onClick={() => handleReorderAll(order)}
                            className="mt-6 w-full bg-[#FCB237] text-white py-3 px-6 rounded-lg
                                     font-light tracking-wider hover:bg-[#E8A230] transition-colors
                                     flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Beställ allt igen
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Knowledge Tab */}
            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12"
              >
                <BookOpen className="w-16 h-16 text-[#FCB237] mx-auto mb-6" />
                <h2 className="text-2xl font-light tracking-wider mb-4">
                  Utforska vårt kunskapscentrum
                </h2>
                <p className="text-gray-600 font-light mb-8 max-w-2xl mx-auto">
                  Fördjupa dig i hudvårdens vetenskap och lär dig mer om våra ingredienser,
                  funktionella råvaror och expertråd för din hudtyp.
                </p>
                <Link
                  href="/kunskap"
                  className="inline-flex items-center gap-2 bg-[#FCB237] text-white px-8 py-3 
                           rounded-lg font-light tracking-wider hover:bg-[#E8A230] transition-colors"
                >
                  Gå till kunskapscentral
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <motion.button
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowVideoModal(true)}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden
                               hover:shadow-md transition-shadow text-left"
                    >
                      <div className="relative aspect-video bg-gray-50">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-contain p-4"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center
                                      opacity-0 hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs
                                      px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-light text-sm">{video.title}</h3>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12"
              >
                <Sparkles className="w-16 h-16 text-[#FCB237] mx-auto mb-6" />
                <h2 className="text-2xl font-light tracking-wider mb-4">
                  Personlig hudanalys
                </h2>
                <p className="text-gray-600 font-light mb-8 max-w-2xl mx-auto">
                  Få en skräddarsydd hudvårdsrutin baserad på din unika hudtyp och behov.
                  Vår expertanalys tar bara några minuter.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 bg-[#FCB237] text-white px-8 py-3 
                           rounded-lg font-light tracking-wider hover:bg-[#E8A230] transition-colors"
                >
                  Starta hudanalys
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg overflow-hidden max-w-4xl w-full"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-light tracking-wider">Applicera produkter som ett proffs</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white font-light">Video kommer snart...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
} 