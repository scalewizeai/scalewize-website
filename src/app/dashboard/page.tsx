'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { 
  Users, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Building2,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  pendingInvitations: number
  chatSessions: number
  tokenUsage: number
  tokenLimit: number
}

export default function DashboardPage() {
  const { profile, organization } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvitations: 0,
    chatSessions: 0,
    tokenUsage: 0,
    tokenLimit: 100000
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization?.id) {
      loadDashboardStats()
    }
  }, [organization?.id])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)

      // Load members count
      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id)

      // Load active members count
      const { count: activeMembersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id)
        .eq('status', 'active')

      // Load pending invitations count
      const { count: invitationsCount } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id)
        .eq('status', 'pending')

      // Load chat sessions count (placeholder for now)
      const chatSessionsCount = 0

      // Load token usage (placeholder for now)
      const tokenUsageCount = 0

      setStats({
        totalMembers: membersCount || 0,
        activeMembers: activeMembersCount || 0,
        pendingInvitations: invitationsCount || 0,
        chatSessions: chatSessionsCount,
        tokenUsage: tokenUsageCount,
        tokenLimit: organization?.monthly_token_limit || 100000
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'text-green-600 bg-green-100'
    if (percentage < 90) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name || 'Admin'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your organization and monitor performance
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{organization?.name}</div>
            <div className="text-blue-100 capitalize">{organization?.plan_type} Plan</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {profile?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/dashboard/settings" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Organization Settings</h3>
                  <p className="text-sm text-gray-600">Manage members and limits</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link 
            href="/dashboard/settings" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Invite Members</h3>
                  <p className="text-sm text-gray-600">Grow your team</p>
                </div>
              </div>
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link 
            href="/dashboard/analytics" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600">Track performance</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              <p className="text-xs text-gray-500">of {organization?.max_users || 50} allowed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.chatSessions}</p>
              <p className="text-xs text-gray-500">of {organization?.max_chat_sessions || 1000} allowed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Token Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.tokenUsage.toLocaleString()}</p>
              <p className="text-xs text-gray-500">of {stats.tokenLimit.toLocaleString()} allowed</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(stats.tokenUsage, stats.tokenLimit)).split(' ')[1]}`}
                style={{ width: `${getUsagePercentage(stats.tokenUsage, stats.tokenLimit)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingInvitations}</p>
              <p className="text-xs text-gray-500">awaiting response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="space-y-4">
        {stats.totalMembers >= (organization?.max_users || 50) * 0.9 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Approaching User Limit</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You're at {Math.round((stats.totalMembers / (organization?.max_users || 50)) * 100)}% of your user limit. 
                  Consider upgrading your plan or removing inactive members.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.pendingInvitations > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Pending Invitations</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You have {stats.pendingInvitations} pending invitation{stats.pendingInvitations > 1 ? 's' : ''}. 
                  <Link href="/dashboard/settings" className="text-blue-800 font-medium hover:underline ml-1">
                    Manage invitations →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {getUsagePercentage(stats.tokenUsage, stats.tokenLimit) > 80 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">High Token Usage</h3>
                <p className="text-sm text-red-700 mt-1">
                  You're at {Math.round(getUsagePercentage(stats.tokenUsage, stats.tokenLimit))}% of your monthly token limit. 
                  Consider upgrading your plan or monitoring usage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">
              Activity will appear here as your team uses the platform
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/chatbot" 
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">AI Chatbot</span>
          </Link>

          <Link 
            href="/dashboard/linkedin" 
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">LinkedIn Sales</span>
          </Link>

          <Link 
            href="/dashboard/analytics" 
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </Link>

          <Link 
            href="/dashboard/settings" 
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}


