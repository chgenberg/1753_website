'use client';

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, BookOpen, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function EbookPage() {
  const t = useTranslations()
  const appRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    // Load PDF.js
    const loadPDFJS = async () => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => initializeEbook()
      document.head.appendChild(script)
    }

    const initializeEbook = async () => {
      try {
        // Initialize PDF.js worker
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          
          // Load and render the ebook
          await loadEbook()
        }
      } catch (error) {
        console.error('Error initializing ebook:', error)
        setIsLoading(false)
      }
    }

    loadPDFJS()

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[src*="pdf.min.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const loadEbook = async () => {
    try {
      const pdfjsLib = (window as any).pdfjsLib
      const loadingTask = pdfjsLib.getDocument('/ebook/e-book_weedyourskin_backup.pdf')
      const pdf = await loadingTask.promise

      setTotalPages(pdf.numPages)
      
      // Render first page
      await renderPage(pdf, 1)
      setIsLoading(false)

      // Setup navigation
      setupNavigation(pdf)
      
    } catch (error) {
      console.error('Error loading PDF:', error)
      setIsLoading(false)
    }
  }

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum)
      const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement
      if (!canvas) return

      const context = canvas.getContext('2d')
      if (!context) return

      // Calculate scale for responsive display
      const container = canvas.parentElement
      if (!container) return

      const containerWidth = container.clientWidth
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(containerWidth / viewport.width, 1.5)
      const scaledViewport = page.getViewport({ scale })

      canvas.height = scaledViewport.height
      canvas.width = scaledViewport.width

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      }

      await page.render(renderContext).promise
      setCurrentPage(pageNum)
    } catch (error) {
      console.error('Error rendering page:', error)
    }
  }

  const setupNavigation = (pdf: any) => {
    const prevBtn = document.getElementById('prev-btn')
    const nextBtn = document.getElementById('next-btn')

    prevBtn?.addEventListener('click', () => {
      if (currentPage > 1) {
        renderPage(pdf, currentPage - 1)
      }
    })

    nextBtn?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        renderPage(pdf, currentPage + 1)
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        renderPage(pdf, currentPage - 1)
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        renderPage(pdf, currentPage + 1)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/kunskap" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Tillbaka till Kunskap
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-amber-600" />
                Weed Your Skin - E-bok
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Laddar din e-bok...</h2>
            <p className="text-gray-600">Detta kan ta en stund första gången</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Ebook Viewer */}
          <div className="relative">
            {/* PDF Canvas Container */}
            <div className="flex justify-center p-4 bg-gray-100 min-h-[600px]">
              <div className="relative max-w-4xl w-full">
                <canvas 
                  id="pdf-canvas" 
                  className="shadow-lg rounded-lg max-w-full h-auto"
                  style={{ 
                    background: 'white',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <button 
                id="prev-btn"
                className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage <= 1}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button 
                id="next-btn"
                className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage >= totalPages}
              >
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-white border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Sida {currentPage} av {totalPages}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Använd piltangenterna för navigation
                </div>
              </div>

              <div className="text-sm text-gray-600">
                © 2024 1753 Skincare
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Om e-boken</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              "Weed Your Skin" är vår omfattande guide till att förstå och förbättra din hudvård. 
              Denna e-bok innehåller djup kunskap om:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• Hudens anatomi och fysiologi</li>
              <li>• Naturliga ingredienser och deras verkningar</li>
              <li>• Problemlösning för vanliga hudproblem</li>
              <li>• Vetenskapsbaserade hudvårdstekniker</li>
              <li>• 1753 Skincare filosofi och metoder</li>
            </ul>
            <p className="mt-4 text-gray-700">
              Perfekt för dig som vill fördjupa dina kunskaper om hudvård och upptäcka 
              hemligheter bakom frisk, strålande hud.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 