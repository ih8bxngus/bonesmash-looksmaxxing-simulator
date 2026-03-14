'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  tierColor: string
}

export default function ProgressBar({ progress, tierColor }: ProgressBarProps) {
  const percent = Math.round(progress * 100)

  return (
    <div className="w-full">
      <div
        className="w-full h-4 rounded-full overflow-hidden border"
        style={{
          borderColor: 'rgba(255,215,0,0.3)',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${tierColor}88, ${tierColor})`,
            boxShadow: `0 0 10px ${tierColor}60`,
          }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs" style={{ fontFamily: "'Bangers', cursive" }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>NORMIE</span>
        <span style={{ color: tierColor, textShadow: `0 0 6px ${tierColor}40` }}>
          {percent}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>ASCENDED</span>
      </div>
    </div>
  )
}
