'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSave, FaPlus, FaTrash, FaArrowLeft, FaCheckCircle, FaTimes, FaCode, FaMobileAlt, FaRocket, FaBriefcase, FaFolder, FaUsers } from 'react-icons/fa'
import ApiService from '@/services/api'

interface Service {
  id: string
  title: string
  description: string
  icon: string
  display_order?: number
}

interface Stat {
  id: string
  value: string
  label: string
  display_order?: number
}

interface AboutData {
  bio: string
  services: Service[]
  stats: Stat[]
}

export default function EditAboutPage() {
  const router = useRouter()
  const [aboutData, setAboutData] = useState<AboutData>({
    bio: '',
    services: [],
    stats: [],
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const iconOptions = [
    { value: 'FaCode', label: 'Code', Icon: FaCode },
    { value: 'FaMobileAlt', label: 'Mobile', Icon: FaMobileAlt },
    { value: 'FaRocket', label: 'Rocket', Icon: FaRocket },
    { value: 'FaBriefcase', label: 'Briefcase', Icon: FaBriefcase },
    { value: 'FaFolder', label: 'Folder', Icon: FaFolder },
    { value: 'FaUsers', label: 'Users', Icon: FaUsers },
  ]

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchAboutData = useCallback(async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // Fetch bio dari portfolio
      const portfolioResponse = await ApiService.getPortfolio()
      
      // Fetch services
      let services: Service[] = []
      try {
        const servicesResponse = await ApiService.get('/portfolio/services', token)
        if (servicesResponse.success && servicesResponse.data) {
          const uniqueServices = new Map()
          servicesResponse.data.forEach((service: any) => {
            const key = `${service.title}_${service.description}`
            if (!uniqueServices.has(key)) {
              uniqueServices.set(key, {
                ...service,
                id: service.id ? String(service.id) : undefined,
              })
            }
          })
          services = Array.from(uniqueServices.values())
        }
      } catch (error) {
        console.log('Services endpoint error:', error)
      }
      
      // Fetch stats
      let stats: Stat[] = []
      try {
        const statsResponse = await ApiService.get('/portfolio/stats', token)
        if (statsResponse.success && statsResponse.data) {
          const uniqueStats = new Map()
          statsResponse.data.forEach((stat: any) => {
            const key = `${stat.value}_${stat.label}`
            if (!uniqueStats.has(key)) {
              uniqueStats.set(key, {
                ...stat,
                id: String(stat.id),
              })
            }
          })
          stats = Array.from(uniqueStats.values())
        }
      } catch (error) {
        console.log('Stats endpoint error:', error)
      }

      setAboutData({
        bio: portfolioResponse.data?.profile?.bio || '',
        services: services,
        stats: stats,
      })
    } catch (error) {
      console.error('Error fetching about data:', error)
      showMessage('error', 'Failed to load about data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAboutData()
  }, [fetchAboutData])

  // === SERVICES CRUD ===
  const handleAddService = () => {
    const newService: Service = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Service',
      description: 'Service description',
      icon: 'FaCode',
      display_order: aboutData.services.length,
    }
    setAboutData(prev => ({
      ...prev,
      services: [...prev.services, newService],
    }))
  }

  const handleUpdateService = (id: string, field: keyof Service, value: string) => {
    setAboutData(prev => ({
      ...prev,
      services: prev.services.map(service =>
        String(service.id) === String(id) ? { ...service, [field]: value } : service
      ),
    }))
  }

  const handleDeleteService = (id: string) => {
    if (!confirm('Delete this service?')) return
    setAboutData(prev => ({
      ...prev,
      services: prev.services.filter(service => String(service.id) !== String(id)),
    }))
  }

  // === STATS CRUD ===
  const handleAddStat = () => {
    const newStat: Stat = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      value: '0',
      label: 'New Stat',
      display_order: aboutData.stats.length,
    }
    setAboutData(prev => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }))
  }

  const handleUpdateStat = (id: string, field: keyof Stat, value: string) => {
    setAboutData(prev => ({
      ...prev,
      stats: prev.stats.map(stat =>
        String(stat.id) === String(id) ? { ...stat, [field]: value } : stat
      ),
    }))
  }

  const handleDeleteStat = (id: string) => {
    if (!confirm('Delete this stat?')) return
    setAboutData(prev => ({
      ...prev,
      stats: prev.stats.filter(stat => String(stat.id) !== String(id)),
    }))
  }

  // === SAVE ALL ===
  const handleSave = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setIsSaving(true)
    try {
      // Save bio
      const profileResponse = await ApiService.updateProfile(
        { bio: aboutData.bio },
        token
      )
      console.log('Save bio response:', profileResponse)

      // === Save Services ===
      // 1. Ambil daftar services yang ada di backend
      let existingServices: Service[] = []
      try {
        const existingResponse = await ApiService.get('/portfolio/services', token)
        if (existingResponse.success && existingResponse.data) {
          existingServices = existingResponse.data.map((s: any) => ({
            ...s,
            id: String(s.id),
          }))
        }
      } catch (error) {
        console.error('Error fetching existing services:', error)
      }

      // 2. Hapus semua services yang tidak ada di UI
      const currentServiceIds = aboutData.services
        .filter(s => !String(s.id).startsWith('temp_'))
        .map(s => String(s.id))
      
      for (const existingService of existingServices) {
        if (!currentServiceIds.includes(String(existingService.id))) {
          console.log('Deleting service:', existingService.id)
          await ApiService.deleteService(existingService.id, token)
        }
      }

      // 3. Update atau create services
      for (const service of aboutData.services) {
        const isTempId = String(service.id).startsWith('temp_')
        
        if (isTempId) {
          // Create new service
          const createResponse = await ApiService.createService(
            {
              title: service.title,
              description: service.description,
              icon: service.icon,
              display_order: service.display_order || 0,
            },
            token
          )
          if (!createResponse.success) {
            console.error('Failed to create service:', createResponse)
          }
        } else {
          // Update existing service
          const updateResponse = await ApiService.updateService(
            service.id,
            {
              title: service.title,
              description: service.description,
              icon: service.icon,
              display_order: service.display_order || 0,
            },
            token
          )
          if (!updateResponse.success) {
            console.error('Failed to update service:', updateResponse)
          }
        }
      }

      // === Save Stats ===
      // 1. Ambil daftar stats yang ada di backend
      let existingStats: Stat[] = []
      try {
        const existingStatsResponse = await ApiService.get('/portfolio/stats', token)
        if (existingStatsResponse.success && existingStatsResponse.data) {
          existingStats = existingStatsResponse.data.map((s: any) => ({
            ...s,
            id: String(s.id),
          }))
        }
      } catch (error) {
        console.error('Error fetching existing stats:', error)
      }

      // 2. Hapus semua stats yang tidak ada di UI
      const currentStatIds = aboutData.stats
        .filter(s => !String(s.id).startsWith('temp_'))
        .map(s => String(s.id))
      
      for (const existingStat of existingStats) {
        if (!currentStatIds.includes(String(existingStat.id))) {
          console.log('Deleting stat:', existingStat.id)
          await ApiService.deleteStat(existingStat.id, token)
        }
      }

      // 3. Update atau create stats
      for (const stat of aboutData.stats) {
        const isTempId = String(stat.id).startsWith('temp_')
        
        if (isTempId) {
          // Create new stat
          const createResponse = await ApiService.createStat(
            {
              value: stat.value,
              label: stat.label,
              display_order: stat.display_order || 0,
            },
            token
          )
          if (!createResponse.success) {
            console.error('Failed to create stat:', createResponse)
          }
        } else {
          // Update existing stat
          const updateResponse = await ApiService.updateStat(
            stat.id,
            {
              value: stat.value,
              label: stat.label,
              display_order: stat.display_order || 0,
            },
            token
          )
          if (!updateResponse.success) {
            console.error('Failed to update stat:', updateResponse)
          }
        }
      }

      showMessage('success', 'About section saved successfully!')
      fetchAboutData() // Refresh data
    } catch (error) {
      console.error('Error saving about data:', error)
      showMessage('error', 'Failed to save about data')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading about data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaTimes className="mr-2" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit About Section</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your bio, services, and quick stats
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isSaving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Bio / Summary
          </h2>
          <label className={labelClass}>Professional Summary</label>
          <textarea
            value={aboutData.bio}
            onChange={(e) => setAboutData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className={inputClass}
            placeholder="Write your professional summary..."
          />
        </div>

        {/* Services Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              What I Do (Services)
            </h2>
            <button
              onClick={handleAddService}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {aboutData.services.map((service, index) => (
              <div key={service.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Service #{index + 1}
                  </h3>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)}
                    className={inputClass}
                    placeholder="Service title"
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                    rows={2}
                    className={inputClass}
                    placeholder="Service description"
                  />
                </div>

                <div>
                  <label className={labelClass}>Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((option) => {
                      const Icon = option.Icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleUpdateService(service.id, 'icon', option.value)}
                          className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                            service.icon === option.value
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                          }`}
                        >
                          <Icon className="mr-2" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Stats
            </h2>
            <button
              onClick={handleAddStat}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Stat
            </button>
          </div>

          <div className="space-y-4">
            {aboutData.stats.map((stat) => (
              <div key={stat.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className={labelClass}>Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(stat.id, 'value', e.target.value)}
                    className={inputClass}
                    placeholder="e.g., 5+, 50+, 30+"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(stat.id, 'label', e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Years Exp, Projects, Clients"
                  />
                </div>
                <button
                  onClick={() => handleDeleteStat(stat.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}