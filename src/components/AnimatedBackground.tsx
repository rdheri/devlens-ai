"use client";
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animFrame: number;
    let w = 0, h = 0;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const colors = ["34, 211, 238", "52, 211, 153", "167, 139, 250"];
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.1, color: colors[Math.floor(Math.random() * colors.length)] });
    }
    const orbs = [
      { x: w * 0.3, y: h * 0.3, radius: 200, color: "34, 211, 238", speed: 0.0003 },
      { x: w * 0.7, y: h * 0.6, radius: 250, color: "167, 139, 250", speed: 0.0004 },
      { x: w * 0.5, y: h * 0.8, radius: 180, color: "52, 211, 153", speed: 0.0005 },
    ];
    let t = 0;
    function draw() {
      ctx!.clearRect(0, 0, w, h); t++;
      for (const orb of orbs) {
        const ox = orb.x + Math.sin(t * orb.speed) * 80;
        const oy = orb.y + Math.cos(t * orb.speed * 1.3) * 60;
        const grad = ctx!.createRadialGradient(ox, oy, 0, ox, oy, orb.radius);
        grad.addColorStop(0, `rgba(${orb.color}, 0.06)`); grad.addColorStop(0.5, `rgba(${orb.color}, 0.02)`); grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = grad; ctx!.fillRect(0, 0, w, h);
      }
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx!.fillStyle = `rgba(${p.color}, ${p.alpha})`; ctx!.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) { ctx!.beginPath(); ctx!.moveTo(particles[i].x, particles[i].y); ctx!.lineTo(particles[j].x, particles[j].y); ctx!.strokeStyle = `rgba(34, 211, 238, ${0.06 * (1 - dist / 120)})`; ctx!.lineWidth = 0.5; ctx!.stroke(); }
        }
      }
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animFrame); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}
