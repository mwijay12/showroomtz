'use client';

/**
 * DistortImage — WebGL image plane with a cursor-driven ripple + RGB shift.
 *
 * This is the "curtains.js" effect, hand-rolled on three.js so we don't ship
 * another dependency:
 *
 *   · a full-quad shader plane textured with the photo
 *   · `uHover` eases 0 → 1 on pointer enter/leave
 *   · `uMouse` is normalized pointer position; the fragment shader builds a
 *     radial wave that displaces UVs and splits the RGB channels slightly
 *   · `uScroll` adds a tiny vertical drift so cards feel alive at rest
 *
 * Guardrails:
 *   · DPR capped at 1.5, one shared rAF per instance, paused when hidden
 *   · prefers-reduced-motion → renders one static frame (no pointer math)
 *   · no WebGL / texture error → falls back to a plain <img>
 *   · texture is same-origin (public/images), so no CORS setup needed
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTex;
uniform vec2  uRes;
uniform vec2  uImgRes;
uniform vec2  uMouse;     // 0..1 in plane space
uniform float uHover;     // 0..1 eased
uniform float uTime;
uniform float uStrength;

varying vec2 vUv;

// cover-fit the texture inside the plane regardless of aspect ratio
vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
  float planeAspect = res.x / max(res.y, 1.0);
  float imgAspect   = img.x / max(img.y, 1.0);
  vec2 scale = vec2(1.0);
  if (planeAspect > imgAspect) {
    scale.y = imgAspect / planeAspect;
  } else {
    scale.x = planeAspect / imgAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUv(vUv, uRes, uImgRes);

  // distance from the pointer, softened
  vec2 d = vUv - uMouse;
  d.x *= uRes.x / max(uRes.y, 1.0);
  float dist = length(d);

  // radial ripple that follows the pointer, plus a slow ambient wobble
  float wave = sin(dist * 26.0 - uTime * 2.4) * 0.5 + 0.5;
  float falloff = smoothstep(0.55, 0.0, dist) * uHover * uStrength;

  vec2 offset = normalize(d + 0.0001) * wave * falloff * 0.045;
  offset.y += sin(uTime * 0.6 + vUv.x * 3.0) * 0.0025 * (1.0 - uHover);

  // chromatic split grows with the hover
  float split = (0.004 + 0.010 * falloff);
  vec3 col;
  col.r = texture2D(uTex, uv + offset + vec2(split, 0.0)).r;
  col.g = texture2D(uTex, uv + offset).g;
  col.b = texture2D(uTex, uv + offset - vec2(split, 0.0)).b;

  // subtle vignette + contrast lift on hover
  float vig = smoothstep(0.95, 0.35, length(vUv - 0.5));
  col *= mix(1.0, vig * 0.55 + 0.65, uHover);
  col = mix(col, col * 1.08, uHover);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function DistortImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 1,
  priority = false,
  enabled = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  priority?: boolean;
  /** Set false (mobile / reduced motion) to skip WebGL entirely. */
  enabled?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const geometry = new THREE.PlaneGeometry(2, 2);

        const uniforms = {
          uTex: { value: null as any },
          uRes: { value: new THREE.Vector2(1, 1) },
          uImgRes: { value: new THREE.Vector2(1600, 900) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uStrength: { value: strength },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        // ── texture ────────────────────────────────────────────────
        const loader = new THREE.TextureLoader();
        try {
          const tex = await loader.loadAsync(src);
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          uniforms.uTex.value = tex;
          const img = tex.image as { width?: number; height?: number };
          uniforms.uImgRes.value.set(img.width || 1600, img.height || 900);
          setReady(true);
        } catch {
          setFailed(true);
          return;
        }

        // ── sizing ─────────────────────────────────────────────────
        const setSize = () => {
          const w = host.clientWidth || 1;
          const h = host.clientHeight || 1;
          renderer.setSize(w, h, false);
          uniforms.uRes.value.set(w, h);
        };
        setSize();
        const ro = new ResizeObserver(setSize);
        ro.observe(host);

        // ── pointer ────────────────────────────────────────────────
        let targetHover = 0;
        let hover = 0;

        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          uniforms.uMouse.value.set(
            (e.clientX - r.left) / r.width,
            1 - (e.clientY - r.top) / r.height
          );
        };
        const onEnter = () => (targetHover = 1);
        const onLeave = () => (targetHover = 0);

        if (!reduced) {
          host.addEventListener('pointermove', onMove);
          host.addEventListener('pointerenter', onEnter);
          host.addEventListener('pointerleave', onLeave);
        }

        // ── loop ───────────────────────────────────────────────────
        // only render while the card is actually on screen
        let visible = true;
        const io = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
          },
          { rootMargin: '120px' }
        );
        io.observe(host);

        const start = performance.now();
        let raf = 0;
        let last = 0;

        const render = (now: number) => {
          raf = requestAnimationFrame(render);
          if (document.hidden || !visible) return;
          // throttle to ~60fps max
          if (now - last < 15) return;
          last = now;

          hover += (targetHover - hover) * 0.08;
          uniforms.uHover.value = hover;
          uniforms.uTime.value = (now - start) / 1000;
          renderer.render(scene, camera);
        };

        if (reduced) {
          uniforms.uTime.value = 8;
          renderer.render(scene, camera);
        } else {
          raf = requestAnimationFrame(render);
        }

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          host.removeEventListener('pointermove', onMove);
          host.removeEventListener('pointerenter', onEnter);
          host.removeEventListener('pointerleave', onLeave);
          uniforms.uTex.value?.dispose?.();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode === host) {
            host.removeChild(renderer.domElement);
          }
        };
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [src, strength, enabled]);

  if (failed || !enabled) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={alt}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 700ms ease' }}
    />
  );
}
