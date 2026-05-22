import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Plan = 'anonymous' | 'free' | 'basic' | 'pro'
export type Layout = 'single' | 'side-by-side' | 'top-bottom' | '2x2'
export type Theme = 'dark' | 'light' | 'blue' | 'sepia' | 'green' | 'glass'

export interface NoteTab {
  id: string
  title: string
  content: string
  format: string
  savedAt?: string
  isDirty: boolean
}

interface EditorStore {
  // Tabs
  tabs: NoteTab[]
  activeTabId: string | null
  addTab: () => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (id: string, updates: Partial<NoteTab>) => void

  // Layout
  layout: Layout
  setLayout: (layout: Layout) => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // Opacity / transparency
  opacity: number
  setOpacity: (value: number) => void

  // Font
  font: string
  fontSize: number
  setFont: (font: string) => void
  setFontSize: (size: number) => void

  // Workspace panel
  workspacePanelOpen: boolean
  setWorkspacePanelOpen: (open: boolean) => void

  // Banners
  showSignUpBanner: boolean
  showUpgradeBanner: boolean
  setShowSignUpBanner: (show: boolean) => void
  setShowUpgradeBanner: (show: boolean) => void
}

function newTab(index: number): NoteTab {
  return {
    id: crypto.randomUUID(),
    title: `Note ${index + 1}`,
    content: '',
    format: 'plain',
    isDirty: false,
  }
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      tabs: [newTab(0)],
      activeTabId: null,
      addTab: () => {
        const tabs = get().tabs
        const tab = newTab(tabs.length)
        set({ tabs: [...tabs, tab], activeTabId: tab.id })
      },
      removeTab: (id) => {
        const tabs = get().tabs.filter(t => t.id !== id)
        const activeTabId = get().activeTabId === id
          ? (tabs[tabs.length - 1]?.id ?? null)
          : get().activeTabId
        set({ tabs: tabs.length ? tabs : [newTab(0)], activeTabId })
      },
      setActiveTab: (id) => set({ activeTabId: id }),
      updateTab: (id, updates) =>
        set({ tabs: get().tabs.map(t => t.id === id ? { ...t, ...updates } : t) }),

      layout: 'single',
      setLayout: (layout) => set({ layout }),

      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },

      opacity: 100,
      setOpacity: (value) => set({ opacity: value }),

      font: 'Segoe UI',
      fontSize: 14,
      setFont: (font) => set({ font }),
      setFontSize: (fontSize) => set({ fontSize }),

      workspacePanelOpen: false,
      setWorkspacePanelOpen: (workspacePanelOpen) => set({ workspacePanelOpen }),

      showSignUpBanner: false,
      showUpgradeBanner: false,
      setShowSignUpBanner: (showSignUpBanner) => set({ showSignUpBanner }),
      setShowUpgradeBanner: (showUpgradeBanner) => set({ showUpgradeBanner }),
    }),
    {
      name: 'vidrio-editor',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        layout: state.layout,
        theme: state.theme,
        opacity: state.opacity,
        font: state.font,
        fontSize: state.fontSize,
      }),
    }
  )
)
