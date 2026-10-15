import React from "react";
import type { Metadata } from "next";
import { AuthTerminal } from "@/components/auth/AuthTerminal";

export const metadata: Metadata = {
  title: "Sign In | CYCLO-AI",
  description: "Sign in to CYCLO-AI command gateway.",
};

export default function LoginPage() {
  return <AuthTerminal initialMode="signin" />;
}
