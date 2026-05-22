import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const password = searchParams.get('password')

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .select('id, title, encrypted_content, format, is_shared, password_hash, expires_at')
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (error || !note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.expires_at && new Date(note.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Note expired' }, { status: 410 })
  }

  if (note.password_hash) {
    if (!password) {
      // Return metadata only — client will show password prompt
      return NextResponse.json({
        id: note.id,
        title: note.title,
        format: note.format,
        is_shared: note.is_shared,
        password_hash: note.password_hash,
        expires_at: note.expires_at,
        encrypted_content: '',
      })
    }

    const hash = createHash('sha256').update(password).digest('hex')
    if (hash !== note.password_hash) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    }

    // Return with decrypt key derived from password
    return NextResponse.json({
      ...note,
      decrypt_key: password,
    })
  }

  return NextResponse.json({
    ...note,
    decrypt_key: 'shared-note-key',
  })
}
