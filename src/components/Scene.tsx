'use client'

import { useRef, useState, useCallback, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MorphHead from './MorphHead'
import GameUI from './GameUI'
import Background from './Background'
import { useMorphSystem } from '@/hooks/useMorphSystem'
import { useAudio } from '@/hooks/useAudio'
import { FloatingTextData } from '@/types'
import { IMPACT_WORDS, IMPACT_COLORS, MAX_HITS } from '@/lib/constants'

let textIdCounter = 0

export default function Scene() {
  const {
    totalHits,
    morphProgress,
    currentTier,
    currentTip,
    showTierFlash,
    displayMorphRef,
    registerHit,
    reset,
  } = useMorphSystem()

  const { muted, playHitSound, playAscendMusic, resetAudio, toggleMute } = useAudio()

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([])
  const [isHitting, setIsHitting] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const resetRef = useRef<(() => void) | null>(null)
  const ascendTriggeredRef = useRef(false)

  // Trigger violent screen shake + music change on ascend
  useEffect(() => {
    if (totalHits >= MAX_HITS && !ascendTriggeredRef.current) {
      ascendTriggeredRef.current = true
      playAscendMusic()
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 1200)
    }
  }, [totalHits, playAscendMusic])

  const handleImpactPosition = useCallback((pos: { x: number; y: number }) => {
    const newText: FloatingTextData = {
      id: textIdCounter++,
      text: IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)],
      color: IMPACT_COLORS[Math.floor(Math.random() * IMPACT_COLORS.length)],
      x: pos.x,
      y: pos.y,
      rotation: (Math.random() - 0.5) * 50,
    }
    setFloatingTexts(prev => [...prev, newText])
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id))
    }, 700)
  }, [])

  const handleHit = useCallback(() => {
    registerHit()
    playHitSound()
    setIsHitting(true)
    setTimeout(() => setIsHitting(false), 140)
  }, [registerHit, playHitSound])

  const handleReset = useCallback(() => {
    reset()
    resetRef.current?.()
    resetAudio()
    ascendTriggeredRef.current = false
  }, [reset, resetAudio])

  return (
    <div className={`relative w-full h-screen overflow-hidden ${screenShake ? 'violent-shake' : ''}`}>
      <Background ascended={totalHits >= MAX_HITS} />

      <div
        className="absolute inset-0 z-10"
        style={{
          cursor: isHitting
            ? `url("data:image/svg+xml,${encodeURIComponent(hammerHitSVG)}") 16 16, auto`
            : `url("data:image/svg+xml,${encodeURIComponent(hammerIdleSVG)}") 16 16, auto`,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <ambientLight color="#ffeedd" intensity={0.55} />
          <directionalLight color="#fff5e6" intensity={1.0} position={[3, 4, 5]} />
          <directionalLight color="#d0e0ff" intensity={0.4} position={[-3, 1, 3]} />
          <directionalLight color="#ffc880" intensity={0.35} position={[0, -1, -4]} />

          <Suspense fallback={null}>
          <MorphHead
            morphProgress={morphProgress}
            totalHits={totalHits}
            displayMorphRef={displayMorphRef}
            onHit={handleHit}
            onImpactPosition={handleImpactPosition}
            onResetRef={resetRef}
          />
          </Suspense>
        </Canvas>
      </div>

      <GameUI
        totalHits={totalHits}
        morphProgress={morphProgress}
        currentTier={currentTier}
        currentTip={currentTip}
        showTierFlash={showTierFlash}
        floatingTexts={floatingTexts}
        onReset={handleReset}
        muted={muted}
        onToggleMute={toggleMute}
      />
    </div>
  )
}

const hammerIdleSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g transform="rotate(-30 16 16)">
    <rect x="14" y="15" width="4" height="14" rx="1" fill="#8B6914" stroke="#5C4A0E" stroke-width="1"/>
    <rect x="6" y="5" width="20" height="10" rx="2" fill="#888" stroke="#555" stroke-width="1.5"/>
    <rect x="6" y="5" width="20" height="10" rx="2" fill="url(#hammerGrad)" stroke="#555" stroke-width="1"/>
  </g>
  <defs><linearGradient id="hammerGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bbb"/><stop offset="100%" stop-color="#777"/></linearGradient></defs>
</svg>`

const hammerHitSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g transform="rotate(10 16 16)">
    <rect x="14" y="15" width="4" height="14" rx="1" fill="#8B6914" stroke="#5C4A0E" stroke-width="1"/>
    <rect x="6" y="3" width="20" height="10" rx="2" fill="#cc4444" stroke="#882222" stroke-width="1.5"/>
  </g>
  <line x1="4" y1="6" x2="1" y2="3" stroke="#FFD700" stroke-width="2"/>
  <line x1="28" y1="6" x2="31" y2="3" stroke="#FFD700" stroke-width="2"/>
  <line x1="16" y1="2" x2="16" y2="-1" stroke="#FFD700" stroke-width="2"/>
  <line x1="6" y1="16" x2="2" y2="18" stroke="#FFD700" stroke-width="1.5"/>
  <line x1="26" y1="16" x2="30" y2="18" stroke="#FFD700" stroke-width="1.5"/>
</svg>`
