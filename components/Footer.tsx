import Link from 'next/link'
import { dummyData } from '@/data/dummyData'

export default function Footer() {
  const { profile } = dummyData

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{profile.name}</h3>
            <p className="text-gray-400">{profile.title}</p>
            <p className="text-gray-400 mt-2">{profile.location}</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/#about" className="block text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/#projects" className="block text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">{profile.email}</p>
            <p className="text-gray-400">{profile.phone}</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}