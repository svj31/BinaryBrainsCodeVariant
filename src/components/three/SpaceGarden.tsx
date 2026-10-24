"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Verdict } from "@/lib/types";
import { useVisible } from "@/lib/useVisible";
import { archGeometry, glowTexture, stoneHeight, type Stone } from "./GardenScene";

/**
 * The space garden. Every project rests on its own floating island in
 * a slow spiral constellation, inside a bounded bubble of space ringed by an
 * asteroid belt. Everything around it is static or turns as one object, so
 * the scene stays cheap to render.
 *
 * Fly: drag to look, W A S D / arrows to move, Q / E to sink and rise, wheel to
 * thrust, Shift to boost. Click a stone (or its label) and the camera glides
 * to it.
 */

const VCOLOR: Record<Verdict, string> = {
  revive: "#6dbf86",
  pivot: "#f2b34a",
  salvage: "#7cc3dc",
  merge: "#e89a6b",
  archive: "#a9a7a0",
};
const DAWN = "#f2b34a";

interface Props {
  stones: Stone[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

type Placed = { stone: Stone; pos: THREE.Vector3; seed: number };

/** Golden-angle spiral: best projects near the heart, the rest swirl outward and up and down. */
function constellation(stones: Stone[]): Placed[] {
  const sorted = [...stones].sort((a, b) => b.score - a.score);
  return sorted.map((stone, i) => {
    const a = i * 2.39996;
    const r = 5 + Math.sqrt(i) * 5.2;
    return { stone, pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 1.7) * 3.2, Math.sin(a) * r), seed: i * 1.37 };
  });
}

/** The garden is a bounded bubble of space: big enough to roam, small enough to render cheaply. */
export const RADIUS = 46;

/* ---------- Starfield: a fixed shell, the whole thing turns slowly as one object ---------- */
function Stars({ count, size, color, r = 120 }: { count: number; size: number; color: string; r?: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(r * (0.7 + Math.random() * 0.3));
      a.set([v.x, v.y, v.z], i * 3);
    }
    return a;
  }, [count, r]);
  const tex = useMemo(() => glowTexture(), []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.004;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} color={color} size={size} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  );
}

/* ---------- Asteroid belt ringing the garden; one rotation per frame, no per-rock work ---------- */
function Rocks({ count = 70 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const belt = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = RADIUS + 4 + Math.random() * 14;
      m.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 10, Math.sin(a) * r);
      m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      m.scale.setScalar(0.3 + Math.random() ** 3 * 2.2);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);
  useFrame((_, dt) => {
    if (belt.current) belt.current.rotation.y += dt * 0.015;
  });
  return (
    <group ref={belt} rotation={[0.18, 0, 0.08]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3a4652" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ---------- Nebula clouds painted on the edge of the bubble (static) ---------- */
function Nebulae() {
  const tex = useMemo(() => glowTexture(), []);
  const clouds = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        p: new THREE.Vector3().randomDirection().multiplyScalar(95).setY((Math.random() - 0.3) * 40),
        s: 50 + Math.random() * 50,
        c: ["#2d5a43", "#22617a", "#5b1630", "#8a520c", "#3c2350"][i % 5],
      })),
    [],
  );
  return (
    <>
      {clouds.map((d, i) => (
        <sprite key={i} position={d.p} scale={[d.s, d.s * 0.7, 1]}>
          <spriteMaterial map={tex} color={d.c} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </sprite>
      ))}
    </>
  );
}

/* ---------- Boundary: a faint rune sphere shows where the garden ends ---------- */
function Boundary() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[RADIUS + 2, 2]} />
      <meshBasicMaterial color="#f2b34a" wireframe transparent opacity={0.04} depthWrite={false} fog={false} />
    </mesh>
  );
}

/* ---------- Comets streak past now and then, wherever you are ---------- */
function Comets() {
  const ref = useRef<THREE.Mesh>(null);
  const st = useRef({ next: 2, start: -10, from: new THREE.Vector3(), dir: new THREE.Vector3() });
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const s = st.current;
    const m = ref.current;
    if (!m) return;
    if (t > s.next) {
      s.start = t;
      s.next = t + 2.5 + Math.random() * 4;
      const f = new THREE.Vector3();
      camera.getWorldDirection(f);
      s.from.copy(camera.position).addScaledVector(f, 40).clampLength(0, 90).add(new THREE.Vector3((Math.random() - 0.5) * 50, 10 + Math.random() * 12, (Math.random() - 0.5) * 30));
      s.dir.set(Math.random() - 0.5, -0.4, Math.random() - 0.5).normalize();
      m.lookAt(m.position.clone().add(s.dir));
    }
    const k = (t - s.start) / 1.3;
    const mat = m.material as THREE.MeshBasicMaterial;
    if (k < 0 || k > 1) return void (mat.opacity = 0);
    m.position.copy(s.from).addScaledVector(s.dir, k * 40);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), s.dir);
    mat.opacity = Math.sin(k * Math.PI);
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.06, 0.06, 6]} />
      <meshBasicMaterial color="#fff6dc" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
  );
}

/* ---------- A ringed planet and the moon anchor the heart of the garden ---------- */
function Planet() {
  const ring = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (body.current) body.current.rotation.y += dt * 0.05;
    if (ring.current) ring.current.rotation.z += dt * 0.02;
  });
  return (
    <group position={[-60, 18, -80]}>
      <mesh ref={body}>
        <sphereGeometry args={[9, 32, 20]} />
        <meshStandardMaterial color="#22617a" emissive="#0b2a36" roughness={0.7} />
      </mesh>
      <mesh ref={ring} rotation={[1.2, 0.2, 0]}>
        <ringGeometry args={[12, 18, 96]} />
        <meshBasicMaterial color={DAWN} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function Moon() {
  const tex = useMemo(() => glowTexture(), []);
  return (
    <group position={[30, 22, -40]}>
      <mesh>
        <sphereGeometry args={[4, 24, 16]} />
        <meshBasicMaterial color="#f9e7b0" toneMapped={false} />
      </mesh>
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial map={tex} color="#f7e3a6" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight color="#ffe7c2" intensity={120} distance={140} decay={1.4} />
    </group>
  );
}

/* ---------- Floating island with a headstone ---------- */
function Island({
  p,
  selected,
  hover,
  onHover,
  onPick,
}: {
  p: Placed;
  selected: boolean;
  hover: boolean;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  const { stone, pos, seed } = p;
  const group = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const beam = useRef<THREE.Mesh>(null);
  const born = useRef<number | null>(null);
  const h = stoneHeight(stone.score);
  const geo = useMemo(() => archGeometry(h), [h]);
  const rock = useMemo(() => {
    const g = new THREE.ConeGeometry(1.6, 2.6, 7, 3);
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const y = a.getY(i);
      if (y < 1.2) {
        a.setX(i, a.getX(i) * (0.85 + Math.random() * 0.3));
        a.setZ(i, a.getZ(i) * (0.85 + Math.random() * 0.3));
      }
    }
    g.computeVertexNormals();
    g.rotateX(Math.PI);
    g.translate(0, -1.3, 0);
    return g;
  }, []);
  const tex = useMemo(() => glowTexture(), []);
  const color = VCOLOR[stone.verdict];
  const potential = stone.score / 100;
  const archived = stone.status === "archived";

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (born.current === null) born.current = t;
    const g = group.current;
    if (!g) return;
    // islands rise out of the dark one by one, then bob forever
    const k = Math.min(1, Math.max(0, (t - born.current - seed * 0.12) / 1.4));
    const e = 1 - Math.pow(1 - k, 3);
    g.scale.setScalar(Math.max(0.001, e * (hover || selected ? 1.12 : 1)));
    g.position.set(pos.x, pos.y + Math.sin(t * 0.6 + seed) * 0.45 - (1 - e) * 6, pos.z);
    g.rotation.y += dt * 0.08;
    if (orbit.current) orbit.current.rotation.y -= dt * (0.6 + potential);
    if (halo.current) {
      const s = (3 + potential * 4) * (0.92 + Math.sin(t * 1.5 + seed) * 0.08) * (selected ? 1.4 : 1);
      halo.current.scale.set(s, s, 1);
    }
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.damp(m.opacity, selected ? 0.22 : 0, 5, dt);
    }
  });

  const pick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // it was a drag to look around, not a click
    onPick(stone.id);
  };

  return (
    <group ref={group}>
      <sprite ref={halo} position={[0, 0.6, 0]}>
        <spriteMaterial map={tex} color={color} transparent opacity={archived ? 0.12 : 0.25 + potential * 0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={beam} position={[0, 12, 0]}>
        <cylinderGeometry args={[0.5, 1.4, 24, 24, 1, true]} />
        <meshBasicMaterial color="#ffe2a8" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group
        onClick={pick}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(stone.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <mesh geometry={rock}>
          <meshStandardMaterial color="#4a3a2e" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.62, 7]} />
          <meshStandardMaterial color={archived ? "#3f4a3f" : "#2f5a3e"} roughness={1} />
        </mesh>
        <mesh geometry={geo} position={[0, 0, 0]}>
          <meshStandardMaterial color={archived ? "#8f948f" : "#d9dce4"} roughness={0.9} emissive={color} emissiveIntensity={archived ? 0 : 0.08 + potential * 0.25 + (selected ? 0.3 : 0)} />
        </mesh>
        {!archived && (
          <mesh position={[0, h + 0.3, 0]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* fireflies orbit stones with life left in them */}
      <group ref={orbit}>
        {Array.from({ length: archived ? 0 : 2 + Math.round(potential * 4) }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2) * (1.9 + (i % 2) * 0.5), 0.6 + (i % 3) * 0.5, Math.sin(i * 2) * (1.9 + (i % 2) * 0.5)]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Glowing threads between projects that share a verdict ---------- */
function Threads({ placed }: { placed: Placed[] }) {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const by = new Map<Verdict, Placed[]>();
    placed.forEach((p) => by.set(p.stone.verdict, [...(by.get(p.stone.verdict) ?? []), p]));
    by.forEach((list) => {
      for (let i = 1; i < list.length; i++) pts.push(...list[i - 1].pos.toArray(), ...list[i].pos.toArray());
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [placed]);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.12 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={mat} color={DAWN} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/* ---------- Free-flight camera ---------- */
const keys = new Set<string>();

function Flight({ focus, home }: { focus: THREE.Vector3 | null; home: number }) {
  const { camera, gl } = useThree();
  const look = useRef({ yaw: 0, pitch: -0.25, ty: 0, tp: -0.25 });
  const vel = useRef(new THREE.Vector3());
  const glide = useRef<{ from: THREE.Vector3; to: THREE.Vector3; aim: THREE.Vector3; t: number } | null>(null);

  // start looking at the heart of the constellation
  useLayoutEffect(() => {
    camera.position.set(0, 9, 34);
    camera.updateProjectionMatrix();
    look.current = { yaw: 0, pitch: -0.25, ty: 0, tp: -0.25 };
  }, [camera, home]);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.focus();
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const L = look.current;
      L.ty -= (e.clientX - lx) * 0.004;
      L.tp = Math.max(-1.4, Math.min(1.4, L.tp - (e.clientY - ly) * 0.004));
      lx = e.clientX;
      ly = e.clientY;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) glide.current = null;
    };
    const up = () => (dragging = false);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      glide.current = null;
      const f = new THREE.Vector3();
      camera.getWorldDirection(f);
      vel.current.addScaledVector(f, -e.deltaY * 0.012);
    };
    const kd = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        if (document.activeElement === el || el.matches(":hover")) {
          if (k.startsWith("arrow")) e.preventDefault();
          keys.add(k);
          glide.current = null;
        }
      }
    };
    const ku = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const blur = () => keys.clear();
    el.tabIndex = 0;
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    addEventListener("keydown", kd);
    addEventListener("keyup", ku);
    addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      removeEventListener("blur", blur);
      keys.clear();
    };
  }, [camera, gl]);

  // glide toward a newly focused stone
  useEffect(() => {
    if (!focus) return;
    const dir = camera.position.clone().sub(focus).setY(0).normalize();
    if (!isFinite(dir.x) || dir.lengthSq() < 0.1) dir.set(0, 0, 1);
    const to = focus.clone().addScaledVector(dir, 8).add(new THREE.Vector3(0, 3, 0));
    glide.current = { from: camera.position.clone(), to, aim: focus.clone(), t: 0 };
    vel.current.set(0, 0, 0);
  }, [focus, camera]);

  useFrame((_, dt) => {
    const L = look.current;
    const g = glide.current;
    if (g) {
      g.t = Math.min(1, g.t + dt / 1.6);
      const e = g.t < 0.5 ? 4 * g.t ** 3 : 1 - (-2 * g.t + 2) ** 3 / 2;
      camera.position.lerpVectors(g.from, g.to, e);
      // a gentle arc over the top while gliding
      camera.position.y += Math.sin(e * Math.PI) * 4;
      const d = g.aim.clone().sub(camera.position);
      L.ty = Math.atan2(-d.x, -d.z);
      L.tp = Math.atan2(d.y, Math.hypot(d.x, d.z));
      if (g.t >= 1) glide.current = null;
    }
    L.yaw = THREE.MathUtils.damp(L.yaw, L.ty, 8, dt);
    L.pitch = THREE.MathUtils.damp(L.pitch, L.tp, 8, dt);
    camera.rotation.set(L.pitch, L.yaw, 0, "YXZ");

    const boost = keys.has("shift") ? 3 : 1;
    const f = new THREE.Vector3();
    camera.getWorldDirection(f);
    const r = new THREE.Vector3().crossVectors(f, camera.up).normalize();
    const acc = new THREE.Vector3();
    if (keys.has("w") || keys.has("arrowup")) acc.add(f);
    if (keys.has("s") || keys.has("arrowdown")) acc.sub(f);
    if (keys.has("d") || keys.has("arrowright")) acc.add(r);
    if (keys.has("a") || keys.has("arrowleft")) acc.sub(r);
    if (keys.has("e")) acc.y += 1;
    if (keys.has("q")) acc.y -= 1;
    vel.current.addScaledVector(acc, 40 * boost * dt);
    vel.current.multiplyScalar(Math.pow(0.04, dt));
    if (!g) camera.position.addScaledVector(vel.current, dt);
    // soft wall: the camera is eased back once it drifts past the edge of the garden
    const out = camera.position.length() - RADIUS;
    if (out > 0) {
      camera.position.multiplyScalar((RADIUS + out * 0.85) / camera.position.length());
      vel.current.multiplyScalar(0.8);
    }
    // a slight roll into turns makes flight feel alive
    camera.rotation.z = THREE.MathUtils.clamp(-(L.ty - L.yaw) * 0.8, -0.25, 0.25);
  });
  return null;
}

type LabelMap = Map<string, HTMLButtonElement>;

function LabelProjector({ placed, labels }: { placed: Placed[]; labels: React.RefObject<LabelMap> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, clock }) => {
    const map = labels.current;
    if (!map) return;
    for (const { stone, pos, seed } of placed) {
      const el = map.get(stone.id);
      if (!el) continue;
      v.set(pos.x, pos.y + Math.sin(clock.elapsedTime * 0.6 + seed) * 0.45 + stoneHeight(stone.score) + 0.9, pos.z);
      const dist = camera.position.distanceTo(v);
      v.project(camera);
      const hidden = v.z > 1 || dist > 90;
      el.style.visibility = hidden ? "hidden" : "visible";
      el.style.opacity = String(Math.max(0.25, Math.min(1, 1.4 - dist / 60)));
      el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px) scale(${Math.max(0.7, Math.min(1.15, 14 / dist))})`;
      if (!el.dataset.lift) el.style.zIndex = String(1000 - Math.round(dist * 10));
    }
  });
  return null;
}

/** Live coordinates and speed readout. */
function Hud({ out }: { out: React.RefObject<HTMLSpanElement | null> }) {
  const last = useRef(new THREE.Vector3());
  const tick = useRef(0);
  useFrame(({ camera }, dt) => {
    tick.current += dt;
    if (!out.current || tick.current < 0.25) return;
    const sp = camera.position.distanceTo(last.current) / tick.current;
    tick.current = 0;
    last.current.copy(camera.position);
    const c = camera.position;
    out.current.textContent = `${c.x.toFixed(0)} · ${c.y.toFixed(0)} · ${c.z.toFixed(0)}   ${sp.toFixed(1)} u/s   ${c.length().toFixed(0)} from home / ${RADIUS}`;
  });
  return null;
}

export default function SpaceGarden({ stones, selectedId, onSelect, className = "" }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focus, setFocus] = useState<THREE.Vector3 | null>(null);
  const [home, setHome] = useState(0);
  const labels = useRef<LabelMap>(new Map());
  const hud = useRef<HTMLSpanElement>(null);
  const placed = useMemo(() => constellation(stones), [stones]);
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);

  const pick = (id: string) => {
    onSelect?.(id);
    const p = placed.find((x) => x.stone.id === id);
    if (p) setFocus(p.pos.clone());
  };

  return (
    <div ref={box} className={`relative isolate ${className}`} data-cursor={hoverId ? "stone" : "drag"}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 9, 34], fov: 60, near: 0.1, far: 300 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={<div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#d9dce4]">Your browser could not open the space garden. Switch to the Plots or Ledger view.</div>}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#060d14"]} />
          <fog attach="fog" args={["#060d14", 35, 110]} />
          <hemisphereLight args={["#b9c9ea", "#14261c", 0.7]} />
          <ambientLight intensity={0.25} />
          <Stars count={1400} size={0.6} color="#f4f1e6" />
          <Stars count={250} size={1.4} color="#ffe2a8" r={110} />
          <Nebulae />
          <Boundary />
          <Rocks />
          <Comets />
          <Planet />
          <Moon />
          <pointLight position={[0, 6, 0]} color="#ffc977" intensity={60} distance={50} decay={1.6} />
          <Threads placed={placed} />
          {placed.map((p) => (
            <Island key={p.stone.id} p={p} selected={selectedId === p.stone.id} hover={hoverId === p.stone.id} onHover={setHoverId} onPick={pick} />
          ))}
          <Flight focus={focus} home={home} />
          <LabelProjector placed={placed} labels={labels} />
          <Hud out={hud} />
        </Suspense>
      </Canvas>

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
                onClick={() => pick(s.id)}
                onFocus={() => setHoverId(s.id)}
                onBlur={() => setHoverId(null)}
                onPointerEnter={() => setHoverId(s.id)}
                onPointerLeave={() => setHoverId(null)}
                aria-pressed={selected}
                aria-label={`${s.name}, Resurrection Score ${s.score}, verdict ${s.verdict}`}
                className={`pointer-events-auto absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-semibold transition-[background,box-shadow,color] duration-300 ${
                  selected
                    ? "border-[#ffd98e] bg-[#f2b34a] text-[#1e2721] shadow-[0_0_22px_6px_rgba(242,179,74,0.55)]"
                    : "border-white/15 bg-[#0d1b26]/70 text-[#f4f1e6] backdrop-blur-md hover:border-[#ffd98e]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: VCOLOR[s.verdict] }} />
                <span className="font-mono">{s.score}</span>
                {lifted && <span>{s.name}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
        <span className="rounded-full border border-white/10 bg-[#0d1b26]/70 px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-[#9fe3b0] uppercase backdrop-blur-md">
          <span ref={hud}>0 · 9 · 34</span>
        </span>
      </div>
      <button
        onClick={() => (setFocus(null), setHome((h) => h + 1))}
        className="absolute top-3 right-3 rounded-full border border-white/15 bg-[#0d1b26]/70 px-3 py-1 text-xs font-semibold text-[#f4f1e6] backdrop-blur-md transition-colors hover:border-[#f2b34a] hover:text-[#f2b34a]"
      >
        ⟲ Fly home
      </button>
    </div>
  );
}
