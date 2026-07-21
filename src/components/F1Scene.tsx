import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  OrbitControls, 
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { F1CarModel } from './F1CarModel';
import { PostProcessing } from './PostProcessing';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface F1SceneProps {
  color: string;
  selectedPart: string | null;
  onSelectPart: (part: string | null) => void;
  drsActive: boolean;
  rimsColor: 'black' | 'chrome' | 'accent';
  tireCompound: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';
  rideHeight: number;       // new custom physics offset
  steeringAngle: number;    // new custom steer angle
  // Live telemetry
  speed: number;
  brake: number;
  throttle: number;
  gForce: number;
  gear: number;
}

// ── Scrolling track ground — makes car look like it's moving ──────────────
function TrackGround({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    uniforms: {
      uTime:  { value: 0 },
      uSpeed: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uSpeed;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // Scrolling UV — car moves forward (Z)
        vec2 uv = vUv;
        uv.y -= uTime * uSpeed * 0.22;

        // Dark asphalt base
        vec3 asphalt = vec3(0.045, 0.045, 0.055);

        // Fine grain noise for tarmac texture
        float grain = hash(floor(uv * 320.0)) * 0.04 - 0.02;
        asphalt += grain;

        // Track centre line — white dashed line
        float cx = abs(vUv.x - 0.5);
        float dashFract = fract(uv.y * 6.0);
        float centerLine = step(cx, 0.006) * step(dashFract, 0.5) * 0.4;

        // Track edge lines - red and white racing curb effect on left and right edges
        float edgeL = step(abs(vUv.x - 0.08), 0.015);
        float edgeR = step(abs(vUv.x - 0.92), 0.015);
        
        // Alternating red/white curbs
        float curbFract = step(fract(uv.y * 8.0), 0.5);
        vec3 curbColor = mix(vec3(0.9, 0.05, 0.05), vec3(0.95, 0.95, 0.95), curbFract);
        vec3 curbs = (edgeL + edgeR) * curbColor;

        vec3 col = asphalt + centerLine;
        if (edgeL + edgeR > 0.0) {
          col = curbs;
        }

        // Subtle reflective sheen in centre
        float gloss = smoothstep(0.42, 0.5, vUv.x) * smoothstep(0.58, 0.5, vUv.x) * 0.08;
        col += gloss;

        // Fade to floor color at edges (outside track)
        float fade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        vec3 floorColor = vec3(0.03, 0.03, 0.04); // approx #08080a dark theme
        col = mix(floorColor, col, fade);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), []);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value  += delta;
    matRef.current.uniforms.uSpeed.value  = speed / 335; // normalised 0–1
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.158, 0]} receiveShadow>
      <planeGeometry args={[6, 18, 1, 1]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  );
}

// ── Speed streaks — horizontal light lines at high speed ──────────────────
function SpeedStreaks({ speed }: { speed: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const streakMats = useMemo(() => 
    Array.from({ length: 16 }, () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.9, 0.1, 0.05), // red hot streaks for premium speed effect
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    ),
  []);

  const streakData = useMemo(() => 
    Array.from({ length: 16 }, () => ({
      x:    (Math.random() - 0.5) * 5.5,
      y:    0.05 + Math.random() * 0.8,
      z:    (Math.random() - 0.5) * 5,
      len:  0.4 + Math.random() * 1.0,
      seed: Math.random() * 6.28,
    })),
  []);

  useFrame(({ clock }) => {
    const t     = clock.getElapsedTime();
    const alpha = Math.max(0, (speed - 180) / 155); // shows above 180 km/h

    streakData.forEach((d, i) => {
      const mat = streakMats[i];
      const pulse = Math.abs(Math.sin(t * 4 + d.seed));
      mat.opacity = alpha * pulse * 0.28;
    });
  });

  return (
    <group ref={groupRef}>
      {streakData.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0015, 0.0015, d.len, 3]} />
          <primitive object={streakMats[i]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ── Camera controller: lerps to part focus, adds speed shake ─────────────
function CameraController({
  selectedPart,
  controlsRef,
  speed,
}: {
  selectedPart: string | null;
  controlsRef: React.MutableRefObject<any>;
  speed: number;
}) {
  const { camera } = useThree();
  const targetPos    = useRef(new THREE.Vector3(3.5, 1.2, 4.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Part-focus camera positions
    if (selectedPart === 'aerodynamics') {
      targetPos.current.set(0.0, 0.45, 3.8);
      targetLookAt.current.set(0.0, 0.08, 2.2);
    } else if (selectedPart === 'engine') {
      targetPos.current.set(2.0, 0.9, 0.7);
      targetLookAt.current.set(0.0, 0.3, -0.2);
    } else if (selectedPart === 'drs') {
      targetPos.current.set(-1.8, 1.0, -3.0);
      targetLookAt.current.set(0.0, 0.55, -2.1);
    } else if (selectedPart === 'cockpit') {
      targetPos.current.set(0.0, 1.3, 0.9);
      targetLookAt.current.set(0.0, 0.35, 0.1);
    } else if (selectedPart === 'tires') {
      targetPos.current.set(2.0, 0.35, 1.8);
      targetLookAt.current.set(0.8, 0.2, 1.2);
    } else {
      targetPos.current.set(3.5, 1.2, 4.5);
      targetLookAt.current.set(0, 0, 0);
    }

    // Speed-based camera shake
    const shakeAmp = Math.max(0, (speed - 160) / 335) * 0.007;
    const time = performance.now() * 0.03;
    const shakeX   = Math.sin(time) * shakeAmp;
    const shakeY   = Math.cos(time * 0.7) * shakeAmp * 0.6;

    // Lerp camera position
    camera.position.lerp(targetPos.current, 0.045);
    camera.position.x += shakeX;
    camera.position.y += shakeY;

    // Lerp orbit target
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.05);
    }
  });

  return null;
}

// ── Main scene export ─────────────────────────────────────────────────────
export function F1Scene({
  color,
  selectedPart,
  onSelectPart,
  drsActive,
  rimsColor,
  tireCompound,
  rideHeight,
  steeringAngle,
  speed,
  brake,
  throttle,
  gForce,
  gear,
}: F1SceneProps) {
  const controlsRef = useRef<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="canvas-wrapper relative w-full h-full bg-[#060608]" style={{ touchAction: 'none' }}>
      <Canvas
        shadows={!isMobile}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          logarithmicDepthBuffer: true,
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [3.5, 1.2, 4.5], fov: 42, near: 0.1, far: 60 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onSelectPart(null);
        }}
      >
        <color attach="background" args={['#060608']} />
        
        {/* Environment setup for reflection maps */}
        <Environment preset="night" background={false} />

        {/* Ambient base */}
        <ambientLight intensity={0.2} color="#151722" />

        {/* Key light - aggressive racing studio spot */}
        <directionalLight
          position={[5, 8, 4]}
          intensity={2.8}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
          shadow-bias={-0.0001}
          shadow-camera-far={18}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* Dynamic neon highlights - red side light */}
        <directionalLight position={[-6, 2, 2]} intensity={1.8} color="#ff1801" />

        {/* Dynamic neon highlights - electric blue side light */}
        <directionalLight position={[6, 2, -2]} intensity={1.2} color="#0055ff" />

        {/* Spotlights mapping the tires and engine */}
        <spotLight
          position={[0, 6, -3]}
          intensity={3.5}
          angle={Math.PI / 4}
          penumbra={0.9}
          color="#ffeacc"
          castShadow={!isMobile}
        />

        {/* ── Car model ── */}
        <Suspense fallback={null}>
          <F1CarModel
            color={color}
            selectedPart={selectedPart}
            onSelectPart={onSelectPart}
            drsActive={drsActive}
            rimsColor={rimsColor}
            tireCompound={tireCompound}
            rideHeight={rideHeight}
            steeringAngle={steeringAngle}
            speed={speed}
            brake={brake}
            throttle={throttle}
            gForce={gForce}
            gear={gear}
          />
        </Suspense>

        {/* ── Scrolling asphalt track ── */}
        <TrackGround speed={speed} />

        {/* ── Wide dark floor beyond the track ── */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#060608" roughness={0.92 /* very matte */} metalness={0.03} />
        </mesh>

        {/* ── Speed streak lines ── */}
        <SpeedStreaks speed={speed} />

        {/* ── Soft contact shadow under tires ── */}
        <ContactShadows
          position={[0, -0.155, 0]}
          opacity={0.75}
          scale={7.5}
          blur={1.4}
          far={1.4}
          resolution={512}
          color="#000000"
        />

        {/* ── Orbit controls ── */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={9.5}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minPolarAngle={0.12}
          enableZoom
        />

        {/* ── Camera controller (focus + shake) ── */}
        <CameraController
          selectedPart={selectedPart}
          controlsRef={controlsRef}
          speed={speed}
        />

        {/* ── Post-processing ── */}
        <PostProcessing selectedPart={selectedPart} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
