'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from './ProgressBar'
import FloatingText from './FloatingText'
import { TierDef, FloatingTextData } from '@/types'
import { MAX_HITS } from '@/lib/constants'
import { getShareImageBlob, getShareImageUrl } from '@/lib/generateShareImage'

interface GameUIProps {
  totalHits: number
  morphProgress: number
  currentTier: TierDef
  currentTip: string | null
  showTierFlash: boolean
  floatingTexts: FloatingTextData[]
  onReset: () => void
  muted: boolean
  onToggleMute: () => void
}

export default function GameUI({
  totalHits,
  morphProgress,
  currentTier,
  currentTip,
  showTierFlash,
  floatingTexts,
  onReset,
  muted,
  onToggleMute,
}: GameUIProps) {
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null)
  const ascended = totalHits >= MAX_HITS

  const shareUrl = 'https://bonesmash.fun'
  const shareText = `I just ASCENDED in Bonesmash! ${totalHits} smashes to reach peak aesthetics. Can you do it?`
  const shareImageUrl = getShareImageUrl()

  // Pre-fetch the share image blob for native sharing
  useEffect(() => {
    if (ascended && !shareImageBlob) {
      getShareImageBlob().then(setShareImageBlob).catch(() => {})
    }
  }, [ascended, shareImageBlob])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const handleDownloadImage = () => {
    const a = document.createElement('a')
    a.href = shareImageUrl
    a.download = 'bonesmash-ascended.png'
    a.click()
  }

  const handleShareTwitter = async () => {
    // Copy share image to clipboard so user can paste it into the tweet
    if (shareImageBlob) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': shareImageBlob })
        ])
      } catch {}
    }
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleNativeShare = async () => {
    if (!navigator.share) return
    const shareData: ShareData = {
      title: 'Bonesmash',
      text: shareText,
      url: shareUrl,
    }
    // Try to share with image if supported
    if (shareImageBlob && navigator.canShare) {
      const file = new File([shareImageBlob], 'bonesmash-ascended.png', { type: 'image/png' })
      const dataWithFile = { ...shareData, files: [file] }
      if (navigator.canShare(dataWithFile)) {
        await navigator.share(dataWithFile).catch(() => {})
        return
      }
    }
    await navigator.share(shareData).catch(() => {})
  }

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Title + Subtitle + Tier badge — compact header block */}
      <div className="absolute top-2 left-0 right-0 flex flex-col items-center gap-0">
        <h1
          className="text-3xl md:text-5xl leading-none"
          style={{
            fontFamily: "Impact, 'Arial Black', sans-serif",
            color: ascended ? '#FFFFFF' : '#FFD700',
            letterSpacing: '0em',
            textShadow: ascended ? '2px 2px 0 #000' : '0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3), 2px 2px 0 #000',
            animation: ascended ? 'titleFloat 3s ease-in-out infinite' : 'none',
          }}
        >
          {ascended ? 'you ascended...' : 'BONESMASH'}
        </h1>
        <p
          className="text-xs md:text-sm tracking-widest uppercase"
          style={{
            fontFamily: "'Bangers', cursive",
            color: 'rgba(255,215,0,0.6)',
            textShadow: '1px 1px 0 #000',
            visibility: ascended ? 'hidden' : 'visible',
          }}
        >
          The Looksmaxxing Simulator
        </p>

        {/* Tier badge — inline below subtitle */}
        <div className="mt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTier.name}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: showTierFlash ? [1, 1.3, 1] : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="px-4 py-1 rounded-full border-2 text-base md:text-lg font-bold"
              style={{
                fontFamily: "'Bangers', cursive",
                color: currentTier.color,
                borderColor: currentTier.color,
                backgroundColor: 'rgba(0,0,0,0.7)',
                textShadow: `0 0 10px ${currentTier.color}40`,
                boxShadow: showTierFlash
                  ? `0 0 30px ${currentTier.color}60, inset 0 0 20px ${currentTier.color}20`
                  : 'none',
              }}
            >
              {currentTier.name.toUpperCase()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hit counter */}
      <div
        className="absolute top-2 right-3 px-3 py-1 rounded-lg border"
        style={{
          fontFamily: "'Bangers', cursive",
          fontSize: '1.1rem',
          color: '#FFD700',
          borderColor: 'rgba(255,215,0,0.3)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          textShadow: '1px 1px 0 #000',
        }}
      >
        SMASHES: {totalHits}
      </div>

      {/* Progress bar — below header block */}
      <div className="absolute top-[140px] left-6 right-6 md:left-12 md:right-12">
        <ProgressBar progress={morphProgress} tierColor={currentTier.color} />
      </div>

      {/* Looksmaxxing tip */}
      <AnimatePresence>
        {currentTip && (
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-14 left-0 right-0 flex justify-center"
          >
            <div
              className="px-4 py-2 rounded-lg border"
              style={{
                fontFamily: "'Bangers', cursive",
                fontSize: '1rem',
                color: '#FFD700',
                borderColor: 'rgba(255,215,0,0.4)',
                backgroundColor: 'rgba(0,0,0,0.8)',
                textShadow: '0 0 8px rgba(255,215,0,0.4)',
              }}
            >
              {currentTip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button — top left */}
      <button
        onClick={onReset}
        className="pointer-events-auto absolute top-2 left-3 px-4 py-1.5 rounded-lg border-2 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
        style={{
          fontFamily: "'Bangers', cursive",
          color: '#FFD700',
          borderColor: 'rgba(255,215,0,0.5)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          cursor: 'pointer',
        }}
      >
        RESET
      </button>

      {/* Share button — bottom center, only on success */}
      <AnimatePresence>
        {ascended && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-3 left-0 right-0 flex justify-center"
          >
            <button
              onClick={() => setShowSharePanel(true)}
              className="pointer-events-auto px-4 py-1.5 rounded-lg border-2 text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              style={{
                fontFamily: "'Bangers', cursive",
                color: '#000',
                borderColor: '#FFD700',
                backgroundColor: '#FFD700',
                cursor: 'pointer',
                textShadow: 'none',
              }}
            >
              SHARE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className="pointer-events-auto absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          color: '#FFD700',
          borderColor: 'rgba(255,215,0,0.5)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          cursor: 'pointer',
          fontSize: '1.2rem',
        }}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Floating impact texts */}
      {floatingTexts.map(ft => (
        <FloatingText key={ft.id} data={ft} />
      ))}

      {/* Share Panel Overlay */}
      <AnimatePresence>
        {showSharePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50 }}
            onClick={() => setShowSharePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-2xl border-2 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'rgba(8,4,24,0.95)',
                borderColor: '#FFD700',
                boxShadow: '0 0 60px rgba(255,215,0,0.3), 0 0 120px rgba(255,215,0,0.1)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowSharePanel(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
                style={{
                  color: '#FFD700',
                  backgroundColor: 'rgba(255,215,0,0.1)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Win screen content */}
              <div className="flex flex-col items-center text-center gap-3">
                {/* Share image preview */}
                <div
                  className="w-full rounded-lg overflow-hidden border"
                  style={{ borderColor: 'rgba(255,215,0,0.3)' }}
                >
                  <img
                    src={shareImageUrl}
                    alt="Bonesmash Win Screen"
                    className="w-full h-auto"
                    style={{ display: 'block' }}
                  />
                </div>

                {/* Share label */}
                <div
                  className="text-sm"
                  style={{
                    fontFamily: "'Bangers', cursive",
                    color: 'rgba(255,215,0,0.6)',
                    letterSpacing: '0.1em',
                  }}
                >
                  SHARE WITH THE BOYS
                </div>

                {/* Share link */}
                <div className="flex gap-2 w-full">
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-sm truncate"
                    style={{
                      backgroundColor: 'rgba(255,215,0,0.08)',
                      border: '1px solid rgba(255,215,0,0.2)',
                      color: 'rgba(255,215,0,0.8)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      fontFamily: "'Bangers', cursive",
                      backgroundColor: copied ? '#50C878' : '#FFD700',
                      color: '#000',
                      cursor: 'pointer',
                      border: 'none',
                      minWidth: '70px',
                    }}
                  >
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "'Bangers', cursive",
                      backgroundColor: 'rgba(80,200,120,0.15)',
                      border: '1px solid rgba(80,200,120,0.4)',
                      color: '#50C878',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    SAVE IMAGE
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "'Bangers', cursive",
                      backgroundColor: 'rgba(29,155,240,0.15)',
                      border: '1px solid rgba(29,155,240,0.4)',
                      color: '#1DA1F2',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    SHARE ON X
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "'Bangers', cursive",
                      backgroundColor: 'rgba(255,215,0,0.1)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      color: '#FFD700',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    MORE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
