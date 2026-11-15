'use client';

/**
 * HeroScene — cinematic 3D showroom hero.
 *
 * Stack: three.js + React Three Fiber + Drei + GSAP. 100% procedural — no HDR
 * files, no model downloads, no network at runtime:
 *   • GT coupe body extruded from a hand-tuned 2D silhouette (THREE.Shape →
 *     ExtrudeGeometry with bevel) with clearcoat physical paint
 *   • Gloss "greenhouse" glass slab extruded slightly wider than the body
 *   • MeshReflectorMaterial showroom floor (blurred planar reflections)
 *   • <Environment frames={1}> renders a local Lightformer rig to a PMREM
 *     cubemap — warm key, crimson rim, cool fill. No external HDR fetch.
 *   • GSAP drive-in intro: car slides from off-camera, wheels spin down,
 *     headlights flash; idle breathing rotation; pointer parallax camera
 *   • drei Sparkles dust motes, capped DPR, fog depth, reduced-motion aware
 *   • If WebGL is unavailable the Canvas `fallback` shows the hero image
 *     (pass fallbackImage) or a CSS crimson-halo gradient — never a black box.
 */

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  RoundedBox,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/* ────────────────────────────────────────────────────────────
   Silhouette — side profile of a shooting-brake GT coupe.
   x = length axis (front is +x), y = height.
   ──────────────────────────────────────────────────────────── */
function buildBodyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-2.1, 0.26);
  s.lineTo(2.12, 0.26);                        // flat floor
  s.quadraticCurveTo(2.38, 0.3, 2.36, 0.48);   // front bumper
  s.quadraticCurveTo(2.32, 0.64, 1.98, 0.7);   // nose
  s.quadraticCurveTo(1.15, 0.76, 0.42, 0.8);   // hood
  s.quadraticCurveTo(0.05, 1.18, -0.62, 1.13); // windshield → roof
  s.quadraticCurveTo(-1.1, 0.9, -1.62, 0.83);  // C-pillar → decklid
  s.quadraticCurveTo(-2.12, 0.8, -2.34, 0.66); // tail
  s.quadraticCurveTo(-2.5, 0.48, -2.24, 0.3);  // rear bumper
  s.closePath();
  return s;
}

function buildGlassShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-1.52, 0.85);
  s.quadraticCurveTo(-1.05, 0.88, -0.58, 1.09); // C-pillar
  s.quadraticCurveTo(0.02, 1.14, 0.38, 0.82);   // roof → windshield base
  s.quadraticCurveTo(-0.15, 0.76, -0.62, 0.765);// lower windshield edge
  s.quadraticCurveTo(-1.15, 0.77, -1.52, 0.85); // beltline back to tail
  s.closePath();
  return s;
}

function Car({ reducedMotion }: { reducedMotion: boolean }) {
  const carRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Group[]>([]);
  const headlightMats = useRef<THREE.MeshStandardMaterial[]>([]);

  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(buildBodyShape(), {
      depth: 1.5,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.09,
      bevelSegments: 4,
      curveSegments: 14,
    });
    geo.translate(0, 0, -0.75);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const glassGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(buildGlassShape(), {
      depth: 1.56,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geo.translate(0, 0, -0.78);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      bodyGeo.dispose();
      glassGeo.dispose();
    };
  }, [bodyGeo, glassGeo]);

  /* GSAP drive-in: slide from off-camera, wheels spin down, headlight flash */
  useEffect(() => {
    const car = carRef.current;
    if (!car) return;
    if (reducedMotion) {
      car.position.set(0, 0, 0);
      car.rotation.set(0, 0, 0);
      return;
    }
    car.position.set(-6.6, 0, 0);
    car.rotation.set(0, 0.85, 0);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(car.position, { x: 0, duration: 1.7 })
      .to(car.rotation, { y: 0, duration: 1.7 }, 0);
    wheelRefs.current.forEach((w) => {
      if (w) gsap.fromTo(w.rotation, { z: 0 }, { z: -Math.PI * 4.5, duration: 1.7, ease: 'expo.out' });
    });
    headlightMats.current.forEach((m) => {
      if (m) gsap.fromTo(m, { emissiveIntensity: 16 }, { emissiveIntensity: 3.6, duration: 1.5, delay: 1.0, ease: 'power2.out' });
    });
    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  const wheel = (x: number, z: number, key: string) => (
    <group
      key={key}
      position={[x, 0.44, z]}
      ref={(g) => {
        if (g && !wheelRefs.current.includes(g)) wheelRefs.current.push(g);
      }}
    >
      {/* tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.34, 28]} />
        <meshStandardMaterial color="#0A0A0B" roughness={0.88} metalness={0.15} />
      </mesh>
      {/* rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.255, 0.255, 0.352, 20]} />
        <meshStandardMaterial color="#E9E5D8" roughness={0.16} metalness={1} envMapIntensity={1.6} />
      </mesh>
      {/* hub cap */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.356, 14]} />
        <meshStandardMaterial color="#8F1D13" roughness={0.3} metalness={0.8} emissive="#D42B1E" emissiveIntensity={0.65} />
      </mesh>
    </group>
  );

  return (
    <group ref={carRef} position={[0, 0, 0]}>
      {/* body */}
      <mesh geometry={bodyGeo} castShadow>
        <meshPhysicalMaterial
          color="#161618"
          metalness={0.72}
          roughness={0.26}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* glass greenhouse */}
      <mesh geometry={glassGeo}>
        <meshPhysicalMaterial
          color="#05070C"
          metalness={0.92}
          roughness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.3}
        />
      </mesh>
      {/* crimson side spears */}
      {[0.77, -0.77].map((z) => (
        <RoundedBox key={z} args={[3.15, 0.05, 0.025]} radius={0.02} position={[0, 0.4, z]}>
          <meshStandardMaterial color="#2A0705" emissive="#E5483C" emissiveIntensity={1.7} roughness={0.4} />
        </RoundedBox>
      ))}
      {/* rear wing + supports */}
      <RoundedBox args={[0.5, 0.045, 1.42]} radius={0.02} position={[-2.02, 1.02, 0]} rotation={[0, 0, -0.09]}>
        <meshPhysicalMaterial color="#121214" metalness={0.8} roughness={0.22} clearcoat={1} envMapIntensity={1.4} />
      </RoundedBox>
      {[0.44, -0.44].map((z) => (
        <mesh key={z} position={[-1.98, 0.9, z]}>
          <boxGeometry args={[0.09, 0.18, 0.09]} />
          <meshStandardMaterial color="#0E0E10" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* grille */}
      <RoundedBox args={[0.05, 0.1, 0.9]} radius={0.02} position={[2.34, 0.4, 0]}>
        <meshStandardMaterial color="#060606" roughness={0.5} metalness={0.6} />
      </RoundedBox>
      {/* headlights */}
      {[0.47, -0.47].map((z) => (
        <RoundedBox key={z} args={[0.07, 0.1, 0.36]} radius={0.03} position={[2.33, 0.6, z]}>
          <meshStandardMaterial
            color="#171410"
            emissive="#FFF3C4"
            emissiveIntensity={3.6}
            ref={(m) => {
              if (m && !headlightMats.current.includes(m)) headlightMats.current.push(m);
            }}
          />
        </RoundedBox>
      ))}
      {/* full-width crimson taillight bar */}
      <RoundedBox args={[0.06, 0.075, 1.16]} radius={0.03} position={[-2.42, 0.63, 0]}>
        <meshStandardMaterial color="#1A0505" emissive="#FF2D1E" emissiveIntensity={3.1} />
      </RoundedBox>
      {/* wheels */}
      {wheel(1.38, 0.72, 'fl')}
      {wheel(1.38, -0.72, 'fr')}
      {wheel(-1.38, 0.72, 'rl')}
      {wheel(-1.38, -0.72, 'rr')}
      {/* crimson underglow */}
      <pointLight position={[0, 0.12, 0]} color="#D42B1E" intensity={14} distance={4.2} decay={2} />
    </group>
  );
}

/* Camera rig: pointer-parallax + breathing idle, always facing the car */
function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const BASE = useMemo(() => new THREE.Vector3(4.6, 1.55, 4.9), []);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  useFrame((state, delta) => {
    const cam = state.camera;
    const t = state.clock.elapsedTime;
    const breathe = reducedMotion ? 0 : Math.sin(t * 0.4) * 0.045;
    const targetX = BASE.x + (reducedMotion ? 0 : pointer.current.x * 0.75);
    const targetY = BASE.y - (reducedMotion ? 0 : pointer.current.y * 0.32);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, targetX, 2.6, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, targetY, 2.6, delta);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, BASE.z, 2.6, delta);
    cam.lookAt(0, 0.55, breathe);
  });
  return null;
}

function SceneContent({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <fog attach="fog" args={['#100E0C', 11, 26]} />
      <ambientLight intensity={0.42} color="#FFF1E0" />
      <directionalLight position={[4.5, 6.5, 2.5]} intensity={1.35} color="#FFE3BD" />
      <directionalLight position={[-5, 3.5, -4]} intensity={0.85} color="#FF6A4D" />
      <spotLight position={[0, 7.5, 1.5]} angle={0.5} penumbra={0.85} intensity={140} color="#FFF7E8" />

      <Car reducedMotion={reducedMotion} />

      {/* reflective showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[26, 48]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={1024}
          mixBlur={1}
          mixStrength={16}
          roughness={0.92}
          depthScale={1.15}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0D0B0A"
          metalness={0.55}
          mirror={0.62}
        />
      </mesh>
      <ContactShadows position={[0, 0.012, 0]} opacity={0.82} scale={11} blur={2.4} far={2.6} resolution={512} color="#000000" />

      {/* floating dust glints */}
      <Sparkles count={72} scale={[10, 4.6, 10]} position={[0, 2.1, 0]} size={2.7} speed={reducedMotion ? 0 : 0.32} color="#FFCE7A" opacity={0.78} />

      {/* local lightformer rig — no external HDR downloads */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#060606']} />
        <Lightformer form="rect" intensity={5.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} color="#FFFFFF" />
        <Lightformer form="rect" intensity={2.6} position={[-6, 2, -4]} rotation-y={Math.PI / 3} scale={[6.5, 1.7, 1]} color="#FFD9A0" />
        <Lightformer form="rect" intensity={3.4} position={[6, 1.6, 2]} rotation-y={-Math.PI / 3} scale={[5, 1.3, 1]} color="#FF5A44" />
        <Lightformer form="rect" intensity={1.5} position={[0, 1.3, 7]} scale={[10, 2.3, 1]} color="#9CC0FF" />
      </Environment>

      <CameraRig reducedMotion={reducedMotion} />
    </>
  );
}

export function HeroScene({
  className,
  style,
  fallbackImage,
}: {
  className?: string;
  style?: React.CSSProperties;
  fallbackImage?: string | null;
}) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      className={className}
      style={{ position: 'absolute', inset: 0, ...style }}
      dpr={[1, 1.6]}
      camera={{ position: [4.6, 1.55, 4.9], fov: 36, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      fallback={
        fallbackImage ? (
          <img
            src={fallbackImage}
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 70% 55% at 68% 42%, rgba(212,43,30,0.4) 0%, rgba(212,43,30,0.07) 38%, transparent 70%)',
            }}
          />
        )
      }
    >
      <Suspense fallback={null}>
        <SceneContent reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
