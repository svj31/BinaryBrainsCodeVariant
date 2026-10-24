"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Verdict } from "@/lib/types";
import { useVisible } from "@/lib/useVisible";
import { AnimatePresence, motion } from "framer-motion";
import { play } from "@/lib/sound";
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
export const RADIUS = 56;

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
  const flies = useMemo(() => {
    const n = 2 + Math.round((stone.score / 100) * 4);
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a.set([Math.cos(i * 2) * (1.9 + (i % 2) * 0.5), 0.6 + (i % 3) * 0.5, Math.sin(i * 2) * (1.9 + (i % 2) * 0.5)], i * 3);
    return a;
  }, [stone.score]);
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
      {/* fireflies orbit stones with life left in them: one point cloud, one draw call */}
      {!archived && (
        <group ref={orbit}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[flies, 3]} />
            </bufferGeometry>
            <pointsMaterial map={tex} color="#ffd27a" size={0.35} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
      )}
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

/* ---------- Spaceship flight ---------- */
const keys = new Set<string>();
const MAX_SPEED = 16;

/** Shared between the 3D ship and the HTML cockpit: the HUD reads it, buttons write to it. */
export interface ShipCtl {
  throttle: number; // 0..1, the speed you asked for
  speed: number; // actual speed, eases toward the throttle
  steerX: number; // pointer offset from the centre of the view, -1..1
  steerY: number;
  steering: boolean; // pointer is over the view
  pos: THREE.Vector3; // ship position, read by the HUD
  yaw: number; // ship heading, read by the radar
}

/** Star streaks hung in front of the cockpit; they stretch and brighten with speed. */
function Streaks({ ctl }: { ctl: React.RefObject<ShipCtl> }) {
  const ref = useRef<THREE.LineSegments>(null);
  const N = 70;
  const data = useMemo(() => Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 10, z: -Math.random() * 30 })), []);
  const pos = useMemo(() => new Float32Array(N * 6), []);
  const camera = useThree((s) => s.camera);
  useFrame((_, dt) => {
    const l = ref.current;
    if (!l) return;
    const sp = ctl.current.speed;
    const len = 0.2 + sp * 0.12;
    data.forEach((d, i) => {
      d.z += sp * dt * 1.6;
      if (d.z > 0) d.z -= 30;
      pos.set([d.x, d.y, d.z, d.x, d.y, d.z - len], i * 6);
    });
    l.geometry.attributes.position.needsUpdate = true;
    (l.material as THREE.LineBasicMaterial).opacity = Math.min(0.7, sp / MAX_SPEED);
    l.position.copy(camera.position);
    l.quaternion.copy(camera.quaternion);
  });
  return (
    <lineSegments ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#cfe8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </lineSegments>
  );
}

/**
 * The camera is a small ship. Throttle sets a cruising speed that holds by
 * itself; while moving, the ship turns toward wherever the pointer is (a calm
 * dead zone in the middle). Parked, you drag to look around. Picking a stone
 * hands control to the autopilot until it arrives.
 */
function Flight({ focus, home, ctl }: { focus: THREE.Vector3 | null; home: number; ctl: React.RefObject<ShipCtl> }) {
  const { camera, gl } = useThree();
  const look = useRef({ yaw: 0, pitch: -0.12, ty: 0, tp: -0.12 });
  const glide = useRef<{ from: THREE.Vector3; to: THREE.Vector3; aim: THREE.Vector3; t: number; dur: number } | null>(null);

  // arrival: warp in from the edge of the garden toward its heart
  useLayoutEffect(() => {
    camera.position.set(0, 14, RADIUS + 10);
    look.current = { yaw: 0, pitch: -0.2, ty: 0, tp: -0.2 };
    glide.current = { from: camera.position.clone(), to: new THREE.Vector3(0, 8, 30), aim: new THREE.Vector3(0, 0, 0), t: 0, dur: 3.2 };
    ctl.current.throttle = 0;
  }, [camera, home, ctl]);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.focus({ preventScroll: true });
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      ctl.current.steering = inside;
      ctl.current.steerX = ((e.clientX - r.left) / r.width) * 2 - 1;
      ctl.current.steerY = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!dragging) return;
      const L = look.current;
      L.ty -= (e.clientX - lx) * 0.004;
      L.tp = Math.max(-1.3, Math.min(1.3, L.tp - (e.clientY - ly) * 0.004));
      lx = e.clientX;
      ly = e.clientY;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) glide.current = null;
    };
    const up = () => (dragging = false);
    const leave = () => (ctl.current.steering = false);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      glide.current = null;
      ctl.current.throttle = Math.max(0, Math.min(1, ctl.current.throttle - e.deltaY * 0.0012));
    };
    const kd = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const k = e.key.toLowerCase();
      if (!(document.activeElement === el || el.matches(":hover"))) return;
      if (["w", "s", "a", "d", "q", "e", "arrowup", "arrowdown", "shift"].includes(k)) {
        if (k.startsWith("arrow")) e.preventDefault();
        keys.add(k);
        glide.current = null;
      }
    };
    const ku = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const blur = () => keys.clear();
    el.tabIndex = 0;
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerleave", leave);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    addEventListener("keydown", kd);
    addEventListener("keyup", ku);
    addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerleave", leave);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      removeEventListener("blur", blur);
      keys.clear();
    };
  }, [camera, gl, ctl]);

  // autopilot toward a newly picked stone
  useEffect(() => {
    if (!focus) return;
    const dir = camera.position.clone().sub(focus).setY(0).normalize();
    if (!isFinite(dir.x) || dir.lengthSq() < 0.1) dir.set(0, 0, 1);
    const to = focus.clone().addScaledVector(dir, 7.5).add(new THREE.Vector3(0, 2.6, 0));
    const dist = camera.position.distanceTo(to);
    glide.current = { from: camera.position.clone(), to, aim: focus.clone(), t: 0, dur: Math.min(2.6, 0.9 + dist / 25) };
    ctl.current.throttle = 0;
  }, [focus, camera, ctl]);

  useFrame((_, dt) => {
    const L = look.current;
    const c = ctl.current;
    const g = glide.current;
    if (g) {
      g.t = Math.min(1, g.t + dt / g.dur);
      const e = g.t < 0.5 ? 4 * g.t ** 3 : 1 - (-2 * g.t + 2) ** 3 / 2;
      camera.position.lerpVectors(g.from, g.to, e);
      camera.position.y += Math.sin(e * Math.PI) * 2.5;
      const d = g.aim.clone().sub(camera.position);
      L.ty = Math.atan2(-d.x, -d.z);
      L.tp = Math.atan2(d.y, Math.hypot(d.x, d.z));
      // streaks while the autopilot is underway
      c.speed = THREE.MathUtils.damp(c.speed, Math.sin(e * Math.PI) * MAX_SPEED * 0.9, 6, dt);
      if (g.t >= 1) glide.current = null;
    } else {
      // throttle from keys
      if (keys.has("w") || keys.has("arrowup")) c.throttle = Math.min(1, c.throttle + dt * 0.7);
      if (keys.has("s") || keys.has("arrowdown")) c.throttle = Math.max(0, c.throttle - dt * 0.9);
      const boost = keys.has("shift") ? 1.8 : 1;
      c.speed = THREE.MathUtils.damp(c.speed, c.throttle * MAX_SPEED * boost, 2.5, dt);
      // pointer steering only while moving, outside a calm dead zone
      if (c.steering && c.speed > 0.6) {
        const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
        L.ty -= dz(c.steerX) * dt * 1.1;
        L.tp = Math.max(-1.2, Math.min(1.2, L.tp - dz(c.steerY) * dt * 0.8));
      }
      if (keys.has("a")) L.ty += dt * 1.2;
      if (keys.has("d")) L.ty -= dt * 1.2;
      const f = new THREE.Vector3();
      camera.getWorldDirection(f);
      camera.position.addScaledVector(f, c.speed * dt);
      if (keys.has("e")) camera.position.y += dt * 6;
      if (keys.has("q")) camera.position.y -= dt * 6;
    }
    L.yaw = THREE.MathUtils.damp(L.yaw, L.ty, 6, dt);
    L.pitch = THREE.MathUtils.damp(L.pitch, L.tp, 6, dt);
    camera.rotation.set(L.pitch, L.yaw, 0, "YXZ");
    // bank into turns like a ship
    camera.rotation.z = THREE.MathUtils.clamp(-(L.ty - L.yaw) * 1.4, -0.35, 0.35);
    c.pos.copy(camera.position);
    c.yaw = L.yaw;
    // soft wall at the edge of the garden
    const out = camera.position.length() - RADIUS;
    if (out > 0 && !g) {
      camera.position.multiplyScalar((RADIUS + out * 0.85) / camera.position.length());
      c.throttle *= 0.97;
    }
  });
  return null;
}

const RANGE = 45;

function Radar({ placed, hud, selectedId, onPick, R = 54 }: { placed: Placed[]; hud: { x: number; z: number; yaw: number }; selectedId?: string | null; onPick: (id: string) => void; R?: number }) {
  const fx = -Math.sin(hud.yaw);
  const fz = -Math.cos(hud.yaw);
  const rx = Math.cos(hud.yaw);
  const rz = -Math.sin(hud.yaw);
  return (
    <div className="rounded-full">
      <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} role="group" aria-label="Radar">
        <circle r={R - 1} fill="none" stroke="#9fe3b0" strokeOpacity="0.25" />
        <circle r={(R - 1) / 2} fill="none" stroke="#9fe3b0" strokeOpacity="0.15" />
        <line x1={-R} x2={R} y1="0" y2="0" stroke="#9fe3b0" strokeOpacity="0.1" />
        <line y1={-R} y2={R} x1="0" x2="0" stroke="#9fe3b0" strokeOpacity="0.1" />
        {/* sweeping beam */}
        <g className="sw-radar-sweep">
          <path d={`M0 0 L0 ${-R + 1} A${R - 1} ${R - 1} 0 0 1 ${(R - 1) * Math.sin(0.6)} ${-(R - 1) * Math.cos(0.6)} Z`} fill="#9fe3b0" fillOpacity="0.12" />
        </g>
        {placed.map((p) => {
          const dx = p.pos.x - hud.x;
          const dz = p.pos.z - hud.z;
          let sx = ((dx * rx + dz * rz) / RANGE) * (R - 6);
          let sy = (-(dx * fx + dz * fz) / RANGE) * (R - 6);
          const len = Math.hypot(sx, sy);
          const edge = len > R - 6;
          if (edge) {
            sx = (sx / len) * (R - 6);
            sy = (sy / len) * (R - 6);
          }
          const sel = p.stone.id === selectedId;
          return (
            <g key={p.stone.id} transform={`translate(${sx} ${sy})`} style={{ cursor: "pointer" }} onClick={() => onPick(p.stone.id)}>
              <title>{p.stone.name}</title>
              {sel && <circle r="6" fill="none" stroke="#f2b34a" strokeWidth="1.2" />}
              <circle r={edge ? 1.6 : 2.6} fill={VCOLOR[p.stone.verdict]} opacity={edge ? 0.5 : 1} />
            </g>
          );
        })}
        {/* the ship */}
        <path d="M0 -5 L4 4 L0 2 L-4 4 Z" fill="#f4f1e6" />
      </svg>
    </div>
  );
}

/** Shifts the view so the horizon sits in the canopy glass, above the dashboard. */
function Lift({ px }: { px: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    camera.setViewOffset(size.width, size.height + px, 0, px, size.width, size.height);
    camera.updateProjectionMatrix();
    return () => {
      camera.clearViewOffset();
    };
  }, [camera, size, px]);
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

export default function SpaceGarden({ stones, selectedId, onSelect, className = "" }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focus, setFocus] = useState<THREE.Vector3 | null>(null);
  const [home, setHome] = useState(0);
  const labels = useRef<LabelMap>(new Map());
  const [help, setHelp] = useState(false);
  const placed = useMemo(() => constellation(stones), [stones]);
  const ctl = useRef<ShipCtl>({ throttle: 0, speed: 0, steerX: 0, steerY: 0, steering: false, pos: new THREE.Vector3(), yaw: 0 });
  const target = placed.find((p) => p.stone.id === selectedId) ?? null;
  // autopilot order: best projects first, the same order as the spiral
  const hop = (d: 1 | -1) => {
    const i = placed.findIndex((p) => p.stone.id === selectedId);
    const n = placed[(i + d + placed.length) % placed.length];
    if (n) pick(n.stone.id);
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const key = (e: KeyboardEvent) => {
      if (!el.matches(":hover") && !el.contains(document.activeElement)) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      hop(e.key === "ArrowRight" ? 1 : -1);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);
  const [dash, setDash] = useState(150);
  useEffect(() => {
    const fit = () => setDash(innerWidth < 640 ? 120 : 160);
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  function pick(id: string) {
    onSelect?.(id);
    const p = placed.find((x) => x.stone.id === id);
    if (p) setFocus(p.pos.clone());
  }

  return (
    <div ref={box} className={`relative isolate ${className}`} data-cursor={hoverId ? "stone" : "drag"}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.25]}
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
          <Flight focus={focus} home={home} ctl={ctl} />
          <Streaks ctl={ctl} />
          <LabelProjector placed={placed} labels={labels} />
          <Lift px={dash} />
        </Suspense>
      </Canvas>

      <ul className="pointer-events-none absolute inset-0 isolate overflow-hidden" aria-label="Projects in the garden">
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

      <Cockpit
        dash={dash}
        ctl={ctl}
        target={target}
        placed={placed}
        selectedId={selectedId}
        onPick={pick}
        onHop={hop}
        onRestart={() => (setFocus(null), setHome((h) => h + 1))}
        help={help}
        setHelp={setHelp}
      />
    </div>
  );
}


/* ---------- Cockpit: canopy frame, dashboard instruments, flight school ---------- */

type Hud = { speed: number; throttle: number; dist: number; x: number; z: number; yaw: number };

const SCHOOL = [
  { id: "hello", title: "Welcome aboard, Keeper", body: "This ship flies you through your graveyard. Four quick drills and you are cleared to explore.", goal: "" },
  { id: "throttle", title: "Throttle up", body: "Push the throttle lever up (or press W, or scroll up over the glass).", goal: "Reach speed 30" },
  { id: "steer", title: "Steer", body: "While moving, point at the left or right side of the glass. The ship turns toward your pointer.", goal: "Turn the ship" },
  { id: "auto", title: "Autopilot", body: "Press ▶ on the navigation screen to fly straight to the next project.", goal: "Engage autopilot" },
  { id: "radar", title: "Read the radar", body: "Dots are projects, coloured by verdict. Straight ahead is always up. Click a dot to fly there.", goal: "" },
] as const;

/** Arc speedometer. */
function Gauge({ v }: { v: number }) {
  const k = Math.min(1, v / (MAX_SPEED * 1.8));
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const arc = (t: number, r: number) => [Math.cos(a0 + (a1 - a0) * t) * r, Math.sin(a0 + (a1 - a0) * t) * r];
  const [ex, ey] = arc(1, 30);
  const [sx, sy] = arc(0, 30);
  const [nx, ny] = arc(k, 24);
  return (
    <svg viewBox="-40 -40 80 70" className="h-[86px] w-[96px]" aria-hidden="true">
      <path d={`M${sx} ${sy} A30 30 0 1 1 ${ex} ${ey}`} fill="none" stroke="#1d3340" strokeWidth="5" strokeLinecap="round" />
      <path d={`M${sx} ${sy} A30 30 0 1 1 ${ex} ${ey}`} fill="none" stroke="url(#sw-g)" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
      <defs>
        <linearGradient id="sw-g" x1="0" x2="1">
          <stop offset="0" stopColor="#7fd29a" />
          <stop offset="0.7" stopColor="#f2b34a" />
          <stop offset="1" stopColor="#f07a5a" />
        </linearGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => {
        const [x1, y1] = arc(i / 8, 36);
        const [x2, y2] = arc(i / 8, 33);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b6472" strokeWidth="1" />;
      })}
      <line x1="0" y1="0" x2={nx} y2={ny} stroke="#f4f1e6" strokeWidth="1.6" strokeLinecap="round" />
      <circle r="3" fill="#f4f1e6" />
      <text y="20" textAnchor="middle" fontSize="11" fill="#f4f1e6" fontFamily="var(--font-plex-mono)">
        {Math.round(v * 10)}
      </text>
      <text y="28" textAnchor="middle" fontSize="5" fill="#7fd29a" letterSpacing="1" fontFamily="var(--font-plex-mono)">
        KM/S
      </text>
    </svg>
  );
}

/** A dark glass instrument screen set into the console. */
function Screen({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#2c4252] bg-[radial-gradient(120%_120%_at_50%_0%,#0f2230,#060d14)] p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,0,0,0.6)] ${className}`}>
      <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(159,227,176,0.03)_0_1px,transparent_1px_3px)]" aria-hidden="true" />
      <p className="relative font-mono text-[8px] tracking-[0.2em] text-[#7fd29a]/80 uppercase">{label}</p>
      <div className="relative">{children}</div>
    </div>
  );
}

function Cockpit({
  dash,
  ctl,
  target,
  placed,
  selectedId,
  onPick,
  onHop,
  onRestart,
  help,
  setHelp,
}: {
  dash: number;
  ctl: React.RefObject<ShipCtl>;
  target: Placed | null;
  placed: Placed[];
  selectedId?: string | null;
  onPick: (id: string) => void;
  onHop: (d: 1 | -1) => void;
  onRestart: () => void;
  help: boolean;
  setHelp: (f: (h: boolean) => boolean) => void;
}) {
  // the dashboard polls the ship itself, so instrument updates never re-render the 3D scene
  const [hud, setHud] = useState<Hud>({ speed: 0, throttle: 0, dist: 0, x: 0, z: 0, yaw: 0 });
  useEffect(() => {
    const t = setInterval(() => {
      const c = ctl.current;
      setHud({ speed: c.speed, throttle: c.throttle, dist: target ? c.pos.distanceTo(target.pos) : 0, x: c.pos.x, z: c.pos.z, yaw: c.yaw });
    }, 150);
    return () => clearInterval(t);
  }, [ctl, target]);
  const [step, setStep] = useState<number>(-1);
  const yaw0 = useRef(0);
  const sel0 = useRef<string | null | undefined>(null);
  const passed = useRef(-1);

  // flight school runs once, the first time the cockpit opens
  useEffect(() => {
    try {
      if (!localStorage.getItem("sw-flight-school")) setStep(0);
    } catch {}
  }, []);
  const done = () => {
    try {
      localStorage.setItem("sw-flight-school", "1");
    } catch {}
    setStep(-1);
  };
  const advance = () => setStep((s) => (s + 1 >= SCHOOL.length ? (done(), -1) : s + 1));
  const drill = step >= 0 ? SCHOOL[step] : null;

  useEffect(() => {
    if (!drill) return;
    if (drill.id === "steer") yaw0.current = hud.yaw;
    if (drill.id === "auto") sel0.current = selectedId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => {
    if (!drill) return;
    const ok =
      (drill.id === "throttle" && hud.speed * 10 >= 30) ||
      (drill.id === "steer" && Math.abs(hud.yaw - yaw0.current) > 0.45) ||
      (drill.id === "auto" && selectedId !== sel0.current);
    // each drill completes once; the HUD keeps ticking, so don't let it cancel the advance
    if (ok && passed.current !== step) {
      passed.current = step;
      play("step");
      setTimeout(advance, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hud, selectedId, drill]);

  const glow = (id: string) => (drill?.id === id ? "ring-2 ring-[#f2b34a] shadow-[0_0_24px_rgba(242,179,74,0.6)]" : "");

  return (
    <>
      {/* Canopy: hull frame, struts and glass sheen around the view */}
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="sw-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101c25" />
            <stop offset="1" stopColor="#05090d" />
          </linearGradient>
          <linearGradient id="sw-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* top bar and corner struts */}
        <path d="M0 0 H100 V4 Q50 7 0 4 Z" fill="url(#sw-hull)" />
        <path d="M0 0 L9 0 L2 60 L0 62 Z" fill="url(#sw-hull)" />
        <path d="M100 0 L91 0 L98 60 L100 62 Z" fill="url(#sw-hull)" />
        <path d="M9 0 L2 60" stroke="#2c4252" strokeWidth="0.25" fill="none" />
        <path d="M91 0 L98 60" stroke="#2c4252" strokeWidth="0.25" fill="none" />
        <path d="M0 4 Q50 7 100 4" stroke="#2c4252" strokeWidth="0.25" fill="none" />
        <path d="M10 5 L40 5 L18 55 L4 55 Z" fill="url(#sw-sheen)" />
      </svg>

      {/* heads-up reticle in the middle of the glass */}
      <div className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ top: `calc((100% - ${dash}px) / 2)` }} aria-hidden="true">
        <div className="relative h-12 w-12 rounded-full border border-[#9fe3b0]/35">
          <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9fe3b0]" />
          <span className="absolute top-1/2 -left-4 h-px w-3 bg-[#9fe3b0]/60" />
          <span className="absolute top-1/2 -right-4 h-px w-3 bg-[#9fe3b0]/60" />
        </div>
        {target && <p className="mt-2 text-center font-mono text-[9px] tracking-[0.2em] whitespace-nowrap text-[#9fe3b0]/80 uppercase">{hud.dist < 11 ? `Holding at ${target.stone.name}` : `${Math.round(hud.dist)} m to target`}</p>}
      </div>

      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button onClick={() => ((passed.current = -1), setStep(0))} className="rounded-full border border-white/15 bg-[#0d1b26]/80 px-3 py-1.5 text-xs font-semibold text-[#f4f1e6] backdrop-blur-sm hover:border-[#f2b34a]">
          Flight school
        </button>
        <button onClick={() => setHelp((h) => !h)} aria-expanded={help} className="rounded-full border border-white/15 bg-[#0d1b26]/80 px-3 py-1.5 text-xs font-semibold text-[#f4f1e6] backdrop-blur-sm hover:border-[#f2b34a]">
          {help ? "Close" : "Controls"}
        </button>
        <button onClick={onRestart} className="rounded-full border border-white/15 bg-[#0d1b26]/80 px-3 py-1.5 text-xs font-semibold text-[#f4f1e6] backdrop-blur-sm hover:border-[#f2b34a]">
          ⟲ Restart
        </button>
      </div>
      {help && (
        <div className="absolute top-14 right-3 z-20 w-64 rounded-xl border border-white/10 bg-[#0d1b26]/92 p-3 text-xs leading-relaxed text-[#d9dce4] backdrop-blur-sm" role="note">
          <p className="mb-1.5 font-semibold text-[#f4f1e6]">Flying your ship</p>
          <ul className="space-y-1">
            <li><b>◀ ▶</b> or <b>arrow keys</b>: autopilot between projects</li>
            <li><b>Click a stone</b> or a radar dot: fly straight to it</li>
            <li><b>Throttle</b>, <b>W / S</b> or <b>scroll</b>: cruising speed</li>
            <li><b>Point</b> to steer while moving, <b>drag</b> to look when stopped</li>
            <li className="hidden [@media(pointer:fine)]:list-item"><b>A / D</b> turn, <b>Q / E</b> down and up, <b>Shift</b> boost</li>
          </ul>
        </div>
      )}

      {/* Dashboard */}
      <div className="absolute inset-x-0 bottom-0 z-20" style={{ height: dash }}>
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,#16242f_0%,#0b141b_40%,#060b10_100%)] shadow-[0_-10px_40px_rgba(0,0,0,0.7)]"
          style={{ clipPath: "polygon(0 22%, 8% 6%, 30% 0, 70% 0, 92% 6%, 100% 22%, 100% 100%, 0 100%)" }}
        >
          <span className="absolute inset-x-[8%] top-0 h-px bg-[linear-gradient(90deg,transparent,#3d5868,transparent)]" />
        </div>
        <div className="relative flex h-full items-end gap-2 px-3 pt-4 pb-3 sm:gap-3 sm:px-6">
          {/* left: radar */}
          <Screen label="Radar" className={`hidden shrink-0 sm:block ${glow("radar")}`}>
            <Radar placed={placed} hud={hud} selectedId={selectedId} onPick={onPick} R={dash > 140 ? 50 : 40} />
          </Screen>

          {/* left-centre: systems */}
          <Screen label="Systems" className="hidden w-36 shrink-0 lg:block">
            <ul className="mt-1 space-y-1 font-mono text-[9px] text-[#c3cbc8]">
              {[
                ["Hull", "100%", "#7fd29a"],
                ["Moonlight", "on", "#f2b34a"],
                ["Stones", String(placed.length), "#86cde5"],
              ].map(([k, v, c]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: c }} />
                    {k}
                  </span>
                  <span style={{ color: c }}>{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5">
              {(Object.keys(VCOLOR) as Verdict[]).map((v) => (
                <span key={v} className="flex items-center gap-1 font-mono text-[8px] text-[#9aa6ad] capitalize">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: VCOLOR[v] }} />
                  {v}
                </span>
              ))}
            </div>
          </Screen>

          {/* centre: navigation computer */}
          <Screen label="Navigation" className={`min-w-0 flex-1 ${glow("auto")}`}>
            <div className="mt-1 flex items-center gap-2">
              <button onClick={() => onHop(-1)} aria-label="Fly to previous project" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#2c4252] bg-[#0b1820] text-[#f4f1e6] hover:border-[#f2b34a]">
                ◀
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate font-display text-base leading-tight font-semibold text-[#f4f1e6] sm:text-lg">{target ? target.stone.name : "No target"}</p>
                {target && (
                  <p className="mt-0.5 flex items-center justify-center gap-2 font-mono text-[10px] text-[#9aa6ad]">
                    <span className="flex items-center gap-1 capitalize" style={{ color: VCOLOR[target.stone.verdict] }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: VCOLOR[target.stone.verdict] }} />
                      {target.stone.verdict}
                    </span>
                    · score {target.stone.score} · {hud.dist < 11 ? "arrived" : `${Math.round(hud.dist)} m`}
                  </p>
                )}
              </div>
              <button onClick={() => onHop(1)} aria-label="Fly to next project" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#2c4252] bg-[#0b1820] text-[#f4f1e6] hover:border-[#f2b34a]">
                ▶
              </button>
            </div>
          </Screen>

          {/* right: speed gauge and throttle */}
          <Screen label="Speed" className="hidden shrink-0 sm:block">
            <Gauge v={hud.speed} />
          </Screen>
          <Screen label="Throttle" className={`shrink-0 ${glow("throttle")}`}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(hud.throttle * 100)}
                onChange={(e) => (ctl.current.throttle = Number(e.target.value) / 100)}
                aria-label="Throttle"
                className="h-[72px] w-6 cursor-pointer accent-[#f2b34a] [direction:rtl] [writing-mode:vertical-lr]"
                style={{ height: dash - 70 }}
              />
              <div className="flex flex-col gap-1.5">
                <button onClick={() => (ctl.current.throttle = 0)} className="rounded border border-[#f07a5a]/60 px-1.5 py-1 font-mono text-[9px] text-[#f07a5a] hover:bg-[#f07a5a]/10" aria-label="Stop the ship">
                  STOP
                </button>
                <span className="text-center font-mono text-[10px] text-[#f4f1e6] tabular-nums">{Math.round(hud.throttle * 100)}%</span>
              </div>
            </div>
          </Screen>
        </div>
      </div>

      {/* steering hint glows on the glass edges while the steer drill is on */}
      {drill?.id === "steer" && (
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
          <span className="absolute top-1/4 left-4 animate-pulse font-mono text-2xl text-[#f2b34a]">◀</span>
          <span className="absolute top-1/4 right-4 animate-pulse font-mono text-2xl text-[#f2b34a]">▶</span>
        </div>
      )}

      {/* Flight school */}
      <AnimatePresence>
        {drill && (
          <motion.div
            key={step}
            role="dialog"
            aria-label={`Flight school: ${drill.title}`}
            className="absolute top-14 left-1/2 z-30 w-[min(360px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-[#2c4252] bg-[#0d1b26]/95 p-4 text-[#f4f1e6] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-[#9fe3b0] uppercase">
                Flight school · {step + 1}/{SCHOOL.length}
              </span>
              <button onClick={done} className="text-xs text-[#9aa6ad] underline-offset-4 hover:text-[#f4f1e6] hover:underline">
                Skip training
              </button>
            </div>
            <h3 className="mt-1.5 font-display text-lg font-semibold">{drill.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#c3cbc8]">{drill.body}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex gap-1">
                {SCHOOL.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-[#f2b34a]" : i < step ? "w-1.5 bg-[#7fd29a]" : "w-1.5 bg-white/20"}`} />
                ))}
              </div>
              {drill.goal ? (
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#f2b34a]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f2b34a]" />
                  {drill.goal}
                </span>
              ) : (
                <button onClick={advance} className="rounded-full bg-[#f2b34a] px-4 py-1.5 text-sm font-semibold text-[#1e2721] hover:bg-[#f7c66d]">
                  {step === 0 ? "Begin training" : step === SCHOOL.length - 1 ? "Start exploring" : "Next"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
