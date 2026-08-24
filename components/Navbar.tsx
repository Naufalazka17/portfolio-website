'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBars, FaTimes, FaMoon, FaSun, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa'
import { useTheme } from './ThemeProvider'
import ApiService from '@/services/api'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoText, setLogoText] = useState('P')
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsLoggedIn(!!token)
  }, [pathname])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await ApiService.getPortfolio()
      
      if (response.success && response.data && response.data.profile) {
        const profile = response.data.profile
        const initials = profile.name
          .split(' ')
          .map((word: string) => word[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        
        setLogoText(initials || 'P')
      }
    } catch (error) {
      console.error('Error fetching profile for navbar:', error)
      setLogoText('P')
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
    setIsLoggedIn(false)
    setIsOpen(false) // Close mobile menu
    router.push('/')
  }

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Experience', href: '/#experience' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo - Kiri */}
          <Link 
            href="/" 
            className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 shrink-0"
          >
            {logoText}
          </Link>

          {/* Desktop Menu - Tengah */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - Kanan */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center whitespace-nowrap"
                >
                  <FaSignOutAlt className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/admin"
                    className="block w-full bg-indigo-600 text-white px-3 py-2.5 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-red-600 text-white px-3 py-2.5 rounded-md text-base font-medium hover:bg-red-700 transition-colors text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full bg-indigo-600 text-white px-3 py-2.5 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}