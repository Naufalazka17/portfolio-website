'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Cropper from 'react-easy-crop'
import { FaUpload, FaTrash, FaArrowLeft, FaCheckCircle, FaTimes, FaExpand, FaCompress, FaUser } from 'react-icons/fa'
import ApiService from '@/services/api'

interface AvatarInfo {
  id?: string
  url?: string
  file_url?: string
  file_data?: string
  filename?: string
  file_name?: string
  original_name?: string
  name?: string
  size?: number
  file_size?: number
  uploaded_at?: string
  created_at?: string
  mime_type?: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function UploadAvatarPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState<AvatarInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Fetch current avatar
  const fetchCurrentAvatar = useCallback(async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await ApiService.get('/portfolio/avatar', token)
      
      if (response.success && response.data) {
        const avatarData = response.data
        
        // Backend menggunakan file_name dan file_data (base64)
        const avatarInfo: AvatarInfo = {
          id: avatarData.id ? String(avatarData.id) : undefined,
          url: avatarData.file_url || avatarData.url || undefined,
          file_url: avatarData.file_url || undefined,
          file_data: avatarData.file_data || undefined,
          filename: avatarData.file_name || avatarData.original_name || avatarData.filename || undefined,
          file_name: avatarData.file_name || undefined,
          original_name: avatarData.original_name || undefined,
          name: avatarData.name || undefined,
          size: avatarData.file_size || avatarData.size || undefined,
          file_size: avatarData.file_size || undefined,
          uploaded_at: avatarData.uploaded_at || avatarData.created_at || undefined,
          created_at: avatarData.created_at || undefined,
          mime_type: avatarData.mime_type || 'image/jpeg',
        }
        
        setCurrentAvatar(avatarInfo)
      } else {
        setCurrentAvatar(null)
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
      setCurrentAvatar(null)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Fetch avatar on mount
  useEffect(() => {
    fetchCurrentAvatar()
  }, [fetchCurrentAvatar])

  // Show message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return
    
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (!allowedTypes.includes(selectedFile.type)) {
      showMessage('error', 'Only JPG, PNG, WebP, or GIF images are allowed')
      return
    }
    
    // Validasi ukuran (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setFileName(selectedFile.name)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(selectedFile)
  }

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Create cropped image
  const createCroppedImage = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error('No image to crop')
    }

    const image = new Image()
    image.src = imageSrc
    
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas not supported')
    }

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/jpeg',
        0.9
      )
    })
  }

  // Handle upload
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      showMessage('error', 'Please select and crop an image first')
      return
    }

    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setUploading(true)

    try {
      const croppedBlob = await createCroppedImage()
      
      const formData = new FormData()
      formData.append('avatar', croppedBlob, fileName || 'avatar.jpg')

      const response = await ApiService.uploadFile('/portfolio/avatar/upload', formData, token)
      
      if (response.success) {
        setImageSrc('')
        setFileName('')
        setCroppedAreaPixels(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        showMessage('success', 'Avatar uploaded successfully!')
        fetchCurrentAvatar() // Refresh data
      } else {
        showMessage('error', response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showMessage('error', 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the current avatar?')) return

    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await ApiService.delete('/portfolio/avatar', token)
      
      if (response.success) {
        setCurrentAvatar(null)
        showMessage('success', 'Avatar deleted successfully!')
      } else {
        showMessage('error', response.message || 'Failed to delete avatar')
      }
    } catch (error) {
      console.error('Delete error:', error)
      showMessage('error', 'Failed to delete avatar')
    }
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAvatarUrl = () => {
    if (!currentAvatar) return ''
    
    // Jika ada URL langsung, gunakan
    if (currentAvatar.url || currentAvatar.file_url) {
      return currentAvatar.url || currentAvatar.file_url || ''
    }
    
    // Jika ada base64 data, buat data URL
    if (currentAvatar.file_data) {
      const mimeType = currentAvatar.mime_type || 'image/jpeg'
      return `data:${mimeType};base64,${currentAvatar.file_data}`
    }
    
    return ''
  }

  const getAvatarName = () => {
    if (!currentAvatar) return 'avatar.jpg'
    return currentAvatar.file_name || currentAvatar.original_name || currentAvatar.filename || currentAvatar.name || 'avatar.jpg'
  }

  const getAvatarSize = () => {
    if (!currentAvatar) return 0
    return currentAvatar.file_size || currentAvatar.size || 0
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaTimes className="mr-2" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Avatar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload and crop your profile picture
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* Current Avatar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Avatar
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : currentAvatar && getAvatarUrl() ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={getAvatarUrl()}
                    alt="Current Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getAvatarName()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(getAvatarSize())}
                      {currentAvatar.uploaded_at && ` • Uploaded ${new Date(currentAvatar.uploaded_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <FaUser className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">No avatar uploaded yet</p>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload New Avatar
          </h2>

          {!imageSrc ? (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Click to select image
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                JPG, PNG, WebP, GIF (max 5MB)
              </p>
            </div>
          ) : (
            <div>
              {/* Cropper */}
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-4 mb-4">
                <FaCompress className="text-gray-500 dark:text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <FaExpand className="text-gray-500 dark:text-gray-400" />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      Upload Avatar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setImageSrc('')
                    setFileName('')
                    setCroppedAreaPixels(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}