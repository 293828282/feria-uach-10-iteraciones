'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  color: string;
}

export const CelestialAuroraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette: Celeste & Lila with gentle soft hues
    const colors = [
      'rgba(56, 189, 248, ', // Celeste
      'rgba(192, 132, 252, ', // Lila
      'rgba(147, 197, 253, ', // Azul cielo
      'rgba(233, 213, 255, ', // Lavanda suave
    ];

    const particleCount = Math.min(Math.floor((width * height) / 25000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.35 + 0.15,
        targetAlpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Ethereal Aurora Gradients in the Background
      const grad1X = width * 0.25 + Math.sin(time) * 80;
      const grad1Y = height * 0.3 + Math.cos(time * 0.8) * 60;
      const radial1 = ctx.createRadialGradient(grad1X, grad1Y, 10, grad1X, grad1Y, width * 0.45);
      radial1.addColorStop(0, 'rgba(186, 230, 253, 0.22)');
      radial1.addColorStop(0.6, 'rgba(224, 242, 254, 0.08)');
      radial1.addColorStop(1, 'rgba(224, 242, 254, 0)');

      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, width, height);

      const grad2X = width * 0.8 - Math.sin(time * 0.7) * 90;
      const grad2Y = height * 0.7 + Math.cos(time) * 70;
      const radial2 = ctx.createRadialGradient(grad2X, grad2Y, 10, grad2X, grad2Y, width * 0.4);
      radial2.addColorStop(0, 'rgba(233, 213, 255, 0.24)');
      radial2.addColorStop(0.6, 'rgba(243, 232, 255, 0.08)');
      radial2.addColorStop(1, 'rgba(243, 232, 255, 0)');

      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, width, height);

      // 2. Update & Draw Particles with Constellation Web
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Breathing alpha
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.targetAlpha - p.alpha) < 0.01) {
          p.targetAlpha = Math.random() * 0.4 + 0.1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect near particles with delicate thread
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.14;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  );
};
