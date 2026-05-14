import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Panel({ position, size, material }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={material.color} roughness={material.roughness} metalness={0.05} />
    </mesh>
  )
}

function Shelf({ y, width, depth, thickness = 0.025, material }) {
  return (
    <Panel position={[0, y, 0]} size={[width - 0.05, thickness, depth - 0.04]} material={material} />
  )
}

function useShelves(height, shelves) {
  return useMemo(() => {
    const gap = (height - 0.05) / (shelves + 1)
    return Array.from({ length: shelves }, (_, i) => -height / 2 + gap * (i + 1))
  }, [height, shelves])
}

/* Single animated door — pivot at group origin, door extends in doorWidth direction */
function AnimatedDoor({ doorWidth, doorHeight, material, targetAngle }) {
  const groupRef = useRef()
  const angle = useRef(0)

  useFrame(() => {
    angle.current = THREE.MathUtils.lerp(angle.current, targetAngle, 0.07)
    if (groupRef.current) groupRef.current.rotation.y = angle.current
  })

  const absW = Math.abs(doorWidth)
  const sign = doorWidth > 0 ? 1 : -1

  return (
    <group ref={groupRef}>
      {/* mesh offset so hinge stays at group origin */}
      <mesh position={[sign * absW / 2, 0, 0]} castShadow>
        <boxGeometry args={[absW, doorHeight, 0.016]} />
        <meshStandardMaterial
          color={material.color}
          roughness={Math.max(0.1, material.roughness - 0.1)}
          metalness={0.12}
        />
      </mesh>
      {/* handle */}
      <mesh position={[sign * absW * 0.72, 0, 0.018]}>
        <cylinderGeometry args={[0.006, 0.006, 0.08, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function FurnitureMesh({ config, isOpen = false }) {
  const { width, height, depth, shelves, material, type } = config
  const t = 0.022
  const groupRef = useRef()
  const shelfYs = useShelves(height, shelves)
  const hasDoors = type.id === 'wardrobe' || type.id === 'cabinet'

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.12
    }
  })

  const doorW  = width / 2 - 0.008
  const doorH  = height - t * 2
  const doorZ  = depth / 2

  return (
    <group ref={groupRef} position={[0, height / 2, 0]}>
      {/* Cabinet body */}
      <Panel position={[0, 0, -(depth / 2 - t / 2)]}  size={[width, height, t]}     material={material} />
      <Panel position={[-(width / 2 - t / 2), 0, 0]}   size={[t, height, depth]}     material={material} />
      <Panel position={[width / 2 - t / 2, 0, 0]}      size={[t, height, depth]}     material={material} />
      <Panel position={[0, height / 2 - t / 2, 0]}     size={[width, t, depth]}      material={material} />
      <Panel position={[0, -(height / 2 - t / 2), 0]}  size={[width, t, depth]}      material={material} />

      {/* Shelves */}
      {shelfYs.map((y, i) => (
        <Shelf key={i} y={y} width={width} depth={depth} material={material} />
      ))}

      {/* Animated doors */}
      {hasDoors && (
        <>
          {/* Left door — hinge at left edge, swings left (+Y) */}
          <group position={[-width / 2, 0, doorZ]}>
            <AnimatedDoor
              doorWidth={doorW}
              doorHeight={doorH}
              material={material}
              targetAngle={isOpen ? -Math.PI / 2.0 : 0}
            />
          </group>

          {/* Right door — hinge at right edge, swings right (-Y) */}
          <group position={[width / 2, 0, doorZ]}>
            <AnimatedDoor
              doorWidth={-doorW}
              doorHeight={doorH}
              material={material}
              targetAngle={isOpen ? Math.PI / 2.0 : 0}
            />
          </group>
        </>
      )}
    </group>
  )
}