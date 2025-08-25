import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId } = await request.json()
    
    // Fix for Next.js 15: await cookies() before using
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => cookieStore })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Check if user is admin of the organization
    let profile = null
    let profileError = null
    
    if (user) {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('organization_id', organizationId)
        .in('role', ['admin', 'super_admin'])
        .single()
      
      profile = profileData
      profileError = profileErr
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: user ? {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at
        } : null,
        session: session ? {
          access_token: session.access_token ? 'present' : 'missing',
          refresh_token: session.refresh_token ? 'present' : 'missing',
          expires_at: session.expires_at
        } : null,
        profile: profile ? {
          id: profile.id,
          role: profile.role,
          organization_id: profile.organization_id
        } : null,
        errors: {
          authError: authError?.message,
          sessionError: sessionError?.message,
          profileError: profileError?.message
        },
        cookies: {
          hasAuthCookie: !!cookieStore.get('sb-mtybaactacapokejmtxy-auth-token'),
          authCookieValue: cookieStore.get('sb-mtybaactacapokejmtxy-auth-token')?.value?.substring(0, 50) + '...'
        }
      }
    })

  } catch (error) {
    console.error('Debug invite error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
