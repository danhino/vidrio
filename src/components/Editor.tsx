'use client'

import { useEffect, useRef } from 'react'
import { EditorState, Extension } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { getLanguageExtension } from '@/utils/languageMap'

interface EditorProps {
  content: string
  onChange: (value: string) => void
  format: string
  font: string
  fontSize: number
  theme: string
  readOnly?: boolean
  showLineNumbers?: boolean
}

export function Editor({
  content,
  onChange,
  format,
  font,
  fontSize,
  theme,
  readOnly = false,
  showLineNumbers = false,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const langExt = getLanguageExtension(format)
    const extensions: Extension[] = [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      syntaxHighlighting(defaultHighlightStyle),
      bracketMatching(),
      highlightActiveLine(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${fontSize}px`,
          fontFamily: font === 'Segoe UI'
            ? `'Segoe UI', system-ui, sans-serif`
            : `'${font}', monospace`,
        },
        '.cm-content': { padding: '8px 0' },
        '.cm-line': { padding: '0 12px' },
      }),
      EditorView.updateListener.of(update => {
        if (update.docChanged && !readOnly) {
          onChange(update.state.doc.toString())
        }
      }),
    ]

    if (showLineNumbers) extensions.push(lineNumbers())
    if (theme === 'dark' || theme === 'blue' || theme === 'green' || theme === 'glass') {
      extensions.push(oneDark)
    }
    if (langExt) extensions.push(langExt)
    if (readOnly) extensions.push(EditorState.readOnly.of(true))

    const state = EditorState.create({ doc: content, extensions })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, theme, fontSize, font, readOnly, showLineNumbers])

  // Sync content changes from outside without rebuilding the editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
    }
  }, [content])

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-auto"
      style={{ background: 'var(--editor-bg)', color: 'var(--editor-fg)' }}
    />
  )
}
