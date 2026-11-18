import React from "react";
import type { Metadata } from "next";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";

export const metadata: Metadata = {
  title: "Sign In | CYTORN Command Gateway",
  description: "Authenticate to enter the CYTORN Tropical Cyclone AI Command Platform.",
};

export default function LoginPage() {
  return <AuthPageWrapper initialMode="signin" />;
}
