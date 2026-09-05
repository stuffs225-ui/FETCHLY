import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface Market {
  name: string
  lat: number
  lon: number
  color?: string
}

const HUB: Market = { name: 'Saudi Arabia', lat: 24.7, lon: 46.7 }

const MARKETS: Market[] = [
  { name: 'USA', lat: 38.9, lon: -77.0 },
  { name: 'UK', lat: 51.5, lon: -0.1 },
  { name: 'Germany', lat: 52.5, lon: 13.4 },
  { name: 'Italy', lat: 41.9, lon: 12.5 },
  { name: 'Japan', lat: 35.7, lon: 139.7 },
  { name: 'South Korea', lat: 37.6, lon: 127.0 },
  { name: 'China', lat: 39.9, lon: 116.4 },
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

  return <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#9a8a5f', transparent: true, opacity: 0.28 }))} />
}

function Dot({ position, hub }: { position: THREE.Vector3; hub?: boolean }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[hub ? 0.05 : 0.03, 12, 12]} />
      <meshBasicMaterial color={hub ? '#c9a668' : '#dfe4ee'} />
    </mesh>
  )
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
      {/* wireframe shell — coarse and dim, reads as a globe grid rather than a circuit/network pattern */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 2]} />
        <meshBasicMaterial color="#8f8367" wireframe transparent opacity={0.14} />
      </mesh>
      {/* solid inner sphere for depth */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 48, 48]} />
        <meshStandardMaterial color="#101625" roughness={0.85} metalness={0.1} />
      </mesh>

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
