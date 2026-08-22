'use client'

import { motion } from 'framer-motion'
import { PortfolioData } from '@/types'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCode, FaMobileAlt, FaRocket } from 'react-icons/fa'

interface AboutProps {
  data: PortfolioData
}

export default function About({ data }: AboutProps) {
  const { profile } = data

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
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <FaCode className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Web Development</h4>
                    <p className="text-indigo-100 text-sm">Building responsive and scalable web applications</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <FaMobileAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Mobile-First Design</h4>
                    <p className="text-indigo-100 text-sm">Creating seamless experiences across all devices</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <FaRocket className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Performance Optimization</h4>
                    <p className="text-indigo-100 text-sm">Optimizing applications for speed and efficiency</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">5+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Years Exp</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">50+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">30+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}