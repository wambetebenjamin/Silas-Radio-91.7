'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * EFFECT-01 — WebGL hero: a 3D radio microphone model orbiting slowly in real
 * time, built from Three.js primitives (no external model file, no invented
 * artwork). Drag to orbit; arrow keys for keyboard users; poster fallback
 * under reduced motion (the canvas is never mounted in that case).
 *
 * Performance: three.js is imported dynamically inside the effect so it never
 * blocks first paint or LCP (EFFECT-23).
 */

export interface HeroMicCanvasProps {
  /** Rendered instead of the canvas when the visitor prefers reduced motion. */
  poster: React.ReactNode;
}

export function HeroMicCanvas({ poster }: HeroMicCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Honour prefers-reduced-motion before importing anything heavy.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced !== false || !mountRef.current) return;

    const mount = mountRef.current;
    let disposed = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const THREE = await import('three');
      if (disposed || !mount) return;

      /* ---------------------------------------------------------------- */
      /*  Scene                                                            */
      /* ---------------------------------------------------------------- */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.6, 7.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      /* ---------------------------- Materials ------------------------- */
      // Brand purple from the design source, plus brass and dark metal.
      const brandMat = new THREE.MeshStandardMaterial({
        color: 0x5c00ce,
        metalness: 0.55,
        roughness: 0.32,
      });
      const grilleMat = new THREE.MeshStandardMaterial({
        color: 0x1b1b1f,
        metalness: 0.85,
        roughness: 0.45,
      });
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xc8a24a,
        metalness: 0.95,
        roughness: 0.24,
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.6,
      });

      /* ---------------------------- Microphone ------------------------ */
      const mic = new THREE.Group();

      // body (capsule shell approximated with a cylinder + rounded ends)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.9, 48, 1, true), brandMat);
      mic.add(body);

      // grille rings across the head
      const grille = new THREE.Group();
      for (let i = 0; i < 11; i += 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72 - i * 0.012, 0.012, 8, 40), grilleMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.62 + i * 0.1;
        grille.add(ring);
      }
      mic.add(grille);

      // top cap + bottom collar
      const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brandMat);
      topCap.position.y = 0.95;
      mic.add(topCap);

      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.5, 0.42, 40), brassMat);
      collar.position.y = -1.12;
      mic.add(collar);

      // yoke ring around the mic
      const yoke = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.075, 12, 64), brassMat);
      yoke.position.y = -0.28;
      mic.add(yoke);

      // side pivots
      const pivotLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 20), brassMat);
      pivotLeft.rotation.z = Math.PI / 2;
      pivotLeft.position.set(-1.12, -0.28, 0);
      mic.add(pivotLeft);
      const pivotRight = pivotLeft.clone();
      pivotRight.position.x = 1.12;
      mic.add(pivotRight);

      // stand column + base
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 24), darkMat);
      column.position.y = -2.0;
      mic.add(column);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.22, 48), darkMat);
      base.position.y = -2.8;
      mic.add(base);

      mic.rotation.z = 0.12;
      group.add(mic);

      /* ---------------------- "ON AIR" ring light ---------------------- */
      const ringLight = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.035, 10, 90),
        new THREE.MeshBasicMaterial({ color: 0xf44336 }), // source preloader red
      );
      ringLight.rotation.x = Math.PI / 2.35;
      ringLight.position.y = -0.2;
      group.add(ringLight);

      const ringLight2 = ringLight.clone();
      ringLight2.material = new THREE.MeshBasicMaterial({ color: 0x673ab7 }); // source preloader purple
      ringLight2.scale.setScalar(1.18);
      ringLight2.rotation.x = Math.PI / 2.9;
      group.add(ringLight2);

      /* ----------------------------- Lights --------------------------- */
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));

      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(3.2, 4.6, 4.2);
      scene.add(key);

      const rim = new THREE.PointLight(0x7e00ad, 22, 22);
      rim.position.set(-3.4, 1.8, -3);
      scene.add(rim);

      const fill = new THREE.PointLight(0x4fc3ff, 14, 20);
      fill.position.set(3.4, -1.6, 2.6);
      scene.add(fill);

      /* ---------------------------- Resize ---------------------------- */
      const resize = () => {
        const width = mount.clientWidth || 1;
        const height = mount.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(mount);

      /* ------------------------ Orbit interaction --------------------- */
      const state = {
        yaw: 0.4,
        pitch: 0.12,
        targetYaw: 0.4,
        targetPitch: 0.12,
        autoSpin: 0.0028,
        pointerId: -1,
        lastX: 0,
        lastY: 0,
      };

      const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

      const onPointerDown = (event: PointerEvent) => {
        state.pointerId = event.pointerId;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        setDragging(true);
        renderer.domElement.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (state.pointerId !== event.pointerId) return;
        const dx = event.clientX - state.lastX;
        const dy = event.clientY - state.lastY;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.targetYaw += dx * 0.008;
        state.targetPitch = clamp(state.targetPitch + dy * 0.005, -0.6, 0.6);
      };

      const onPointerUp = (event: PointerEvent) => {
        if (state.pointerId === event.pointerId) {
          state.pointerId = -1;
          setDragging(false);
        }
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        state.targetPitch = clamp(state.targetPitch + event.deltaY * 0.0012, -0.6, 0.6);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        const step = event.shiftKey ? 0.22 : 0.1;
        switch (event.key) {
          case 'ArrowLeft':
            state.targetYaw -= step;
            break;
          case 'ArrowRight':
            state.targetYaw += step;
            break;
          case 'ArrowUp':
            state.targetPitch = clamp(state.targetPitch - step * 0.6, -0.6, 0.6);
            break;
          case 'ArrowDown':
            state.targetPitch = clamp(state.targetPitch + step * 0.6, -0.6, 0.6);
            break;
          case 'Home':
            state.targetYaw = 0.4;
            state.targetPitch = 0.12;
            break;
          default:
            return;
        }
        event.preventDefault();
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
      mount.addEventListener('keydown', onKeyDown);

      /* ------------------------------ Loop ---------------------------- */
      let visible = document.visibilityState === 'visible';
      const onVisibility = () => {
        visible = document.visibilityState === 'visible';
      };
      document.addEventListener('visibilitychange', onVisibility);

      let time = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        if (!visible) return;

        time += 0.016;
        // slow orbit — suspended while the visitor pauses the effect
        if (state.pointerId === -1 && !pausedRef.current) state.targetYaw += state.autoSpin;
        state.yaw += (state.targetYaw - state.yaw) * 0.06;
        state.pitch += (state.targetPitch - state.pitch) * 0.06;

        group.rotation.y = state.yaw;
        group.rotation.x = state.pitch * 0.5;
        group.position.y = Math.sin(time * 0.9) * 0.06;

        ringLight.rotation.z = time * 0.35;
        ringLight2.rotation.z = -time * 0.22;
        const pulse = 0.9 + Math.sin(time * 2.2) * 0.08;
        ringLight.scale.setScalar(pulse);
        ringLight2.scale.setScalar(pulse * 1.18);

        renderer.render(scene, camera);
      };
      animate();

      /* ----------------------------- Teardown ------------------------- */
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
        mount.removeEventListener('keydown', onKeyDown);
        renderer.dispose();
        renderer.domElement.remove();
        scene.traverse((object) => {
          const mesh = object as { geometry?: { dispose?: () => void }; material?: { dispose?: () => void } };
          mesh.geometry?.dispose?.();
          mesh.material?.dispose?.();
        });
      };
    };

    void boot();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  if (reduced === null) {
    // First paint: keep the stage dark and reserve space so there is no CLS.
    return <div className="sr-hero__stage" aria-hidden="true" />;
  }

  if (reduced) {
    return (
      <div className="sr-hero__stage" data-effect="01-fallback">
        {/* Poster fallback: the canvas is never mounted under reduced motion */}
        {poster}
      </div>
    );
  }

  return (
    <div className="sr-hero__stage">
      <div
        ref={mountRef}
        tabIndex={0}
        role="img"
        aria-label="Interactive 3D model of a Silas Radio studio microphone. Use the arrow keys to orbit the microphone, or drag it with a pointer."
        aria-describedby="sr-mic-instructions"
        style={{ position: 'absolute', inset: 0, cursor: dragging ? 'grabbing' : 'grab' }}
      />
      <p id="sr-mic-instructions" className="sr-hero__drag-hint">
        Drag to orbit · Arrow keys to rotate
      </p>
      <button
        type="button"
        className="sr-hero__drag-hint"
        style={{ left: 'auto', right: 14, pointerEvents: 'auto' }}
        onClick={() => {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }}
        aria-pressed={paused}
        aria-label={paused ? 'Resume the microphone orbit' : 'Pause the microphone orbit'}
      >
        {paused ? 'Resume orbit' : 'Pause orbit'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {paused ? 'Microphone orbit paused.' : ''}
      </span>
    </div>
  );
}
