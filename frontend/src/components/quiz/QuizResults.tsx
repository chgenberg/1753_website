'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Heart, Droplets, Leaf, Brain, MessageCircle, 
  CheckCircle, ArrowRight, ShoppingBag, Sun, Moon, 
  Award, Target, Users, Send, User, Loader, 
  Shield, Star, TrendingUp, Activity, Coffee,
  Smile, CloudRain, Wind, Dumbbell, Apple,
  Clock, BrainCircuit, Lightbulb
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterModal } from '@/components/auth/RegisterModal'

interface QuizResultsProps {
  answers: Record<string, string>
  userName?: string
  userEmail?: string
  results?: any
  onRestart?: () => void
  onClose?: () => void
}

type TabType = 'summary' | 'lifestyle' | 'products' | 'nutrition' | 'ai-expert'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Generate welcome message for AI Expert
function generateWelcomeMessage(userName: string, results: any, answers: Record<string, string>): string {
  const skinConcernText = results.skinConcerns.length > 0 
    ? `Jag ser att du har ${results.skinConcerns.join(', ').toLowerCase()}.` 
    : 'Du verkar ha en balanserad hud.'
    
  return `Hej ${userName}! 👋

Välkommen till din personliga AI Hudexpert. Jag är här för att hjälpa dig med alla dina frågor om hud, hudvård och hudhälsa.

Baserat på dina svar i quizet har jag fått en bra överblick över din hud:
• ${results.skinType}
• Hudpoäng: ${results.skinScore}/100
• ${skinConcernText}

Jag kan hjälpa dig med:
✨ Personliga hudvårdsråd baserat på dina behov
🌿 Naturliga och holistiska lösningar
🧬 Information om hur endocannabinoidsystemet påverkar din hud
💡 Livsstilstips för bättre hudhälsa

Vad skulle du vilja veta mer om?`
}

// Generate fallback response when AI API fails
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check if it's a skin-related question
  const skinKeywords = ['hud', 'akne', 'torr', 'fet', 'känslig', 'rynkor', 'rodnad', 'eksem', 'psoriasis', 'cbd', 'cbg', 'serum', 'kräm', 'olja', 'rengöring']
  const isSkinRelated = skinKeywords.some(keyword => lowerMessage.includes(keyword))
  
  if (!isSkinRelated) {
    return "Jag kan tyvärr inte svara på den frågan men fråga mig gärna något annat om hud, hudvård eller hudhälsa. 😊"
  }
  
  // Provide generic but helpful responses for common topics
  if (lowerMessage.includes('akne')) {
    return "Akne kan ha många orsaker, från hormoner till kost och stress. Våra CBD-produkter kan hjälpa till att balansera hudens oljeproduktion och minska inflammation. Vill du veta mer om någon specifik produkt?"
  }
  
  if (lowerMessage.includes('torr')) {
    return "Torr hud behöver både fukt och näring. Våra oljor med CBD och CBG hjälper till att återställa hudbarriären. DUO Face Oil är särskilt bra för torr hud. Vill du ha fler tips?"
  }
  
  return "Det är en intressant fråga! Baserat på din hudtyp och behov skulle jag rekommendera att fokusera på att stärka din hudbarriär med naturliga ingredienser som CBD och CBG. Vill du att jag går in mer på detaljer?"
}

// AI Expert Tab Component
function AIExpertTab({ messages, input, setInput, onSend, isTyping, chatEndRef }: {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  onSend: () => void
  isTyping: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BrainCircuit className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
        <h3 className="text-2xl font-light text-[#4A3428] mb-2">Din AI Hudexpert</h3>
        <p className="text-[#6B5D54] font-light">Ställ frågor om din hud och få personliga råd</p>
      </div>
      
      {/* Chat Messages */}
      <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-[#FAFAF8] rounded-2xl">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                message.role === 'user' 
                  ? 'bg-[#4A3428] text-white' 
                  : 'bg-white border border-[#E5DDD5]'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-[#8B7355] mt-1 px-2">
                {new Date(message.timestamp).toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B7355]/20 to-[#4A3428]/20 flex items-center justify-center mr-2">
                <BrainCircuit className="w-4 h-4 text-[#8B7355]" />
              </div>
            )}
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-[#E5DDD5] rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      {/* Input Field */}
      <div className="flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          placeholder="Ställ en fråga om din hud..."
          className="flex-1 px-4 py-3 rounded-full border border-[#E5DDD5] focus:outline-none focus:border-[#8B7355] transition-colors"
        />
        <motion.button
          onClick={onSend}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-[#4A3428] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span className="font-light">Skicka</span>
        </motion.button>
      </div>
    </div>
  )
}

export function QuizResults({ answers, userName = 'Användare', userEmail = '', results, onRestart, onClose }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Analyze user answers to generate real results
  const analysisResults = analyzeQuizAnswers(answers)

  // Initialize chat with welcome message
  useEffect(() => {
    if (activeTab === 'ai-expert' && chatMessages.length === 0) {
      const welcomeMessage = generateWelcomeMessage(userName, analysisResults, answers)
      setChatMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }])
    }
  }, [activeTab, userName, analysisResults, answers, chatMessages.length])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const tabs = [
    { id: 'summary' as TabType, label: 'Översikt', icon: Sparkles },
    { id: 'lifestyle' as TabType, label: 'Livsstil', icon: Heart },
    { id: 'nutrition' as TabType, label: 'Kost', icon: Apple },
    { id: 'products' as TabType, label: 'Produkter', icon: Droplets },
    { id: 'ai-expert' as TabType, label: 'AI Hudexpert', icon: BrainCircuit }
  ]

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    
    // Add user message
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setIsTyping(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai-skincare-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            userName: userName || 'Du',
            skinType: analysisResults.skinType,
            concerns: analysisResults.skinConcerns,
            answers
          }
        })
      })

      const data = await response.json()
      
      // Add AI response
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || generateFallbackResponse(userMessage),
        timestamp: new Date()
      }])
    } catch (error) {
      // Fallback response if API fails
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackResponse(userMessage),
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAF8] to-white">
      {/* Minimalist Hero Section */}
      <div className="relative py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#8B7355]/10 to-[#4A3428]/10 rounded-full mb-6"
          >
            <Sparkles className="w-10 h-10 text-[#8B7355]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-light text-[#4A3428] mb-4"
          >
            Hej {userName || 'Du'}!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[#6B5D54] font-light max-w-2xl mx-auto"
          >
            Din personliga hudanalys är klar. Låt oss utforska dina resultat tillsammans.
          </motion.p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Skin Score Card - Minimalist Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-[#F0EDE8] p-8 md:p-12 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-sm uppercase tracking-wider text-[#8B7355] mb-2">Din hudtyp</h2>
              <p className="text-xl font-light text-[#4A3428]">{analysisResults.skinType}</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#8B7355]/5 to-[#4A3428]/5 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-light text-[#4A3428]">{analysisResults.skinScore}</span>
                    <span className="text-sm text-[#6B5D54] block mt-1">hudpoäng</span>
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, #8B7355 0deg, #8B7355 ${analysisResults.skinScore * 3.6}deg, transparent ${analysisResults.skinScore * 3.6}deg)`,
                    mask: 'radial-gradient(farthest-side, transparent 65%, black 66%)',
                    WebkitMask: 'radial-gradient(farthest-side, transparent 65%, black 66%)'
                  }}
                  initial={{ rotate: -90 }}
                  animate={{ rotate: -90 }}
                />
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h2 className="text-sm uppercase tracking-wider text-[#8B7355] mb-2">Fokusområde</h2>
              <p className="text-xl font-light text-[#4A3428]">
                {analysisResults.skinConcerns[0] || 'Balanserad hudvård'}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Navigation - Minimalist Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full flex items-center space-x-2 transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#4A3428] text-white shadow-lg' 
                    : 'bg-white text-[#6B5D54] border border-[#E5DDD5] hover:border-[#8B7355]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-light">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-sm border border-[#F0EDE8] p-8 md:p-12"
          >
            {activeTab === 'summary' && (
              <SummaryTab results={analysisResults} userName={userName || 'Du'} onRegister={() => setShowRegisterModal(true)} />
            )}
            {activeTab === 'lifestyle' && (
              <LifestyleTab results={analysisResults} answers={answers} />
            )}
            {activeTab === 'nutrition' && (
              <NutritionTab results={analysisResults} answers={answers} />
            )}
            {activeTab === 'products' && (
              <ProductsTab results={analysisResults} answers={answers} />
            )}
            {activeTab === 'ai-expert' && (
              <AIExpertTab 
                messages={chatMessages}
                input={chatInput}
                setInput={setChatInput}
                onSend={handleSendMessage}
                isTyping={isTyping}
                chatEndRef={chatEndRef}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Action buttons for modal usage */}
        {(onRestart || onClose) && (
          <div className="flex justify-center gap-4 mt-8">
            {onRestart && (
              <motion.button
                onClick={onRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white border border-[#E5DDD5] text-[#6B5D54] rounded-full font-light hover:border-[#8B7355] transition-colors"
              >
                Gör om quiz
              </motion.button>
            )}
            {onClose && (
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#4A3428] text-white rounded-full font-light hover:bg-[#8B7355] transition-colors"
              >
                Stäng
              </motion.button>
            )}
          </div>
        )}
        
        {/* Register Modal */}
        {showRegisterModal && (
          <RegisterModal
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            quizData={{
              answers,
              results: analysisResults,
              userName: userName || 'Du',
              userEmail: userEmail
            }}
          />
        )}
      </div>
    </div>
  )
}

// Function to analyze quiz answers and generate real results
function analyzeQuizAnswers(answers: Record<string, string>) {
  // Get skin type from answers
  const skinType = determineSkinType(answers)
  const skinConcerns = determineSkinConcerns(answers)
  const lifestyle = analyzeLifestyle(answers)
  const skinScore = calculateSkinScore(answers)
  
  return {
    skinType,
    skinConcerns,
    lifestyle,
    skinScore,
    ecosystemBalance: {
      microbiome: calculateMicrobiomeScore(answers),
      endocannabinoid: calculateEndocannabinoidScore(answers),
      barrier: calculateBarrierScore(answers)
    }
  }
}

function determineSkinType(answers: Record<string, string>): string {
  const ageAnswer = answers.age
  const skinConditionAnswer = answers.skinCondition
  const sensitiveSkinAnswer = answers.sensitiveSkin
  
  if (sensitiveSkinAnswer === 'very-sensitive') {
    return 'Mycket känslig hud som behöver mild, återfuktande vård'
  }
  
  if (skinConditionAnswer === 'dry') {
    return 'Torr hud som behöver djup återfuktning och nourishing ingredienser'
  }
  
  if (skinConditionAnswer === 'oily') {
    return 'Fet hud som behöver balansering och rening utan att torka ut'
  }
  
  if (skinConditionAnswer === 'combination') {
    return 'Kombinationshud som behöver balanserad vård för olika zoner'
  }
  
  return 'Normal hud som behöver grundläggande vård och skydd'
}

function determineSkinConcerns(answers: Record<string, string>): string[] {
  const concerns: string[] = []
  
  // Handle multi-select concerns
  if (answers.concerns) {
    const selectedConcerns = answers.concerns.split(',')
    
    selectedConcerns.forEach(concern => {
      switch(concern) {
        case 'acne':
          concerns.push('Akne och oregelbundenheter')
          break
        case 'pigmentation':
          concerns.push('Pigmentfläckar och ojämn hudton')
          break
        case 'aging':
          concerns.push('Åldrande och fina linjer')
          break
        case 'redness':
          concerns.push('Rodnad och irritation')
          break
        case 'dryness':
          concerns.push('Torrhet och uttorkning')
          break
      }
    })
  }
  
  // Also check if skin problems were mentioned (backward compatibility)
  if (answers.skinProblems) {
    const problems = answers.skinProblems.split(',')
    problems.forEach(problem => {
      switch(problem) {
        case 'acne':
          if (!concerns.includes('Akne och oregelbundenheter')) {
            concerns.push('Akne och oregelbundenheter')
          }
          break
        case 'pigmentation':
          if (!concerns.includes('Pigmentfläckar och ojämn hudton')) {
            concerns.push('Pigmentfläckar och ojämn hudton')
          }
          break
        case 'aging':
          if (!concerns.includes('Åldrande och fina linjer')) {
            concerns.push('Åldrande och fina linjer')
          }
          break
        case 'redness':
          if (!concerns.includes('Rodnad och irritation')) {
            concerns.push('Rodnad och irritation')
          }
          break
      }
    })
  }
  
  return concerns.length > 0 ? concerns : ['Förebyggande vård']
}

function analyzeLifestyle(answers: Record<string, string>) {
  const lifestyle = {
    stress: answers.stressLevel || 'normal',
    sleep: answers.sleepQuality || 'good',
    exercise: answers.exerciseFrequency || 'regular',
    sun: answers.sunExposure || 'moderate'
  }
  
  return lifestyle
}

function calculateSkinScore(answers: Record<string, string>): number {
  let score = 70 // Base score
  
  // Positive factors
  if (answers.sleepQuality === 'excellent') score += 10
  if (answers.waterIntake === 'high') score += 5
  if (answers.stressLevel === 'low') score += 8
  if (answers.exerciseFrequency === 'daily') score += 7
  
  // Negative factors
  if (answers.stressLevel === 'very-high') score -= 15
  if (answers.sleepQuality === 'poor') score -= 10
  if (answers.sunExposure === 'excessive') score -= 8
  if (answers.smoking === 'yes') score -= 12
  
  return Math.max(Math.min(score, 100), 30) // Keep between 30-100
}

function calculateMicrobiomeScore(answers: Record<string, string>): number {
  let score = 75
  
  if (answers.skinCondition === 'sensitive') score -= 10
  if (answers.stressLevel === 'high') score -= 5
  if (answers.dietQuality === 'excellent') score += 10
  
  return Math.max(Math.min(score, 100), 40)
}

function calculateEndocannabinoidScore(answers: Record<string, string>): number {
  let score = 70
  
  if (answers.stressLevel === 'low') score += 15
  if (answers.sleepQuality === 'excellent') score += 10
  if (answers.exerciseFrequency === 'daily') score += 5
  
  return Math.max(Math.min(score, 100), 40)
}

function calculateBarrierScore(answers: Record<string, string>): number {
  let score = 80
  
  if (answers.skinCondition === 'dry') score -= 15
  if (answers.climateExposure === 'harsh') score -= 10
  if (answers.skincareRoutine === 'minimal') score -= 5
  
  return Math.max(Math.min(score, 100), 40)
}

// Tab Components with real data
function SummaryTab({ results, userName, onRegister }: { results: any, userName: string, onRegister: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Ecosystem Balance */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-[#4A3428] mb-6">Din Hudbalans</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-3">
              <svg className="w-24 h-24">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                <circle 
                  cx="48" cy="48" r="40" 
                  fill="none" 
                  stroke="#8B7355" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * results.ecosystemBalance.microbiome / 100} ${2 * Math.PI * 40}`}
                  className="transform -rotate-90 origin-center transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-light">{results.ecosystemBalance.microbiome}%</span>
              </div>
            </div>
            <h4 className="font-light text-[#4A3428]">Mikrobiom</h4>
            <p className="text-xs text-[#6B5D54] mt-1">Hudens bakteriebalans</p>
          </div>
          
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-3">
              <svg className="w-24 h-24">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                <circle 
                  cx="48" cy="48" r="40" 
                  fill="none" 
                  stroke="#8B7355" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * results.ecosystemBalance.endocannabinoid / 100} ${2 * Math.PI * 40}`}
                  className="transform -rotate-90 origin-center transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-light">{results.ecosystemBalance.endocannabinoid}%</span>
              </div>
            </div>
            <h4 className="font-light text-[#4A3428]">ECS</h4>
            <p className="text-xs text-[#6B5D54] mt-1">Endocannabinoidsystem</p>
          </div>
          
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-3">
              <svg className="w-24 h-24">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                <circle 
                  cx="48" cy="48" r="40" 
                  fill="none" 
                  stroke="#8B7355" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * results.ecosystemBalance.barrier / 100} ${2 * Math.PI * 40}`}
                  className="transform -rotate-90 origin-center transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-light">{results.ecosystemBalance.barrier}%</span>
              </div>
            </div>
            <h4 className="font-light text-[#4A3428]">Hudbarriär</h4>
            <p className="text-xs text-[#6B5D54] mt-1">Skyddande funktion</p>
          </div>
        </div>
      </div>
      
      {/* Key Recommendations */}
      <div className="bg-gradient-to-br from-[#FAFAF8] to-white rounded-2xl p-8 border border-[#F0EDE8]">
        <h4 className="text-xl font-light text-[#4A3428] mb-6 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-[#8B7355]" />
          Dina viktigaste åtgärder
        </h4>
        <div className="space-y-4">
          {results.skinConcerns.map((concern: string, index: number) => (
            <div key={index} className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[#8B7355]/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#8B7355]" />
              </div>
              <div>
                <p className="text-[#4A3428] font-medium">{concern}</p>
                <p className="text-sm text-[#6B5D54] mt-1">
                  {getRecommendationForConcern(concern)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA for Free Account */}
      <div className="text-center bg-gradient-to-br from-[#4A3428] to-[#8B7355] rounded-2xl p-8 text-white">
        <Shield className="w-12 h-12 mx-auto mb-4 text-white/80" />
        <h4 className="text-2xl font-light mb-3">Skapa ditt gratiskonto</h4>
        <p className="text-white/90 mb-6 max-w-md mx-auto">
          Spara dina resultat, få personliga tips varje vecka och exklusiva erbjudanden
        </p>
        <motion.button
          onClick={onRegister}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-[#4A3428] px-8 py-3 rounded-full font-medium hover:shadow-lg transition-shadow"
        >
          Registrera dig gratis
        </motion.button>
      </div>
    </motion.div>
  )
}

function getRecommendationForConcern(concern: string): string {
  const recommendations: Record<string, string> = {
    'Akne och oregelbundenheter': 'CBD hjälper till att balansera talgproduktionen och har antiinflammatoriska egenskaper.',
    'Pigmentfläckar och ojämn hudton': 'CBG främjar cellförnyelse och kan hjälpa till att jämna ut hudtonen över tid.',
    'Åldrande och fina linjer': 'Antioxidanter från våra svampextrakt skyddar mot fria radikaler och för tidigt åldrande.',
    'Rodnad och irritation': 'CBD och Chaga har lugnande egenskaper som minskar rodnad och stärker hudbarriären.',
    'Förebyggande vård': 'Fokusera på att bibehålla din huds naturliga balans med våra milda, närande produkter.'
  }
  return recommendations[concern] || 'Våra naturliga ingredienser arbetar synergistiskt för att stödja din huds hälsa.'
}

function LifestyleTab({ results, answers }: { results: any, answers: Record<string, string> }) {
  const lifestyleTips = generateLifestyleTips(answers)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Personliga Livsstilsråd</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lifestyleTips.map((tip, index) => (
          <div key={index} className="bg-[#F5F3F0] rounded-xl p-6">
            <div className="flex items-center mb-4">
              {tip.icon}
              <h4 className="font-semibold text-[#4A3428] ml-3">{tip.title}</h4>
            </div>
            <p className="text-[#6B5D54]">{tip.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ProductsTab({ results, answers }: { results: any, answers: Record<string, string> }) {
  const recommendedProducts = generateProductRecommendations(answers)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Dina Produktrekommendationer</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedProducts.map((product, index) => (
          <div key={index} className="bg-white border border-[#E5DDD5] rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#F5F3F0] rounded-full mx-auto mb-4 flex items-center justify-center">
              <Droplets className="w-8 h-8 text-[#8B7355]" />
            </div>
            <h4 className="font-semibold text-[#4A3428] text-center mb-2">{product.name}</h4>
            <p className="text-sm text-[#6B5D54] text-center mb-4">{product.description}</p>
            <p className="text-xs text-[#8B7355] text-center font-medium">{product.reason}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function NutritionTab({ results, answers }: { results: any, answers: Record<string, string> }) {
  const nutritionTips = generateNutritionTips(answers)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Näringsråd för din Hud</h3>
      
      <div className="space-y-4">
        {nutritionTips.map((tip, index) => (
          <div key={index} className="bg-[#F5F3F0] rounded-xl p-6">
            <h4 className="font-semibold text-[#4A3428] mb-3">{tip.category}</h4>
            <p className="text-[#6B5D54] mb-3">{tip.description}</p>
            <div className="flex flex-wrap gap-2">
              {tip.foods.map((food, foodIndex) => (
                <span key={foodIndex} className="bg-white px-3 py-1 rounded-full text-sm text-[#8B7355] border border-[#E5DDD5]">
                  {food}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function SourcesTab({ results }: { results: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-serif text-[#4A3428] mb-6">Vetenskapliga Källor</h3>
      
      <div className="space-y-4">
        <div className="bg-[#F5F3F0] rounded-xl p-6">
          <h4 className="font-semibold text-[#4A3428] mb-3">Endocannabinoidsystemet i Huden</h4>
          <p className="text-[#6B5D54] text-sm mb-2">
            "The endocannabinoid system in skin: a potential approach for the treatment of skin disorders"
          </p>
          <p className="text-[#8B7355] text-xs">Journal of Clinical Medicine, 2020</p>
        </div>
        
        <div className="bg-[#F5F3F0] rounded-xl p-6">
          <h4 className="font-semibold text-[#4A3428] mb-3">CBD och Hudbarriären</h4>
          <p className="text-[#6B5D54] text-sm mb-2">
            "Cannabidiol in dermatology: a systematic review"
          </p>
          <p className="text-[#8B7355] text-xs">Dermatology Online Journal, 2021</p>
        </div>
        
        <div className="bg-[#F5F3F0] rounded-xl p-6">
          <h4 className="font-semibold text-[#4A3428] mb-3">Hudens Mikrobiom</h4>
          <p className="text-[#6B5D54] text-sm mb-2">
            "The skin microbiome: associations between altered microbial communities and disease"
          </p>
          <p className="text-[#8B7355] text-xs">Annual Review of Microbiology, 2019</p>
        </div>
      </div>
    </motion.div>
  )
}

// Helper functions for generating recommendations
function generateLifestyleTips(answers: Record<string, string>) {
  const tips = []
  
  if (answers.stressLevel === 'high' || answers.stressLevel === 'very-high') {
    tips.push({
      icon: <Heart className="w-6 h-6 text-[#8B7355]" />,
      title: 'Stresshantering',
      description: 'Din stressnivå påverkar din hud negativt. Prova meditation, yoga eller andningsövningar för att stärka ditt endocannabinoidsystem.'
    })
  }
  
  if (answers.sleepQuality === 'poor' || answers.sleepQuality === 'fair') {
    tips.push({
      icon: <Moon className="w-6 h-6 text-[#8B7355]" />,
      title: 'Sömnkvalitet',
      description: 'Bättre sömn är avgörande för hudregenerering. Skapa en avkopplande kvällsrutin och undvik skärmar innan sänggåendet.'
    })
  }
  
  tips.push({
    icon: <Sun className="w-6 h-6 text-[#8B7355]" />,
    title: 'Solskydd',
    description: 'Använd dagligen SPF för att skydda mot UV-strålning och förhindra för tidigt åldrande och pigmentförändringar.'
  })
  
  return tips
}

function generateProductRecommendations(answers: Record<string, string>) {
  const products = []
  
  if (answers.skinCondition === 'dry') {
    products.push({
      name: 'DUO Face Oil',
      description: 'Djupt närande ansiktsolja med CBD och CBG',
      reason: 'Perfekt för torr hud som behöver extra fukt och återställning'
    })
  }
  
  if (answers.skinCondition === 'oily' || answers.skinProblems?.includes('acne')) {
    products.push({
      name: 'THE Serum',
      description: 'Lättviktig serum med CBD för problemhud',
      reason: 'Balanserar oljeproduktion utan att torka ut huden'
    })
  }
  
  products.push({
    name: 'Au Naturel Cleanser',
    description: 'Mild rengöring som respekterar hudbarriären',
    reason: 'Grundläggande för alla hudtyper'
  })
  
  return products
}

function generateNutritionTips(answers: Record<string, string>) {
  const tips = [
    {
      category: 'Omega-3 Fettsyror',
      description: 'Stärker hudbarriären och minskar inflammation',
      foods: ['Lax', 'Valnötter', 'Chia-frön', 'Avokado']
    },
    {
      category: 'Antioxidanter',
      description: 'Skyddar mot fria radikaler och för tidigt åldrande',
      foods: ['Blåbär', 'Spenat', 'Mörk choklad', 'Grönt te']
    },
    {
      category: 'Probiotika',
      description: 'Stödjer hudens mikrobiom via tarm-hud-axeln',
      foods: ['Kimchi', 'Kefir', 'Yoghurt', 'Kombucha']
    }
  ]
  
  return tips
} 