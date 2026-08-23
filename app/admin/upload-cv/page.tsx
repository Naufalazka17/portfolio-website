'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUpload, FaTrash, FaFilePdf, FaDownload, FaEye, FaTimes, FaCheckCircle, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa'
import ApiService from '@/services/api'

interface CVInfo {
  id: string
  filename?: string
  name?: string
  url?: string
  file_url?: string
  size?: number
  file_size?: number
  uploaded_at?: string
  mime_type?: string
}

export default function UploadCvPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [backendError, setBackendError] = useState(false)

  const fetchCurrentCV = useCallback(async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await ApiService.get('/portfolio/cv', token)
      
      if (response.success && response.data) {
        setCvInfo(response.data)
        setBackendError(false)
      } else if (response.error) {
        // Endpoint belum ada di backend
        console.warn('CV endpoint not available:', response.error)
        setBackendError(true)
      }
    } catch (error) {
      console.error('Error fetching CV:', error)
      setBackendError(true)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCurrentCV()
  }, [fetchCurrentCV])

  const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        showMessage('error', 'File size must be less than 5MB')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        showMessage('error', 'Only PDF, DOC, or DOCX files are allowed')
      } else {
        showMessage('error', 'Invalid file')
      }
      return
    }

    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return

    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('cv', file)

      const response = await ApiService.uploadFile('/portfolio/cv/upload', formData, token)
      
      console.log('Upload response:', response)

      if (response.success) {
        showMessage('success', 'CV uploaded successfully!')
        setFile(null)
        setBackendError(false)
        fetchCurrentCV()
      } else if (response.error && response.error.includes('does not exist')) {
        // Database schema error
        showMessage('warning', 'Backend database is not ready. Please contact developer.')
        setBackendError(true)
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

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCVUrl = () => {
    if (!cvInfo) return ''
    return cvInfo.url || cvInfo.file_url || ''
  }

  const getCVName = () => {
    if (!cvInfo) return 'cv.pdf'
    return cvInfo.filename || cvInfo.name || 'cv.pdf'
  }

  const getCVSize = () => {
    if (!cvInfo) return 0
    return cvInfo.size || cvInfo.file_size || 0
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
                  : message.type === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-2" />
              ) : message.type === 'warning' ? (
                <FaExclamationTriangle className="mr-2" />
              ) : (
                <FaTimes className="mr-2" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backend Error Warning */}
        {backendError && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-1 mr-3" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                  Backend CV endpoints are not ready yet
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  Please contact your backend developer to:
                  <ul className="list-disc list-inside mt-2">
                    <li>Create the <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">cvs</code> table with proper columns</li>
                    <li>Add <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">GET /api/portfolio/cv</code> endpoint</li>
                    <li>Add <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">POST /api/portfolio/cv/upload</code> endpoint</li>
                    <li>Add <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">DELETE /api/portfolio/cv</code> endpoint</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload CV</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your CV file for download
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

        {/* Current CV Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current CV
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : cvInfo ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <FaFilePdf className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getCVName()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(getCVSize())}
                    {cvInfo.uploaded_at && ` • Uploaded ${new Date(cvInfo.uploaded_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {getCVUrl() && (
                  <>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <FaEye />
                    </button>
                    <a
                      href={getCVUrl()}
                      download
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FaDownload />
                    </a>
                  </>
                )}
                <button
                  onClick={() => showMessage('warning', 'Delete endpoint not ready yet')}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFilePdf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {backendError ? 'Backend not ready' : 'No CV uploaded yet'}
              </p>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload New CV
          </h2>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <input {...getInputProps()} />
            
            <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                Drop file here...
              </p>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Drag & drop file here, or click to select
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  PDF, DOC, DOCX (max 5MB)
                </p>
              </>
            )}
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaFilePdf className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
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
                      Upload CV
                    </>
                  )}
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}