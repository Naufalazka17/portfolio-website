'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ApiService from '@/services/api'

interface AdminAuthProps {
  children: React.ReactNode
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await ApiService.verifyToken(token)
        
        if (response.success) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUsername')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth verification error:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUsername')
        router.push('/login')
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}