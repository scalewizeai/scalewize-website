'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Users, MessageSquare, TrendingUp, Target } from 'lucide-react'

export default function LinkedInPage() {
  const { profile, organization } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Sales</h1>
        <p className="text-gray-600">Automate your LinkedIn outreach and lead generation</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-semibold text-gray-900">247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages Sent</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-semibold text-gray-900">23%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Create Campaign
          </button>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Tech Startup Outreach</h3>
                <p className="text-sm text-gray-500">Targeting CTOs and Engineering Managers</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
                <span className="text-sm text-gray-500">156 leads • 23% response</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Enterprise Sales</h3>
                <p className="text-sm text-gray-500">Targeting VP Sales and Sales Directors</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  Paused
                </span>
                <span className="text-sm text-gray-500">89 leads • 18% response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sarah Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">TechCorp Inc</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">CTO</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Connected</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 days ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Mike Chen</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">StartupXYZ</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering Manager</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 week ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Advanced LinkedIn Features Coming Soon</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We're working on advanced LinkedIn automation including AI-powered messaging, 
          lead scoring, and comprehensive analytics. Stay tuned for updates!
        </p>
      </div>
    </div>
  )
} 