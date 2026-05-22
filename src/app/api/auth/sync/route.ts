import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address ?? ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({ clerk_id: id, email, name, avatar_url: image_url ?? null })
      .select('id')
      .single()

    if (userError || !user) {
      console.error('Failed to create user:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    await supabaseAdmin.from('subscriptions').insert({ user_id: user.id })
    await supabaseAdmin.from('settings').insert({ user_id: user.id })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await supabaseAdmin
      .from('users')
      .update({
        email: email_addresses[0]?.email_address ?? '',
        name: [first_name, last_name].filter(Boolean).join(' ') || null,
        avatar_url: image_url ?? null,
      })
      .eq('clerk_id', id)
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      await supabaseAdmin.from('users').delete().eq('clerk_id', id)
    }
  }

  return NextResponse.json({ success: true })
}
