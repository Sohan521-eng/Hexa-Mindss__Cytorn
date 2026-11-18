import React from "react";
import type { Metadata } from "next";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";

export const metadata: Metadata = {
  title: "Register Clearance | CYTORN Command Gateway",
  description: "Provision operational credentials for the CYTORN Tropical Cyclone AI Platform.",
};

export default function RegisterPage() {
  return <AuthPageWrapper initialMode="register" />;
}
