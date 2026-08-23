'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PortfolioData } from '@/types'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCode, FaMobileAlt, FaRocket, FaBriefcase, FaFolder, FaUsers, FaLink } from 'react-icons/fa'
import ApiService from '@/services/api'

interface AboutProps {
  data: PortfolioData
}

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

const iconMap: { [key: string]: any } = {
  FaCode,
  FaMobileAlt,
  FaRocket,
  FaBriefcase,
  FaFolder,
  FaUsers,
  FaLink,
}

export default function About({ data }: AboutProps) {
  const { profile } = data
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAboutData()
  }, [])

  const fetchAboutData = async () => {
    setLoading(true)
    console.log('=== About: Starting fetch ===')
    console.log('About: Data from props:', data)
    
    try {
      let fetchedServices: Service[] = []
      let fetchedStats: Stat[] = []

      // 1. Cek apakah data services/stats sudah ada di props (dari homepage fetch)
      if ((data as any).services && (data as any).services.length > 0) {
        console.log('About: Services found in props:', (data as any).services)
        fetchedServices = (data as any).services
      }
      
      if ((data as any).stats && (data as any).stats.length > 0) {
        console.log('About: Stats found in props:', (data as any).stats)
        fetchedStats = (data as any).stats
      }

      // 2. Jika tidak ada di props, fetch dari endpoint terpisah
      if (fetchedServices.length === 0) {
        try {
          console.log('About: Fetching services from /portfolio/services')
          const servicesResponse = await ApiService.get('/portfolio/services')
          console.log('About: Services response:', servicesResponse)
          
          if (servicesResponse.success && servicesResponse.data) {
            fetchedServices = servicesResponse.data
          } else {
            console.warn('About: Services fetch failed:', servicesResponse)
          }
        } catch (error) {
          console.error('About: Error fetching services:', error)
        }
      }

      if (fetchedStats.length === 0) {
        try {
          console.log('About: Fetching stats from /portfolio/stats')
          const statsResponse = await ApiService.get('/portfolio/stats')
          console.log('About: Stats response:', statsResponse)
          
          if (statsResponse.success && statsResponse.data) {
            fetchedStats = statsResponse.data
          } else {
            console.warn('About: Stats fetch failed:', statsResponse)
          }
        } catch (error) {
          console.error('About: Error fetching stats:', error)
        }
      }

      // 3. Jika masih kosong, fetch dari /portfolio dengan token
      if (fetchedServices.length === 0 || fetchedStats.length === 0) {
        try {
          const token = localStorage.getItem('adminToken')
          console.log('About: Fetching full portfolio with token:', token ? 'yes' : 'no')
          
          const portfolioResponse = await ApiService.getPortfolio()
          console.log('About: Full portfolio response:', portfolioResponse)
          
          if (portfolioResponse.success && portfolioResponse.data) {
            if (fetchedServices.length === 0 && portfolioResponse.data.services) {
              fetchedServices = portfolioResponse.data.services
            }
            if (fetchedStats.length === 0 && portfolioResponse.data.stats) {
              fetchedStats = portfolioResponse.data.stats
            }
          }
        } catch (error) {
          console.error('About: Error fetching full portfolio:', error)
        }
      }

      console.log('About: Final services:', fetchedServices)
      console.log('About: Final stats:', fetchedStats)

      setServices(fetchedServices)
      setStats(fetchedStats)
    } catch (error) {
      console.error('About: Fatal error:', error)
      setServices([])
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Me</h2>
          <div className="w-24 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Professional Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {profile.bio}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white font-medium truncate">{profile.name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaEnvelope className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium break-all">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaPhone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaMapMarkerAlt className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.location}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-white">
                What I Do
              </h3>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : services.length > 0 ? (
                  services.map((service) => {
                    const Icon = iconMap[service.icon] || FaCode
                    return (
                      <div key={service.id} className="flex items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                          <Icon className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{service.title}</h4>
                          <p className="text-indigo-100 text-sm">{service.description}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-indigo-100 text-center">No services added yet</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : stats.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat) => (
                    <div key={stat.id}>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center">No stats added yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}