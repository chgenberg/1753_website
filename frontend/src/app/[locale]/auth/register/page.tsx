'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    newsletter: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Lösenorden matchar inte')
      return
    }

    setIsLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        newsletter: formData.newsletter
      })
      toast.success('Konto skapat! Välkommen!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Något gick fel. Försök igen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAF8] to-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center text-[#6B5D54] hover:text-[#4A3428] mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#F0EDE8] p-8 md:p-12">
          <h1 className="text-3xl font-light text-[#4A3428] mb-2">Skapa konto</h1>
          <p className="text-[#6B5D54] mb-8">Bli en del av 1753-familjen</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                  Förnamn
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                  Efternamn
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="din@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                Telefon (valfritt)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="+46 70 123 45 67"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                Lösenord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4A3428]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5D54] mb-2">
                Bekräfta lösenord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4A3428]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                className="h-4 w-4 text-[#8B7355] focus:ring-[#8B7355] border-[#E5DDD5] rounded"
              />
              <label htmlFor="newsletter" className="ml-2 text-sm text-[#6B5D54]">
                Ja, jag vill få nyhetsbrev och erbjudanden
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#8B7355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Skapar konto...' : 'Skapa konto'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6B5D54]">
              Har du redan ett konto?{' '}
              <Link
                href="/auth/login"
                className="text-[#8B7355] hover:text-[#4A3428] font-medium transition-colors"
              >
                Logga in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 