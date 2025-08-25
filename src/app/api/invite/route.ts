import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId } = await request.json()
    
    // Validate input
    if (!email || !organizationId) {
      return NextResponse.json(
        { error: 'Email and organization ID are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Fix for Next.js 15: await cookies() before using
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => cookieStore })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin of the organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('organization_id', organizationId)
      .in('role', ['admin', 'super_admin'])
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'You must be an admin to invite users' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    // Check if invitation already exists and is pending
    const { data: existingInvitation } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Invitation creation error:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Get organization details for email
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    // Send invitation email (you'll need to implement this)
    // For now, we'll just return the invitation data
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    // TODO: Implement email sending
    // await sendInvitationEmail(email, inviteUrl, organization?.name, profile.full_name)

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: invitation.id,
        email: invitation.email,
        expires_at: invitation.expires_at,
        invite_url: inviteUrl
      }
    })

  } catch (error) {
    console.error('Invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate limiting middleware (basic implementation)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 10 // 10 invites per hour

  const userLimit = rateLimit.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(userId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}
