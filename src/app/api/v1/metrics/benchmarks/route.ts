import { NextResponse } from "next/server";

export async function GET() {
  const metricsPayload = {
    status: "success",
    timestamp_utc: new Date().toISOString(),
    metrics: [
      {
        id: "accuracy",
        value: "96.4%",
        label: "AI Track Accuracy",
        description: "Mean cross-track forecast error under 48 km across 120-hour prediction cones.",
        badge: "RMSE Verified",
        color: "#00F2FE",
        gradient: "from-[#0F1B2F] via-[#050B14] to-[#00F2FE]/15"
      },
      {
        id: "ri_lead",
        value: "24H",
        label: "Rapid Intensification Lead",
        description: "Early detection window before explosive eyewall pressure drops occur.",
        badge: "PINN Model",
        color: "#FF5E36",
        gradient: "from-[#0F1B2F] via-[#050B14] to-[#FF5E36]/15"
      },
      {
        id: "protocol",
        value: "4 Tiers",
        label: "IMD / WMO Protocol",
        description: "End-to-end automated dissemination from Pre-Cyclone Watch to Landfall Red Alert.",
        badge: "Standardized",
        color: "#10E7A2",
        gradient: "from-[#0F1B2F] via-[#050B14] to-[#10E7A2]/15"
      },
      {
        id: "precision",
        value: "0.08°",
        label: "Center-Fix Precision",
        description: "Sub-kilometer eyewall centroid localization using INSAT-3DR multi-spectral remote sensing.",
        badge: "MOSDAC Feed",
        color: "#6366F1",
        gradient: "from-[#0F1B2F] via-[#050B14] to-[#6366F1]/15"
      }
    ]
  };

  return NextResponse.json(metricsPayload);
}

