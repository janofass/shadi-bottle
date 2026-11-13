import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { generateInnerPetalTexture, generateInnerStardustTexture } from '../utils/sleeveTexture'
import {
  CORNER_SEGMENTS,
  HEIGHT,
  NECK_R,
  PROFILE,
  SLEEVE_BOTTOM,
  SLEEVE_GAP,
  SLEEVE_PROFILE,
  SLEEVE_TOP,
  UV_INSET,
  ringPoints,
} from '../utils/bottleProfile'

// Water fills the body up to the end of the shoulder taper.
const WATER_PROFILE = PROFILE.slice(0, 6).map((p, i) => ({
  y: i === 0 ? 0.15 : p.y,
  hw: p.hw - 0.18,
  r: Math.max(p.r - 0.18, 0.3),
}))

const FLANGE_Y = 17.3
const THREAD_BOTTOM = 17.8
const THREAD_TOP = HEIGHT - 0.4
const CAP_BOTTOM = 17.75
const CAP_TOP = 19.6

// Texture panels: 0 Front, 1 Right, 2 Left, 3 Back. Faces listed in ring traversal order: +z, -x, -z, +x.
const FACE_PANELS = [0, 2, 3, 1]

// Lofts rounded-square rings into a closed shell. UVs: u around the perimeter, v up the height.
function loft(profile, { bottomCap = false, topCap = false } = {}) {
  const rings = profile.map(({ y, hw, r }) => ({ y, pts: ringPoints(hw, r) }))
  const n = rings[0].pts.length
  const m = n + 1
  const yMin = rings[0].y
  const ySpan = rings[rings.length - 1].y - yMin
  const positions = []
  const uvs = []
  const ringUvU = rings.map(({ pts }) => {
    const acc = [0]
    for (let i = 1; i <= n; i++) {
      const p = pts[i % n]
      const q = pts[i - 1]
      acc.push(acc[i - 1] + Math.hypot(p[0] - q[0], p[1] - q[1]))
    }
    return acc.map((d) => d / acc[n])
  })

  rings.forEach(({ y, pts }, j) => {
    for (let i = 0; i <= n; i++) {
      const [x, z] = pts[i % n]
      positions.push(x, y, z)
      uvs.push(ringUvU[j][i], (y - yMin) / ySpan)
    }
  })

  const index = []
  for (let j = 0; j < rings.length - 1; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * m + i
      const c = a + m
      index.push(a, c, c + 1, a, c + 1, a + 1)
    }
  }

  // Caps use their own vertices so the rim stays a hard edge.
  const addCap = (ringIdx, up) => {
    const { y, pts } = rings[ringIdx]
    const start = positions.length / 3
    for (let i = 0; i <= n; i++) {
      const [x, z] = pts[i % n]
      positions.push(x, y, z)
      uvs.push(ringUvU[ringIdx][i], (y - yMin) / ySpan)
    }
    const center = positions.length / 3
    positions.push(0, y, 0)
    uvs.push(0.5, (y - yMin) / ySpan)
    for (let i = 0; i < n; i++) {
      const a = start + i
      index.push(center, up ? a + 1 : a, up ? a : a + 1)
    }
  }
  if (bottomCap) addCap(0, false)
  if (topCap) addCap(rings.length - 1, true)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(index)
  geometry.computeVertexNormals()

  // Duplicated seam vertices must share one normal.
  const normal = geometry.getAttribute('normal')
  for (let j = 0; j < rings.length; j++) {
    const first = j * m
    const last = first + n
    const nx = normal.getX(first) + normal.getX(last)
    const ny = normal.getY(first) + normal.getY(last)
    const nz = normal.getZ(first) + normal.getZ(last)
    const len = Math.hypot(nx, ny, nz) || 1
    normal.setXYZ(first, nx / len, ny / len, nz / len)
    normal.setXYZ(last, nx / len, ny / len, nz / len)
  }
  return geometry
}

// Four panels follow the body and shoulders, leaving the base exposed.
function buildSleeveGeometry() {
  const perCorner = CORNER_SEGMENTS + 1
  const half = CORNER_SEGMENTS / 2
  const rings = SLEEVE_PROFILE.map(({ hw, r }) => ringPoints(hw + SLEEVE_GAP, r + SLEEVE_GAP))
  const positions = []
  const normals = []
  const uvs = []
  const index = []

  FACE_PANELS.forEach((panel, f) => {
    const start = f * perCorner
    const next = ((f + 1) % 4) * perCorner
    const u0 = panel / 4 + UV_INSET
    const u1 = (panel + 1) / 4 - UV_INSET
    const base = positions.length / 3
    const m = CORNER_SEGMENTS + 2 + (f === 0 ? 1 : 0)

    SLEEVE_PROFILE.forEach(({ y }, row) => {
      const pts = rings[row]
      const face = [...pts.slice(start + half, start + perCorner), ...pts.slice(next, next + half + 1)]
      if (f === 0) {
        const left = face[half]
        const right = face[half + 1]
        face.splice(half + 1, 0, [(left[0] + right[0]) / 2, (left[1] + right[1]) / 2, left[2]])
      }
      const acc = [0]
      for (let i = 1; i < face.length; i++) {
        acc.push(acc[i - 1] + Math.hypot(face[i][0] - face[i - 1][0], face[i][1] - face[i - 1][1]))
      }
      const total = acc[acc.length - 1]
      const before = SLEEVE_PROFILE[Math.max(0, row - 1)]
      const after = SLEEVE_PROFILE[Math.min(SLEEVE_PROFILE.length - 1, row + 1)]
      const slope = (after.hw - before.hw) / (after.y - before.y)
      const normalScale = 1 / Math.hypot(1, slope)
      face.forEach(([x, z, angle], i) => {
        positions.push(x, y, z)
        normals.push(Math.cos(angle) * normalScale, -slope * normalScale, Math.sin(angle) * normalScale)
        // Ring runs right-to-left as seen from outside, so u is reversed to avoid mirroring.
        uvs.push(u1 - (acc[i] / total) * (u1 - u0), (y - SLEEVE_BOTTOM) / (SLEEVE_TOP - SLEEVE_BOTTOM))
      })
    })
    for (let row = 0; row < SLEEVE_PROFILE.length - 1; row++) {
      for (let i = 0; i < m - 1; i++) {
        const a = base + row * m + i
        const c = a + m
        // Mirror the front-center diagonals so tapering does not shear centered artwork.
        if (f === 0 && i === half + 1) {
          index.push(a, c, a + 1, a + 1, c, c + 1)
        } else {
          index.push(a, c, c + 1, a, c + 1, a + 1)
        }
      }
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(index)
  return geometry
}

function tileInnerTexture(texture) {
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(2, 1)
}

function useCanvasTexture(canvas, configure) {
  const gl = useThree((state) => state.gl)
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = gl.capabilities.getMaxAnisotropy()
    configure?.(tex)
    return tex
  }, [canvas, gl, configure])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function GlassMaterial() {
  return (
    <meshPhysicalMaterial
      color="#a6daf4"
      transmission={1}
      thickness={0.35}
      ior={1.45}
      roughness={0.03}
      envMapIntensity={0.9}
      depthWrite={false}
    />
  )
}

// Body glass is plain alpha so the water and sleeve layers inside/over it sort correctly.
function BodyGlassMaterial() {
  return (
    <meshPhysicalMaterial
      color="#8acded"
      transparent
      opacity={0.32}
      ior={1.45}
      roughness={0.03}
      clearcoat={1}
      clearcoatRoughness={0.03}
      envMapIntensity={1.4}
      depthWrite={false}
    />
  )
}

function Bottle({ innerEffect }) {
  const bodyGeometry = useMemo(() => loft(PROFILE, { bottomCap: true, topCap: true }), [])
  const waterGeometry = useMemo(() => loft(WATER_PROFILE, { topCap: true }), [])
  const threadGeometry = useMemo(() => {
    const turns = 3
    const steps = 96
    const pts = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const a = t * turns * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          (NECK_R + 0.04) * Math.cos(a),
          THREAD_BOTTOM + t * (THREAD_TOP - THREAD_BOTTOM),
          (NECK_R + 0.04) * Math.sin(a),
        ),
      )
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 192, 0.07, 8, false)
  }, [])

  const innerCanvas = useMemo(
    () => (innerEffect === 'stardust' ? generateInnerStardustTexture() : generateInnerPetalTexture()),
    [innerEffect],
  )
  const innerTexture = useCanvasTexture(innerCanvas, tileInnerTexture)

  return (
    <group>
      <mesh geometry={bodyGeometry} renderOrder={0}>
        <BodyGlassMaterial />
      </mesh>

      <mesh position={[0, FLANGE_Y, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.18, 48]} />
        <GlassMaterial />
      </mesh>

      <mesh geometry={threadGeometry}>
        <GlassMaterial />
      </mesh>

      <mesh position={[0, (CAP_BOTTOM + CAP_TOP) / 2, 0]}>
        <cylinderGeometry args={[1.5, 1.5, CAP_TOP - CAP_BOTTOM, 64]} />
        <meshPhysicalMaterial color="#0054aa" roughness={0.3} clearcoat={0.5} />
      </mesh>

      {/* Both faces render so the far wall shows through the near one, giving depth. */}
      <mesh geometry={waterGeometry} renderOrder={1}>
        <meshBasicMaterial map={innerTexture} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Sleeve({ sleeveCanvas }) {
  const geometry = useMemo(() => buildSleeveGeometry(), [])
  const texture = useCanvasTexture(sleeveCanvas)

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <meshPhysicalMaterial map={texture} transparent roughness={0.5} envMapIntensity={0.5} />
    </mesh>
  )
}

const VIEW_DISTANCE = 192
const VIEW_POLAR = Math.PI / 2 - 0.05
const VIEW_FOV = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(16)) / 4))
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// Eases the orbit camera to cameraView.angle (azimuth: 0 front, PI/2 right, PI back, -PI/2 left).
function CameraRig({ cameraView }) {
  const controls = useThree((state) => state.controls)
  const camera = useThree((state) => state.camera)
  const goal = useRef(null)
  const spherical = useMemo(() => new THREE.Spherical(), [])
  const offset = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (cameraView) goal.current = cameraView.angle
  }, [cameraView])

  // Dragging takes over from any running animation.
  useEffect(() => {
    if (!controls) return undefined
    const cancel = () => {
      goal.current = null
    }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, delta) => {
    if (goal.current === null || !controls) return
    const k = 1 - Math.exp(-7 * delta)
    offset.copy(camera.position).sub(controls.target)
    spherical.setFromVector3(offset)
    const dTheta = wrapAngle(goal.current - spherical.theta)
    const dPhi = VIEW_POLAR - spherical.phi
    const dRadius = VIEW_DISTANCE - spherical.radius
    const done = Math.abs(dTheta) < 0.002 && Math.abs(dPhi) < 0.002 && Math.abs(dRadius) < 0.05
    spherical.theta += done ? dTheta : dTheta * k
    spherical.phi += done ? dPhi : dPhi * k
    spherical.radius += done ? dRadius : dRadius * k
    camera.position.copy(controls.target).add(offset.setFromSpherical(spherical))
    controls.update()
    if (done) goal.current = null
  })

  return null
}

export default function BottleCanvas({ sleeveCanvas, cameraView, innerEffect }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, HEIGHT / 2 + 1, VIEW_DISTANCE], fov: VIEW_FOV }} gl={{ antialias: true }}>
      <color attach="background" args={['#ece7df']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 15]} intensity={1.2} />
      <Environment resolution={512}>
        <Lightformer form="rect" intensity={3} position={[0, 8, 10]} scale={[14, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-10, 2, 2]} scale={[14, 10, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[10, 2, 2]} scale={[14, 10, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 2, -10]} scale={[16, 10, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 12, 0]} scale={8} />
      </Environment>
      <Bottle innerEffect={innerEffect} />
      {sleeveCanvas && <Sleeve sleeveCanvas={sleeveCanvas} />}
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={30} blur={2.5} far={6} />
      <OrbitControls makeDefault target={[0, HEIGHT / 2, 0]} enablePan={false} minDistance={60} maxDistance={280} />
      <CameraRig cameraView={cameraView} />
    </Canvas>
  )
}
