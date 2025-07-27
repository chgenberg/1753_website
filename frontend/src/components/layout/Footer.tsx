'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  products: [
    { name: 'Alla produkter', href: '/products' },
    { name: 'Hudvårdskit', href: '/products?category=hudvardskit' },
    { name: 'Serum', href: '/products?category=serum' },
    { name: 'Ansiktsoljor', href: '/products?category=ansiktsolja' },
    { name: 'Kosttillskott', href: '/products?category=kosttillskott' }
  ],
  company: [
    { name: 'Om oss', href: '/om-oss' },
    { name: 'Våra ingredienser', href: '/om-oss/ingredienser' },
    { name: 'Återförsäljare', href: '/om-oss/aterforsaljare' },
    { name: 'Blogg', href: '/blogg' },
    { name: 'Kontakt', href: '/kontakt' }
  ],
  help: [
    { name: 'FAQ', href: '/om-oss/faq' },
    { name: 'Leverans & Retur', href: '/leverans-retur' },
    { name: 'Betalning', href: '/betalning' },
    { name: 'Integritetspolicy', href: '/integritetspolicy' },
    { name: 'Villkor', href: '/villkor' }
  ]
}

export function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/1753.png"
                alt="1753 Skincare"
                width={120}
                height={40}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Naturlig hudvård med CBD & CBG. Vi kombinerar traditionell kunskap med modern vetenskap för din huds bästa.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00937c] transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00937c] transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00937c] transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Produkter</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#00937c] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Företag</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#00937c] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">Hjälp</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#00937c] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-[#00937c]" />
                              <a href="mailto:hej@1753skincare.com" className="text-gray-400 hover:text-[#00937c] transition-colors">
                  hej@1753skincare.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-[#00937c]" />
                              <a href="tel:+46732305521" className="text-gray-400 hover:text-[#00937c] transition-colors">
                +46732305521
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#00937c]" />
                              <span className="text-gray-400">Åsa, Sverige</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 1753 Skincare. Alla rättigheter förbehållna.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/integritetspolicy" className="text-gray-500 hover:text-[#00937c] text-sm transition-colors">
                Integritetspolicy
              </Link>
              <Link href="/villkor" className="text-gray-500 hover:text-[#00937c] text-sm transition-colors">
                Villkor
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-[#00937c] text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 