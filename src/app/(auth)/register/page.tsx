import React from "react";
import type { Metadata } from "next";
import { AuthTerminal } from "@/components/auth/AuthTerminal";

export const metadata: Metadata = {
  title: "Register | CYCLO-AI",
  description: "Register for CYCLO-AI access.",
};

export default function RegisterPage() {
  return <AuthTerminal initialMode="register" />;
}
