import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserPlan } from '@/lib/auth'
import { getPrompt, getFormatPrompt, AIAction } from '@/lib/ai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await getUserPlan(userId)

  if (plan === 'anonymous' || plan === 'free') {
    return NextResponse.json({ error: 'AI tools require a Basic or Pro plan' }, { status: 403 })
  }

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check daily limit for Basic
  if (plan === 'basic') {
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabaseAdmin
      .from('usage').select('ai_calls_count').eq('user_id', user.id).eq('date', today).single()

    if ((usage?.ai_calls_count ?? 0) >= 50) {
      return NextResponse.json({ error: 'Daily AI limit reached (50 calls). Upgrade to Pro for unlimited.' }, { status: 429 })
    }
  }

  const { action, content, format, model: reqModel, customKey, compareWith } = await req.json()

  // Determine which model to use
  let model = 'claude-haiku-4-5-20251001'
  if (plan === 'pro') {
    model = reqModel ?? 'claude-haiku-4-5-20251001'
  }

  // Build prompt
  const systemPrompt = action === 'apply'
    ? getFormatPrompt(format ?? 'plain')
    : getPrompt(action as AIAction)

  const userContent = action === 'compare'
    ? `Original:\n${content}\n\nRevised:\n${compareWith}`
    : content

  try {
    // Use custom key if Pro user supplied one
    const client = (plan === 'pro' && customKey)
      ? new Anthropic({ apiKey: customKey })
      : anthropic

    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })

    const result = response.content[0].type === 'text' ? response.content[0].text : ''

    // Increment usage counter
    const today = new Date().toISOString().split('T')[0]
    await supabaseAdmin.rpc('increment_ai_usage', { p_user_id: user.id, p_date: today })
      .then(() => {}) // fire and forget

    return NextResponse.json({ result })
  } catch (e) {
    console.error('AI error:', e)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
