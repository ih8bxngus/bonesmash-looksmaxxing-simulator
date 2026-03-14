'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

export function useAudio() {
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const ascendRef = useRef<HTMLAudioElement | null>(null)
  const hitMetalRef = useRef<HTMLAudioElement | null>(null)
  const bonkRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)
  const startedRef = useRef(false)
  const ascendedRef = useRef(false)

  useEffect(() => {
    const bgm = new Audio('/sounds/bgm.wav')
    bgm.loop = true
    bgm.volume = 0.5
    bgmRef.current = bgm

    const ascend = new Audio('/sounds/ascendloop.wav')
    ascend.loop = true
    ascend.volume = 0.5
    ascendRef.current = ascend

    const hitMetal = new Audio('/sounds/hit-metal.mp3')
    hitMetal.volume = 0.3
    hitMetalRef.current = hitMetal

    const bonk = new Audio('/sounds/bonk.mp3')
    bonk.volume = 0.3
    bonkRef.current = bonk

    return () => {
      bgm.pause()
      bgm.src = ''
      ascend.pause()
      ascend.src = ''
    }
  }, [])

  const startBGM = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    const bgm = bgmRef.current
    if (bgm && !muted) {
      bgm.play().catch(() => {})
    }
  }, [muted])

  const playAscendMusic = useCallback(() => {
    if (ascendedRef.current) return
    ascendedRef.current = true

    // Fade out normal BGM and start ascend loop
    const bgm = bgmRef.current
    const ascend = ascendRef.current
    if (bgm) {
      // Quick fade out over 300ms
      let vol = bgm.volume
      const fade = setInterval(() => {
        vol -= 0.05
        if (vol <= 0) {
          bgm.pause()
          bgm.volume = 0.5
          clearInterval(fade)
        } else {
          bgm.volume = vol
        }
      }, 30)
    }
    if (ascend && !muted) {
      ascend.currentTime = 0
      ascend.play().catch(() => {})
    }
  }, [muted])

  const playHitSound = useCallback(() => {
    // Start BGM on first interaction
    if (!startedRef.current) startBGM()

    if (muted) return

    const isBonk = Math.random() < 0.1
    const src = isBonk ? bonkRef.current : hitMetalRef.current
    if (src) {
      // Clone to allow overlapping sounds
      const clone = src.cloneNode() as HTMLAudioElement
      clone.volume = 0.3
      clone.play().catch(() => {})
    }
  }, [muted, startBGM])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      const activeBgm = ascendedRef.current ? ascendRef.current : bgmRef.current
      if (activeBgm) {
        if (next) {
          activeBgm.pause()
        } else if (startedRef.current) {
          activeBgm.play().catch(() => {})
        }
      }
      return next
    })
  }, [])

  const resetAudio = useCallback(() => {
    // Stop ascend music and go back to normal BGM
    const ascend = ascendRef.current
    const bgm = bgmRef.current
    if (ascend) {
      ascend.pause()
      ascend.currentTime = 0
    }
    ascendedRef.current = false
    if (bgm && startedRef.current && !muted) {
      bgm.volume = 0.5
      bgm.currentTime = 0
      bgm.play().catch(() => {})
    }
  }, [muted])

  return { muted, playHitSound, playAscendMusic, resetAudio, toggleMute }
}
