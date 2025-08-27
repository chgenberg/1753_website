'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useCart } from '@/contexts/CartContext'
import { Clock, ShoppingBag, X } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface RecentlyViewedProps {
  className?: string
  showTitle?: boolean
  maxItems?: number
}

export default function RecentlyViewed({ 
  className = '', 
  showTitle = true, 
  maxItems = 5 
}: RecentlyViewedProps) {
  const { recentProducts, removeFromRecentlyViewed } = useRecentlyViewed()
  const { addToCart } = useCart()
  const { formatMoney } = useCurrency()

  const displayProducts = recentProducts.slice(0, maxItems)

  if (displayProducts.length === 0) {
    return null
  }

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Nyligen visade</h3>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Remove button */}
            <button
              onClick={() => removeFromRecentlyViewed(product.id)}
              className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>

            {/* Product Image */}
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={product.images?.[0]?.url || '/images/products/default.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
            </Link>

            {/* Product Info */}
            <div className="p-3">
              <Link href={`/products/${product.slug}`}>
                <h4 className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-[#E79C1A] transition-colors">
                  {product.name}
                </h4>
              </Link>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-[#E79C1A]">
                  {formatMoney(product.price)}
                </span>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-8 h-8 bg-[#E79C1A] text-white rounded-lg flex items-center justify-center hover:bg-[#D4891A] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 