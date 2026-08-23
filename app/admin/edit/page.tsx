'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSave, FaPlus, FaTrash, FaUser, FaBriefcase, FaCode, FaFolder, FaLink, FaTimes, FaEdit } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import ApiService from '@/services/api'

type TabId = 'profile' | 'social' | 'skills' | 'experience' | 'projects'

interface Tab {
  id: TabId
  label: string
  icon: any
}

interface Profile {
  id?: string
  name: string
  title: string
  email: string
  phone: string
  location: string
  bio: string
  avatar: string
  resumeUrl: string
}

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  display_order?: number;
}

interface Skill {
  id: string
  name: string
  level: number
  category: string
}

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  achievements: string[]
}

interface Project {
  id: string
  title: string
  description: string
  image: string
  technologies: string[]
  liveUrl: string
  githubUrl: string
}

interface PortfolioData {
  profile: Profile
  socialLinks: SocialLink[]
  skills: Skill[]
  experiences: Experience[]
  projects: Project[]
}

export default function AdminEditPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [data, setData] = useState<PortfolioData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'social', label: 'Social Links', icon: FaLink },
    { id: 'skills', label: 'Skills', icon: FaCode },
    { id: 'experience', label: 'Experience', icon: FaBriefcase },
    { id: 'projects', label: 'Projects', icon: FaFolder }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await ApiService.getPortfolio()
      
      if (response.success) {
        setData(response.data)
      } else {
        showNotification('error', response.message || 'Failed to load data')
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      showNotification('error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // Profile update - pastikan field names sesuai backend
  const handleSaveProfile = async () => {
    if (!data) return
    
    const token = localStorage.getItem('adminToken')
    if (!token) return

    setIsSaving(true)
    try {
      // Hanya kirim field yang diperlukan, tanpa avatar dan resume_url
      // Backend mungkin menolak nilai yang tidak valid
      const profileData = {
        id: data.profile.id || 1,
        name: data.profile.name,
        title: data.profile.title,
        email: data.profile.email,
        phone: data.profile.phone || '',
        location: data.profile.location || '',
        bio: data.profile.bio || '',
        // Jangan kirim avatar dan resume_url jika nilainya tidak valid
        // avatar: '',
        // resume_url: '',
      }
      
      console.log('Sending profile data:', profileData)
      
      const response = await ApiService.updateProfile(profileData, token)
      console.log('Update profile response:', response)
      
      if (response.success) {
        setSaveSuccess(true)
        showNotification('success', 'Profile saved successfully!')
        setTimeout(() => setSaveSuccess(false), 3000)
        fetchData()
      } else {
        console.error('Error details:', response.error)
        let errorMsg = response.message || 'Failed to save profile'
        if (response.error && Array.isArray(response.error) && response.error.length > 0) {
          const firstError = response.error[0]
          errorMsg = `${firstError.field || firstError.path || 'Field'}: ${firstError.message || 'Invalid'}`
        }
        showNotification('error', errorMsg)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      showNotification('error', 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Social Links CRUD
  const handleCreateSocialLink = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    // Gunakan GitHub sebagai default yang valid
    const newLink = {
      platform: 'GitHub',
      url: 'https://github.com/username',
      icon: 'FaGithub',
      display_order: data?.socialLinks?.length || 0
    }

    try {
      const response = await ApiService.createSocialLink(newLink, token)
      console.log('Create social link response:', response)
      
      if (response.success) {
        showNotification('success', 'Social link added!')
        fetchData()
      } else {
        console.error('Error details:', response.error)
        showNotification('error', response.message || 'Failed to add social link')
      }
    } catch (error) {
      console.error('Error creating social link:', error)
      showNotification('error', 'Failed to add social link')
    }
  }

  const handleUpdateSocialLink = async (id: string, field: string, value: string) => {
    if (!data) return
    
    // Update local state
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        socialLinks: prev.socialLinks.map(link =>
          link.id === id ? { ...link, [field]: value } : link
        )
      }
    })

    // Jangan kirim update real-time untuk setiap ketikan
    // Biarkan user klik Save dulu
  }

  const handleSaveSocialLinks = async () => {
    if (!data) return
    
    const token = localStorage.getItem('adminToken')
    if (!token) return

    setIsSaving(true)
    try {
      let hasError = false
      
      // Update semua social links satu per satu
      for (const link of data.socialLinks) {
        const linkData = {
          platform: link.platform,
          url: link.url,
          icon: link.icon || `Fa${link.platform}`,
          display_order: link.display_order || 0,
        }
        
        // Validasi URL
        if (link.url && !link.url.startsWith('http')) {
          showNotification('error', `URL for ${link.platform} must start with http:// or https://`)
          hasError = true
          break
        }
        
        const response = await ApiService.updateSocialLink(link.id, linkData, token)
        console.log(`Update ${link.platform} response:`, response)
        
        if (!response.success) {
          hasError = true
          showNotification('error', `Failed to update ${link.platform}: ${response.message || 'Unknown error'}`)
          break
        }
      }
      
      if (!hasError) {
        showNotification('success', 'Social links saved successfully!')
        fetchData()
      }
    } catch (error) {
      console.error('Error saving social links:', error)
      showNotification('error', 'Failed to save social links')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSocialLink = async (id: string) => {
    if (!confirm('Delete this social link?')) return

    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      const response = await ApiService.deleteSocialLink(id, token)
      
      if (response.success) {
        showNotification('success', 'Social link deleted!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to delete social link')
      }
    } catch (error) {
      console.error('Error deleting social link:', error)
      showNotification('error', 'Failed to delete social link')
    }
  }

  // Skills CRUD
  const handleCreateSkill = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const newSkill = {
      name: 'New Skill',
      level: 80,
      category: 'Frontend',
      display_order: 0
    }

    try {
      const response = await ApiService.createSkill(newSkill, token)
      console.log('Create skill response:', response)
      
      if (response.success) {
        showNotification('success', 'Skill added!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to add skill')
      }
    } catch (error) {
      console.error('Error creating skill:', error)
      showNotification('error', 'Failed to add skill')
    }
  }

  const handleUpdateSkill = async (id: string, field: string, value: string | number) => {
    if (!data) return
    
    // Update local state
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        skills: prev.skills.map(skill =>
          skill.id === id ? { ...skill, [field]: value } : skill
        )
      }
    })

    const token = localStorage.getItem('adminToken')
    if (!token) return

    const skill = data.skills.find(s => s.id === id)
    if (!skill) return

    try {
      const updatedSkill = { ...skill, [field]: value }
      const response = await ApiService.updateSkill(id, updatedSkill, token)
      
      if (!response.success) {
        showNotification('error', response.message || 'Failed to update skill')
      }
    } catch (error) {
      console.error('Error updating skill:', error)
    }
  }

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return

    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      const response = await ApiService.deleteSkill(id, token)
      
      if (response.success) {
        showNotification('success', 'Skill deleted!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to delete skill')
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
      showNotification('error', 'Failed to delete skill')
    }
  }

  // Experience CRUD
  const handleCreateExperience = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const newExperience = {
      company: 'New Company',
      position: 'Position',
      start_date: '2024-01',
      end_date: 'Present',
      description: 'Job description',
      achievements: [],
      display_order: 0
    }

    try {
      const response = await ApiService.createExperience(newExperience, token)
      console.log('Create experience response:', response)
      
      if (response.success) {
        showNotification('success', 'Experience added!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to add experience')
      }
    } catch (error) {
      console.error('Error creating experience:', error)
      showNotification('error', 'Failed to add experience')
    }
  }

  const handleUpdateExperience = async (id: string, field: string, value: string | string[]) => {
    if (!data) return
    
    // Update local state
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        experiences: prev.experiences.map(exp =>
          exp.id === id ? { ...exp, [field]: value } : exp
        )
      }
    })

    const token = localStorage.getItem('adminToken')
    if (!token) return

    const experience = data.experiences.find(e => e.id === id)
    if (!experience) return

    try {
      const updatedExperience = { ...experience, [field]: value }
      const response = await ApiService.updateExperience(id, updatedExperience, token)
      
      if (!response.success) {
        showNotification('error', response.message || 'Failed to update experience')
      }
    } catch (error) {
      console.error('Error updating experience:', error)
    }
  }

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Delete this experience?')) return

    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      const response = await ApiService.deleteExperience(id, token)
      
      if (response.success) {
        showNotification('success', 'Experience deleted!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to delete experience')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      showNotification('error', 'Failed to delete experience')
    }
  }

  // Projects CRUD
  const handleCreateProject = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const newProject = {
      title: 'New Project',
      description: 'Project description',
      image: 'https://via.placeholder.com/400x300',
      technologies: ['React', 'Node.js'],
      live_url: 'https://example.com',
      github_url: 'https://github.com/username/project',
      featured: false,
      display_order: 0
    }

    try {
      const response = await ApiService.createProject(newProject, token)
      console.log('Create project response:', response)
      
      if (response.success) {
        showNotification('success', 'Project added!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to add project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      showNotification('error', 'Failed to add project')
    }
  }

  const handleUpdateProject = async (id: string, field: string, value: string | string[]) => {
    if (!data) return
    
    // Update local state
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        projects: prev.projects.map(proj =>
          proj.id === id ? { ...proj, [field]: value } : proj
        )
      }
    })

    const token = localStorage.getItem('adminToken')
    if (!token) return

    const project = data.projects.find(p => p.id === id)
    if (!project) return

    try {
      const updatedProject = { ...project, [field]: value }
      const response = await ApiService.updateProject(id, updatedProject, token)
      
      if (!response.success) {
        showNotification('error', response.message || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return

    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      const response = await ApiService.deleteProject(id, token)
      
      if (response.success) {
        showNotification('success', 'Project deleted!')
        fetchData()
      } else {
        showNotification('error', response.message || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showNotification('error', 'Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
  const cardClass = "bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                notification.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Content</h1>
          {activeTab === 'profile' && (
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Areas */}
        <div className={cardClass}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={data.profile.name}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, name: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={data.profile.title}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, title: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, email: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={data.profile.phone}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, phone: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={data.profile.location}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, location: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Resume URL</label>
                  <input
                    type="url"
                    value={data.profile.resumeUrl}
                    onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, resumeUrl: e.target.value } } : prev)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={data.profile.bio}
                  onChange={(e) => setData(prev => prev ? { ...prev, profile: { ...prev.profile, bio: e.target.value } } : prev)}
                  rows={4}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Social Links</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSocialLink}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Add Link
                  </button>
                  <button
                    onClick={handleSaveSocialLinks}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {isSaving ? 'Saving...' : 'Save Links'}
                  </button>
                </div>
              </div>
              
              {data.socialLinks.map((link) => (
                <div key={link.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className={labelClass}>Platform</label>
                      <select
                        value={link.platform}
                        onChange={(e) => {
                          const platform = e.target.value
                          setData(prev => {
                            if (!prev) return prev
                            return {
                              ...prev,
                              socialLinks: prev.socialLinks.map(l =>
                                l.id === link.id ? { 
                                  ...l, 
                                  platform, 
                                  icon: `Fa${platform}` // Simpan icon name yang sesuai
                                } : l
                              )
                            }
                          })
                        }}
                        className={inputClass}
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Website">Website</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleDeleteSocialLink(link.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div>
                    <label className={labelClass}>URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const url = e.target.value
                        setData(prev => {
                          if (!prev) return prev
                          return {
                            ...prev,
                            socialLinks: prev.socialLinks.map(l =>
                              l.id === link.id ? { ...l, url } : l
                            )
                          }
                        })
                      }}
                      placeholder={`https://${link.platform.toLowerCase()}.com/username`}
                      className={inputClass}
                    />
                    {link.url && !link.url.startsWith('http') && (
                      <p className="text-red-500 text-sm mt-1">
                        URL must start with http:// or https://
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skills</h2>
                <button
                  onClick={handleCreateSkill}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Skill
                </button>
              </div>
              {data.skills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className={labelClass}>Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleUpdateSkill(skill.id, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Category</label>
                    <input
                      type="text"
                      value={skill.category}
                      onChange={(e) => handleUpdateSkill(skill.id, 'category', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32">
                    <label className={labelClass}>Level (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => handleUpdateSkill(skill.id, 'level', parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Work Experience</h2>
                <button
                  onClick={handleCreateExperience}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Experience
                </button>
              </div>
              {data.experiences.map((exp) => (
                <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleUpdateExperience(exp.id, 'position', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
                <button
                  onClick={handleCreateProject}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Project
                </button>
              </div>
              {data.projects.map((project) => (
                <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleUpdateProject(project.id, 'title', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Image URL</label>
                      <input
                        type="text"
                        value={project.image}
                        onChange={(e) => handleUpdateProject(project.id, 'image', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Live URL</label>
                      <input
                        type="url"
                        value={project.liveUrl}
                        onChange={(e) => handleUpdateProject(project.id, 'liveUrl', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>GitHub URL</label>
                      <input
                        type="url"
                        value={project.githubUrl}
                        onChange={(e) => handleUpdateProject(project.id, 'githubUrl', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => handleUpdateProject(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}