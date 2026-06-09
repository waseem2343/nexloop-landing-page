/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export default function AiMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 90;
    const connectionDistance = 140;

    // Handle Resize
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    };

    // Color choices to emulate Nexloop core colors (Primary #0066ff, Secondary #00e0ff, ambient purples/violets)
    const particleColors = [
      'rgba(0, 102, 255, ',
      'rgba(0, 224, 255, ',
      'rgba(179, 197, 255, ',
      'rgba(139, 92, 246, ', // Violet
    ];

    const initParticles = () => {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;

      for (let i = 0; i < maxParticles; i++) {
        const colorBase = particleColors[Math.floor(Math.random() * particleColors.length)];
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 1.2,
          alpha: Math.random() * 0.4 + 0.3,
          color: colorBase,
        });
      }
    };

    resizeCanvas();

    // Resize observer to handle dynamic changes (safer than window resize alone)
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Mouse Tracking relative to canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseLeave = () => {
      setMouse({ x: null, y: null });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw Connection lines first (background)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const ratio = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Dynamic glowing gradient line
            ctx.strokeStyle = `rgba(0, 102, 255, ${ratio * 0.12 * p1.alpha})`;
            ctx.lineWidth = ratio * 1.1;
            ctx.stroke();
          }
        }

        // Draw connections to the mouse pointer
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < connectionDistance * 1.3) {
            const mratio = 1 - mdist / (connectionDistance * 1.3);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 224, 255, ${mratio * 0.18 * p1.alpha})`;
            ctx.lineWidth = mratio * 1.5;
            ctx.stroke();

            // Symmetrically apply a gentle attraction force to user interaction
            p1.x -= mdx * 0.015 * mratio;
            p1.y -= mdy * 0.015 * mratio;
          }
        }
      }

      // Draw all Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Wall bounce
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;

        // Glow aura for select particles
        if (i % 5 === 0) {
          ctx.shadowColor = 'rgba(0, 224, 255, 0.4)';
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouse.x, mouse.y]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <canvas ref={canvasRef} className="block w-full h-full mix-blend-screen opacity-70" />
    </div>
  );
}
