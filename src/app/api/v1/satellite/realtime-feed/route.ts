import { NextResponse } from "next/server";

export async function GET() {
  const satellitePayload = {
    satellite: "INSAT-3DR",
    timestamp_utc: new Date().toISOString(),
    bands: ["TIR-1 (10.8µm)", "WV (6.7µm)", "VIS (0.65µm)", "PMW (89GHz)"],
    spatial_resolution_km: 4.0,
    center_coordinates: { lat: 16.2, lon: 88.4 },
    target_storm: 'CYCLONE "ARNAB"',
    basin: "Bay of Bengal",
    scan_cadence: "15m Rapid Scan",
    ingestion_latency: "12s",
    status: "OPTIMAL"
  };

  return NextResponse.json(satellitePayload);
}

