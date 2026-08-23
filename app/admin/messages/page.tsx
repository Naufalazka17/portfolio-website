'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import ApiService from '@/services/api'

interface Message {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  created_at: string
  is_read: boolean
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const unreadCount = messages.filter(m => !m.is_read).length

  useEffect(() => {
    fetchMessages()
  }, [page])

  const fetchMessages = async () => {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await ApiService.getMessages(token, page, 10)
      console.log('Fetch messages response:', response)
      
      if (response.success) {
        // Backend menggunakan snake_case
        const messagesData = response.data || []
        setMessages(messagesData)
        setPagination(response.pagination || null)
      } else {
        showNotification('error', response.message || 'Failed to load messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      showNotification('error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    // Update local state dulu agar UI langsung berubah
    setMessages(prev => 
      prev.map(msg => 
        String(msg.id) === String(id) ? { ...msg, is_read: true } : msg
      )
    )
    if (selectedMessage && String(selectedMessage.id) === String(id)) {
      setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null)
    }

    // Kirim ke backend - PUT tanpa body
    try {
      const response = await ApiService.markAsRead(id, token)
      console.log('Mark as read response:', response)
      
      if (!response.success) {
        console.warn('Backend rejected mark as read:', response)
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      // UI sudah diupdate, backend akan sync nanti
    }
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    if (!confirm('Are you sure you want to delete this message?')) return

    setActionLoading(true)
    try {
      const response = await ApiService.deleteMessage(id, token)
      console.log('Delete response:', response)
      
      if (response.success) {
        setMessages(prev => prev.filter(msg => String(msg.id) !== String(id)))
        if (selectedMessage && String(selectedMessage.id) === String(id)) {
          setSelectedMessage(null)
        }
        showNotification('success', 'Message deleted successfully')
      } else {
        showNotification('error', response.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      showNotification('error', 'Failed to delete message')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReply = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token || !selectedMessage || !replyText.trim()) return

    setActionLoading(true)
    try {
      const response = await ApiService.replyToMessage(selectedMessage.id, replyText, token)
      console.log('Reply response:', response)
      
      if (response.success) {
        setShowReplyModal(false)
        setReplyText('')
        showNotification('success', 'Reply sent successfully!')
      } else {
        showNotification('error', response.message || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      showNotification('error', 'Failed to send reply. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !msg.is_read) || 
      (filter === 'read' && msg.is_read)
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && messages.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
              <button
                onClick={fetchMessages}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <FaEnvelope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !message.is_read ? 'border-l-4 border-indigo-600 dark:border-indigo-400' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.is_read) {
                    handleMarkAsRead(message.id)
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.is_read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                        {message.is_read ? (
                          <FaEnvelopeOpen className="text-gray-500 dark:text-gray-400" />
                        ) : (
                          <FaEnvelope className="text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {message.name}
                            {!message.is_read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{message.email}</p>
                        <p className="text-gray-900 dark:text-white font-medium mt-1">{message.subject}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessage(message)
                          setShowReplyModal(true)
                        }}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Reply"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(message.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                        disabled={actionLoading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* Message Detail Modal */}
        <AnimatePresence>
          {selectedMessage && !showReplyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="space-y-1">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">From:</span> {selectedMessage.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Email:</span> {selectedMessage.email}
                        </p>
                        {selectedMessage.phone && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Phone:</span> {selectedMessage.phone}
                          </p>
                        )}
                        <p className="text-gray-500 dark:text-gray-500 text-sm">
                          {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <FaTimes className="text-gray-500 dark:text-gray-400 text-xl" />
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <FaReply className="mr-2" />
                      Reply
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      disabled={actionLoading}
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReplyModal && selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
              onClick={() => setShowReplyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Reply to {selectedMessage.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedMessage.email}</p>
                    </div>
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <FaTimes className="text-gray-500 dark:text-gray-400 text-xl" />
                    </button>
                  </div>
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Original message:</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedMessage.message}</p>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Write your reply..."
                  />
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={handleReply}
                      disabled={actionLoading || !replyText.trim()}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}