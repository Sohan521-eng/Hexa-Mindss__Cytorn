"use client";

import React, { useEffect, useRef } from "react";

interface VortexParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  hue: number;
  spiralTightness: number;
}

export const AuthVortexCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize spiral arm particles
    const particleCount = 280;
    const particles: VortexParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 35 + Math.random() * (Math.min(width, height) * 0.44),
        speed: 0.008 + Math.random() * 0.018,
        size: 1 + Math.random() * 2.4,
        opacity: 0.2 + Math.random() * 0.7,
        hue: Math.random() > 0.4 ? 184 : 198, // Cyan / deep teal
        spiralTightness: 0.002 + Math.random() * 0.005,
      });
    }

    // Radar scan beam angle
    let scanAngle = 0;

    const render = () => {
      // Create trailing motion blur
      ctx.fillStyle = "rgba(5, 11, 20, 0.22)";
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.44;
      const maxRadius = Math.min(width, height) * 0.46;

      // 1. Draw atmospheric radial concentric ranges (Radar HUD)
      ctx.strokeStyle = "rgba(0, 242, 254, 0.08)";
      ctx.lineWidth = 1;
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radar cardinal axes
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // 2. Draw active Satellite Sweep Beam (INSAT-3DR / NOAA)
      scanAngle += 0.022;
      const beamEndX = centerX + Math.cos(scanAngle) * maxRadius;
      const beamEndY = centerY + Math.sin(scanAngle) * maxRadius;

      const beamGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        maxRadius
      );
      beamGrad.addColorStop(0, "rgba(0, 242, 254, 0.25)");
      beamGrad.addColorStop(0.5, "rgba(0, 242, 254, 0.06)");
      beamGrad.addColorStop(1, "rgba(0, 242, 254, 0)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, scanAngle - 0.35, scanAngle);
      ctx.closePath();
      ctx.fill();

      // Leading beam scan line
      ctx.strokeStyle = "rgba(0, 242, 254, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(beamEndX, beamEndY);
      ctx.stroke();

      // 3. Cyclone Eye Core (Calm central depression)
      const eyeGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        32
      );
      eyeGrad.addColorStop(0, "rgba(5, 11, 20, 0.95)");
      eyeGrad.addColorStop(0.6, "rgba(10, 19, 34, 0.85)");
      eyeGrad.addColorStop(1, "rgba(0, 242, 254, 0.2)");

      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 242, 254, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 4. Update and render vortex particle streamlines
      particles.forEach((p) => {
        // Northern hemisphere tropical cyclones rotate counter-clockwise (increasing angle)
        p.angle += p.speed * (1 + 25 / p.radius);
        // Subtle inward suction spiral
        p.radius -= 0.18;
        if (p.radius < 32) {
          p.radius = maxRadius * (0.8 + Math.random() * 0.2);
          p.opacity = 0.1 + Math.random() * 0.6;
        }

        // Compute polar to Cartesian position with vortex elliptical distortion
        const x = centerX + Math.cos(p.angle) * p.radius * 1.08;
        const y = centerY + Math.sin(p.angle) * p.radius * 0.92;

        // Particle stream drawing with glow
        ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${p.opacity})`;
        ctx.shadowColor = "#00F2FE";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow blur
      });

      // 5. Eye-wall intensity indicator ring
      ctx.strokeStyle = "rgba(255, 94, 54, 0.6)"; // Solar Coral eye-wall ring
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-full overflow-hidden bg-[#050B14]">
      {/* Dynamic Simulation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Atmospheric Vignette & Ambient Radial Glows */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-[#050B14]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#00F2FE]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
