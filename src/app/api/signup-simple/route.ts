import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, organizationName, organizationSlug } = await request.json()
    
    // Validate input
    if (!email || !password || !fullName || !organizationName || !organizationSlug) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => cookieStore })

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName,
          organization_slug: organizationSlug,
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // If user is immediately authenticated, create organization and profile
    if (authData.session) {
      try {
        // Create organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName,
            domain: organizationSlug,
            subscription_status: 'trial',
            plan_type: 'starter',
            max_users: 50,
            max_chat_sessions: 1000,
            monthly_token_limit: 100000,
            librechat_config: {},
          })
          .select()
          .single()

        if (orgError) {
          console.error('Organization creation error:', orgError)
          return NextResponse.json(
            { error: 'Failed to create organization: ' + orgError.message },
            { status: 500 }
          )
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            organization_id: orgData.id,
            role: 'admin',
            is_active: true,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          return NextResponse.json(
            { error: 'Failed to create user profile: ' + profileError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Account created successfully',
          user: authData.user,
          organization: orgData,
          requiresEmailConfirmation: false
        })
      } catch (error) {
        console.error('Database operation error:', error)
        return NextResponse.json(
          { error: 'Failed to complete account setup' },
          { status: 500 }
        )
      }
    } else {
      // Email confirmation required
      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your account before continuing.',
        user: authData.user,
        requiresEmailConfirmation: true
      })
    }

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
