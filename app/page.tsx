'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import SocialLinks from '@/components/SocialLinks'
import ApiService from '@/services/api'
import { dummyData } from '@/data/dummyData'

export default function Home() {
  const [portfolioData, setPortfolioData] = useState(dummyData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const response = await ApiService.getPortfolio()
      
      if (response.success && response.data) {
        setPortfolioData(response.data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      // Gunakan dummy data sebagai fallback
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16">
      <Hero data={portfolioData} />
      <About data={portfolioData} />
      <Skills data={portfolioData} />
      <Experience data={portfolioData} />
      <Projects data={portfolioData} />
      <SocialLinks data={portfolioData} />
    </div>
  )
}