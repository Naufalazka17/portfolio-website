'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaDownload } from 'react-icons/fa'
import { PortfolioData } from '@/types'
import ApiService from '@/services/api'

interface HeroProps {
  data: PortfolioData
}

export default function Hero({ data }: HeroProps) {
  const { profile } = data
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarLoading, setAvatarLoading] = useState(true)
  const [cvUrl, setCvUrl] = useState<string>('')
  const [cvName, setCvName] = useState<string>('CV.pdf')
  const [isLoadingCV, setIsLoadingCV] = useState(false)

  useEffect(() => {
    fetchAvatar()
    fetchCV()
  }, [])

  const fetchAvatar = async () => {
    setAvatarLoading(true)
    try {
      let response = await ApiService.get('/portfolio/avatar')
      
      if (!response.success || !response.data) {
        const token = localStorage.getItem('adminToken') || ''
        if (token) {
          response = await ApiService.get('/portfolio/avatar', token)
        }
      }
      
      console.log('Avatar response:', response)
      
      if (response.success && response.data) {
        const avatarData = response.data
        
        if (avatarData.file_url || avatarData.url) {
          setAvatarUrl(avatarData.file_url || avatarData.url)
        } else if (avatarData.file_data) {
          let base64Data = avatarData.file_data
          
          if (base64Data.startsWith('data:image')) {
            setAvatarUrl(base64Data)
          } else {
            const mimeType = avatarData.mime_type || 'image/jpeg'
            setAvatarUrl(`data:${mimeType};base64,${base64Data}`)
          }
        }
      } else {
        if (profile.avatar && profile.avatar.startsWith('http')) {
          setAvatarUrl(profile.avatar)
        }
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
      if (profile.avatar && profile.avatar.startsWith('http')) {
        setAvatarUrl(profile.avatar)
      }
    } finally {
      setAvatarLoading(false)
    }
  }

  const fetchCV = async () => {
    try {
      let response = await ApiService.get('/portfolio/cv')
      
      if (!response.success || !response.data) {
        const token = localStorage.getItem('adminToken')
        if (token) {
          response = await ApiService.get('/portfolio/cv', token)
        }
      }
      
      if (response.success && response.data) {
        const cvData = response.data
        setCvUrl(cvData.url || cvData.file_url || '')
        setCvName(cvData.filename || cvData.file_name || cvData.name || 'CV.pdf')
      }
    } catch (error) {
      console.error('Error fetching CV:', error)
    }
  }

  const handleDownloadCV = async () => {
    if (cvUrl) {
      const link = document.createElement('a')
      link.href = cvUrl
      link.download = cvName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    setIsLoadingCV(true)
    try {
      let response = await ApiService.get('/portfolio/cv')
      
      if (!response.success || !response.data) {
        const token = localStorage.getItem('adminToken')
        if (token) {
          response = await ApiService.get('/portfolio/cv', token)
        }
      }
      
      if (response.success && response.data) {
        const cvData = response.data
        
        if (cvData.file_data) {
          const byteCharacters = atob(cvData.file_data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: cvData.mime_type || 'application/pdf' })
          const url = URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = url
          link.download = cvData.filename || cvData.file_name || 'CV.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          return
        }
        
        if (cvData.url || cvData.file_url) {
          const url = cvData.url || cvData.file_url
          setCvUrl(url)
          setCvName(cvData.filename || cvData.file_name || 'CV.pdf')
          
          const link = document.createElement('a')
          link.href = url
          link.download = cvData.filename || 'CV.pdf'
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    } catch (error) {
      console.error('Error downloading CV:', error)
    } finally {
      setIsLoadingCV(false)
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-10 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Avatar - Tampil di atas untuk mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:hidden"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <div className="absolute inset-0 bg-indigo-600 rounded-full opacity-10"></div>
              
              {avatarLoading ? (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover shadow-xl"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No photo</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              Hi, I'm {profile.name}
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-600 dark:text-blue-400 font-semibold mb-3 md:mb-6">
              {profile.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 mb-5 md:mb-8 leading-relaxed">
              {profile.bio}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-6 py-2.5 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center text-sm md:text-base"
              >
                Contact Me
              </Link>
              
              <button
                onClick={handleDownloadCV}
                disabled={isLoadingCV}
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 px-6 py-2.5 md:py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center text-sm md:text-base disabled:opacity-50"
              >
                {isLoadingCV ? 'Loading...' : (
                  <>
                    <FaDownload className="mr-2" />
                    Download CV
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Avatar - Tampil di kanan untuk desktop */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative w-56 h-56 lg:w-72 lg:h-72">
              <div className="absolute inset-0 bg-indigo-600 rounded-full opacity-10"></div>
              
              {avatarLoading ? (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover shadow-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No photo</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}