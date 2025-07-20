'use client';

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Play, 
  Lightbulb, 
  Target,
  Award,
  Camera,
  Plus,
  Star,
  ArrowRight,
  Droplets,
  Sun,
  Moon,
  Thermometer
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ProgressData {
  overview: {
    totalEntries: number
    averageSkinCondition: number
    improvement: number
    currentCondition: number
    daysTracking: number
  }
  progressData: Array<{
    week: string
    averageSkinCondition: number
    averageMood: number
    entryCount: number
  }>
  suggestions: Array<{
    id: string
    type: string
    title: string
    description: string
    urgency: string
    category: string
    isRead: boolean
  }>
  recentEntries: Array<{
    id: string
    date: string
    skinCondition: number
    mood?: number
    notes?: string
  }>
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isAuthenticated || !user) return

    fetchProgressData()
  }, [isAuthenticated, user])

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/progress/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProgressData(data.data)
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Du måste vara inloggad för att se din dashboard.</p>
      </div>
    )
  }

  // Chart data for skin condition progress
  const chartData = {
    labels: progressData?.progressData.map(d => d.week) || [],
    datasets: [
      {
        label: 'Hudkondition',
        data: progressData?.progressData.map(d => d.averageSkinCondition) || [],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Humör',
        data: progressData?.progressData.map(d => d.averageMood) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      }
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Din Hudresa över Tid',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Välkommen tillbaka, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600">
              Här är din personliga hudresa och rekommendationer
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-3 bg-[#E5DDD5] rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#4A3428]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Nuvarande Kondition</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData?.overview.currentCondition || 0}/10
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Dagar Tracking</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData?.overview.daysTracking || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Förbättring</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(progressData?.overview.improvement || 0) > 0 ? '+' : ''}{progressData?.overview.improvement || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Nya Förslag</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData?.suggestions.filter(s => !s.isRead).length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Progress Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-sm mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Din Progress</h2>
                {progressData?.progressData.length ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Ingen progressdata än</p>
                    <button className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                      <Plus className="w-4 h-4 mr-2" />
                      Lägg till första inlägget
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Senaste Aktivitet</h2>
                {progressData?.recentEntries.length ? (
                  <div className="space-y-4">
                    {progressData.recentEntries.slice(0, 5).map((entry, index) => (
                      <div key={entry.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">
                            Hudkondition: {entry.skinCondition}/10
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString('sv-SE')}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                          )}
                        </div>
                        {entry.mood && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-600">{entry.mood}/10</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Inga inlägg än</p>
                )}
              </motion.div>
            </div>

            {/* Right Column - Suggestions & Quick Actions */}
            <div className="space-y-8">
              {/* Personalized Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personliga Förslag</h2>
                {progressData?.suggestions.length ? (
                  <div className="space-y-4">
                    {progressData.suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            suggestion.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-[#E5DDD5] text-[#2A1A14]'
                          }`}>
                            {suggestion.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center">
                          Visa mer <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Inga förslag än</p>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Snabbåtgärder</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Camera className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-900">Lägg till hudreseinlägg</span>
                  </button>
                  
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <BookOpen className="w-5 h-5 text-[#4A3428] mr-3" />
                    <span className="text-gray-900">Utforska kunskapscentral</span>
                  </button>
                  
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Play className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-900">Titta på videoguider</span>
                  </button>
                  
                  <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Droplets className="w-5 h-5 text-cyan-600 mr-3" />
                    <span className="text-gray-900">Ingredienslexikon</span>
                  </button>
                </div>
              </motion.div>

              {/* Today's Weather Impact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
              >
                <h3 className="font-bold mb-3 flex items-center">
                  <Sun className="w-5 h-5 mr-2" />
                  Dagens Väder & Hudtips
                </h3>
                <p className="text-blue-100 text-sm mb-3">
                  Soligt och 22°C. Perfekt väder för en lätt morgonrutin.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Thermometer className="w-4 h-4 mr-2" />
                    <span>Använd lätt fuktcream</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Sun className="w-4 h-4 mr-2" />
                    <span>Glöm inte SPF!</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 