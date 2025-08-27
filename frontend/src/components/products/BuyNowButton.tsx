'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface BuyNowButtonProps {
  product: Product
  quantity?: number
  variant?: string
  className?: string
  onSuccess?: () => void
}

export default function BuyNowButton({ 
  product, 
  quantity = 1, 
  variant, 
  className = '',
  onSuccess 
}: BuyNowButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleBuyNow = async () => {
    setIsProcessing(true)

    try {
      // Create a temporary order with just this product
      const orderData = {
        customer: {
          email: '',
          firstName: '',
          lastName: '',
          phone: ''
        },
        shippingAddress: {
          address: '',
          apartment: '',
          city: '',
          postalCode: '',
          country: 'Sverige'
        },
        items: [{
          productId: product.id,
          variantId: variant || null,
          quantity: quantity,
          price: product.price
        }],
        subtotal: product.price * quantity,
        shippingCost: product.price * quantity >= 500 ? 0 : 49, // Free shipping over 500 SEK
        total: (product.price * quantity) + (product.price * quantity >= 500 ? 0 : 49),
        newsletter: false
      }

      // Store the buy-now order in sessionStorage for checkout
      sessionStorage.setItem('buyNowOrder', JSON.stringify({
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '/images/products/default.png'
        },
        quantity,
        variant,
        orderData
      }))

      // Redirect to checkout with buy-now flag
      router.push('/checkout?buyNow=true')
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Buy now error:', error)
      toast.error('Ett fel uppstod. Försök igen.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBuyNow}
      disabled={isProcessing}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 
        bg-gradient-to-r from-[#E79C1A] to-[#FCB237] 
        text-white font-medium rounded-xl
        hover:from-[#D4891A] hover:to-[#E79C1A]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Behandlar...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          <span>Köp nu</span>
        </>
      )}
    </motion.button>
  )
} 