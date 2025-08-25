import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET() {
  try {
    // Create admin client to check settings
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Try to get auth settings (this might not work with service role, but worth trying)
    const { data: authSettings, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    })

    // Test organization creation directly
    const { data: orgTest, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: 'Test Organization',
        domain: 'test-org',
        subscription_status: 'trial',
        plan_type: 'starter',
        max_users: 50,
        max_chat_sessions: 1000,
        monthly_token_limit: 100000,
        librechat_config: {},
      })
      .select()
      .single()

    // Clean up test organization
    if (orgTest) {
      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', orgTest.id)
    }

    return NextResponse.json({
      success: true,
      authSettings: authSettings ? {
        users: authSettings.users.length,
        total: 'total' in authSettings ? authSettings.total : 'Unknown'
      } : null,
      authError: authError?.message,
      orgTest: orgTest ? 'Success' : null,
      orgError: orgError?.message,
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    })

  } catch (error) {
    console.error('Check Supabase settings error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
