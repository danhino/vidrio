'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Lock, Link, Clock, HardDrive, Cloud, Save } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { NoteTab } from '@/store/editorStore'
import { encryptNote } from '@/lib/crypto'

type ExpireOption = '1h' | '1d' | '7d' | '30d' | 'never'

interface SaveDialogProps {
  tab: NoteTab
  plan: string
  onClose: () => void
  onSaved: (updates: Partial<NoteTab>) => void
}

const EXPIRE_OPTIONS: { value: ExpireOption; label: string; requiresBasic?: boolean }[] = [
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'never', label: 'Never', requiresBasic: true },
]

function expireToDate(value: ExpireOption): string | null {
  if (value === 'never') return null
  const ms = { '1h': 3600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }[value]
  return ms ? new Date(Date.now() + ms).toISOString() : null
}

export function SaveDialog({ tab, plan, onClose, onSaved }: SaveDialogProps) {
  const { getToken, userId } = useAuth()
  const [saveType, setSaveType] = useState<'local' | 'cloud' | 'drive' | 'dropbox'>('local')
  const [expire, setExpire] = useState<ExpireOption>('7d')
  const [isShared, setIsShared] = useState(false)
  const [passwordEnabled, setPasswordEnabled] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [title, setTitle] = useState(tab.title)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shareLink, setShareLink] = useState('')

  const isAnonymous = plan === 'anonymous'
  const isFree = plan === 'free'
  const isBasicPlus = plan === 'basic' || plan === 'pro'
  const isProPlus = plan === 'pro'

  async function handleSave() {
    setError('')
    if (passwordEnabled && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)

    try {
      if (saveType === 'local') {
        const existing = JSON.parse(localStorage.getItem('vidrio-notes') ?? '[]') as NoteTab[]
        const updated = existing.filter(n => n.id !== tab.id)
        updated.unshift({ ...tab, title, content: tab.content, isDirty: false, savedAt: new Date().toISOString() })
        localStorage.setItem('vidrio-notes', JSON.stringify(updated.slice(0, 50)))
        onSaved({ title })
        return
      }

      if (saveType === 'cloud') {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')

        const encKey = userId ?? 'anonymous'
        const encrypted = await encryptNote(tab.content, encKey)

        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: tab.id,
            title,
            encrypted_content: encrypted,
            format: tab.format,
            expires_at: expireToDate(expire),
            is_shared: isShared,
            password: passwordEnabled ? password : undefined,
          }),
        })

        if (!res.ok) throw new Error('Save failed')
        const data = await res.json()

        if (isShared && data.share_token) {
          setShareLink(`${window.location.origin}/note/${data.share_token}`)
        }

        onSaved({ title })
        return
      }

      // Google Drive / Dropbox: placeholder
      onSaved({ title })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--border)' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Save note</h2>
          <button onClick={onClose} className="hover:opacity-60" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'var(--editor-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Save type tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--toolbar-bg)' }}>
            <SaveTypeBtn active={saveType === 'local'} onClick={() => setSaveType('local')} icon={<Save className="w-3.5 h-3.5" />} label="Local" />
            {!isAnonymous && (
              <SaveTypeBtn active={saveType === 'cloud'} onClick={() => setSaveType('cloud')} icon={<Cloud className="w-3.5 h-3.5" />} label="Vidrio cloud" />
            )}
            {isBasicPlus && (
              <SaveTypeBtn active={saveType === 'drive'} onClick={() => setSaveType('drive')} icon={<HardDrive className="w-3.5 h-3.5" />} label="Drive" />
            )}
            {isProPlus && (
              <SaveTypeBtn active={saveType === 'dropbox'} onClick={() => setSaveType('dropbox')} icon={<HardDrive className="w-3.5 h-3.5" />} label="Dropbox" />
            )}
          </div>

          {isAnonymous && saveType === 'local' && (
            <div className="text-xs p-3 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <a href="/sign-up" className="underline" style={{ color: 'var(--accent)' }}>Sign up free</a> to save notes to the cloud and share them.
            </div>
          )}

          {/* Cloud options */}
          {saveType === 'cloud' && (
            <div className="space-y-3">
              {/* Auto-expire */}
              <div>
                <label className="flex items-center gap-1.5 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3.5 h-3.5" /> Auto-expire
                </label>
                <div className="flex gap-1 flex-wrap">
                  {EXPIRE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (opt.requiresBasic && !isBasicPlus) return
                        setExpire(opt.value)
                      }}
                      disabled={opt.requiresBasic && !isBasicPlus}
                      className="px-2.5 py-1 rounded text-xs border transition-colors disabled:opacity-40"
                      style={{
                        background: expire === opt.value ? 'var(--accent)' : 'var(--btn-bg)',
                        borderColor: expire === opt.value ? 'var(--accent)' : 'var(--border)',
                        color: expire === opt.value ? 'var(--titlebar-bg)' : 'var(--text-secondary)',
                      }}
                    >
                      {opt.label}{opt.requiresBasic && !isBasicPlus ? ' (Basic+)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shareable link */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={e => setIsShared(e.target.checked)}
                  className="rounded accent-[#89B4FA]"
                />
                <Link className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text)' }}>Create shareable link</span>
              </label>

              {/* Password protect */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passwordEnabled}
                  onChange={e => setPasswordEnabled(e.target.checked)}
                  className="rounded accent-[#89B4FA]"
                />
                <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text)' }}>Password protect</span>
              </label>

              {passwordEnabled && (
                <div className="space-y-2 pl-6">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm"
                    style={{ background: 'var(--editor-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm"
                    style={{ background: 'var(--editor-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              )}

              {!isBasicPlus && (
                <div className="text-xs p-3 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <a href="/pricing" className="underline" style={{ color: 'var(--accent)' }}>Upgrade to Basic</a> for Google Drive sync and never-expire notes.
                </div>
              )}
            </div>
          )}

          {shareLink && (
            <div className="p-3 rounded-lg border text-xs break-all" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
              {shareLink}
            </div>
          )}

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--titlebar-bg)' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SaveTypeBtn({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium flex-1 justify-center transition-colors"
      style={{
        background: active ? 'var(--tab-selected-bg)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-secondary)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
