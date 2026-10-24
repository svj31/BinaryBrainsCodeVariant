"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Status, Verdict } from "@/lib/types";

export interface Stone {
  id: string;
  name: string;
  score: number;
  verdict: Verdict;
  status: Status;
}

interface Props {
  stones: Stone[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  mode?: "hero" | "app";
  className?: string;
}

const STONE = new THREE.Color("#efeae0");
const STONE_OLD = new THREE.Color("#cdc7bb");
const MOSS = "#2d5a43";
const DAWN = "#e9a53a";

/**
 * Amphitheatre layout: stones sit on arcs facing the viewer, the most
 * promising ones in the front row and nearest the centre of each arc.
 */
function layout(stones: Stone[]) {
  const sorted = [...stones].sort((x, y) => y.score - x.score);
  const out: { stone: Stone; pos: [number, number, number]; rot: number }[] = [];
  const centre = 4;
  let i = 0;
  for (let row = 0; i < sorted.length; row++) {
    const perRow = 4 + row * 2;
    const slice = sorted.slice(i, i + perRow);
    const radius = 4 + row * 2.7;
    const step = 2.05 / radius;
    const n = slice.length;
    // slots ordered from the middle outwards
    const slots = Array.from({ length: n }, (_, k) => k - (n - 1) / 2).sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
    slice.forEach((s, k) => {
      const angle = slots[k] * step;
      const x = Math.sin(angle) * radius;
      const z = centre - Math.cos(angle) * radius;
      out.push({ stone: s, pos: [x, 0, z], rot: -angle });
    });
    i += perRow;
  }
  return out;
}

export const stoneHeight = (score: number) => 0.85 + (score / 100) * 0.9;

function archGeometry(height: number) {
  const w = 0.92;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2, height - w / 2);
  shape.absarc(0, height - w / 2, w / 2, Math.PI, 0, true);
  shape.lineTo(w / 2, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.translate(0, 0, -0.1);
  return geo;
}

function Sprout({ height, bloom, seed }: { height: number; bloom: boolean; seed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + seed) * 0.08;
  });
  return (
    <group ref={ref} position={[0, height + 0.02, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.32, 6]} />
        <meshStandardMaterial color={MOSS} />
      </mesh>
      <mesh position={[-0.09, 0.24, 0]} rotation={[0, 0, 0.9]} scale={[0.11, 0.05, 0.05]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color={MOSS} />
      </mesh>
      <mesh position={[0.09, 0.3, 0]} rotation={[0, 0, -0.9]} scale={[0.11, 0.05, 0.05]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#4d8a5f" />
      </mesh>
      {bloom && (
        <mesh position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.065, 14, 10]} />
          <meshStandardMaterial color={DAWN} emissive={DAWN} emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function Headstone({
  stone,
  position,
  rotation,
  selected,
  hover,
  onHover,
  onSelect,
  seed,
}: {
  stone: Stone;
  position: [number, number, number];
  rotation: number;
  selected: boolean;
  hover: boolean;
  onHover: (id: string | null) => void;
  onSelect?: (id: string) => void;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const potential = stone.score / 100;
  const height = stoneHeight(stone.score);
  const geo = useMemo(() => archGeometry(height), [height]);
  const archived = stone.status === "archived";
  const sprouting = !archived && (stone.status !== "resting" || stone.score >= 55);

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const target = hover || selected ? 0.12 : 0;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, target, 6, dt);
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      const pulse = 0.5 + Math.sin(clock.elapsedTime * 1.4 + seed) * 0.5;
      m.opacity = archived ? 0 : (0.12 + potential * 0.38) * (0.8 + pulse * 0.2) + (selected ? 0.15 : 0);
    }
  });

  const handle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(stone.id);
  };

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.15]}>
        <circleGeometry args={[0.55 + potential * 0.5, 40]} />
        <meshBasicMaterial color={DAWN} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <group
        ref={group}
        onClick={onSelect ? handle : undefined}
        onPointerOver={(e) => {
          if (!onSelect) return;
          e.stopPropagation();
          onHover(stone.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial
            color={archived ? STONE_OLD : STONE}
            roughness={0.92}
            emissive={DAWN}
            emissiveIntensity={archived ? 0 : potential * 0.12 + (selected ? 0.1 : 0)}
          />
        </mesh>
        {/* engraved lines */}
        <mesh position={[0, height * 0.62, 0.137]}>
          <boxGeometry args={[0.42, 0.045, 0.01]} />
          <meshStandardMaterial color="#9d968a" />
        </mesh>
        <mesh position={[0, height * 0.62 - 0.11, 0.137]}>
          <boxGeometry args={[0.28, 0.045, 0.01]} />
          <meshStandardMaterial color="#9d968a" />
        </mesh>
        {sprouting && <Sprout height={height} bloom={stone.status === "alive" || stone.score >= 70} seed={seed} />}
        {archived && (
          <mesh position={[0.22, 0.1, 0.13]} scale={[0.25, 0.12, 0.05]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#6f8f5c" roughness={1} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Pollen({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1;
      speeds[i] = 0.08 + Math.random() * 0.18;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(({ clock }, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t * 0.5 + i) * 0.002;
      if (arr[i * 3 + 1] > 4.6) arr[i * 3 + 1] = 0;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={DAWN} size={0.06} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

function Grass({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const m = new THREE.Object3D();
    const list: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r - 1);
      m.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
      const s = 0.6 + Math.random() * 0.8;
      m.scale.set(s, s, s);
      m.updateMatrix();
      list.push(m.matrix.clone());
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((mat, i) => mesh.setMatrixAt(i, mat));
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
    >
      <coneGeometry args={[0.035, 0.2, 4]} />
      <meshStandardMaterial color="#6f9a6a" roughness={1} />
    </instancedMesh>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[24, 64]} />
        <meshStandardMaterial color="#c9d6b4" roughness={1} />
      </mesh>
      {/* soft hills on the horizon */}
      {[
        [-9, -11, 7, "#b7c9a2"],
        [6, -13, 9, "#bfcfa9"],
        [15, -8, 6, "#b3c69e"],
        [-17, -6, 6, "#bccca6"],
      ].map(([x, z, r, c], i) => (
        <mesh key={i} position={[x as number, -(r as number) * 0.78, z as number]}>
          <sphereGeometry args={[r as number, 32, 16]} />
          <meshStandardMaterial color={c as string} roughness={1} />
        </mesh>
      ))}
      {/* a path through the garden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 4]}>
        <planeGeometry args={[1.3, 9]} />
        <meshStandardMaterial color="#e3d8bf" roughness={1} />
      </mesh>
    </group>
  );
}

const TARGET = new THREE.Vector3(0, 0.4, -2.2);

function AimCamera() {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => camera.lookAt(TARGET), [camera]);
  return null;
}

type LabelMap = Map<string, HTMLButtonElement>;

/** Projects each stone's label anchor to screen space and moves the DOM label there. */
function LabelProjector({ placed, labels }: { placed: ReturnType<typeof layout>; labels: React.RefObject<LabelMap> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const map = labels.current;
    if (!map) return;
    for (const { stone, pos } of placed) {
      const el = map.get(stone.id);
      if (!el) continue;
      v.set(pos[0], stoneHeight(stone.score) + 0.55, pos[2]);
      const dist = camera.position.distanceTo(v);
      v.project(camera);
      const hidden = v.z > 1;
      el.style.visibility = hidden ? "hidden" : "visible";
      el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      if (!el.dataset.lift) el.style.zIndex = String(1000 - Math.round(dist * 10));
    }
  });
  return null;
}

function Scene({
  stones,
  selectedId,
  onSelect,
  mode = "app",
  hoverId,
  setHoverId,
  labels,
}: Props & { hoverId: string | null; setHoverId: (id: string | null) => void; labels: React.RefObject<LabelMap> }) {
  const placed = useMemo(() => layout(stones), [stones]);
  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (mode === "hero" && spin.current) spin.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.25;
  });

  return (
    <>
      <color attach="background" args={["#f3ede0"]} />
      <fog attach="fog" args={["#f3ede0", 11, 26]} />
      <hemisphereLight args={["#fffaf0", "#d8dcc4", 1.25]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.35}
        color="#ffe7c2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* low dawn sun */}
      <mesh position={[-8, 4.2, -20]}>
        <circleGeometry args={[1.3, 48]} />
        <meshBasicMaterial color="#f7d79c" fog={false} transparent opacity={0.85} />
      </mesh>
      <group ref={spin}>
        <Ground />
        <Grass />
        {placed.map(({ stone, pos, rot }, i) => (
          <Headstone
            key={stone.id}
            stone={stone}
            position={pos}
            rotation={rot}
            selected={selectedId === stone.id}
            hover={hoverId === stone.id}
            onHover={setHoverId}
            onSelect={onSelect}
            seed={i * 1.7}
          />
        ))}
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={22} blur={2.4} far={3} />
      </group>
      <Pollen count={mode === "hero" ? 160 : 110} />
      {mode === "hero" && <AimCamera />}
      {mode === "app" && <LabelProjector placed={placed} labels={labels} />}
      {mode === "app" && (
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={16}
          minPolarAngle={0.6}
          maxPolarAngle={1.32}
          target={TARGET}
          enableDamping
        />
      )}
    </>
  );
}

export default function GardenScene(props: Props) {
  const { mode = "app", className = "", stones, selectedId, onSelect } = props;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const labels = useRef<LabelMap>(new Map());
  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: mode === "hero" ? [0, 4.6, 9.5] : [0, 7, 9.6], fov: 46 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-2">
            Your browser could not start the 3D garden. Switch to the Plots or Ledger view to see every project.
          </div>
        }
        onPointerMissed={() => (document.body.style.cursor = "")}
        aria-hidden={mode === "hero" ? true : undefined}
      >
        <Suspense fallback={null}>
          <Scene {...props} hoverId={hoverId} setHoverId={setHoverId} labels={labels} />
        </Suspense>
      </Canvas>
      {mode === "app" && (
        <ul className="pointer-events-none absolute inset-0 overflow-hidden" aria-label="Projects in the garden">
          {stones.map((s) => {
            const selected = s.id === selectedId;
            const lifted = selected || hoverId === s.id;
            return (
              <li key={s.id}>
                <button
                  ref={(el) => {
                    if (el) labels.current.set(s.id, el);
                    else labels.current.delete(s.id);
                  }}
                  data-lift={lifted ? "1" : undefined}
                  style={{ visibility: "hidden", ...(lifted ? { zIndex: 2000 } : {}) }}
                  onClick={() => onSelect?.(s.id)}
                  onFocus={() => setHoverId(s.id)}
                  onBlur={() => setHoverId(null)}
                  onPointerEnter={() => setHoverId(s.id)}
                  onPointerLeave={() => setHoverId(null)}
                  aria-pressed={selected}
                  aria-label={`${s.name}, Resurrection Score ${s.score}, verdict ${s.verdict}`}
                  className={`pointer-events-auto absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-1.5 py-0.5 text-[12px] font-semibold shadow-sm transition-colors ${
                    selected ? "border-moss bg-moss text-white" : "border-line bg-card/95 text-ink hover:border-ink-3"
                  }`}
                >
                  <span className="font-mono">{s.score}</span>
                  {lifted && <span>{s.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
