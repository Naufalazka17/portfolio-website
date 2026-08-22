'use client'

import { motion } from 'framer-motion'
import { PortfolioData } from '@/types'

interface ExperienceProps {
  data: PortfolioData
}

export default function Experience({ data }: ExperienceProps) {
  const { experiences } = data

  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Work Experience</h2>
          <div className="w-24 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto"></div>
        </motion.div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {exp.position}
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">{exp.company}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0">
                  {exp.startDate} - {exp.endDate}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{exp.description}</p>
              <ul className="space-y-2">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2 mt-1">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{achievement}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}