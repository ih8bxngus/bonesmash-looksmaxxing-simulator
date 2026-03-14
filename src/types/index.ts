import * as THREE from 'three'

export interface TierDef {
  name: string
  color: string
  minProgress: number
}

export interface FloatingTextData {
  id: number
  text: string
  color: string
  x: number
  y: number
  rotation: number
}

export interface GameState {
  totalHits: number
  morphProgress: number
  displayMorph: number
  currentTier: TierDef
}

export interface DeformationState {
  velocities: Float32Array
  restPositions: Float32Array
  currentPositions: Float32Array
}
