'use client'

import { useRef, useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'

export function useTransparency(plan: string) {
  const { opacity, setOpacity, setShowSignUpBanner, setShowUpgradeBanner } = useEditorStore()
  const previewActiveRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null }
  }, [])

  const handleOpacityChange = useCallback((value: number) => {
    if (plan === 'basic' || plan === 'pro') {
      setOpacity(value)
      return
    }

    if (plan === 'free') {
      setOpacity(value)
      if (previewActiveRef.current) return // already counting down, just update opacity
      previewActiveRef.current = true

      let remaining = 30
      setCountdownSeconds(remaining)

      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1
        setCountdownSeconds(remaining)
      }, 1000)

      timerRef.current = setTimeout(() => {
        clearTimers()
        setOpacity(100)
        setCountdownSeconds(null)
        previewActiveRef.current = false
        setShowUpgradeBanner(true)
        // re-allow preview after 10 minutes
        setTimeout(() => { previewActiveRef.current = false }, 10 * 60 * 1000)
      }, 30000)
      return
    }

    // Anonymous: 3-second preview then snap back
    clearTimers()
    setOpacity(value)
    timerRef.current = setTimeout(() => {
      setOpacity(100)
      setShowSignUpBanner(true)
    }, 3000)
  }, [plan, setOpacity, setShowSignUpBanner, setShowUpgradeBanner, clearTimers])

  const resetOpacity = useCallback(() => {
    clearTimers()
    setOpacity(100)
    setCountdownSeconds(null)
    previewActiveRef.current = false
  }, [clearTimers, setOpacity])

  return { opacity, handleOpacityChange, resetOpacity, countdownSeconds }
}
