'use client';

import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function EbookPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [scriptError, setScriptError] = useState('')

  useEffect(() => {
    // Add the original CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/ebook-reader/styles.css'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setShowFallback(true)
        setScriptError('E-bok läsaren laddade inte inom rimlig tid.')
      }
    }, 15000) // Give more time for interactive reader
    return () => clearTimeout(timeout)
  }, [isLoading])

  const handlePdfJsError = () => {
    setScriptError('Kunde inte ladda PDF.js biblioteket.')
    setShowFallback(true)
  }

  const handleAppJsError = () => {
    setScriptError('Kunde inte ladda e-bok applikationen.')
    setShowFallback(true)
  }

  return (
    <>
      <Header />
      <div className="pt-24">
        <Script 
          src="/ebook-reader/pdf.min.js"
          onLoad={() => {
            console.log('PDF.js loaded successfully')
            setPdfLoaded(true)
          }}
          onError={handlePdfJsError}
        />
        
        {pdfLoaded && (
          <Script 
            src="/ebook-reader/app.js"
            onLoad={() => {
              console.log('App.js loaded successfully')
              setIsLoading(false)
            }}
            onError={handleAppJsError}
          />
        )}

      {/* Loading Screen */}
      <div id="loading" className={`loading-screen ${!isLoading ? 'hidden' : ''}`}>
        <div className="loader">
          <div className="loader-ring"></div>
          <div className="loader-text">Laddar din e-bok...</div>
          <div className="loader-progress">
            <div className="loader-progress-bar">
              <div className="loader-progress-fill"></div>
            </div>
            <div className="loader-progress-text">0%</div>
          </div>
        </div>
      </div>

      {/* Fallback embed om läsaren inte laddas */}
      {showFallback && (
        <div className="max-w-6xl mx-auto my-12 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">E-bok läsaren kunde inte laddas</h3>
            {scriptError && (
              <p className="text-sm text-yellow-700 mb-2">Fel: {scriptError}</p>
            )}
            <p className="text-sm text-yellow-700">
              Ingen fara! Du kan fortfarande läsa e-boken via PDF-visningen nedan.
            </p>
          </div>
          
          <iframe
            src="/ebook-reader/e-book_weedyourskin_backup.pdf#toolbar=0&navpanes=0"
            className="w-full h-[80vh] border rounded-lg shadow-lg"
            title="Weed Your Skin E-book"
          />
          
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              Du kan också{' '}
              <a 
                href="/ebook-reader/e-book_weedyourskin_backup.pdf" 
                className="underline text-[#4A3428] hover:text-[#6B5337]" 
                download="1753_Skincare_WeedYourSkin_Ebook.pdf"
              >
                ladda ner e-boken här
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Filstorlek: ~15 MB | Format: PDF
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div id="app" className={`app-container ${!isLoading ? 'loaded' : ''}`}>

        {/* Navigation Arrows */}
        <button id="prevBtn" className="nav-arrow nav-prev" title="Föregående sida">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <button id="nextBtn" className="nav-arrow nav-next" title="Nästa sida">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        {/* E-book Reader */}
        <main className="reader-container">
          {/* Book Container */}
          <div className="book-container">
            <div className="book" id="book">
              <div className="page-container">
                {/* Left Page */}
                <div className="page left-page" id="leftPage">
                  <canvas id="leftCanvas"></canvas>
                </div>
                
                {/* Right Page */}
                <div className="page right-page" id="rightPage">
                  <canvas id="rightCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Click Areas for Navigation */}
          <div className="click-area click-left" id="clickLeft"></div>
          <div className="click-area click-right" id="clickRight"></div>
        </main>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" id="progressFill"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="control-group">
            <button id="firstBtn" className="control-btn" title="Första sidan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11,17 6,12 11,7"></polyline>
                <polyline points="18,17 13,12 18,7"></polyline>
              </svg>
            </button>
            
            <button id="prevPageBtn" className="control-btn" title="Föregående">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <div className="page-info">
              <span id="currentPage">1</span>
              <span>/</span>
              <span id="totalPages">0</span>
            </div>
            
            <button id="nextPageBtn" className="control-btn" title="Nästa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
            
            <button id="lastBtn" className="control-btn" title="Sista sidan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13,17 18,12 13,7"></polyline>
                <polyline points="6,17 11,12 6,7"></polyline>
              </svg>
            </button>
          </div>
          
          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button id="zoomOutBtn" className="control-btn" title="Zooma ut (Ctrl+-)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            
            <span id="zoomLevel" className="zoom-level">100%</span>
            
            <button id="zoomInBtn" className="control-btn" title="Zooma in (Ctrl++)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            
            <button id="zoomResetBtn" className="control-btn" title="Återställ zoom (Ctrl+0)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M11,11 L11,6 M11,11 L14,11"></path>
              </svg>
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="action-controls">
            <button id="downloadBtn" className="control-btn download-btn" title="Ladda ner PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            
            <button id="fullscreenBtn" className="control-btn" title="Fullskärm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Recommendations Section */}
      <section className="product-recommendations">
        <div className="recommendations-container">
          <h2 className="recommendations-title">VILL DU TA HAND OM HUDENS HÄLSA PÅ RIKTIGT?</h2>
          
          <div className="products-grid">
            {/* Product 1: DUO-kit + TA-DA Serum */}
            <div className="product-card">
              <Link href="/products/duo-ta-da" className="product-link">
                <div className="product-image-wrapper">
                  <Image 
                    src="/ebook-reader/DUOTADA.png" 
                    alt="DUO-kit + TA-DA Serum" 
                    width={300}
                    height={300}
                    className="product-image"
                  />
                </div>
                <h3 className="product-name">DUO-kit + TA-DA Serum</h3>
                <p className="product-description">
                  Våra bästsäljare – Nu som komplett rutinpaket för 1498 kr
                  Vill du ge din hud ett verkligt lyft – utan att kompromissa med ingredienser, filosofi eller resultat? Då är det här paketet för dig.
                </p>
                <span className="product-cta">Läs mer →</span>
              </Link>
            </div>

            {/* Product 2: Au Naturel Makeup Remover */}
            <div className="product-card">
              <Link href="/products/makeup-remover-au-naturel" className="product-link">
                <div className="product-image-wrapper">
                  <Image 
                    src="/ebook-reader/Naturel.png" 
                    alt="Au Naturel Makeup Remover" 
                    width={300}
                    height={300}
                    className="product-image"
                  />
                </div>
                <h3 className="product-name">Au Naturel Makeup Remover</h3>
                <p className="product-description">
                  Vill du avlägsna smuts, luftföroreningar och makeup utan att skada din huds naturliga balans? Au Naturel Makeup Remover är lösningen du har letat efter
                </p>
                <span className="product-cta">Läs mer →</span>
              </Link>
            </div>

            {/* Product 3: Fungtastic Mushroom Extract */}
            <div className="product-card">
              <Link href="/products/fungtastic-extract" className="product-link">
                <div className="product-image-wrapper">
                  <Image 
                    src="/ebook-reader/Fungtastic.png" 
                    alt="Fungtastic Mushroom Extract" 
                    width={300}
                    height={300}
                    className="product-image"
                  />
                </div>
                <h3 className="product-name">Fungtastic Mushroom Extract</h3>
                <p className="product-description">
                  Upplev naturens kraft med Fungtastic Mushroom Extract - Fungtastic Mushroom Extract kombinerar fyra av naturens mest potenta medicinska svampar
                </p>
                <span className="product-cta">Läs mer →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
  </>
  )
} 