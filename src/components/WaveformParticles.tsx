'use client';

import { useEffect, useRef } from 'react';

/**
 * EFFECT-06 — ambient audio waveform particles behind the hero.
 *
 * aria-hidden · opacity below 0.2 (0.18, set in CSS) · paused when the tab is
 * hidden · frozen (no rAF at all) under reduced motion.
 */
export function WaveformParticles({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let visible = document.visibilityState === 'visible';

    const particles = Array.from({ length: 64 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.02 + Math.random() * 0.05,
      radius: 0.6 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibility);

    let time = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible) return; // paused while the tab is hidden

      time += 0.012;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      // vertical waveform bars (the "audio waveform" reading)
      const bars = 42;
      const barWidth = width / bars;
      context.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < bars; i += 1) {
        const amplitude =
          (Math.sin(time * 1.6 + i * 0.34) * 0.5 + Math.sin(time * 0.7 + i * 0.13) * 0.5) * 0.5 + 0.5;
        const barHeight = Math.max(2, amplitude * height * 0.5);
        context.fillRect(i * barWidth + barWidth * 0.25, (height - barHeight) / 2, barWidth * 0.5, barHeight);
      }

      // drifting particles
      for (const particle of particles) {
        particle.y -= particle.speed * 0.004;
        if (particle.y < -0.05) particle.y = 1.05;
        const x = (particle.x + Math.sin(time + particle.phase) * 0.01) * width;
        const y = particle.y * height;
        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255,255,255,0.55)';
        context.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  if (reduced) return null; // frozen: no canvas, nothing to animate

  return (
    <div className="sr-particles" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
