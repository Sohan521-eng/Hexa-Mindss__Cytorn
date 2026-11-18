import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Gateway | CYTORN",
  description:
    "Role-based mission-control authentication gateway for CYTORN Tropical Cyclone AI Prediction System.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] w-full bg-[#050B14] text-white overflow-y-auto overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#00F2FE]">
      {children}
    </div>
  );
}
