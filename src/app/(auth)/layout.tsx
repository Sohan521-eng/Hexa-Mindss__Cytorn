import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | CYCLO-AI",
  description: "Secure login and registration portal for CYCLO-AI.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-transparent text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#00F2FE]/30 selection:text-white pt-20 sm:pt-24">
      {/* Centered Minimalist Card Container */}
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
