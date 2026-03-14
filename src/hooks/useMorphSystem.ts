import { useState, useCallback, useRef } from 'react'
import { TierDef } from '@/types'
import { MAX_HITS, PROGRESS_FULL_AT, TIERS, LOOKSMAX_TIPS } from '@/lib/constants'
import { easeOutCubic } from '@/lib/easing'

export function useMorphSystem() {
  const [totalHits, setTotalHits] = useState(0)
  const [morphProgress, setMorphProgress] = useState(0)
  const [currentTier, setCurrentTier] = useState<TierDef>(TIERS[0])
  const [currentTip, setCurrentTip] = useState<string | null>(null)
  const [showTierFlash, setShowTierFlash] = useState(false)
  const displayMorphRef = useRef(0)
  const tipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getTier = useCallback((progress: number): TierDef => {
    let tier = TIERS[0]
    for (const t of TIERS) {
      if (progress >= t.minProgress) tier = t
    }
    return tier
  }, [])

  const registerHit = useCallback(() => {
    setTotalHits(prev => {
      const next = prev + 1
      const newProgress = Math.min(next / PROGRESS_FULL_AT, 1.0)
      setMorphProgress(newProgress)

      const newTier = getTier(newProgress)
      setCurrentTier(prevTier => {
        if (newTier.name !== prevTier.name) {
          setShowTierFlash(true)
          setTimeout(() => setShowTierFlash(false), 1200)
        }
        return newTier
      })

      // Show tip every ~3 hits
      if (next % 3 === 0) {
        const tip = LOOKSMAX_TIPS[Math.floor(Math.random() * LOOKSMAX_TIPS.length)]
        setCurrentTip(tip)
        if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current)
        tipTimeoutRef.current = setTimeout(() => setCurrentTip(null), 2500)
      }

      return next
    })
  }, [getTier])

  const reset = useCallback(() => {
    setTotalHits(0)
    setMorphProgress(0)
    setCurrentTier(TIERS[0])
    setCurrentTip(null)
    setShowTierFlash(false)
    displayMorphRef.current = 0
  }, [])

  return {
    totalHits,
    morphProgress,
    currentTier,
    currentTip,
    showTierFlash,
    displayMorphRef,
    registerHit,
    reset,
  }
}
