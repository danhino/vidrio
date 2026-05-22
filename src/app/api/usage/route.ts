import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserPlan } from '@/lib/auth'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ plan: 'anonymous', ai_calls_today: 0, limit: 0 })
  }

  const plan = await getUserPlan(userId)
  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('clerk_id', userId).single()

  if (!user) return NextResponse.json({ plan, ai_calls_today: 0, limit: 0 })

  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabaseAdmin
    .from('usage')
    .select('ai_calls_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const limit = plan === 'pro' ? Infinity : plan === 'basic' ? 50 : 0

  return NextResponse.json({
    plan,
    ai_calls_today: usage?.ai_calls_count ?? 0,
    limit,
  })
}
