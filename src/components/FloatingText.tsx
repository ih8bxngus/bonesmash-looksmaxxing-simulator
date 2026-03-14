'use client'

import { motion } from 'framer-motion'
import { FloatingTextData } from '@/types'

interface FloatingTextProps {
  data: FloatingTextData
}

export default function FloatingText({ data }: FloatingTextProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-30 font-bold text-2xl md:text-3xl"
      style={{
        left: data.x,
        top: data.y,
        color: data.color,
        fontFamily: "'Bangers', cursive",
        textShadow: `0 0 10px ${data.color}, 2px 2px 0 #000`,
        transform: `rotate(${data.rotation}deg)`,
      }}
      initial={{ scale: 0.4, opacity: 1, y: 0 }}
      animate={{ scale: 1.3, opacity: 0, y: -55 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {data.text}
    </motion.div>
  )
}
