import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const telemetryData = {
    status: "success",
    timestamp_utc: now.toISOString(),
    sector: "BAY OF BENGAL • SECTOR BOB-02",
    satellite_cycle: "INSAT-3DR Rapid Scan (15m)",
    mosdac_status: "Synced",
    storm: {
      id: "BOB-02-ARNAB",
      name: 'CYCLONE "ARNAB"',
      warningStage: "Stage 3 Warning",
      warningTier: "warning" as const,
      location: "Bay of Bengal • East Coast Threat Sector",
      intensity: "VSCS Cat-3",
      categoryDisplay: "Category 4 Severe",
      confidence: "96.4%",
      confidenceScore: 96.4,
      landfallCountdown: "T-24h (Puri-Dhamra Sector)",
      updatedAgo: "Updated just now",
      coordinates: { lat: 16.2, lon: 88.4 }
    },
    parameters: [
      {
        id: "wind",
        label: "Max Wind Speed",
        value: "185 km/h",
        numericValue: 185,
        unit: "km/h",
        change: "+15 km/h in 3h",
        colorKey: "ai-cyan"
      },
      {
        id: "pressure",
        label: "Central Pressure",
        value: "942 hPa",
        numericValue: 942,
        unit: "hPa",
        change: "-8 hPa rapid drop",
        colorKey: "solar-coral"
      },
      {
        id: "sst",
        label: "Sea Surface Temp",
        value: "30.4 °C",
        numericValue: 30.4,
        unit: "°C",
        change: "Above threshold (28°C)",
        colorKey: "stage-2-alert"
      },
      {
        id: "shear",
        label: "Vertical Wind Shear",
        value: "8.5 kts",
        numericValue: 8.5,
        unit: "kts",
        change: "Favorable (<10 kts)",
        colorKey: "stage-1-watch"
      },
      {
        id: "humidity",
        label: "Relative Humidity",
        value: "86%",
        numericValue: 86,
        unit: "%",
        change: "Mid-troposphere saturated",
        colorKey: "cloud-low"
      },
      {
        id: "rainfall",
        label: "Estimated Rainfall",
        value: "220 mm/24h",
        numericValue: 220,
        unit: "mm/24h",
        change: "Extreme core band",
        colorKey: "cloud-deep"
      }
    ],
    trends: [
      { time: "-24h", wind: 45, pressure: 998, isForecast: false },
      { time: "-18h", wind: 55, pressure: 990, isForecast: false },
      { time: "-12h", wind: 85, pressure: 980, isForecast: false },
      { time: "-6h", wind: 140, pressure: 955, isForecast: false },
      { time: "Now", wind: 185, pressure: 942, isForecast: false },
      { time: "+6h", wind: 195, pressure: 936, isForecast: true },
      { time: "+12h", wind: 205, pressure: 930, isForecast: true },
      { time: "+18h", wind: 195, pressure: 938, isForecast: true },
      { time: "+24h", wind: 165, pressure: 952, isForecast: true }
    ]
  };

  return NextResponse.json(telemetryData);
}
