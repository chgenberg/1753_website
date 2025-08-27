'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  Star, 
  Check, 
  CheckCircle,
  Camera,
  X,
  Loader2,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

function ReviewForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [review, setReview] = useState('')
  const [recommend, setRecommend] = useState<boolean | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productData, setProductData] = useState<any>(null)
  
  // Auto-fill data from URL
  const orderNumber = searchParams.get('order')
  const productId = searchParams.get('product')
  const customerName = searchParams.get('name') || ''
  const customerEmail = searchParams.get('email') || ''
  
  useEffect(() => {
    // Fetch product data if productId is provided
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProductData(data.product)
          }
        })
        .catch(err => console.error('Failed to fetch product:', err))
    }
  }, [productId])
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 3) {
      toast.error('Max 3 bilder tillåtna')
      return
    }
    setImages([...images, ...files])
  }
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Vänligen välj ett betyg')
      return
    }
    
    if (!review.trim()) {
      toast.error('Vänligen skriv en recension')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create form data for image upload
      const formData = new FormData()
      formData.append('rating', rating.toString())
      formData.append('title', title)
      formData.append('review', review)
      formData.append('recommend', recommend ? 'true' : 'false')
      formData.append('productId', productId || '')
      formData.append('orderNumber', orderNumber || '')
      formData.append('customerName', customerName)
      formData.append('customerEmail', customerEmail)
      formData.append('verified', 'true') // Mark as verified purchase
      
      images.forEach((image, index) => {
        formData.append(`image${index}`, image)
      })
      
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Tack för din recension! 🎉')
        
        // Redirect to product page or reviews page
        setTimeout(() => {
          if (productId) {
            router.push(`/products/${productId}#reviews`)
          } else {
            router.push('/recensioner')
          }
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Ett fel uppstod. Försök igen.')
      console.error('Review submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa] pt-24">
        <div className="max-w-2xl mx-auto px-4 py-16">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-light tracking-[0.1em] uppercase mb-4">
              Lämna en recension
            </h1>
            {orderNumber && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Verifierat köp • Order #{orderNumber}</span>
              </div>
            )}
          </motion.div>
          
          {/* Product Info */}
          {productData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 mb-8 flex items-center gap-4"
            >
              {productData.images?.[0] && (
                <Image
                  src={productData.images[0]}
                  alt={productData.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              )}
              <div>
                <h2 className="font-medium text-lg">{productData.name}</h2>
                <p className="text-sm text-gray-600">{productData.category}</p>
              </div>
            </motion.div>
          )}
          
          {/* Review Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white p-8"
          >
            {/* Rating */}
            <div className="mb-8">
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-4">
                Ditt betyg
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        star <= (hoveredRating || rating)
                          ? 'fill-[#E79C1A] text-[#E79C1A]'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Rubrik (valfritt)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sammanfatta din upplevelse"
                className="w-full px-4 py-3 border-b border-gray-200 focus:border-[#E79C1A] outline-none transition-colors"
              />
            </div>
            
            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Din recension
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Berätta om din upplevelse med produkten..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#E79C1A] outline-none transition-colors resize-none"
              />
            </div>
            
            {/* Recommend */}
            <div className="mb-8">
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-4">
                Skulle du rekommendera denna produkt?
              </label>
              <div className="flex justify-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRecommend(true)}
                  className={`px-8 py-3 border transition-all ${
                    recommend === true
                      ? 'border-[#E79C1A] bg-[#E79C1A] text-white'
                      : 'border-gray-300 hover:border-[#E79C1A]'
                  }`}
                >
                  Ja
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRecommend(false)}
                  className={`px-8 py-3 border transition-all ${
                    recommend === false
                      ? 'border-[#E79C1A] bg-[#E79C1A] text-white'
                      : 'border-gray-300 hover:border-[#E79C1A]'
                  }`}
                >
                  Nej
                </motion.button>
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-4">
                Lägg till bilder (valfritt)
              </label>
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-24 h-24"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                {images.length < 3 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-[#E79C1A] flex items-center justify-center cursor-pointer transition-colors">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Customer Info (pre-filled) */}
            {customerName && (
              <div className="mb-8 p-4 bg-gray-50 text-sm">
                <p className="text-gray-600">
                  Recensionen kommer att publiceras som: <strong>{customerName}</strong>
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-4 font-medium tracking-wider uppercase hover:bg-[#E79C1A] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Skickar...
                </span>
              ) : (
                'Publicera recension'
              )}
            </motion.button>
            
            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Genom att publicera godkänner du att din recension visas offentligt.
              Vi publicerar aldrig din e-postadress.
            </p>
          </motion.form>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E79C1A]" />
      </div>
    }>
      <ReviewForm />
    </Suspense>
  )
} 