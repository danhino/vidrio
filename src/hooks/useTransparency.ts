'use client'

import { useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'

export function useTransparency(plan: string) {
  const { opacity, setOpacity, setShowSignUpBanner, setShowUpgradeBanner } = useEditorStore()
  const previewActiveRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpacityChange = useCallback((value: number) => {
    if (plan === 'basic' || plan === 'pro') {
      setOpacity(value)
      document.body.style.opacity = String(value / 100)
      return
    }

    if (plan === 'free') {
      setOpacity(value)
      document.body.style.opacity = String(value / 100)
      if (!previewActiveRef.current) {
        previewActiveRef.current = true
        timerRef.current = setTimeout(() => {
          setOpacity(100)
          document.body.style.opacity = '1'
          previewActiveRef.current = false
          if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
          }
          // Reset preview availability after 10 minutes
          setTimeout(() => { previewActiveRef.current = false }, 10 * 60 * 1000)
          setShowUpgradeBanner(true)
        }, 30000)
      }
      return
    }

    // Anonymous: 3 second preview only
    document.body.style.opacity = String(value / 100)
    setTimeout(() => {
      document.body.style.opacity = '1'
      setShowSignUpBanner(true)
    }, 3000)
  }, [plan, setOpacity, setShowSignUpBanner, setShowUpgradeBanner])

  const resetOpacity = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpacity(100)
    document.body.style.opacity = '1'
    previewActiveRef.current = false
  }, [setOpacity])

  return { opacity, handleOpacityChange, resetOpacity }
}
