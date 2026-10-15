"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

export interface ScientistPillButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  ease?: string;
  title?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  hoverIcon?: React.ReactNode;
  label: React.ReactNode;
  hoverLabel?: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
}

export const ScientistPillButton: React.FC<ScientistPillButtonProps> = ({
  onClick,
  type = "button",
  className = "",
  ease = "power2.easeOut",
  title,
  disabled = false,
  icon,
  hoverIcon,
  label,
  hoverLabel,
  style,
  id,
}) => {
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const computeLayout = useCallback(() => {
    const circle = circleRef.current;
    const pill = pillRef.current;
    if (!circle || !pill) return;

    const rect = pill.getBoundingClientRect();
    const { width: w, height: h } = rect;
    if (w === 0 || h === 0) return;

    const R = ((w * w) / 4 + h * h) / (2 * h);
    const D = Math.ceil(2 * R) + 2;
    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
    const originY = D - delta;

    circle.style.width = `${D}px`;
    circle.style.height = `${D}px`;
    circle.style.bottom = `-${delta}px`;

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`,
    });

    const defaultLabel = pill.querySelector<HTMLElement>(".pill-label");
    const whiteLabel = pill.querySelector<HTMLElement>(".pill-label-hover");

    if (defaultLabel) gsap.set(defaultLabel, { y: 0 });
    if (whiteLabel) gsap.set(whiteLabel, { y: h + 12, opacity: 0 });

    tlRef.current?.kill();
    const tl = gsap.timeline({ paused: true });

    tl.to(circle, { scale: 1.5, xPercent: -50, duration: 1.6, ease, overwrite: "auto" }, 0);

    if (defaultLabel) {
      tl.to(defaultLabel, { y: -(h + 8), duration: 1.6, ease, overwrite: "auto" }, 0);
    }

    if (whiteLabel) {
      gsap.set(whiteLabel, { y: Math.ceil(h + 100), opacity: 0 });
      tl.to(whiteLabel, { y: 0, opacity: 1, duration: 1.6, ease, overwrite: "auto" }, 0);
    }

    tlRef.current = tl;
  }, [ease]);

  useEffect(() => {
    let active = true;

    const safeLayout = () => {
      if (!active) return;
      computeLayout();
    };

    safeLayout();
    const t1 = setTimeout(safeLayout, 100);
    const t2 = setTimeout(safeLayout, 300);

    window.addEventListener("resize", safeLayout);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(safeLayout).catch(() => {});
    }

    return () => {
      active = false;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", safeLayout);
      tlRef.current?.kill();
    };
  }, [computeLayout]);

  const handleEnter = () => {
    if (disabled) return;
    if (!tlRef.current) {
      computeLayout();
    }
    const tl = tlRef.current;
    if (!tl) return;
    tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    if (disabled) return;
    const tl = tlRef.current;
    if (!tl) return;
    tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  return (
    <button
      id={id}
      ref={pillRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`scientist-pill ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title={title}
      style={style}
    >
      <span
        className="hover-circle"
        aria-hidden="true"
        ref={circleRef}
      />
      <span className="label-stack">
        <span className="pill-label">
          {icon}
          <span>{label}</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          {hoverIcon || icon}
          <span>{hoverLabel || label}</span>
        </span>
      </span>
    </button>
  );
};
