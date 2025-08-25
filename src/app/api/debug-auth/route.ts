import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: async () => cookieStore 
    })

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Test organization creation with current user
    let orgTest = null
    if (session?.user) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
      
      orgTest = { data, error: error?.message }
    }

    return NextResponse.json({
      success: true,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          created_at: session.user.created_at
        },
        expires_at: session.expires_at
      } : null,
      sessionError: sessionError?.message,
      orgTest,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
