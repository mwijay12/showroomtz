'use client';

/**
 * WebGLShaderBackground — cinematic GLSL hero backdrop.
 *
 * Three shader programs (domain-warped fbm noise, hand-rolled GLSL):
 *   • aurora    — flowing crimson/gold aurora over deep black (house default)
 *   • liquid    — warped liquid-chrome specular bands
 *   • starfield — procedural twinkling stars + nebular glow
 *
 * Engineering notes:
 *   • Raw WebGL via Three.js — no assets, no textures, fully procedural.
 *   • DevicePixelRatio capped at 1.5; render loop pauses when tab is hidden.
 *   • Respects prefers-reduced-motion (renders a single static frame).
 *   • Fails silently → renders nothing if WebGL is unavailable.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type WebGLStyle = 'aurora' | 'liquid' | 'starfield';

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uStyle;   // 0 = aurora, 1 = liquid chrome, 2 = starfield
uniform vec2  uRes;
varying vec2  vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.52;
  }
  return v;
}

void main() {
  vec2 st = vUv - 0.5;
  st.x *= uRes.x / max(uRes.y, 1.0);
  float t = uTime * 0.05;
  vec3 col = vec3(0.0);

  if (uStyle < 0.5) {
    // ── AURORA ─────────────────────────────────────────────────────────
    vec2 q = vec2(fbm(st * 1.6 + t), fbm(st * 1.6 - t * 1.3 + 5.2));
    vec2 r = vec2(
      fbm(st * 2.1 + q * 2.0 + vec2(1.7, 9.2) + t * 0.6),
      fbm(st * 2.1 + q * 2.0 + vec2(8.3, 2.8) - t * 0.5)
    );
    float f = fbm(st * 1.8 + r * 2.4);
    vec3 deep    = vec3(0.016, 0.008, 0.016);
    vec3 ember   = vec3(0.42, 0.035, 0.26);
    vec3 crimson = vec3(0.86, 0.075, 0.125);
    vec3 gold    = vec3(1.0, 0.62, 0.16);
    col = deep;
    col = mix(col, ember,   smoothstep(0.30, 0.75, f) * 0.95);
    col = mix(col, crimson, smoothstep(0.42, 0.95, length(r)) * 0.72);
    col = mix(col, gold,    pow(smoothstep(0.55, 1.0, f), 2.4) * 0.85);
    col += gold * pow(max(0.0, 1.0 - abs(st.y + 0.18) * 1.5), 6.0) * 0.22; // horizon glow
  } else if (uStyle < 1.5) {
    // ── LIQUID CHROME ──────────────────────────────────────────────────
    vec2 p = st * 3.0;
    float w = fbm(p + fbm(p - t * 2.0) * 1.8 + t);
    float band = sin((p.x + w * 3.5 + t * 2.0) * 3.0);
    float spec = pow(clamp(band * 0.5 + 0.5, 0.0, 1.0), 6.0);
    vec3 base  = vec3(0.012, 0.012, 0.02);
    vec3 steel = vec3(0.72, 0.76, 0.84);
    vec3 red   = vec3(0.9, 0.12, 0.18);
    col = mix(base, steel * 0.32, smoothstep(0.2, 0.9, w));
    col += steel * spec * (0.35 + 0.65 * smoothstep(0.3, 1.0, w));
    col = mix(col, red, pow(spec, 2.0) * 0.38 * smoothstep(0.4, 1.0, w));
  } else {
    // ── STARFIELD ──────────────────────────────────────────────────────
    vec2 p = st * 4.0;
    float neb = fbm(p * 0.8 + t);
    col = vec3(0.008, 0.008, 0.018);
    col += vec3(0.32, 0.05, 0.28) * smoothstep(0.45, 0.95, neb) * 0.6;
    col += vec3(0.9, 0.34, 0.08) * pow(smoothstep(0.6, 1.0, neb), 2.0) * 0.35;
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 9.0 : 17.0;
      vec2 g = floor(p * scale);
      vec2 fpos = fract(p * scale) - 0.5;
      float h = hash(g + float(layer) * 13.7);
      if (h > 0.92) {
        float d = length(fpos);
        float tw = 0.6 + 0.4 * sin(uTime * (1.5 + h * 3.0) + h * 40.0);
        col += vec3(1.0, 0.95, 0.85) * smoothstep(0.09 + h * 0.05, 0.0, d) * tw;
      }
    }
  }

  // Cinematic vignette
  float vig = smoothstep(1.35, 0.35, length(st));
  col *= vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

const STYLE_INDEX: Record<WebGLStyle, number> = {
  aurora: 0,
  liquid: 1,
  starfield: 2,
};

interface WebGLShaderBackgroundProps {
  style?: WebGLStyle;
  /** 0–1, applied to the wrapper element. Default 1. */
  opacity?: number;
  className?: string;
}

export function WebGLShaderBackground({
  style = 'aurora',
  opacity = 1,
  className = '',
}: WebGLShaderBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      // WebGL unavailable — fail silently, page still looks great.
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uStyle: { value: STYLE_INDEX[style] ?? 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const setSize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    };
    setSize();
    window.addEventListener('resize', setSize);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      raf = window.requestAnimationFrame(render);
      if (document.hidden) return; // pause GPU when tab hidden
      uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
    };

    if (prefersReduced) {
      uniforms.uTime.value = 12.0; // pick an interesting frame
      renderer.render(scene, camera);
    } else {
      render();
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', setSize);
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, [style]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    />
  );
}
