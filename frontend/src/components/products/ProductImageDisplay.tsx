'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductImageDisplayProps {
  images: { url: string; alt?: string }[]
  productName: string
  isListView?: boolean
}

export function ProductImageDisplay({ images, productName, isListView = false }: ProductImageDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const validImages = images.filter(img => img.url)
  
  if (validImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">No image available</p>
      </div>
    )
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  if (isListView) {
    return (
      <div 
        className="relative w-full h-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setCurrentIndex(0)
        }}
      >
        {/* Minimalist gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCB237]/5 via-transparent to-[#FCB237]/10" />
        
        {/* Main image container with creative layout */}
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={validImages[currentIndex].url}
                alt={validImages[currentIndex].alt || productName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-contain p-4 transition-all duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Creative hover overlay */}
          <AnimatePresence>
            {isHovered && validImages.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Navigation dots - minimalist style */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                  className={`transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-[#FCB237] rounded-full'
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Subtle navigation arrows on hover */}
          <AnimatePresence>
            {isHovered && validImages.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Full product page view
  return (
    <div className="space-y-4">
      {/* Main image with creative background */}
      <motion.div 
        className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F3F0] via-white to-[#FCB237]/5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Creative pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FCB237] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FCB237] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full cursor-zoom-in"
            onClick={() => setShowZoom(true)}
          >
            <Image
              src={validImages[currentIndex].url}
              alt={validImages[currentIndex].alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8 hover:scale-105 transition-transform duration-500"
              priority
            />

            {/* Zoom hint */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </motion.div>

      {/* Thumbnail gallery - minimalist grid */}
      {validImages.length > 1 && (
        <div className="flex gap-3 justify-center">
          {validImages.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all ${
                currentIndex === index 
                  ? 'ring-2 ring-[#FCB237] ring-offset-2 scale-110' 
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} view ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#FCB237]/20 to-transparent" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
            >
              <Image
                src={validImages[currentIndex].url}
                alt={validImages[currentIndex].alt || productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <button
                onClick={() => setShowZoom(false)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 