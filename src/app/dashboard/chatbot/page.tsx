'use client'

import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Bot, Settings } from 'lucide-react'

export default function ChatbotPage() {
  const { profile, organization } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
        <p className="text-gray-600">Your organization's intelligent AI assistant</p>
      </div>

      {/* Chat Interface Placeholder */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-96 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{organization?.name || 'Organization'} AI Assistant</h3>
              <p className="text-sm text-gray-500">Powered by ScaleWize AI</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 max-w-md">
                <p className="text-gray-900">
                  Hello! I'm your AI assistant. I can help you with questions about your organization, 
                  provide insights, and assist with various tasks. How can I help you today?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Advanced Features Coming Soon</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We're working on advanced chatbot features including knowledge base integration, 
          custom training, and analytics. Stay tuned for updates!
        </p>
      </div>
    </div>
  )
} 