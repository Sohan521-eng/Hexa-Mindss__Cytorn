"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { gsap } from "gsap";

interface SlideOverMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlideOverMenu({ isOpen, onClose }: SlideOverMenuProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const isClosingRef = useRef(false);

  // Sync mounting state with isOpen
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      isClosingRef.current = false;
      document.body.style.overflow = "hidden";
    } else if (mounted && !isClosingRef.current) {
      handleClose();
    }
  }, [isOpen]);

  // Handle ESC key press to smoothly close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mounted && !isClosingRef.current) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted]);

  // Clean up overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // GSAP Choreographed Entrance Animation
  useEffect(() => {
    if (!mounted || isClosingRef.current) return;

    const container = containerRef.current;
    const topBar = topBarRef.current;
    const nav = navRef.current;
    if (!container || !topBar || !nav) return;

    const items = nav.querySelectorAll(".nav-menu-item");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set(container, { opacity: 0, scale: 1.02 });
      gsap.set(topBar, { opacity: 0, y: -25 });
      gsap.set(items, { opacity: 0, y: 35 });

      tl.to(container, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      })
      .to(topBar, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out"
      }, "-=0.25")
      .to(items, {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.45,
        ease: "power3.out"
      }, "-=0.2");
    }, container);

    return () => ctx.revert();
  }, [mounted]);

  // GSAP Choreographed Exit Animation
  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const container = containerRef.current;
    const topBar = topBarRef.current;
    const nav = navRef.current;

    if (!container) {
      setMounted(false);
      isClosingRef.current = false;
      document.body.style.overflow = "unset";
      onClose();
      return;
    }

    const items = nav ? nav.querySelectorAll(".nav-menu-item") : [];

    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => {
        setMounted(false);
        isClosingRef.current = false;
        document.body.style.overflow = "unset";
        onClose();
      }
    });

    if (items.length > 0) {
      tl.to(items, {
        opacity: 0,
        y: -15,
        stagger: 0.03,
        duration: 0.22,
        ease: "power2.in"
      }, 0);
    }

    if (topBar) {
      tl.to(topBar, {
        opacity: 0,
        y: -20,
        duration: 0.22,
        ease: "power2.in"
      }, 0);
    }

    tl.to(container, {
      opacity: 0,
      scale: 0.98,
      duration: 0.28,
      ease: "power2.in"
    }, "-=0.1");
  };

  if (!mounted) return null;

  const menuItems = [
    { num: "01", name: "Live Command GIS", href: "/dashboard", desc: "Real-time satellite & radar command HUD" },
    { num: "02", name: "AI Satellite Studio", href: "/satellite-analyzer", desc: "INSAT-3DR TIR-1 & automated Dvorak classification" },
    { num: "03", name: "120h Trajectory Prediction", href: "/forecast", desc: "PINNs Navier-Stokes ensemble forecast cones" },
    { num: "04", name: "Disaster Warning Hub", href: "/alerts", desc: "IMD 4-stage color alerts & coastal evacuation grids" },
    { num: "05", name: "Model Performance Lab", href: "/model-metrics", desc: "Validation metrics, confusion matrix & RMSE benchmarks" },
    { num: "06", name: "Developer & API Hub", href: "/settings", desc: "Doppler radar webhooks & REST API docs" },
    { num: "07", name: "Coastal Digital Twin", href: "/digital-twin", desc: "Hyper-local coastal inundation & sub-street flood simulation" },
  ];

  return (
    <div 
      ref={containerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#050B14]/95 backdrop-blur-2xl text-white font-jakarta px-6 sm:px-16 py-6 sm:py-8 overflow-y-auto will-change-[transform,opacity]"
    >
      {/* Background Atmosphere Radial Glow - Fixed to prevent any cutoff during scroll */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(0,242,254,0.12)_0%,transparent_70%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,231,162,0.04)_0%,transparent_60%)]" />

      {/* TOP BAR */}
      <div 
        ref={topBarRef}
        className="relative z-10 flex items-center justify-between border-b border-[#1E3252]/60 pb-6 will-change-[transform,opacity]"
      >
        <Link 
          href="/" 
          onClick={handleClose}
          className="group flex items-center gap-1.5 sm:gap-2 shrink-0"
        >
          <Image 
            src="/logo.png" 
            alt="CYTORN Logo" 
            width={64} 
            height={64} 
            unoptimized
            className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 object-contain translate-y-0.5 sm:translate-y-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] drop-shadow-[0_0_8px_rgba(0,242,254,0.35)] group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(0,242,254,0.65)] transition-all duration-300 shrink-0"
          />
          <div className="flex flex-col">
            <span 
              className="text-lg sm:text-2xl font-extrabold tracking-[0.06em] text-white font-orbitron uppercase transition-all duration-300 group-hover:text-[#00F2FE] group-hover:[text-shadow:0_2px_4px_#000000,0_0_16px_rgba(0,242,254,0.9)]"
              style={{
                textShadow: "0 2px 4px #000000, 0 4px 12px rgba(0, 0, 0, 0.9), 0 0 16px rgba(0, 242, 254, 0.35)"
              }}
            >
              CYTORN
            </span>
            <span 
              className="text-[7px] sm:text-[8.5px] uppercase tracking-[0.18em] text-slate-300 mt-1 font-jetbrains font-semibold transition-colors duration-300 group-hover:text-[#00F2FE]/80"
              style={{
                textShadow: "0 1px 3px #000000, 0 2px 6px rgba(0, 0, 0, 0.95)"
              }}
            >
              Deep-Tech Climate OS
            </span>
          </div>
        </Link>

        <button
          onClick={handleClose}
          aria-label="Close navigation drawer"
          className="p-2.5 rounded-full bg-[#0F1B2F] border border-[#1E3252] text-slate-300 hover:text-[#00F2FE] hover:border-[#00F2FE] transition-all hover:rotate-90 duration-300 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* EDITORIAL NAVIGATION LINKS (EVENLY DISTRIBUTED TO FILL VIEWPORT) */}
      <nav 
        ref={navRef}
        className="relative z-10 flex-1 flex flex-col justify-evenly py-2 sm:py-4 max-w-5xl w-full min-h-0"
      >
        {menuItems.map((item) => (
          <Link
            key={item.num}
            href={item.href}
            onClick={handleClose}
            className="nav-menu-item group flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6 py-1.5 sm:py-2.5 border-b border-[#1E3252]/40 transition-colors will-change-[transform,opacity]"
          >
            <span className="font-jetbrains text-xs sm:text-sm text-[#00F2FE] group-hover:text-white transition-colors">
              {item.num} /
            </span>
            <div className="flex-1">
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-slate-200 group-hover:text-[#00F2FE] transition-colors font-rajdhani uppercase leading-tight">
                {item.name}
              </span>
              <p className="text-xs sm:text-sm text-[#8E9EB5] font-jakarta font-normal mt-0.5 group-hover:text-slate-300">
                {item.desc}
              </p>
              {/* Expanding Underline Hover */}
              <span className="block h-[2px] w-0 bg-[#00F2FE] transition-all duration-500 ease-out group-hover:w-full mt-1.5 shadow-[0_0_8px_#00F2FE]" />
            </div>
          </Link>
        ))}
      </nav>

    </div>
  );
}
