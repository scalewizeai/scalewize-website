'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { 
  Shield, 
  Users, 
  Settings, 
  Mail, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  BarChart3,
  UserPlus,
  Key
} from 'lucide-react'

interface Invitation {
  id: string
  email: string
  status: string
  created_at: string
  expires_at: string
}

interface Member {
  id: string
  email: string
  full_name: string
  status: string
  role: string
  created_at: string
  last_activity_at: string
}

interface OrganizationSettings {
  name: string
  domain: string
  max_users: number
  max_chat_sessions: number
  monthly_token_limit: number
  plan_type: string
  subscription_status: string
}

export default function SettingsPage() {
  const { profile, organization } = useAuth()
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: '',
    domain: '',
    max_users: 50,
    max_chat_sessions: 1000,
    monthly_token_limit: 100000,
    plan_type: 'starter',
    subscription_status: 'trial'
  })

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadInvitations()
      loadMembers()
      loadOrganizationSettings()
    }
  }, [profile?.role])

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, status, role, created_at, last_activity_at')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const loadOrganizationSettings = async () => {
    if (!organization) return
    
    setOrgSettings({
      name: organization.name || '',
      domain: organization.domain || '',
      max_users: organization.max_users || 50,
      max_chat_sessions: organization.max_chat_sessions || 1000,
      monthly_token_limit: organization.monthly_token_limit || 100000,
      plan_type: organization.plan_type || 'starter',
      subscription_status: organization.subscription_status || 'trial'
    })
  }

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !organization?.id) return

    setSending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/invite-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          organizationId: organization.id,
          userId: profile?.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      setSuccess('Invitation sent successfully!')
      setEmail('')
      loadInvitations()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  const copyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId)

      if (error) throw error
      loadInvitations()
    } catch (error) {
      console.error('Error cancelling invitation:', error)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          organization_id: null,
          status: 'suspended'
        })
        .eq('id', memberId)

      if (error) throw error
      loadMembers()
      setSuccess('Member removed successfully')
    } catch (error) {
      setError('Failed to remove member')
    }
  }

  const updateOrganizationSettings = async () => {
    if (!organization?.id) return

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgSettings.name,
          max_users: orgSettings.max_users,
          max_chat_sessions: orgSettings.max_chat_sessions,
          monthly_token_limit: orgSettings.monthly_token_limit,
          plan_type: orgSettings.plan_type
        })
        .eq('id', organization.id)

      if (error) throw error
      
      setEditingSettings(false)
      setSuccess('Organization settings updated successfully')
      
      // Refresh organization data
      window.location.reload()
    } catch (error) {
      setError('Failed to update organization settings')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'accepted': return 'text-green-600 bg-green-100 border-green-200'
      case 'expired': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getProfileStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'active': return 'text-green-600 bg-green-100 border-green-200'
      case 'suspended': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              You don't have permission to access organization settings. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600">Manage your organization, members, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEditingSettings(!editingSettings)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingSettings ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editingSettings ? 'Cancel' : 'Edit Settings'}
          </button>
          {editingSettings && (
            <button
              onClick={updateOrganizationSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Organization Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Building2 className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            {editingSettings ? (
              <input
                type="text"
                value={orgSettings.name}
                onChange={(e) => setOrgSettings({...orgSettings, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{orgSettings.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
            <p className="text-gray-900">{orgSettings.domain || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {orgSettings.plan_type}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
            {editingSettings ? (
              <input
                type="number"
                value={orgSettings.max_users}
                onChange={(e) => setOrgSettings({...orgSettings, max_users: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{orgSettings.max_users}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Chat Sessions</label>
            {editingSettings ? (
              <input
                type="number"
                value={orgSettings.max_chat_sessions}
                onChange={(e) => setOrgSettings({...orgSettings, max_chat_sessions: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{orgSettings.max_chat_sessions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Token Limit</label>
            {editingSettings ? (
              <input
                type="number"
                value={orgSettings.monthly_token_limit}
                onChange={(e) => setOrgSettings({...orgSettings, monthly_token_limit: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{orgSettings.monthly_token_limit.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{members.filter(m => m.status === 'active').length}</p>
              <p className="text-xs text-gray-500">of {orgSettings.max_users} allowed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
              <p className="text-xs text-gray-500">of {orgSettings.max_chat_sessions} allowed</p>
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
              <p className="text-2xl font-semibold text-gray-900">0</p>
              <p className="text-xs text-gray-500">of {orgSettings.monthly_token_limit.toLocaleString()} allowed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Invitations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Invite New Members</h2>
          </div>
        </div>

        <form onSubmit={sendInvitation} className="flex space-x-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>

        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{invitation.email}</p>
                <p className="text-sm text-gray-500">
                  Sent {new Date(invitation.created_at).toLocaleDateString()} • 
                  Expires {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(invitation.status)}`}>
                  {invitation.status}
                </span>
                {invitation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => copyInviteLink(invitation.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Copy invite link"
                    >
                      {copiedToken === invitation.id ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-100"
                      title="Cancel invitation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Current Members</h2>
          </div>
          <span className="text-sm text-gray-500">{members.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.full_name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getProfileStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
