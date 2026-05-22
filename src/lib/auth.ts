import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from './supabase'

export type Plan = 'anonymous' | 'free' | 'basic' | 'pro'

export interface UserWithPlan {
  clerkId: string
  email: string
  name: string | null
  avatarUrl: string | null
  plan: Plan
  supabaseUserId: string | null
}

export async function getCurrentUserWithPlan(): Promise<UserWithPlan | null> {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!dbUser) {
    return {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: clerkUser.fullName,
      avatarUrl: clerkUser.imageUrl,
      plan: 'free',
      supabaseUserId: null,
    }
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', dbUser.id)
    .single()

  const plan = resolvePlan(subscription?.plan, subscription?.status)

  return {
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
    name: clerkUser.fullName,
    avatarUrl: clerkUser.imageUrl,
    plan,
    supabaseUserId: dbUser.id,
  }
}

function resolvePlan(
  plan: string | undefined | null,
  status: string | undefined | null
): Plan {
  if (!plan || plan === 'free') return 'free'
  if (status === 'active' || status === 'trialing') {
    if (plan === 'basic') return 'basic'
    if (plan === 'pro') return 'pro'
  }
  return 'free'
}

export async function getUserPlan(clerkId: string): Promise<Plan> {
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()

  if (!dbUser) return 'free'

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', dbUser.id)
    .single()

  return resolvePlan(subscription?.plan, subscription?.status)
}
