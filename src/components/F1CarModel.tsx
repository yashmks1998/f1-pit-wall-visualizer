import { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface F1CarModelProps {
  color: string;
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  drsActive: boolean;
  rimsColor: 'black' | 'chrome' | 'accent';
  tireCompound: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';
  rideHeight: number;       // Custom ride height offset (in meters)
  steeringAngle: number;    // Custom front wheel steer angle (in degrees)
  // Live telemetry for physics animation
  speed: number;
  brake: number;
  throttle: number;
  gForce: number;
  gear: number;
}

// C42 GLB material name suffix → part role
const SUFFIX_ROLE: Record<number, string> = {
  1:  'paint',  // body paint — main livery
  2:  'paint',  // body paint — sidepods
  3:  'paint',  // body paint — nose/halo/wings
  4:  'carbon', // carbon fibre trim
  5:  'caliper',// brake caliper
  6:  'chrome', // chrome suspension arms
  7:  'carbon', // carbon floor / diffuser
  8:  'chrome', // chrome metal details
  9:  'tire',   // tyre rubber
  11: 'rim',    // wheel rims
  13: 'glass',  // visor / windscreen
};

export function F1CarModel({
  color,
  selectedPart,
  onSelectPart,
  rimsColor,
  tireCompound,
  rideHeight,
  speed,
  brake,
  throttle,
  gForce,
}: F1CarModelProps) {
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'f1_car.glb');

  // Clone the scene and its materials so we get independent meshes/materials per instance
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => m.clone());
        } else {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
      }
    });
    return clone;
  }, [scene]);

  const outerRef = useRef<THREE.Group>(null); // Y-position float & Y-rotation
  const bodyRef  = useRef<THREE.Group>(null); // suspension physics (pitch/roll/bounce)
  
  // References to front wheel objects for dynamic steering
  const frontWheelsRef = useRef<THREE.Object3D[]>([]);

  // ── Find front wheels for steering once scene is loaded ──────────────────
  useEffect(() => {
    if (!clonedScene) return;
    
    // Find bounding box to determine front vs rear wheels
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const wheels: THREE.Object3D[] = [];
    clonedScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const nameLower = mesh.name.toLowerCase();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        const isWheel = nameLower.includes('wheel') || nameLower.includes('tire') || nameLower.includes('rim') || mats.some(mat => {
          const m = mat.name.match(/\.(\d+)$/);
          const suffix = m ? parseInt(m[1], 10) : -1;
          const role = SUFFIX_ROLE[suffix];
          return role === 'tire' || role === 'rim';
        });

        if (isWheel) {
          // Bounding center in local space of clonedScene
          const meshBox = new THREE.Box3().setFromObject(mesh);
          const meshCenter = new THREE.Vector3();
          meshBox.getCenter(meshCenter);
          
          // In the unscaled space, the F1 car faces negative Z (nose at Z < center.z)
          // Therefore, front wheels have center.z < 0 or center.z < carCenter.z
          if (meshCenter.z < center.z) {
            wheels.push(mesh);
          }
        }
      }
    });

    frontWheelsRef.current = wheels;
  }, [clonedScene]);

  // ── Rim colour config ─────────────────────────────────────────────────────
  const rimCfg = useMemo(() => {
    switch (rimsColor) {
      case 'chrome': return { hex: '#e2e8f0', metal: 1.0,  rough: 0.03 };
      case 'accent': return { hex: color,     metal: 0.85, rough: 0.12 };
      default:       return { hex: '#0f0f12', metal: 0.7,  rough: 0.28 };
    }
  }, [rimsColor, color]);

  // ── Caliper colour matches Pirelli Compound ────────────────────────────────
  const caliperHex = useMemo(() => {
    switch (tireCompound) {
      case 'soft':          return '#ef4444'; // Red
      case 'medium':        return '#eab308'; // Yellow
      case 'hard':          return '#f8fafc'; // White
      case 'intermediate':  return '#22c55e'; // Green
      case 'wet':           return '#3b82f6'; // Blue
      default:              return '#ef4444';
    }
  }, [tireCompound]);

  // ── Apply / update materials on clone whenever config props change ─────────
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      mesh.castShadow    = true;
      mesh.receiveShadow = true;

      const applyToMat = (mat: THREE.Material) => {
        const m = mat.name.match(/\.(\d+)$/);
        const suffix = m ? parseInt(m[1], 10) : -1;
        const role   = SUFFIX_ROLE[suffix] ?? 'paint';

        const c = mat as THREE.MeshStandardMaterial;

        switch (role) {
          case 'paint':
            c.color.set(color);
            c.metalness        = 0.92;
            c.roughness        = 0.08;
            c.envMapIntensity  = 2.4;
            if ('clearcoat' in c) {
              (c as THREE.MeshPhysicalMaterial).clearcoat          = 1.0;
              (c as THREE.MeshPhysicalMaterial).clearcoatRoughness = 0.02;
            }
            break;

          case 'carbon':
            c.color.set('#0b0b0d');
            c.metalness       = 0.1;
            c.roughness       = 0.5;
            c.envMapIntensity = 0.5;
            break;

          case 'caliper':
            c.color.set(caliperHex);
            c.metalness = 0.8;
            c.roughness = 0.2;
            break;

          case 'chrome':
            c.color.set('#cccccc');
            c.metalness       = 1.0;
            c.roughness       = 0.03;
            c.envMapIntensity = 3.2;
            break;

          case 'rim':
            c.color.set(rimCfg.hex);
            c.metalness       = rimCfg.metal;
            c.roughness       = rimCfg.rough;
            c.envMapIntensity = 2.6;
            break;

          case 'tire':
            c.color.set('#09090b');
            c.metalness       = 0.05;
            // Differentiate texture slightly for intermediates/wets
            c.roughness       = (tireCompound === 'intermediate' || tireCompound === 'wet') ? 0.8 : 0.94;
            c.envMapIntensity = 0.1;
            break;

          case 'glass':
            c.color.set('#88aacc');
            c.metalness  = 0.1;
            c.roughness  = 0.0;
            c.transparent = true;
            c.opacity     = 0.35;
            c.envMapIntensity = 3.6;
            break;
        }

        c.needsUpdate = true;
      };

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyToMat);
      } else {
        applyToMat(mesh.material);
      }
    });
  }, [clonedScene, color, rimCfg, caliperHex, tireCompound]);

  // ── Physics animation state ───────────────────────────────────────────────
  const phys = useRef({
    time:    0,
    bounce:  0,
    pitch:   0,  // nose-up (+) / nose-down (-)
    roll:    0,  // lean
    rotY:    0,  // outer group Y rotation (idle spin)
    floatY:  -0.15,
  });

  useFrame((_, delta) => {
    const s = phys.current;
    s.time += delta;

    // ── Suspension bounce: faster & larger at high speed ──────────────────
    const speedNorm   = Math.min(speed / 335, 1);
    const bumpFreq    = 3.5 + speedNorm * 8;          // 3.5–11.5 Hz
    const bumpAmp     = 0.002 + speedNorm * 0.009;    // 2–11 mm
    const rawBounce   = Math.sin(s.time * bumpFreq * Math.PI * 2) * bumpAmp
                      + Math.sin(s.time * bumpFreq * 0.37 * Math.PI * 2) * bumpAmp * 0.4;
    s.bounce = THREE.MathUtils.damp(s.bounce, rawBounce, 15, delta);

    // ── Brake dive: nose dips forward under hard braking ─────────────────
    const brakeNorm   = brake / 100;
    const throttleNorm = throttle / 100;
    const rawPitch    = brakeNorm * -0.05 + throttleNorm * 0.012;
    s.pitch = THREE.MathUtils.damp(s.pitch, rawPitch, 10, delta);

    // ── Corner lean: body rolls based on lateral G ────────────────────────
    const latG     = Math.max(0, gForce - 1.0);
    const leanDir  = Math.sin(s.time * 0.28);
    const rawRoll  = latG * 0.022 * leanDir;
    s.roll = THREE.MathUtils.damp(s.roll, rawRoll, 8, delta);

    // Apply suspension + Ride Height offset to body group
    if (bodyRef.current) {
      // Y offset adjusted by rideHeight slider
      bodyRef.current.position.y = s.bounce + rideHeight;
      bodyRef.current.rotation.x = s.pitch;
      bodyRef.current.rotation.z = s.roll;
    }

    // ── Outer group: float + Y-rotation ──────────────────────────────────
    if (outerRef.current) {
      if (!selectedPart) {
        // Idle showcase rotation — speed-influenced
        s.rotY += (0.0012 + speedNorm * 0.0008) * (60 * delta);
        outerRef.current.rotation.y = s.rotY;

        // Gentle float
        const targetY = Math.sin(s.time * 0.55) * 0.012 - 0.15;
        s.floatY = THREE.MathUtils.damp(s.floatY, targetY, 4, delta);
        outerRef.current.position.y = s.floatY;
      } else {
        // Stop rotating and lock when a part is selected
        outerRef.current.rotation.y = THREE.MathUtils.damp(outerRef.current.rotation.y, 0, 6, delta);
        outerRef.current.position.y = THREE.MathUtils.damp(outerRef.current.position.y, -0.15, 6, delta);
      }
    }
  });

  // ── Hotspot click boundaries ──────────────────────────────────────────────
  const hotspots = [
    { id: 'aerodynamics', pos: [0,    0.10,  2.20] as [number,number,number], size: [1.8, 0.25, 0.60] as [number,number,number] },
    { id: 'engine',       pos: [0,    0.30, -0.50] as [number,number,number], size: [1.0, 0.50, 1.00] as [number,number,number] },
    { id: 'drs',          pos: [0,    0.55, -2.20] as [number,number,number], size: [1.6, 0.45, 0.50] as [number,number,number] },
    { id: 'cockpit',      pos: [0,    0.40,  0.10] as [number,number,number], size: [0.7, 0.45, 0.70] as [number,number,number] },
    { id: 'tires',        pos: [0.85, 0.20,  1.10] as [number,number,number], size: [0.3, 0.55, 0.60] as [number,number,number] },
  ];

  return (
    <group ref={outerRef} position={[0, -0.15, 0]}>
      {/* Inner body group handles suspension physics & ride height */}
      <group ref={bodyRef}>
        <group scale={[0.12, 0.12, 0.12]} rotation={[0, Math.PI, 0]}>
          <primitive object={clonedScene} />
        </group>
      </group>

      {/* Click hotspots */}
      {hotspots.map(({ id, pos, size }) => (
        <mesh
          key={id}
          position={pos}
          visible={false}
          onClick={(e) => { e.stopPropagation(); onSelectPart(id); }}
        >
          <boxGeometry args={size} />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(import.meta.env.BASE_URL + 'f1_car.glb');
