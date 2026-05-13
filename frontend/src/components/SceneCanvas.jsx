import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { FurnitureMesh } from './FurnitureMesh'
import { Suspense } from 'react'

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#e8e0d4" roughness={1} />
    </mesh>
  )
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
  position={[4, 8, 4]}
  intensity={1.2}
  castShadow
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
/>
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />
    </>
  )
}

export function SceneCanvas({ config, isOpen }) {
  return (
    <Canvas shadows camera={{ position: [2.5, 2, 3], fov: 40 }} style={{ background: 'transparent' }}>
      <Suspense fallback={null}>
        <SceneLighting />
        <Environment preset="apartment" />
        <Floor />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={8} blur={2} far={4} color="#8b7355" />
        <FurnitureMesh config={config} isOpen={isOpen} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={1.5}
          maxDistance={6}
          target={[0, config.height / 2, 0]}
        />
      </Suspense>
    </Canvas>
  )
}