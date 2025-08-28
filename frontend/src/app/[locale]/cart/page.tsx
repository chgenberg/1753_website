'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { useTranslations } from 'next-intl'
import { 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  ArrowLeft,
  Tag
} from 'lucide-react'

export default function CartPage() {
  const t = useTranslations()
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    subtotal,
    shipping,
    tax,
    total 
  } = useCart()
  
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)

  const applyDiscountCode = () => {
    // Mock discount logic - replace with actual API call
    if (discountCode.toUpperCase() === 'WELCOME10') {
      setAppliedDiscount(subtotal * 0.1)
    }
  }

  const finalTotal = total - appliedDiscount

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-24">
          <div className="text-center max-w-md">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('cart.empty.title')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('cart.empty.description')}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FCB237] text-white px-8 py-4 rounded-lg hover:bg-[#E79C1A] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t('cart.empty.cta')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 mx-auto sm:mx-0">
                      {item.product.images && item.product.images[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-base sm:text-lg font-semibold text-gray-900 hover:text-[#FCB237] transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            {t('cart.pricePerUnit', { price: item.price })}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-red-500 hover:text-red-600 transition-colors self-start sm:self-center"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between sm:justify-start">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 sm:px-4 py-2 min-w-[50px] sm:min-w-[60px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Item Total - Mobile */}
                          <div className="text-lg font-semibold text-gray-900 sm:hidden">
                            {item.price * item.quantity} kr
                          </div>
                        </div>

                        {/* Item Total - Desktop */}
                        <div className="text-lg font-semibold text-gray-900 hidden sm:block">
                          {item.price * item.quantity} kr
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  {t('cart.clearCart')}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('cart.orderSummary')}
                </h2>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cart.discountCode')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder={t('cart.discountCodePlaceholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCB237]"
                    />
                    <button
                      onClick={applyDiscountCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('cart.applyDiscount')}
                    </button>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span>{subtotal} kr</span>
                  </div>
                  
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-[#FCB237]">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {t('cart.discount')}
                      </span>
                      <span>-{appliedDiscount} kr</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.shipping')}</span>
                    <span>{shipping === 0 ? t('cart.freeShipping') : `${shipping} kr`}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>{t('cart.total')}</span>
                      <span>{finalTotal} kr</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t('cart.includesTax')}</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#FCB237] text-white py-3 rounded-lg font-medium hover:bg-[#E79C1A] transition-colors flex items-center justify-center gap-2"
                >
                  {t('cart.proceedToCheckout')}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="h-5 w-5 text-[#FCB237]" />
                    <span>{t('cart.trustBadges.securePayment')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-[#FCB237]" />
                    <span>{t('cart.trustBadges.freeShippingOver500')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CreditCard className="h-5 w-5 text-[#FCB237]" />
                    <span>{t('cart.trustBadges.paymentMethods')}</span>
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-6 border-t">
                  <Link
                    href="/products"
                    className="text-[#FCB237] hover:text-[#E79C1A] font-medium flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('cart.continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 