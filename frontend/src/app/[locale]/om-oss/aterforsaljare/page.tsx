import ClientRetailersPage from './retailers-client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MapPin, Phone, Globe, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function generateStaticParams() {
  return [{ locale: 'sv' }]
}

export default function RetailersPageWrapper() {
  return (
    <>
      <Header />
      <ClientRetailersPage />
      <Footer />
    </>
  )
} 