'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaDownload, FaUser } from 'react-icons/fa'
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
      // Coba tanpa token dulu (untuk public endpoint)
      let response = await ApiService.get('/portfolio/avatar')
      
      // Jika gagal, coba dengan token dari localStorage
      if (!response.success || !response.data) {
        const token = localStorage.getItem('adminToken') || ''
        if (token) {
          response = await ApiService.get('/portfolio/avatar', token)
        }
      }
      
      console.log('Avatar response:', response)
      
      if (response.success && response.data) {
        const avatarData = response.data
        
        // Cek berbagai format response
        if (avatarData.file_url || avatarData.url) {
          setAvatarUrl(avatarData.file_url || avatarData.url)
        } else if (avatarData.file_data) {
          // Jika base64, pastikan tidak ada prefix data:image yang duplikat
          let base64Data = avatarData.file_data
          
          // Jika sudah ada prefix data:image, gunakan langsung
          if (base64Data.startsWith('data:image')) {
            setAvatarUrl(base64Data)
          } else {
            // Jika belum ada prefix, tambahkan
            const mimeType = avatarData.mime_type || 'image/jpeg'
            setAvatarUrl(`data:${mimeType};base64,${base64Data}`)
          }
        } else if (avatarData.avatar_url) {
          setAvatarUrl(avatarData.avatar_url)
        }
      } else {
        console.log('No avatar data found, using fallback')
        // Fallback ke profile.avatar dari data utama
        if (profile.avatar && profile.avatar.startsWith('http')) {
          setAvatarUrl(profile.avatar)
        }
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
      // Fallback ke profile.avatar
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
      
      // Jika gagal, coba dengan token
      if (!response.success || !response.data) {
        const token = localStorage.getItem('adminToken')
        if (token) {
          response = await ApiService.get('/portfolio/cv', token)
        }
      }
      
      console.log('CV response:', response)
      
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
        
        // Jika ada file_data (base64)
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
        
        // Jika ada URL
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
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Hi, I'm {profile.name}
            </h1>
            <h2 className="text-3xl text-blue-600 dark:text-blue-400 font-semibold mb-6">
              {profile.title}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Contact Me
              </Link>
              
              <button
                onClick={handleDownloadCV}
                disabled={isLoadingCV}
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center disabled:opacity-50"
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

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-indigo-600 rounded-full opacity-10"></div>
              
              {avatarLoading ? (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover shadow-2xl"
                  onError={(e) => {
                    // Fallback jika gambar gagal dimuat
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}