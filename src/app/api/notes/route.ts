import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: notes } = await supabaseAdmin
    .from('notes')
    .select('id, title, format, created_at, updated_at, expires_at, is_shared, share_token')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ notes })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, title, encrypted_content, format, expires_at, is_shared, password } = body

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const password_hash = password
    ? createHash('sha256').update(password).digest('hex')
    : null

  const noteData = {
    user_id: user.id,
    title: title ?? 'Untitled',
    encrypted_content: encrypted_content ?? '',
    format: format ?? 'plain',
    expires_at: expires_at ?? null,
    is_shared: is_shared ?? false,
    password_hash,
    size_bytes: Buffer.byteLength(encrypted_content ?? '', 'utf8'),
    updated_at: new Date().toISOString(),
  }

  // Upsert by id if provided
  let data, error
  if (id) {
    ;({ data, error } = await supabaseAdmin
      .from('notes')
      .update(noteData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, share_token')
      .single())
  } else {
    ;({ data, error } = await supabaseAdmin
      .from('notes')
      .insert(noteData)
      .select('id, share_token')
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const noteId = searchParams.get('id')
  if (!noteId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await supabaseAdmin.from('notes').delete().eq('id', noteId).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
