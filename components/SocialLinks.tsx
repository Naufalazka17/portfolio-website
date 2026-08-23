'use client'

import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaGlobe, FaLink } from 'react-icons/fa'
import { PortfolioData } from '@/types'

interface SocialLinksProps {
  data: PortfolioData
}

const iconMap: { [key: string]: any } = {
  FaLinkedin: FaLinkedin,
  FaGithub: FaGithub,
  FaTwitter: FaTwitter,
  FaInstagram: FaInstagram,
  FaFacebook: FaFacebook,
  FaYoutube: FaYoutube,
  FaGlobe: FaGlobe,
  FaLink: FaLink,
}

export default function SocialLinks({ data }: SocialLinksProps) {
  const { socialLinks } = data

  const getIcon = (iconName: string) => {
    // Cari icon di map, jika tidak ada gunakan FaLink sebagai fallback
    return iconMap[iconName] || FaLink
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Connect With Me
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {socialLinks.map((link) => {
            const Icon = getIcon(link.icon || `Fa${link.platform}`)
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                aria-label={link.platform}
              >
                <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}