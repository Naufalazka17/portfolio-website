'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaEdit, FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa'

export default function AdminPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const unreadMessages = 2

  useEffect(() => {
    // Get username from localStorage
    const savedUsername = localStorage.getItem('adminUsername')
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    router.push('/login')
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header dengan Logout */}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unreadMessages}</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">1,234</p>
              </div>
              <FaChartBar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/messages">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow relative cursor-pointer">
              <div className="absolute top-4 right-4">
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadMessages}
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
        </div>
      </div>
    </div>
  )
}