'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Download, FileText, ExternalLink } from 'lucide-react'

export default function EBookPage() {
  useEffect(() => {
    // Check if iframe fails to load and show desktop fallback
    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Weed Your Skin E-bok"]') as HTMLIFrameElement;
      const desktopFallback = document.getElementById('desktop-pdf-fallback') as HTMLElement;
      
      if (iframe && desktopFallback) {
        try {
          // Try to access iframe content - if it fails, show fallback
          iframe.contentDocument;
        } catch (error) {
          // Cross-origin or X-Frame-Options blocked the iframe
          iframe.style.display = 'none';
          desktopFallback.style.display = 'flex';
        }
      }
    }, 3000); // Wait 3 seconds for iframe to load

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Weed Your Skin - E-bok
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Upptäck hemligheten bakom frisk och strålande hud med vår omfattande guide 
                om CBD-baserad hudvård och hudens ekosystem.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a
                  href="/e-book_weedyourskin_backup.pdf"
                  download="Weed_Your_Skin_1753.pdf"
                  className="inline-flex items-center px-8 py-4 bg-[#4A3428] text-white rounded-full font-medium hover:bg-[#3A2418] transition-colors duration-300 shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Ladda ner e-boken (PDF)
                </a>
                <button
                  onClick={() => window.open('/e-book_weedyourskin_backup.pdf', '_blank')}
                  className="inline-flex items-center px-8 py-4 bg-white text-[#4A3428] rounded-full font-medium hover:bg-gray-50 transition-colors duration-300 shadow-lg border border-[#4A3428]"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Öppna i ny flik
                </button>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <FileText className="w-12 h-12 text-[#4A3428] mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Omfattande Guide</h3>
                  <p className="text-gray-600">200+ sidor fullpackade med kunskap om hudvård och CBD</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <svg className="w-12 h-12 text-[#4A3428] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-semibold text-lg mb-2">Vetenskapligt Baserad</h3>
                  <p className="text-gray-600">Byggd på forskning och 12+ års erfarenhet</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <Download className="w-12 h-12 text-[#4A3428] mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Direkt Nedladdning</h3>
                  <p className="text-gray-600">Få tillgång till e-boken direkt på din enhet</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PDF Viewer Section */}
        <section className="pb-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Förhandsgranska e-boken</h2>
                  <a
                    href="/e-book_weedyourskin_backup.pdf"
                    download="Weed_Your_Skin_1753.pdf"
                    className="inline-flex items-center px-6 py-2 bg-[#4A3428] text-white rounded-full text-sm font-medium hover:bg-[#3A2418] transition-colors duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ladda ner PDF
                  </a>
                </div>
              </div>
              
              {/* PDF Embed with fallback */}
              <div className="relative bg-gray-100" style={{ height: '800px' }}>
                <iframe
                  src="/e-book_weedyourskin_backup.pdf#toolbar=1&navpanes=0&scrollbar=1"
                  className="w-full h-full"
                  title="Weed Your Skin E-bok"
                  loading="lazy"
                  onError={() => {
                    // Hide iframe and show fallback on error
                    const iframe = document.querySelector('iframe[title="Weed Your Skin E-bok"]') as HTMLElement;
                    const fallback = document.getElementById('pdf-fallback') as HTMLElement;
                    if (iframe && fallback) {
                      iframe.style.display = 'none';
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                
                {/* Fallback content - always visible on mobile, hidden on desktop until error */}
                <div 
                  id="pdf-fallback" 
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 md:hidden"
                >
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto">
                    <FileText className="w-20 h-20 text-[#4A3428] mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Ladda ner e-boken
                    </h3>
                    <p className="text-gray-700 mb-6">
                      För bästa läsupplevelse, ladda ner e-boken direkt till din enhet.
                    </p>
                    <div className="space-y-3">
                      <a
                        href="/e-book_weedyourskin_backup.pdf"
                        download="Weed_Your_Skin_1753.pdf"
                        className="block w-full px-6 py-3 bg-[#4A3428] text-white rounded-lg text-sm font-medium hover:bg-[#3A2418] transition-colors duration-300"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Ladda ner PDF (14 MB)
                      </a>
                      <button
                        onClick={() => window.open('/e-book_weedyourskin_backup.pdf', '_blank')}
                        className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-300"
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Öppna i ny flik
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop error fallback (hidden by default) */}
                <div 
                  id="desktop-pdf-fallback" 
                  className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <div className="text-center p-12 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
                    <FileText className="w-24 h-24 text-[#4A3428] mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      E-boken kunde inte visas
                    </h3>
                    <p className="text-gray-700 mb-6">
                      PDF:en kan inte visas direkt i webbläsaren på grund av säkerhetsinställningar.
                      Ladda ner den istället för att läsa den lokalt.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="/e-book_weedyourskin_backup.pdf"
                        download="Weed_Your_Skin_1753.pdf"
                        className="flex-1 px-6 py-3 bg-[#4A3428] text-white rounded-lg font-medium hover:bg-[#3A2418] transition-colors duration-300 text-center"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Ladda ner PDF
                      </a>
                      <button
                        onClick={() => window.open('/e-book_weedyourskin_backup.pdf', '_blank')}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-300"
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Försök öppna
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                <span className="font-medium">Tips:</span> Du kan zooma in och ut i PDF:en med Ctrl/Cmd + och - tangenterna.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 