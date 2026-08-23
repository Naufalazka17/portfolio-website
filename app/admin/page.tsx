'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaEnvelopeOpen, FaEdit, FaSignOutAlt, FaCode, FaBriefcase, FaFolder } from 'react-icons/fa'
import ApiService from '@/services/api'
import { FaFilePdf } from 'react-icons/fa'
import { FaUser } from 'react-icons/fa6'

export default function AdminPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [stats, setStats] = useState({
    unreadMessages: 0,
    totalMessages: 0,
    totalProjects: 0,
    totalSkills: 0,
    totalExperiences: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      router.push('/login')
      return
    }

    const savedUsername = localStorage.getItem('adminUsername')
    if (savedUsername) {
      setUsername(savedUsername)
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch unread count
      const unreadResponse = await ApiService.getUnreadCount(token)
      console.log('Unread response:', unreadResponse)
      
      // Fetch all messages for total count
      const messagesResponse = await ApiService.getMessages(token, 1, 1)
      console.log('Messages response:', messagesResponse)
      
      // Fetch portfolio data
      const portfolioResponse = await ApiService.getPortfolio()
      console.log('Portfolio response:', portfolioResponse)

      // Extract values safely - backend returns snake_case
      let unreadCount = 0
      if (unreadResponse.success && unreadResponse.data) {
        if (typeof unreadResponse.data === 'number') {
          unreadCount = unreadResponse.data
        } else if (typeof unreadResponse.data.count === 'number') {
          unreadCount = unreadResponse.data.count
        }
      }

      let totalMessages = 0
      if (messagesResponse.success) {
        if (messagesResponse.pagination && typeof messagesResponse.pagination.total === 'number') {
          totalMessages = messagesResponse.pagination.total
        } else if (messagesResponse.data && Array.isArray(messagesResponse.data)) {
          totalMessages = messagesResponse.data.length
        }
      }

      let totalProjects = 0
      let totalSkills = 0
      let totalExperiences = 0

      if (portfolioResponse.success && portfolioResponse.data) {
        // Backend menggunakan snake_case
        totalProjects = portfolioResponse.data.projects?.length || 0
        totalSkills = portfolioResponse.data.skills?.length || 0
        totalExperiences = portfolioResponse.data.experiences?.length || 0
      }

      setStats({
        unreadMessages: unreadCount,
        totalMessages: totalMessages,
        totalProjects: totalProjects,
        totalSkills: totalSkills,
        totalExperiences: totalExperiences,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken')
    
    if (token) {
      try {
        await ApiService.logout(token)
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            {username && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, <span className="font-semibold">{username}</span>!
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.unreadMessages}
                </p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                <FaEnvelope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalMessages}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <FaEnvelopeOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalProjects}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <FaFolder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Skills</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSkills}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <FaCode className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Experiences</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalExperiences}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <FaBriefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/messages">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow relative cursor-pointer">
              <div className="absolute top-4 right-4">
                {stats.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </div>
              <FaEnvelope className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage incoming messages from visitors
              </p>
            </div>
          </Link>

          <Link href="/admin/edit">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <FaEdit className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Edit Content
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Update your profile, skills, projects, and more
              </p>
            </div>
          </Link>

          <Link href="/admin/upload-cv">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <FaFilePdf className="w-12 h-12 text-red-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload CV
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload or update your CV file
              </p>
            </div>
          </Link>

          <Link href="/admin/upload-avatar">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <FaUser className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Avatar
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload and crop your profile picture
              </p>
            </div>
          </Link>

          <Link href="/admin/edit-about">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <FaUser className="w-12 h-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Edit About
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Update bio, services, and quick stats
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}