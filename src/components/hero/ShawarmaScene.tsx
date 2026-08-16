import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, ContactShadows } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

type Progress = MutableRefObject<{ v: number; hover: number }>;

/** Vertical rotisserie cone of stacked meat */
function Spit({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const slabs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        return {
          y: -1.5 + t * 3,
          r: 0.95 - Math.abs(t - 0.35) * 0.75 - t * 0.15,
          rot: i * 1.31,
          tone: 0.35 + Math.random() * 0.35,
          h: 0.24,
        };
      }),
    [],
  );

  useFrame((state, dt) => {
    if (!group.current) return;
    const p = progress.current.v;
    group.current.rotation.y += dt * (0.25 + p * 0.9);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06 - p * 0.35;
    const s = 0.92 - p * 0.18;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group}>
      {/* skewer */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.055, 4.2, 24]} />
        <meshStandardMaterial color="#8d8f96" metalness={1} roughness={0.22} />
      </mesh>
      {slabs.map((s, i) => (
        <mesh
          key={i}
          position={[0, s.y, 0]}
          rotation={[0, s.rot, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[s.r, s.r * 0.94, s.h, 40, 1, false]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.055, 0.62, 0.16 + s.tone * 0.14)}
            roughness={0.55 - s.tone * 0.2}
            metalness={0.15}
            emissive="#4a1d05"
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
      {/* charred top cap */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.75} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** Ingredient layers that explode outward with scroll */
function ExplodedLayers({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return {
          a,
          y: -1.2 + (i % 6) * 0.5,
          kind: i % 3,
          spin: (Math.random() - 0.5) * 2,
        };
      }),
    [],
  );

  useFrame((state) => {
    if (!group.current) return;
    const p = THREE.MathUtils.smoothstep(progress.current.v, 0.15, 0.85);
    group.current.children.forEach((c, i) => {
      const it = items[i]!;
      const r = 0.9 + p * 2.6;
      c.position.set(Math.cos(it.a) * r, it.y + p * 0.3, Math.sin(it.a) * r);
      c.rotation.y = state.clock.elapsedTime * 0.3 * it.spin;
      c.rotation.x = state.clock.elapsedTime * 0.2 * it.spin;
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = p;
      c.visible = p > 0.02;
    });
    group.current.rotation.y = state.clock.elapsedTime * 0.06;
  });

  const palette = ["#e8c05a", "#c2453a", "#6f8f4a"];

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} castShadow>
          {it.kind === 0 ? (
            <torusGeometry args={[0.16, 0.05, 12, 28]} />
          ) : it.kind === 1 ? (
            <sphereGeometry args={[0.13, 20, 16]} />
          ) : (
            <boxGeometry args={[0.3, 0.05, 0.22]} />
          )}
          <meshStandardMaterial
            color={palette[it.kind]!}
            roughness={0.35}
            metalness={0.25}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Steam, embers and spice dust */
function Particles({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.08 + Math.random() * 0.28;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const attr = geo.attributes['position'] as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] = arr[i * 3 + 1]! + speeds[i]! * dt;
      arr[i * 3] = arr[i * 3]! + Math.sin(state.clock.elapsedTime * 0.4 + i) * dt * 0.03;
      if (arr[i * 3 + 1]! > 3.6) arr[i * 3 + 1] = -3.6;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#f5c66a"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig({ progress }: { progress: Progress }) {
  const { camera, pointer, viewport } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const p = progress.current.v;
    const mobile = viewport.width < 6;
    const baseZ = mobile ? 8.4 : 6.6;
    target.current.set(
      pointer.x * 0.55 + (mobile ? 0 : -0.85 + p * 1.6),
      pointer.y * 0.35 + 0.2 - p * 0.5,
      baseZ - p * 2.4,
    );
    camera.position.lerp(target.current, 1 - Math.pow(0.001, dt));
    camera.lookAt(0, 0.1 - p * 0.3, 0);
  });
  return null;
}

function Lights({ progress }: { progress: Progress }) {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  useFrame((state, dt) => {
    const boost = progress.current.hover;
    if (key.current)
      key.current.intensity = THREE.MathUtils.damp(
        key.current.intensity,
        90 + boost * 70,
        4,
        dt,
      );
    if (rim.current) {
      rim.current.intensity = 40 + Math.sin(state.clock.elapsedTime * 3) * 6 + boost * 30;
    }
  });
  return (
    <>
      <ambientLight intensity={0.25} color="#40331f" />
      <spotLight
        ref={key}
        position={[4, 6, 5]}
        angle={0.5}
        penumbra={1}
        intensity={90}
        color="#ffd79a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight ref={rim} position={[-4, 1.4, -3]} intensity={40} color="#ff7a18" />
      <pointLight position={[3.5, -2, -2]} intensity={18} color="#ffb347" />
    </>
  );
}

export default function ShawarmaScene({ progress }: { progress: Progress }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.3, 7], fov: 38 }}
    >
      <Rig progress={progress} />
      <Lights progress={progress} />
      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.4}>
        <Spit progress={progress} />
      </Float>
      <ExplodedLayers progress={progress} />
      <Particles />
      <ContactShadows
        position={[0, -2.35, 0]}
        opacity={0.75}
        scale={12}
        blur={3.2}
        far={5}
        color="#000000"
      />
      <Environment preset="night" />
      <fog attach="fog" args={["#0B0B0C", 8, 20]} />
    </Canvas>
  );
}
