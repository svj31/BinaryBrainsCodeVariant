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

/** Day is the soft dawn of the landing page, night is the moonlit garden of the app. */
const THEMES = {
  day: {
    sky: "#f3ede0",
    fog: [11, 26] as [number, number],
    ground: "#c9d6b4",
    hills: ["#b7c9a2", "#bfcfa9", "#b3c69e", "#bccca6"],
    path: "#e3d8bf",
    grass: "#6f9a6a",
    stone: "#efeae0",
    stoneOld: "#cdc7bb",
    engrave: "#9d968a",
    hemi: ["#fffaf0", "#d8dcc4", 1.25] as [string, string, number],
    sun: { color: "#ffe7c2", intensity: 1.35, pos: [6, 9, 5] as [number, number, number] },
  },
  night: {
    sky: "#0d1b26",
    fog: [10, 28] as [number, number],
    ground: "#183126",
    hills: ["#14281f", "#112319", "#173024", "#122a20"],
    path: "#2a3a2f",
    grass: "#2f5a3e",
    stone: "#d9dce4",
    stoneOld: "#8f948f",
    engrave: "#8a8f9c",
    hemi: ["#b9c9ea", "#14261c", 0.9] as [string, string, number],
    sun: { color: "#c9d8ff", intensity: 0.9, pos: [-6, 9, -4] as [number, number, number] },
  },
};
type Theme = (typeof THEMES)["day"];

const MOSS = "#2d5a43";
const DAWN = "#f2b34a";

/** A soft round glow sprite drawn once on a canvas. */
let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

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
    const slots = Array.from({ length: n }, (_, k) => k - (n - 1) / 2).sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
    slice.forEach((s, k) => {
      const angle = slots[k] * step;
      out.push({ stone: s, pos: [Math.sin(angle) * radius, 0, centre - Math.cos(angle) * radius], rot: -angle });
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

function Sprout({ height, bloom, seed, night }: { height: number; bloom: boolean; seed: number; night: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + seed) * 0.08;
  });
  return (
    <group ref={ref} position={[0, height + 0.02, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.32, 6]} />
        <meshStandardMaterial color={night ? "#5fa877" : MOSS} />
      </mesh>
      <mesh position={[-0.09, 0.24, 0]} rotation={[0, 0, 0.9]} scale={[0.11, 0.05, 0.05]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color={night ? "#6dbf86" : MOSS} emissive={night ? "#2f6b45" : "#000"} />
      </mesh>
      <mesh position={[0.09, 0.3, 0]} rotation={[0, 0, -0.9]} scale={[0.11, 0.05, 0.05]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#8bd39b" emissive={night ? "#3d7a50" : "#000"} />
      </mesh>
      {bloom && (
        <mesh position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.065, 14, 10]} />
          <meshStandardMaterial color={DAWN} emissive={DAWN} emissiveIntensity={night ? 2.2 : 0.6} toneMapped={false} />
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
  theme,
  night,
  delay,
}: {
  stone: Stone;
  position: [number, number, number];
  rotation: number;
  selected: boolean;
  hover: boolean;
  onHover: (id: string | null) => void;
  onSelect?: (id: string) => void;
  seed: number;
  theme: Theme;
  night: boolean;
  delay: number;
}) {
  const group = useRef<THREE.Group>(null);
  const rise = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const beam = useRef<THREE.Mesh>(null);
  const born = useRef<number | null>(null);
  const potential = stone.score / 100;
  const height = stoneHeight(stone.score);
  const geo = useMemo(() => archGeometry(height), [height]);
  const archived = stone.status === "archived";
  const sprouting = !archived && (stone.status !== "resting" || stone.score >= 55);
  const tex = useMemo(() => (night ? glowTexture() : null), [night]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (born.current === null) born.current = t;
    // rise out of the soil on first appearance
    if (rise.current) {
      const k = Math.min(1, Math.max(0, (t - born.current - delay) / 0.9));
      const e = 1 - Math.pow(1 - k, 3);
      rise.current.scale.y = Math.max(0.001, e);
      rise.current.position.y = (1 - e) * -0.3;
    }
    if (!group.current) return;
    const target = hover || selected ? 0.14 : 0;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, target, 6, dt);
    const pulse = 0.5 + Math.sin(t * 1.4 + seed) * 0.5;
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      m.opacity = archived ? 0 : (0.12 + potential * 0.38) * (0.8 + pulse * 0.2) + (selected ? 0.15 : 0);
    }
    if (halo.current) {
      const s = (1.4 + potential * 1.6) * (0.92 + pulse * 0.12) * (selected || hover ? 1.25 : 1);
      halo.current.scale.set(s, s * 1.15, 1);
      (halo.current.material as THREE.SpriteMaterial).opacity = archived ? 0.05 : 0.18 + potential * 0.5;
    }
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.damp(m.opacity, selected ? 0.16 + pulse * 0.06 : 0, 5, dt);
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.15]}>
        <circleGeometry args={[0.55 + potential * 0.5, 40]} />
        <meshBasicMaterial
          color={DAWN}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={night ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
      {night && tex && (
        <>
          <sprite ref={halo} position={[0, height * 0.55, -0.15]}>
            <spriteMaterial map={tex} color={DAWN} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <mesh ref={beam} position={[0, 3, 0]}>
            <cylinderGeometry args={[0.35, 0.75, 6, 24, 1, true]} />
            <meshBasicMaterial color="#ffe2a8" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      )}
      <group ref={rise}>
        <group
          ref={group}
          onClick={
            onSelect
              ? (e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  onSelect(stone.id);
                }
              : undefined
          }
          onPointerOver={(e) => {
            if (!onSelect) return;
            e.stopPropagation();
            onHover(stone.id);
          }}
          onPointerOut={() => onHover(null)}
        >
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial
              color={archived ? theme.stoneOld : theme.stone}
              roughness={0.92}
              emissive={DAWN}
              emissiveIntensity={archived ? 0 : potential * (night ? 0.1 : 0.12) + (selected ? 0.12 : 0)}
            />
          </mesh>
          <mesh position={[0, height * 0.62, 0.137]}>
            <boxGeometry args={[0.42, 0.045, 0.01]} />
            <meshStandardMaterial color={theme.engrave} />
          </mesh>
          <mesh position={[0, height * 0.62 - 0.11, 0.137]}>
            <boxGeometry args={[0.28, 0.045, 0.01]} />
            <meshStandardMaterial color={theme.engrave} />
          </mesh>
          {sprouting && <Sprout height={height} bloom={stone.status === "alive" || stone.score >= 70} seed={seed} night={night} />}
          {archived && (
            <mesh position={[0.22, 0.1, 0.13]} scale={[0.25, 0.12, 0.05]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#6f8f5c" roughness={1} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

/** Floating motes: pollen by day, fireflies by night. */
function Motes({ count, night }: { count: number; night: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1;
      seeds[i] = Math.random() * 100;
    }
    return { positions, seeds };
  }, [count]);
  const tex = useMemo(() => (night ? glowTexture() : null), [night]);

  useFrame(({ clock }, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      if (night) {
        // fireflies wander in lazy loops
        arr[i * 3] += Math.sin(t * 0.6 + s) * 0.006;
        arr[i * 3 + 1] += Math.cos(t * 0.8 + s * 1.3) * 0.004;
        arr[i * 3 + 2] += Math.sin(t * 0.5 + s * 0.7) * 0.005;
      } else {
        arr[i * 3 + 1] += (0.08 + (s % 1) * 0.18) * dt;
        arr[i * 3] += Math.sin(t * 0.5 + i) * 0.002;
        if (arr[i * 3 + 1] > 4.6) arr[i * 3 + 1] = 0;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
    if (night) (pts.material as THREE.PointsMaterial).opacity = 0.75 + Math.sin(t * 2.2) * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={night ? "#ffd27a" : DAWN}
        size={night ? 0.22 : 0.06}
        map={tex ?? undefined}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={night ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

function Stars() {
  const a = useRef<THREE.Points>(null);
  const b = useRef<THREE.Points>(null);
  const [p1, p2] = useMemo(() => {
    const make = (n: number) => {
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = Math.random() * Math.PI - Math.PI / 2;
        const ph = Math.random() * 0.9 + 0.12;
        arr[i * 3] = Math.sin(th) * 40;
        arr[i * 3 + 1] = Math.sin(ph) * 9 + 1.2;
        arr[i * 3 + 2] = -Math.cos(th) * 40 - 6;
      }
      return arr;
    };
    return [make(260), make(140)];
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) (a.current.material as THREE.PointsMaterial).opacity = 0.65 + Math.sin(t * 1.7) * 0.25;
    if (b.current) (b.current.material as THREE.PointsMaterial).opacity = 0.65 + Math.cos(t * 1.1) * 0.3;
  });
  return (
    <>
      {[
        [a, p1, 0.14],
        [b, p2, 0.24],
      ].map(([ref, pos, size], i) => (
        <points key={i} ref={ref as React.RefObject<THREE.Points>}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pos as Float32Array, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#f4f1e6" size={size as number} sizeAttenuation transparent fog={false} depthWrite={false} />
        </points>
      ))}
    </>
  );
}

function ShootingStar() {
  const ref = useRef<THREE.Mesh>(null);
  const state = useRef({ next: 3, start: -10, from: new THREE.Vector3(), dir: new THREE.Vector3() });
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = state.current;
    const m = ref.current;
    if (!m) return;
    if (t > s.next) {
      s.start = t;
      s.next = t + 5 + Math.random() * 6;
      s.from.set(-14 + Math.random() * 20, 12 + Math.random() * 6, -24);
      s.dir.set(1, -0.45, 0).normalize();
      m.rotation.z = Math.atan2(s.dir.y, s.dir.x);
    }
    const k = (t - s.start) / 1.1;
    const mat = m.material as THREE.MeshBasicMaterial;
    if (k < 0 || k > 1) {
      mat.opacity = 0;
      return;
    }
    m.position.copy(s.from).addScaledVector(s.dir, k * 16);
    mat.opacity = Math.sin(k * Math.PI) * 0.9;
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[3, 0.05]} />
      <meshBasicMaterial color="#fff6dc" transparent opacity={0} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/** Crescent painted on a transparent canvas: the "bite" is erased, so no dark disc is left behind. */
function crescentTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(110, 120, 20, 128, 128, 100);
  grad.addColorStop(0, "#fff6d6");
  grad.addColorStop(1, "#f3d98f");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(128, 128, 96, 0, Math.PI * 2);
  g.fill();
  // soft craters
  g.fillStyle = "rgba(214,184,110,0.35)";
  [[90, 150, 12], [110, 90, 8], [80, 110, 6]].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });
  g.globalCompositeOperation = "destination-out";
  g.filter = "blur(2px)";
  g.beginPath();
  g.arc(158, 104, 86, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Moon() {
  const glow = useMemo(() => glowTexture(), []);
  const face = useMemo(() => crescentTexture(), []);
  const halo = useRef<THREE.Sprite>(null);
  const body = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (halo.current) {
      const s = 7 + Math.sin(t * 0.6) * 0.5;
      halo.current.scale.set(s, s, 1);
    }
    if (body.current) body.current.material.rotation = Math.sin(t * 0.2) * 0.05;
  });
  return (
    <group position={[8, 1.9, -21]} scale={0.75}>
      <sprite ref={halo} position={[-0.5, 0.2, -0.1]}>
        <spriteMaterial map={glow} color="#f7e3a6" transparent opacity={0.35} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={body} scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={face} transparent fog={false} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

function Grass({ count, color }: { count: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const m = new THREE.Object3D();
    const list: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r - 1);
      m.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
      m.scale.setScalar(0.6 + Math.random() * 0.8);
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
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <coneGeometry args={[0.035, 0.2, 4]} />
      <meshStandardMaterial color={color} roughness={1} />
    </instancedMesh>
  );
}

function Ground({ theme }: { theme: Theme }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[24, 64]} />
        <meshStandardMaterial color={theme.ground} roughness={1} />
      </mesh>
      {[
        [-9, -11, 7],
        [6, -13, 9],
        [15, -8, 6],
        [-17, -6, 6],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.78, z]}>
          <sphereGeometry args={[r, 32, 16]} />
          <meshStandardMaterial color={theme.hills[i]} roughness={1} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 4]}>
        <planeGeometry args={[1.3, 9]} />
        <meshStandardMaterial color={theme.path} roughness={1} />
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
      el.style.visibility = v.z > 1 ? "hidden" : "visible";
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
  const night = mode === "app";
  const theme = night ? THEMES.night : THEMES.day;
  const placed = useMemo(() => layout(stones), [stones]);
  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (mode === "hero" && spin.current) spin.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.25;
  });

  return (
    <>
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.sky, ...theme.fog]} />
      <hemisphereLight args={theme.hemi} />
      <ambientLight intensity={night ? 0.15 : 0.25} />
      <directionalLight
        position={theme.sun.pos}
        intensity={theme.sun.intensity}
        color={theme.sun.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {night ? (
        <>
          <Moon />
          <Stars />
          <ShootingStar />
          <pointLight position={[0, 2.5, 3]} color="#ffc977" intensity={3} distance={8} decay={1.8} />
        </>
      ) : (
        <mesh position={[-8, 4.2, -20]}>
          <circleGeometry args={[1.3, 48]} />
          <meshBasicMaterial color="#f7d79c" fog={false} transparent opacity={0.85} />
        </mesh>
      )}
      <group ref={spin}>
        <Ground theme={theme} />
        <Grass count={260} color={theme.grass} />
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
            theme={theme}
            night={night}
            delay={i * 0.08}
          />
        ))}
        <ContactShadows position={[0, 0.01, 0]} opacity={night ? 0.55 : 0.35} scale={22} blur={2.4} far={3} />
      </group>
      <Motes count={night ? 70 : 160} night={night} />
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
          autoRotate={!hoverId}
          autoRotateSpeed={0.35}
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
    <div className={`relative ${className}`} data-cursor={mode === "app" ? (hoverId ? "stone" : "drag") : undefined}>
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
                  data-cursor="stone"
                  style={{ visibility: "hidden", ...(lifted ? { zIndex: 2000 } : {}) }}
                  onClick={() => onSelect?.(s.id)}
                  onFocus={() => setHoverId(s.id)}
                  onBlur={() => setHoverId(null)}
                  onPointerEnter={() => setHoverId(s.id)}
                  onPointerLeave={() => setHoverId(null)}
                  aria-pressed={selected}
                  aria-label={`${s.name}, Resurrection Score ${s.score}, verdict ${s.verdict}`}
                  className={`pointer-events-auto absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-1.5 py-0.5 text-[12px] font-semibold transition-[background,box-shadow,color] duration-300 ${
                    selected
                      ? "border-[#ffd98e] bg-[#f2b34a] text-[#1e2721] shadow-[0_0_18px_4px_rgba(242,179,74,0.55)]"
                      : "border-white/20 bg-[#0d1b26]/80 text-[#f4f1e6] backdrop-blur-sm hover:border-[#ffd98e] hover:shadow-[0_0_14px_2px_rgba(242,179,74,0.4)]"
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
