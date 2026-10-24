"use client";

import { create } from "zustand";

/**
 * Tiny synthesized sound kit (Web Audio, no files to download). Each kind of
 * interaction has its own voice so the ear learns what happened:
 * tick = button, tab = switching views, toggle = on/off, nav = page link,
 * pick/drop/return = the drag-and-drop loop, open = a panel or dialog,
 * unlock = a slide confirm, magic = a ritual, step = tutorial.
 */
export type Sfx = "tick" | "tab" | "toggle" | "nav" | "pick" | "drop" | "return" | "open" | "close" | "unlock" | "magic" | "step";

const KEY = "sw-sound";

export const useSound = create<{ on: boolean; toggle: () => void }>((set, get) => ({
  on: true,
  toggle: () => {
    const on = !get().on;
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {}
    set({ on });
    if (on) play("toggle");
  },
}));

export function loadSoundPref() {
  try {
    if (localStorage.getItem(KEY) === "off") useSound.setState({ on: false });
  } catch {}
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, { type = "sine", vol = 0.5, to }: { type?: OscillatorType; vol?: number; to?: number } = {}) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master!);
  o.start(at);
  o.stop(at + dur + 0.02);
}

function noise(at: number, dur: number, vol: number, from: number, to: number) {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, at);
  f.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(at);
}

let last = 0;
export function play(s: Sfx) {
  if (!useSound.getState().on) return;
  if (typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches && s !== "drop") return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  // never stack the same burst of clicks on top of itself
  if (t - last < 0.03 && (s === "tick" || s === "tab")) return;
  last = t;
  switch (s) {
    case "tick":
      tone(1400, t, 0.05, { type: "triangle", vol: 0.25 });
      break;
    case "tab":
      tone(660, t, 0.09, { type: "triangle", vol: 0.3 });
      tone(990, t + 0.05, 0.12, { type: "sine", vol: 0.22 });
      break;
    case "toggle":
      tone(880, t, 0.08, { vol: 0.25 });
      tone(1320, t + 0.06, 0.18, { vol: 0.2 });
      break;
    case "nav":
      noise(t, 0.35, 0.18, 400, 1600);
      tone(523, t + 0.05, 0.3, { vol: 0.12 });
      break;
    case "pick":
      tone(300, t, 0.14, { type: "sine", vol: 0.35, to: 620 });
      break;
    case "drop":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.06, 0.35, { type: "triangle", vol: 0.22 }));
      break;
    case "return":
      tone(420, t, 0.18, { type: "sine", vol: 0.3, to: 220 });
      break;
    case "open":
      noise(t, 0.25, 0.12, 2000, 6000);
      tone(784, t, 0.2, { vol: 0.15, to: 1175 });
      break;
    case "close":
      tone(700, t, 0.12, { vol: 0.15, to: 420 });
      break;
    case "unlock":
      tone(220, t, 0.35, { type: "sawtooth", vol: 0.06, to: 880 });
      [784, 1175].forEach((f, i) => tone(f, t + 0.3 + i * 0.08, 0.4, { vol: 0.2 }));
      break;
    case "magic":
      [1047, 1319, 1568, 2093, 1568, 2637].forEach((f, i) => tone(f, t + i * 0.05, 0.5, { vol: 0.1 }));
      noise(t, 0.8, 0.08, 3000, 8000);
      break;
    case "step":
      tone(587, t, 0.12, { type: "triangle", vol: 0.22 });
      tone(880, t + 0.07, 0.16, { vol: 0.16 });
      break;
  }
}
