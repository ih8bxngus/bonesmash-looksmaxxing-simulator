import { TierDef } from '@/types'

export const MAX_HITS = 21
export const PROGRESS_FULL_AT = 21
export const SPRING_CONSTANT = 0.05
export const DAMPING_FACTOR = 0.88
export const SMASH_RADIUS = 0.6
export const SMASH_FORCE = 0.25

export const TIERS: TierDef[] = [
  { name: 'Normie', color: '#8888aa', minProgress: 0.0 },
  { name: 'Mewer', color: '#6CB4EE', minProgress: 0.08 },
  { name: 'Mogger', color: '#50C878', minProgress: 0.25 },
  { name: 'Chad Lite', color: '#FFD700', minProgress: 0.45 },
  { name: 'GigaChad', color: '#FF6A00', minProgress: 0.65 },
  { name: 'Ascended', color: '#E040FB', minProgress: 0.85 },
]

export const IMPACT_WORDS = [
  'BONK!', 'SMASH!', 'WHAM!', 'POW!', 'CRACK!',
  'THWACK!', '+1 PSL', 'MOGS!', 'CHISELED!', 'BASED!',
]

export const IMPACT_COLORS = ['#FFD700', '#FF4444', '#FF8C00', '#FFFFFF', '#50C878']

export const LOOKSMAX_TIPS = [
  'Canthal tilt: IMPROVING',
  'Zygomatic arch: ACTIVATED',
  'Mandible gains detected!',
  'Forward growth unlocked',
  'Hunter eyes loading...',
  'Mewing power: +10',
  'Jawline sharpness: CRITICAL',
  'Brow ridge: REINFORCED',
  'Maxilla moving forward!',
  'Ramus length: MAXIMIZED',
  'PSL rating: off the charts',
  'Gonial angle: PERFECTED',
  'Your looksmatch just fainted',
  'Infraorbital rim: chiseled',
]
