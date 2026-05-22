'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Eye, EyeOff, Save, Settings, ChevronDown,
  Columns2, Rows2, Grid2x2, Layout, Wand2, Trash2,
  PanelLeft, ExternalLink,
} from 'lucide-react'
import { useEditorStore, NoteTab, Layout as LayoutType, Theme } from '@/store/editorStore'
import { useTransparency } from '@/hooks/useTransparency'
import { FORMAT_LABELS, Format } from '@/utils/languageMap'

const Editor = dynamic(() => import('@/components/Editor').then(m => ({ default: m.Editor })), {
  ssr: false,
  loading: () => <div className="flex-1 bg-[var(--editor-bg)]" />,
})

const SaveDialog = dynamic(() => import('@/components/SaveDialog').then(m => ({ default: m.SaveDialog })), {
  ssr: false,
})

// ── AI actions ────────────────────────────────────────────────────────────────

const AI_ACTIONS = [
  { id: 'spellcheck', label: 'Spell check' },
  { id: 'polish', label: 'Polish' },
  { id: 'rephrase', label: 'Rephrase' },
  { id: 'fix', label: 'Fix code' },
  { id: 'suggest', label: 'Suggest' },
]

// ── Plan resolution ───────────────────────────────────────────────────────────

function usePlan(): string {
  const { user } = useUser()
  const [plan, setPlan] = useState<string>('anonymous')

  useEffect(() => {
    if (!user) { setPlan('anonymous'); return }
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => setPlan(d.plan ?? 'free'))
      .catch(() => setPlan('free'))
  }, [user])

  return plan
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UpgradeBanner({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#89B4FA] text-[#1E1E2E] text-sm font-medium shadow-xl"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
    >
      Upgrade to Basic for full transparency — $2.99/month
      <a href="/pricing" className="underline">Upgrade</a>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </motion.div>
  )
}

function SignUpBanner({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#313244] border border-[#89B4FA]/40 text-white text-sm shadow-xl"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
    >
      Sign up free to unlock more transparency time
      <a href="/sign-up" className="text-[#89B4FA] underline">Sign up</a>
      <button onClick={onClose} className="ml-2 hover:opacity-70 text-[#A6ADC8]"><X className="w-4 h-4" /></button>
    </motion.div>
  )
}

function TabBar({ plan }: { plan: string }) {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useEditorStore()
  const maxTabs = plan === 'basic' || plan === 'pro' ? 8 : 1

  return (
    <div
      className="flex items-center overflow-x-auto border-b"
      style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border)' }}
    >
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="flex items-center gap-2 px-4 py-2 text-sm border-r min-w-0 shrink-0 transition-colors"
          style={{
            background: activeTabId === tab.id ? 'var(--tab-selected-bg)' : 'var(--tab-bg)',
            borderColor: 'var(--border)',
            color: activeTabId === tab.id ? 'var(--text)' : 'var(--text-secondary)',
          }}
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          <span className="truncate max-w-[120px]">{tab.title}</span>
          {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-[#89B4FA] shrink-0" />}
          {tabs.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); removeTab(tab.id) }}
              className="hover:opacity-60 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </motion.button>
      ))}
      {tabs.length < maxTabs ? (
        <button
          onClick={addTab}
          className="px-3 py-2 hover:opacity-70 shrink-0 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          title="New tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {plan === 'anonymous' || plan === 'free' ? 'Upgrade for more tabs' : '8 max'}
        </div>
      )}
    </div>
  )
}

function Toolbar({ plan, onSave }: { plan: string; onSave: () => void }) {
  const { tabs, activeTabId, updateTab, layout, setLayout, theme, setTheme, font, setFont, fontSize, setFontSize, workspacePanelOpen, setWorkspacePanelOpen } = useEditorStore()
  const { opacity, handleOpacityChange } = useTransparency(plan)
  const activeTab = tabs.find(t => t.id === activeTabId)

  const THEMES: Theme[] = ['dark', 'light', 'blue', 'sepia', 'green', 'glass']
  const LAYOUTS: { value: LayoutType; icon: React.ReactNode; label: string }[] = [
    { value: 'single', icon: <Layout className="w-3.5 h-3.5" />, label: 'Single' },
    { value: 'side-by-side', icon: <Columns2 className="w-3.5 h-3.5" />, label: 'Side by side' },
    { value: 'top-bottom', icon: <Rows2 className="w-3.5 h-3.5" />, label: 'Top/bottom' },
    { value: '2x2', icon: <Grid2x2 className="w-3.5 h-3.5" />, label: '2x2' },
  ]

  async function handlePiP() {
    if (!('documentPictureInPicture' in window)) return
    try {
      const pip = await (window as unknown as { documentPictureInPicture: { requestWindow: (o: object) => Promise<Window> } })
        .documentPictureInPicture.requestWindow({ width: 640, height: 480 })
      pip.document.body.style.cssText = 'margin:0;background:#1E1E2E;color:#CDD6F4;font-family:sans-serif;padding:16px;'
      pip.document.body.innerHTML = `<pre style="white-space:pre-wrap;font-size:14px;">${activeTab?.content ?? ''}</pre>`
    } catch { /* user cancelled */ }
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto"
      style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Workspace panel toggle */}
      <button
        onClick={() => setWorkspacePanelOpen(!workspacePanelOpen)}
        className="p-1.5 rounded hover:opacity-70 transition-opacity hidden md:flex"
        style={{ color: 'var(--text-secondary)' }}
        title="Workspace panel"
      >
        <PanelLeft className="w-4 h-4" />
      </button>

      <div className="w-px h-4 shrink-0" style={{ background: 'var(--border)' }} />

      {/* Format selector */}
      {activeTab && (
        <select
          value={activeTab.format}
          onChange={e => updateTab(activeTab.id, { format: e.target.value, isDirty: true })}
          className="text-xs px-2 py-1 rounded border appearance-none cursor-pointer"
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          {Object.entries(FORMAT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      )}

      {/* Layout selector (Basic+) */}
      {(plan === 'basic' || plan === 'pro') && (
        <div className="flex items-center gap-0.5 rounded border p-0.5" style={{ borderColor: 'var(--border)' }}>
          {LAYOUTS.map(l => (
            <button
              key={l.value}
              onClick={() => setLayout(l.value)}
              title={l.label}
              className="p-1 rounded transition-colors"
              style={{
                background: layout === l.value ? 'var(--tab-selected-bg)' : 'transparent',
                color: layout === l.value ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {l.icon}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Opacity slider */}
      <div className="flex items-center gap-2 shrink-0">
        <Eye className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <input
          type="range"
          min={10}
          max={100}
          value={opacity}
          onChange={e => handleOpacityChange(Number(e.target.value))}
          className="w-24 accent-[#89B4FA]"
          title={`Opacity ${opacity}%`}
        />
        <span className="text-xs w-8" style={{ color: 'var(--text-secondary)' }}>{opacity}%</span>
      </div>

      {/* PiP (Pro only) */}
      {plan === 'pro' && (
        <button
          onClick={handlePiP}
          className="p-1.5 rounded hover:opacity-70 transition-opacity hidden md:flex"
          style={{ color: 'var(--text-secondary)' }}
          title="Picture-in-Picture"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      )}

      {/* Theme selector */}
      <select
        value={theme}
        onChange={e => setTheme(e.target.value as Theme)}
        className="text-xs px-2 py-1 rounded border appearance-none cursor-pointer"
        style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        {THEMES.map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>

      {/* Font size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setFontSize(Math.max(10, fontSize - 1))}
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ background: 'var(--btn-bg)', color: 'var(--text)' }}
        >A-</button>
        <span className="text-xs w-6 text-center" style={{ color: 'var(--text-secondary)' }}>{fontSize}</span>
        <button
          onClick={() => setFontSize(Math.min(28, fontSize + 1))}
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ background: 'var(--btn-bg)', color: 'var(--text)' }}
        >A+</button>
      </div>

      {/* Save */}
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all hover:scale-105"
        style={{ background: 'var(--accent)', color: 'var(--titlebar-bg)' }}
      >
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Save</span>
      </button>
    </div>
  )
}

function AIToolbar({ plan, tabId }: { plan: string; tabId: string }) {
  const { tabs, updateTab } = useEditorStore()
  const [loading, setLoading] = useState<string | null>(null)
  const activeTab = tabs.find(t => t.id === tabId)

  const canUseAI = plan === 'basic' || plan === 'pro'

  async function runAI(action: string) {
    if (!canUseAI || !activeTab?.content) return
    setLoading(action)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: activeTab.content, format: activeTab.format }),
      })
      const data = await res.json()
      if (data.result) {
        updateTab(tabId, { content: data.result, isDirty: true })
      }
    } catch { /* silent */ }
    setLoading(null)
  }

  if (!canUseAI) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--toolbar-bg)' }}>
        <Wand2 className="w-3.5 h-3.5" />
        <span>AI tools — <a href="/pricing" className="underline" style={{ color: 'var(--accent)' }}>Upgrade to Basic</a></span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--toolbar-bg)' }}>
      <Wand2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
      {AI_ACTIONS.map(a => (
        <button
          key={a.id}
          onClick={() => runAI(a.id)}
          disabled={loading !== null}
          className="px-2.5 py-0.5 rounded text-xs transition-colors shrink-0 disabled:opacity-50"
          style={{ background: 'var(--btn-bg)', color: loading === a.id ? 'var(--accent)' : 'var(--text-secondary)' }}
        >
          {loading === a.id ? '...' : a.label}
        </button>
      ))}
    </div>
  )
}

function EditorPane({ tab, plan }: { tab: NoteTab; plan: string }) {
  const { updateTab, theme, font, fontSize } = useEditorStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AIToolbar plan={plan} tabId={tab.id} />
      <div className="flex-1 overflow-hidden">
        <Editor
          content={tab.content}
          onChange={val => updateTab(tab.id, { content: val, isDirty: true })}
          format={tab.format}
          font={font}
          fontSize={fontSize}
          theme={theme}
          showLineNumbers={['python','javascript','typescript','java','csharp','c','cpp','rust','sql'].includes(tab.format)}
        />
      </div>
      <div
        className="flex items-center justify-between px-3 py-1 text-xs border-t"
        style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <span>{FORMAT_LABELS[tab.format as Format] ?? tab.format}</span>
        <span>{tab.content.length} chars</span>
      </div>
    </div>
  )
}

function PaneSystem({ plan }: { plan: string }) {
  const { tabs, activeTabId, layout } = useEditorStore()
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]
  if (!activeTab) return null

  if (layout === 'single' || tabs.length === 1 || plan === 'anonymous' || plan === 'free') {
    return (
      <div className="flex-1 overflow-hidden">
        <EditorPane tab={activeTab} plan={plan} />
      </div>
    )
  }

  const visibleTabs = tabs.slice(0, layout === '2x2' ? 4 : 2)

  const gridClass = {
    'side-by-side': 'grid-cols-2',
    'top-bottom': 'grid-rows-2',
    '2x2': 'grid-cols-2 grid-rows-2',
  }[layout] ?? 'grid-cols-1'

  return (
    <div className={`flex-1 grid ${gridClass} overflow-hidden`} style={{ gap: '1px', background: 'var(--splitter)' }}>
      {visibleTabs.map(tab => (
        <div key={tab.id} className="overflow-hidden" style={{ background: 'var(--editor-bg)' }}>
          <EditorPane tab={tab} plan={plan} />
        </div>
      ))}
    </div>
  )
}

function WorkspacePanel({ open, tabs, activeTabId, setActiveTab, updateTab, removeTab }: {
  open: boolean
  tabs: NoteTab[]
  activeTabId: string | null
  setActiveTab: (id: string) => void
  updateTab: (id: string, updates: Partial<NoteTab>) => void
  removeTab: (id: string) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="w-56 border-r flex flex-col overflow-hidden shrink-0"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--border)' }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 224, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <div className="px-3 py-2 text-xs font-semibold border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            NOTES
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-between px-3 py-1.5 cursor-pointer rounded mx-1 transition-colors"
                style={{
                  background: activeTabId === tab.id ? 'var(--tab-selected-bg)' : 'transparent',
                  color: activeTabId === tab.id ? 'var(--text)' : 'var(--text-secondary)',
                }}
              >
                <span className="text-sm truncate flex-1">{tab.title}</span>
                {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-[#89B4FA] ml-1 shrink-0" />}
                {tabs.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeTab(tab.id) }}
                    className="ml-1 hover:opacity-60"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AppPage() {
  const plan = usePlan()
  const [saveOpen, setSaveOpen] = useState(false)
  const {
    tabs, activeTabId, setActiveTab, updateTab, removeTab,
    workspacePanelOpen, setWorkspacePanelOpen,
    theme, showSignUpBanner, showUpgradeBanner,
    setShowSignUpBanner, setShowUpgradeBanner,
  } = useEditorStore()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Init activeTabId if null
  useEffect(() => {
    if (!activeTabId && tabs.length > 0) {
      setActiveTab(tabs[0].id)
    }
  }, [activeTabId, tabs, setActiveTab])

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--app-bg)', color: 'var(--text)' }}
    >
      {/* Main toolbar */}
      <Toolbar plan={plan} onSave={() => setSaveOpen(true)} />

      {/* Tab bar */}
      <TabBar plan={plan} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Workspace panel (Basic+ only) */}
        {(plan === 'basic' || plan === 'pro') && (
          <WorkspacePanel
            open={workspacePanelOpen}
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTab={setActiveTab}
            updateTab={updateTab}
            removeTab={removeTab}
          />
        )}

        {/* Editor panes */}
        <PaneSystem plan={plan} />
      </div>

      {/* Save dialog */}
      <AnimatePresence>
        {saveOpen && activeTab && (
          <SaveDialog
            tab={activeTab}
            plan={plan}
            onClose={() => setSaveOpen(false)}
            onSaved={(updates) => {
              updateTab(activeTab.id, { ...updates, isDirty: false })
              setSaveOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Banners */}
      <AnimatePresence>
        {showUpgradeBanner && (
          <UpgradeBanner onClose={() => setShowUpgradeBanner(false)} />
        )}
        {showSignUpBanner && (
          <SignUpBanner onClose={() => setShowSignUpBanner(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
