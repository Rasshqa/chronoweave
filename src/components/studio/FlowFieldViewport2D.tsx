'use client';

// ponytail: HTML5 2D Canvas flow-field engine using Simplex noise for fluid particle dynamics.

import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import { VisualVector } from '@/lib/mappingEngine';
import { mulberry32, cyrb128 } from '@/lib/prng';

interface FlowFieldViewport2DProps {
  vector: VisualVector;
  isPaused?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  color: string;
}

export default function FlowFieldViewport2D({
  vector,
  isPaused = false,
}: FlowFieldViewport2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initial background
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, width, height);

    // Seeded PRNG for particles and Simplex noise
    const [h1] = cyrb128(vector.seedHash);
    const prng = mulberry32(h1);
    const noise3D = createNoise3D(prng);

    const colors = [vector.primaryColor, vector.secondaryColor, vector.accentColor];
    const particleCount = vector.particleCount;
    const particles: Particle[] = [];

    const initParticle = (): Particle => ({
      x: prng() * width,
      y: prng() * height,
      vx: 0,
      vy: 0,
      age: 0,
      maxAge: 60 + Math.floor(prng() * 120),
      color: colors[Math.floor(prng() * colors.length)],
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(initParticle());
    }

    let zOff = 0;

    const render = () => {
      if (!isPaused) {
        // Semi-transparent overlay creating sleek particle trails
        ctx.fillStyle = 'rgba(7, 7, 9, 0.06)';
        ctx.fillRect(0, 0, width, height);

        const noiseScale = vector.noiseScale * 0.002;
        const speed = vector.particleSpeed * 0.9;

        ctx.lineWidth = 1.2;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Compute angle from 3D Simplex noise
          const angle = noise3D(p.x * noiseScale, p.y * noiseScale, zOff) * Math.PI * 2;

          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;

          const prevX = p.x;
          const prevY = p.y;

          p.x += p.vx;
          p.y += p.vy;
          p.age += 1;

          // Draw particle stroke
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Reset if aged or out of bounds
          if (
            p.age >= p.maxAge ||
            p.x < 0 ||
            p.x > width ||
            p.y < 0 ||
            p.y > height
          ) {
            particles[i] = initParticle();
          }
        }

        zOff += 0.003 * vector.particleSpeed;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [vector, isPaused]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#070709] overflow-hidden">
      <canvas
        id="flowfield-canvas-target"
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
}
