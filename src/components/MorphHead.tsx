'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
import * as THREE from 'three'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SMASH_RADIUS, SMASH_FORCE, MAX_HITS } from '@/lib/constants'

interface MorphHeadProps {
  morphProgress: number
  totalHits: number
  displayMorphRef: React.MutableRefObject<number>
  onHit: () => void
  onImpactPosition: (screenPos: { x: number; y: number }) => void
  onResetRef: React.MutableRefObject<(() => void) | null>
}

function extractMesh(scene: THREE.Group): THREE.Mesh | null {
  let found: THREE.Mesh | null = null
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && !found) found = child
  })
  return found
}

/**
 * Normalize geometry to fit within targetSize, centered at origin.
 * Returns the scale factor used, so morph deltas can be scaled to match.
 */
function normalizeGeometry(geo: THREE.BufferGeometry, targetSize: number): number {
  geo.computeBoundingBox()
  const bb = geo.boundingBox!
  const center = new THREE.Vector3()
  bb.getCenter(center)
  const size = new THREE.Vector3()
  bb.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = targetSize / maxDim

  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, (pos.getX(i) - center.x) * scale)
    pos.setY(i, (pos.getY(i) - center.y) * scale)
    pos.setZ(i, (pos.getZ(i) - center.z) * scale)
  }
  pos.needsUpdate = true
  geo.computeBoundingBox()
  geo.computeVertexNormals()

  return scale
}

export default function MorphHead({
  morphProgress,
  totalHits,
  displayMorphRef,
  onHit,
  onImpactPosition,
  onResetRef,
}: MorphHeadProps) {
  const beforeMeshRef = useRef<THREE.Mesh>(null)
  const afterMeshRef = useRef<THREE.Mesh>(null)
  const shakeRef = useRef({ x: 0, y: 0, decay: 0 })
  const flashRef = useRef({ intensity: 0 })
  const scaleRef = useRef(1)
  const groupRef = useRef<THREE.Group>(null)
  const floatTimeRef = useRef(0)
  const [swapped, setSwapped] = useState(false)

  const beforeGltf = useGLTF('/models/before.glb')
  const afterGltf = useGLTF('/models/after.glb')

  const data = useMemo(() => {
    const beforeSrcMesh = extractMesh(beforeGltf.scene)
    const afterSrcMesh = extractMesh(afterGltf.scene)
    if (!beforeSrcMesh || !afterSrcMesh) throw new Error('No meshes found in GLB')

    const beforeGeo = beforeSrcMesh.geometry.clone()
    const afterGeo = afterSrcMesh.geometry.clone()

    // Extract morph delta data BEFORE clearing morph attributes
    // glTF morph targets are stored as deltas (displacement from base)
    let morphDeltas: Float32Array | null = null
    if (beforeGeo.morphAttributes.position && beforeGeo.morphAttributes.position.length > 0) {
      const morphAttr = beforeGeo.morphAttributes.position[0]
      morphDeltas = new Float32Array(morphAttr.array)
      console.log('Extracted morph deltas:', morphDeltas.length / 3, 'vertices')
    }

    // Remove morph attributes from geometry — we'll do morphing CPU-side
    delete beforeGeo.morphAttributes.position
    if (beforeGeo.morphAttributes.normal) delete beforeGeo.morphAttributes.normal

    // Normalize both geometries
    const beforeScale = normalizeGeometry(beforeGeo, 1.8)
    normalizeGeometry(afterGeo, 1.8)

    // Scale morph deltas to match the normalized geometry
    if (morphDeltas) {
      for (let i = 0; i < morphDeltas.length; i++) {
        morphDeltas[i] *= beforeScale
      }
    }

    const beforeMat = (beforeSrcMesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial
    const afterMat = (afterSrcMesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial
    beforeMat.side = THREE.DoubleSide
    afterMat.side = THREE.DoubleSide

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    // Store rest positions after normalization
    const beforeRestPositions = new Float32Array(beforeGeo.attributes.position.array)
    const afterRestPositions = new Float32Array(afterGeo.attributes.position.array)

    const beforeCount = beforeGeo.attributes.position.count
    const afterCount = afterGeo.attributes.position.count

    return {
      beforeGeo,
      afterGeo,
      beforeMat,
      afterMat,
      flashMat,
      beforeRestPositions,
      afterRestPositions,
      morphDeltas,
      beforeDeformOffsets: new Float32Array(beforeCount * 3),
      beforeDeformVelocities: new Float32Array(beforeCount * 3),
      afterDeformOffsets: new Float32Array(afterCount * 3),
      afterDeformVelocities: new Float32Array(afterCount * 3),
    }
  }, [beforeGltf, afterGltf])

  // Reset handler
  useMemo(() => {
    onResetRef.current = () => {
      data.beforeDeformOffsets.fill(0)
      data.beforeDeformVelocities.fill(0)
      data.afterDeformOffsets.fill(0)
      data.afterDeformVelocities.fill(0)
      displayMorphRef.current = 0
      flashRef.current.intensity = 0
      scaleRef.current = 1
      setSwapped(false)

      ;(data.beforeGeo.attributes.position.array as Float32Array).set(data.beforeRestPositions)
      data.beforeGeo.attributes.position.needsUpdate = true
      data.beforeGeo.computeVertexNormals()

      ;(data.afterGeo.attributes.position.array as Float32Array).set(data.afterRestPositions)
      data.afterGeo.attributes.position.needsUpdate = true
      data.afterGeo.computeVertexNormals()
    }
  }, [data, displayMorphRef, onResetRef])

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()

      const worldPoint = event.point.clone()
      const faceNormal = event.face
        ? event.face.normal.clone().transformDirection(event.object.matrixWorld)
        : new THREE.Vector3(0, 0, 1)
      const inwardDir = faceNormal.clone().negate()

      const meshRef = swapped ? afterMeshRef : beforeMeshRef
      const velocities = swapped ? data.afterDeformVelocities : data.beforeDeformVelocities

      const mesh = meshRef.current
      if (!mesh) return

      const localPoint = mesh.worldToLocal(worldPoint.clone())
      const positions = mesh.geometry.attributes.position

      for (let i = 0; i < positions.count; i++) {
        const dx = positions.getX(i) - localPoint.x
        const dy = positions.getY(i) - localPoint.y
        const dz = positions.getZ(i) - localPoint.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < SMASH_RADIUS) {
          const falloff = Math.pow(1 - dist / SMASH_RADIUS, 2)
          const impulse = falloff * SMASH_FORCE
          velocities[i * 3] += inwardDir.x * impulse
          velocities[i * 3 + 1] += inwardDir.y * impulse
          velocities[i * 3 + 2] += inwardDir.z * impulse
        }
      }

      shakeRef.current = {
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.15,
        decay: 1.0,
      }

      onHit()

      const screenPos = event.point.clone().project(event.camera)
      const x = ((screenPos.x + 1) / 2) * window.innerWidth
      const y = ((-screenPos.y + 1) / 2) * window.innerHeight
      onImpactPosition({ x, y })
    },
    [data, swapped, onHit, onImpactPosition]
  )

  useFrame(({ camera }) => {
    displayMorphRef.current += (morphProgress - displayMorphRef.current) * 0.08
    const dm = displayMorphRef.current

    // Check for swap trigger at MAX_HITS
    const shouldSwap = totalHits >= MAX_HITS
    if (shouldSwap && !swapped) {
      setSwapped(true)
      flashRef.current.intensity = 1.0
      scaleRef.current = 1.2
      shakeRef.current = {
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
        decay: 1.5,
      }
    }

    // Animate flash decay
    if (flashRef.current.intensity > 0) {
      flashRef.current.intensity *= 0.9
      if (flashRef.current.intensity < 0.01) flashRef.current.intensity = 0
      data.flashMat.opacity = flashRef.current.intensity
    }

    // Animate scale punch back to 1
    scaleRef.current += (1 - scaleRef.current) * 0.1

    // --- Before mesh: CPU morph (from GLB morph targets) + spring deformation ---
    if (!swapped) {
      const { beforeDeformOffsets: offsets, beforeDeformVelocities: vels, beforeRestPositions: rest, morphDeltas } = data
      const pos = data.beforeGeo.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      const count = pos.count
      let hasChange = false

      // Morph factor: 0 to 1 as progress approaches full
      const morphT = Math.min(dm, 1.0)

      // Spring physics on deform offsets (bonk deformation)
      for (let i = 0; i < count * 3; i++) {
        vels[i] = (vels[i] - offsets[i] * 0.05) * 0.88
        offsets[i] += vels[i]
        if (Math.abs(offsets[i]) > 0.0005 || Math.abs(vels[i]) > 0.0005) hasChange = true
      }

      // Set positions = rest + morphT * morphDelta + deformOffset
      if (morphDeltas) {
        for (let i = 0; i < count * 3; i++) {
          const v = rest[i] + morphT * morphDeltas[i] + offsets[i]
          if (arr[i] !== v) { arr[i] = v; hasChange = true }
        }
      } else {
        for (let i = 0; i < count * 3; i++) {
          const v = rest[i] + offsets[i]
          if (arr[i] !== v) { arr[i] = v; hasChange = true }
        }
      }

      if (hasChange) {
        pos.needsUpdate = true
        data.beforeGeo.computeVertexNormals()
      }
    }

    // --- After mesh: just spring physics ---
    if (swapped) {
      const { afterDeformOffsets: offsets, afterDeformVelocities: vels, afterRestPositions: rest } = data
      const pos = data.afterGeo.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      const count = pos.count
      let hasChange = false

      for (let i = 0; i < count * 3; i++) {
        vels[i] = (vels[i] - offsets[i] * 0.05) * 0.88
        offsets[i] += vels[i]
        if (Math.abs(offsets[i]) > 0.0005 || Math.abs(vels[i]) > 0.0005) hasChange = true
      }

      for (let i = 0; i < count * 3; i++) {
        const v = rest[i] + offsets[i]
        if (arr[i] !== v) { arr[i] = v; hasChange = true }
      }

      if (hasChange) {
        pos.needsUpdate = true
        data.afterGeo.computeVertexNormals()
      }
    }

    // Floating animation
    floatTimeRef.current += 0.015
    const floatY = Math.sin(floatTimeRef.current) * 0.03
    const floatX = Math.sin(floatTimeRef.current * 0.7) * 0.02
    if (groupRef.current) {
      groupRef.current.position.x = floatX
      groupRef.current.position.y = -0.225 + floatY
      groupRef.current.scale.setScalar(scaleRef.current)
    }

    // Screen shake
    const s = shakeRef.current
    camera.position.x = s.x * s.decay
    camera.position.y = s.y * s.decay
    camera.position.z = 5
    if (s.decay > 0.01) { s.decay *= 0.85 } else { s.x = 0; s.y = 0; s.decay = 0 }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={beforeMeshRef} geometry={data.beforeGeo} material={data.beforeMat} onClick={handleClick} visible={!swapped} />
      <mesh ref={afterMeshRef} geometry={data.afterGeo} material={data.afterMat} onClick={handleClick} visible={swapped} position={[0, 0.02, 0]} />
      <mesh geometry={swapped ? data.afterGeo : data.beforeGeo} material={data.flashMat} renderOrder={10} position={swapped ? [0, 0.02, 0] : [0, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/models/before.glb')
useGLTF.preload('/models/after.glb')
