'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Loader2, CheckCircle, XCircle, Mail, Building2, User, ArrowRight, Shield, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface InvitationData {
  id: string
  organization_id: string
  email: string
  expires_at: string
  status: string
  organization: {
    name: string
  }
  invited_by: {
    full_name: string
  }
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [signupError, setSignupError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
      validateToken(resolvedParams.token)
    }
    loadParams()
  }, [params])

  const validateToken = async (token: string) => {
    try {
      console.log('Validating token:', token)
      
      // Simplified query - just get the basic invitation data first
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('id, organization_id, email, expires_at, status, token, invited_by')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      console.log('Invitation query result:', { invitationData, invitationError })

      if (invitationError || !invitationData) {
        console.error('Invitation not found:', invitationError)
        setError('Invalid or expired invitation link')
        setLoading(false)
        return
      }

      // Now get organization and inviter details separately
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitationData.organization_id)
        .single()

      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitationData.invited_by)
        .single()

      // Check if invitation is expired
      if (new Date(invitationData.expires_at) < new Date()) {
        console.log('Invitation expired:', invitationData.expires_at)
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      // Combine the data
      const fullInvitationData = {
        ...invitationData,
        organization: orgData || { name: 'Unknown Organization' },
        invited_by: inviterData || { full_name: 'Unknown User' }
      }

      console.log('Invitation validated successfully:', fullInvitationData)
      setInvitation(fullInvitationData)
      setFullName(invitationData.email.split('@')[0]) // Pre-fill name from email
      setLoading(false)
    } catch (error) {
      console.error('Token validation error:', error)
      setError('Failed to validate invitation')
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    setProcessing(true)
    try {
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // User is logged in, check if they match the invitation email
        if (user.email !== invitation.email) {
          setError('This invitation is for a different email address. Please log out and sign in with the correct account.')
          setProcessing(false)
          return
        }

        // Update user's profile to join the organization
        await joinOrganization(user.id)
      } else {
        // Show signup form for new users
        setShowSignupForm(true)
        setProcessing(false)
      }
    } catch (error) {
      console.error('Accept invitation error:', error)
      setError('Failed to accept invitation')
      setProcessing(false)
    }
  }

  const handleSignupAndJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters')
      return
    }

    setProcessing(true)
    setSignupError(null)

    try {
      // Create user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: invitation!.email,
        password: password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (signUpError || !user) {
        throw signUpError || new Error('Failed to create user account')
      }

      // Create profile and join organization
      await joinOrganization(user.id)
    } catch (error) {
      console.error('Signup error:', error)
      setSignupError(error instanceof Error ? error.message : 'Failed to create account')
      setProcessing(false)
    }
  }

  const joinOrganization = async (userId: string) => {
    try {
      // Create profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: invitation!.email,
          full_name: fullName,
          organization_id: invitation!.organization_id,
          role: 'user', // Default role for invited users
          status: 'active', // Set status to active when they accept invitation
          onboarding_step: 'completed',
          profile_completion_percentage: 100
        })

      if (profileError) {
        throw profileError
      }

      // Mark invitation as accepted
      const { error: invitationError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted'
        })
        .eq('id', invitation!.id)

      if (invitationError) {
        console.error('Failed to update invitation status:', invitationError)
      }

      setSuccess(true)
      setProcessing(false)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Join organization error:', error)
      setError('Failed to join organization')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
        <div className="text-center">
          <div className="mb-6">
            <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={200} height={50} className="mx-auto" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating invitation...</h2>
            <p className="text-gray-600">Please wait while we verify your invitation link.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
        <div className="text-center">
          <div className="mb-6">
            <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={200} height={50} className="mx-auto" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
        <div className="text-center">
          <div className="mb-6">
            <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={200} height={50} className="mx-auto" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to {invitation?.organization.name}!</h2>
            <p className="text-gray-600 mb-6">You've successfully joined the organization. Redirecting to dashboard...</p>
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (showSignupForm) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
        <div className="text-center w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={200} height={50} className="mx-auto" />
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Join {invitation?.organization.name} on ScaleWize AI</p>
            </div>

            <form onSubmit={handleSignupAndJoin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={invitation?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>

              {signupError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {signupError}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Account & Join Organization
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
      <div className="text-center w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={200} height={50} className="mx-auto" />
        </div>

        {/* Invitation Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h2>
            <p className="text-gray-600">Join {invitation?.organization.name} on ScaleWize AI</p>
          </div>

          {/* Invitation Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{invitation?.email}</p>
                <p className="text-xs text-gray-500">Invited email address</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{invitation?.invited_by.full_name}</p>
                <p className="text-xs text-gray-500">Invited by</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{invitation?.organization.name}</p>
                <p className="text-xs text-gray-500">Organization</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcceptInvitation}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium"
            >
              I already have an account
            </Link>
          </div>

          {/* Expiration Notice */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This invitation expires on {new Date(invitation?.expires_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by ScaleWize AI - Simplifying AI for businesses
          </p>
        </div>
      </div>
    </div>
  )
}
