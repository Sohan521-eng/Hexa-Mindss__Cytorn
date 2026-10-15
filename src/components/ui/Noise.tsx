"use client";

import React, { useRef, useEffect } from "react";
import "./Noise.css";

export interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
  className = "",
  style = {},
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    let cachedFrames: ImageData[] = [];
    let lastW = 0;
    let lastH = 0;

    const resize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();
      const parentW = rect && rect.width > 0 ? rect.width : (canvas.parentElement?.parentElement?.getBoundingClientRect().width || patternSize || 250);
      const parentH = rect && rect.height > 0 ? rect.height : (canvas.parentElement?.parentElement?.getBoundingClientRect().height || patternSize || 250);

      // Compute isotropic resolution so grain aspect ratio is always 1:1 regardless of card aspect ratio
      const grainScale = Math.max(0.5, patternScaleX || 1.4);
      const cw = Math.max(32, Math.round(parentW / grainScale));
      const ch = Math.max(32, Math.round(parentH / grainScale));

      if (cw === lastW && ch === lastH && cachedFrames.length > 0) return;
      lastW = cw;
      lastH = ch;

      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.minWidth = "100%";
      canvas.style.minHeight = "100%";
      canvas.style.transform = "none";

      // Pre-cache 10 randomized noise frames to avoid CPU thrashing across multiple cards
      cachedFrames = [];
      for (let f = 0; f < 10; f++) {
        const imgData = ctx.createImageData(cw, ch);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const value = Math.random() * 255;
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
          data[i + 3] = patternAlpha;
        }
        cachedFrames.push(imgData);
      }
    };

    let frameIdx = 0;
    const loop = () => {
      if (frame % patternRefreshInterval === 0 && cachedFrames.length > 0) {
        ctx.putImageData(cachedFrames[frameIdx % cachedFrames.length], 0, 0);
        frameIdx++;
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    const ro = canvas.parentElement ? new ResizeObserver(resize) : null;
    if (ro && canvas.parentElement) {
      ro.observe(canvas.parentElement);
      if (canvas.parentElement.parentElement) {
        ro.observe(canvas.parentElement.parentElement);
      }
    }

    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className={`noise-overlay ${className}`}
      ref={grainRef}
      style={{ imageRendering: "pixelated", ...style }}
      aria-hidden="true"
    />
  );
};

export default Noise;
