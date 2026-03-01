"use client";

import React, { useEffect, useRef } from "react";

interface MoonCursorOptions {
  element?: HTMLElement;
}

const MoonCursor: React.FC<MoonCursorOptions> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number | null>(null);
  const prefersReducedMotion = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const target = element || document.body;

    canvas.style.position = element ? "absolute" : "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";

    target.appendChild(canvas);
    canvasRef.current = canvas;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = element ? target.clientWidth : window.innerWidth;
      const h = element ? target.clientHeight : window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addParticle = (x: number, y: number) => {
      particles.current.push(new Particle(x, y));
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = target.getBoundingClientRect();
      const x = element ? e.clientX - rect.left : e.clientX;
      const y = element ? e.clientY - rect.top : e.clientY;
      addParticle(x, y);
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.current.splice(i, 1);
      });
    };

    const loop = () => {
      update();
      animationFrame.current = requestAnimationFrame(loop);
    };

    const init = () => {
      if (prefersReducedMotion.current?.matches) return;

      setCanvasSize();
      target.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", setCanvasSize);
      loop();
    };

    const destroy = () => {
      canvasRef.current?.remove();
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      target.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", setCanvasSize);
    };

    prefersReducedMotion.current.onchange = () => {
      if (prefersReducedMotion.current?.matches) {
        destroy();
      } else {
        init();
      }
    };

    init();
    return () => destroy();
  }, [element]);

  return null;
};

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  initialLife: number;
  size: number;
  starOffset: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = 1 + Math.random();
    this.life = Math.random() * 70 + 90;
    this.initialLife = this.life;
    this.size = 8 + Math.random() * 6;
    this.starOffset = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const t = this.life / this.initialLife;
    const scale = Math.max(t, 0);
    const r = this.size * scale;

    ctx.save();
    ctx.translate(this.x, this.y);

    // ✨ Glow
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    glow.addColorStop(0, `rgba(255, 235, 150, ${0.4 * t})`);
    glow.addColorStop(1, "rgba(255, 235, 150, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();

    // 🌙 Crescent
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.25, Math.PI * 1.75, false);
    ctx.arc(r * 0.45, 0, r * 0.85, Math.PI * 1.75, Math.PI * 0.25, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 240, 180, ${t})`;
    ctx.fill();

    // ⭐ Star (4-point sparkle)
    const sx = r * 0.9;
    const sy = -r * 0.6;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.starOffset);

    ctx.fillStyle = `rgba(255,255,220,${t})`;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.3);
    ctx.lineTo(r * 0.15, 0);
    ctx.lineTo(0, r * 0.3);
    ctx.lineTo(-r * 0.15, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}

export default MoonCursor;
