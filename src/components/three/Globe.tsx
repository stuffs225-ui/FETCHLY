import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CONTINENTS } from './continents'

interface Market {
  name: string
  lat: number
  lon: number
}

const HUB: Market = { name: 'Saudi Arabia', lat: 24.7, lon: 46.7 }

// Kept to four representative regions — enough to read as "global sourcing"
// without the clutter of a full market list.
const MARKETS: Market[] = [
  { name: 'USA', lat: 38.9, lon: -77.0 },
  { name: 'UK', lat: 51.5, lon: -0.1 },
  { name: 'Europe', lat: 50.1, lon: 10.5 },
  { name: 'Asia', lat: 31.2, lon: 112.0 },
]

const RADIUS = 1.7

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

// A static arc (no traveling "pulse" dot) — enough to read as a connection
// between the hub and a market without the site tipping into a
// blockchain/network-diagram look.
function Arc({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS * 1.3)
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, mid, to])
  const points = useMemo(() => curve.getPoints(48), [curve])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#9a8a5f', transparent: true, opacity: 0.32 }))} />
}

function Dot({ position, hub }: { position: THREE.Vector3; hub?: boolean }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[hub ? 0.055 : 0.03, 12, 12]} />
      <meshBasicMaterial color={hub ? '#d4b878' : '#dfe4ee'} />
    </mesh>
  )
}

function ContinentOutline({ points }: { points: [number, number][] }) {
  const geometry = useMemo(() => {
    const vecs = points.map(([lat, lon]) => latLonToVector3(lat, lon, RADIUS * 1.001))
    return new THREE.BufferGeometry().setFromPoints(vecs)
  }, [points])

  return <primitive object={new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: '#8f8367', transparent: true, opacity: 0.4 }))} />
}

function GlobeScene({ autoRotate }: { autoRotate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const hubPos = useMemo(() => latLonToVector3(HUB.lat, HUB.lon, RADIUS), [])
  const markets = useMemo(() => MARKETS.map((m) => ({ ...m, pos: latLonToVector3(m.lat, m.lon, RADIUS) })), [])

  useFrame((_, delta) => {
    if (group.current && autoRotate) group.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={group} rotation={[0.25, -0.6, 0]}>
      {/* solid sphere for depth/base */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 48, 48]} />
        <meshStandardMaterial color="#101625" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* simplified continent outlines — reads as Earth, not a network graph */}
      {CONTINENTS.map((points, i) => (
        <ContinentOutline key={i} points={points} />
      ))}

      <Dot position={hubPos} hub />
      {markets.map((m) => (
        <Dot key={m.name} position={m.pos} />
      ))}
      {markets.map((m) => (
        <Arc key={m.name} from={hubPos.clone()} to={m.pos.clone()} />
      ))}
    </group>
  )
}

export default function Globe({ className }: { className?: string }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.4], fov: 42 }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 3, 5]} intensity={45} color="#cbbf9e" />
        <pointLight position={[-4, -2, -4]} intensity={30} color="#2b3f68" />
        <Suspense fallback={null}>
          <GlobeScene autoRotate={!reducedMotion} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.4}
          minPolarAngle={Math.PI / 2 - 0.6}
          maxPolarAngle={Math.PI / 2 + 0.6}
        />
      </Canvas>
    </div>
  )
}
