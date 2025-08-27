'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Trash2, 
  ArrowRight,
  Package,
  Truck,
  Shield
} from 'lucide-react'

export const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    cartCount,
    subtotal,
    shipping,
    total 
  } = useCart()
  const { formatMoney } = useCurrency()

  const freeShippingThreshold = 500
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-[#FCB237] flex-shrink-0" />
                        <h2 className="text-lg sm:text-xl font-semibold truncate">
                          Din varukorg ({cartCount})
                        </h2>
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0"
                        onClick={closeCart}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Free Shipping Progress */}
                    {remainingForFreeShipping > 0 && (
                      <div className="px-4 sm:px-6 py-3 bg-[#F5F3F0] border-b">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm text-gray-700 flex-1">
                                                            {formatMoney(remainingForFreeShipping)} kvar till fri frakt!
                          </span>
                          <Truck className="h-4 w-4 text-[#FCB237] flex-shrink-0" />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-[#FCB237] h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Din varukorg är tom
                          </h3>
                          <p className="text-sm text-gray-500 text-center mb-6">
                            Upptäck våra fantastiska produkter och börja handla!
                          </p>
                          <Link
                            href="/products"
                            onClick={closeCart}
                            className="bg-[#FCB237] text-white px-6 py-3 rounded-lg hover:bg-[#E79C1A] transition-colors flex items-center gap-2"
                          >
                            Börja handla
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {items.map((item) => (
                            <motion.div
                              key={`${item.productId}-${item.variantId}`}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="p-4 md:p-6 border-b hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Product Image */}
                                <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 mx-auto sm:mx-0">
                                  {item.product.images && item.product.images[0] && (
                                    <Image
                                      src={typeof item.product.images[0] === 'string' 
                                        ? item.product.images[0] 
                                        : item.product.images[0].url
                                      }
                                      alt={item.product.name}
                                      fill
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
                                        onClick={closeCart}
                                        className="font-medium text-gray-900 hover:text-[#FCB237] transition-colors line-clamp-2 text-sm sm:text-base"
                                      >
                                        {item.product.name}
                                      </Link>
                                      
                                      <div className="mt-1 text-sm text-gray-500">
                                        {formatMoney(item.price)}/st
                                      </div>
                                    </div>

                                    {/* Item Total - Mobile */}
                                    <div className="text-right sm:hidden">
                                      <div className="font-medium text-gray-900">
                                        {formatMoney(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                        className="p-1.5 hover:bg-gray-100 transition-colors"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                        className="p-1.5 hover:bg-gray-100 transition-colors"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => removeFromCart(item.productId, item.variantId)}
                                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Item Total - Desktop */}
                                <div className="text-right hidden sm:block min-w-[80px]">
                                  <div className="font-medium text-gray-900">
                                    {formatMoney(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t px-4 sm:px-6 py-4">
                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4 py-3 border-b">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Snabb leverans</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Säker betalning</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">30 dagars retur</span>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Delsumma</span>
                            <span>{formatMoney(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Frakt</span>
                            <span>{shipping === 0 ? 'Gratis' : formatMoney(shipping)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                            <span>Total</span>
                            <span>{formatMoney(total)}</span>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            inkl. moms
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Link
                            href="/cart"
                            onClick={closeCart}
                            className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            Visa varukorg
                          </Link>
                          <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="w-full bg-[#FCB237] text-white py-3 rounded-lg font-medium hover:bg-[#E79C1A] transition-colors flex items-center justify-center gap-2"
                          >
                            Till kassan
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 