'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaSearch, FaTimes } from 'react-icons/fa'

interface Message {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
  isRead: boolean
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+62 812-3456-7890',
      subject: 'Project Collaboration',
      message: 'Hi, I would like to discuss a potential project about building a web application for my company. We need a full-featured e-commerce platform with payment gateway integration and inventory management system. Please let me know if you are available for a consultation call next week.',
      createdAt: '2024-01-15T10:30:00',
      isRead: false
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+62 813-9876-5432',
      subject: 'Job Opportunity',
      message: 'We are looking for a senior developer to join our team. Your portfolio looks impressive and we think you would be a great fit for our company. We offer competitive salary and benefits.',
      createdAt: '2024-01-14T14:20:00',
      isRead: false
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+62 814-5555-7777',
      subject: 'Consultation Request',
      message: 'Need help with optimizing our existing application. We are experiencing performance issues and would love to schedule a consultation to discuss possible solutions.',
      createdAt: '2024-01-13T09:15:00',
      isRead: true
    }
  ])
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadCount = messages.filter(m => !m.isRead).length

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      )
    )
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, isRead: true })
    }
  }

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
    if (selectedMessage?.id === id) {
      setSelectedMessage(null)
    }
  }

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      // Here you would send the reply via email
      console.log(`Replying to ${selectedMessage.email}: ${replyText}`)
      const mailtoLink = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}&body=${encodeURIComponent(replyText)}`
      window.location.href = mailtoLink
      setShowReplyModal(false)
      setReplyText('')
      handleMarkAsRead(selectedMessage.id)
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !msg.isRead) || 
      (filter === 'read' && msg.isRead)
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
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
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                !message.isRead ? 'border-l-4 border-indigo-600 dark:border-indigo-400' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message)
                handleMarkAsRead(message.id)
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30'
                    }`}>
                      {message.isRead ? (
                        <FaEnvelopeOpen className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <FaEnvelope className="text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {message.name}
                          {!message.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleDateString()}
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
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
                          {new Date(selectedMessage.createdAt).toLocaleString()}
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
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Send Reply
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