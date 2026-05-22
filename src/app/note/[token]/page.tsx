'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Eye, Lock, Clock } from 'lucide-react'
import { decryptNote } from '@/lib/crypto'

const Editor = dynamic(() => import('@/components/Editor').then(m => ({ default: m.Editor })), { ssr: false })

interface Note {
  id: string
  title: string
  encrypted_content: string
  format: string
  is_shared: boolean
  password_hash: string | null
  expires_at: string | null
}

type PageState = 'loading' | 'expired' | 'password' | 'ready' | 'error'

export default function SharedNotePage({ params }: { params: { token: string } }) {
  const [state, setState] = useState<PageState>('loading')
  const [note, setNote] = useState<Note | null>(null)
  const [content, setContent] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const loadNote = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes/shared?token=${params.token}`)
      if (res.status === 404) { setState('expired'); return }
      if (!res.ok) { setState('error'); return }

      const data: Note = await res.json()

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setState('expired')
        return
      }

      setNote(data)

      if (data.password_hash) {
        setState('password')
        return
      }

      // Decrypt with empty password (no password protection)
      try {
        const plaintext = await decryptNote(data.encrypted_content, 'shared-note-key')
        setContent(plaintext)
        setState('ready')
      } catch {
        // Content might be unencrypted for anonymous shares
        setContent(data.encrypted_content)
        setState('ready')
      }
    } catch {
      setState('error')
    }
  }, [params.token])

  useEffect(() => { loadNote() }, [loadNote])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note) return
    setPasswordError('')

    try {
      const res = await fetch(`/api/notes/shared?token=${params.token}&password=${encodeURIComponent(password)}`)
      if (res.status === 401) { setPasswordError('Wrong password'); return }
      const data = await res.json()
      const plaintext = await decryptNote(data.encrypted_content, data.decrypt_key)
      setContent(plaintext)
      setState('ready')
    } catch {
      setPasswordError('Could not decrypt note')
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 rounded-full border-2 border-[#89B4FA] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0a0f] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F38BA8]/10 border border-[#F38BA8]/30 flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#F38BA8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">This note has expired</h1>
          <p className="text-[#A6ADC8]">The note you&apos;re looking for is no longer available.</p>
        </div>
        <Link href="/app" className="px-6 py-3 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] font-semibold transition-all hover:scale-105">
          Create your own note
        </Link>
      </div>
    )
  }

  if (state === 'password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0a0f] px-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#89B4FA]/10 border border-[#89B4FA]/30 flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#89B4FA]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white text-center mb-1">{note?.title ?? 'Protected note'}</h1>
          <p className="text-[#A6ADC8] text-sm text-center mb-6">Enter the password to view this note.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-lg border bg-[#2A2A3E] border-[#45475A] text-white text-sm"
              autoFocus
            />
            {passwordError && <p className="text-sm text-[#F38BA8]">{passwordError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] font-semibold text-sm transition-all"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-center px-6">
        <h1 className="text-2xl font-bold text-white">Note not found</h1>
        <p className="text-[#A6ADC8]">This link may be invalid or the note has been deleted.</p>
        <Link href="/app" className="px-6 py-3 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] font-semibold transition-all hover:scale-105">
          Create your own note
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1E1E2E]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#45475A] flex items-center gap-3" style={{ background: '#16161E' }}>
        <div className="w-6 h-6 rounded bg-[#89B4FA]/20 border border-[#89B4FA]/40 flex items-center justify-center">
          <Eye className="w-3.5 h-3.5 text-[#89B4FA]" />
        </div>
        <span className="text-[#CDD6F4] font-medium">{note?.title ?? 'Shared note'}</span>
        <span className="text-xs text-[#A6ADC8] ml-auto">{note?.format}</span>
      </div>

      {/* Editor (read-only) */}
      <div className="flex-1 overflow-hidden">
        <Editor
          content={content}
          onChange={() => {}}
          format={note?.format ?? 'plain'}
          font="Segoe UI"
          fontSize={14}
          theme="dark"
          readOnly
        />
      </div>

      {/* Footer branding */}
      <div className="px-6 py-4 border-t border-[#45475A] flex items-center justify-between" style={{ background: '#16161E' }}>
        <p className="text-xs text-[#A6ADC8]">
          Created with{' '}
          <Link href="/" className="text-[#89B4FA] hover:underline">Vidrio</Link>
        </p>
        <Link
          href="/app"
          className="px-4 py-1.5 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] text-xs font-semibold transition-all hover:scale-105"
        >
          Create your own note
        </Link>
      </div>
    </div>
  )
}
