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
  const [logoText, setLogoText] = useState('')
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
        const fullName = profile.name || ''
        const nameParts = fullName.split(' ').filter(Boolean)
        let initials = ''
        
        if (nameParts.length >= 2) {
          initials = nameParts[0][0] + nameParts[1][0]
        } else if (nameParts.length === 1) {
          initials = nameParts[0][0]
        }
        
        setLogoText(initials.toUpperCase())
      }
    } catch (error) {
      console.error('Error fetching profile for navbar:', error)
      setLogoText('')
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
    setIsOpen(false)
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
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="w-full px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 shrink-0 min-w-[40px]"
          >
            {logoText || 'NA'}
          </Link>

          {/* Desktop Menu - hanya lg ke atas */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 xl:px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center whitespace-nowrap"
                >
                  <FaSignOutAlt className="mr-1 text-xs" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-gray-700 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="px-4 py-2 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/admin"
                    className="block w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
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