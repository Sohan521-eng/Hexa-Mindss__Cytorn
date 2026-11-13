import { NextResponse } from "next/server";

export async function GET() {
  const tickerPayload = {
    status: "success",
    timestamp_utc: new Date().toISOString(),
    active_cyclones_count: 2,
    ticker_items: [
      {
        id: "count",
        isBadge: true,
        text: "Cyclones Active: 02",
        color: "text-[#00F2FE]",
        badge: "LIVE FEED"
      },
      {
        id: "arnab",
        name: 'CYCLONE "ARNAB"',
        basin: "BoB",
        category: "Cat 3",
        wind: "185 km/h",
        pressure: "942 hPa",
        coords: "16.2°N, 88.4°E",
        href: "/dashboard",
        highlight: true
      },
      {
        id: "arb-01",
        name: "Deep Depression ARB-01",
        basin: "Arabian Sea",
        category: "Deep Depression",
        wind: "55 km/h",
        pressure: "998 hPa",
        coords: "14.8°N, 67.2°E",
        href: "/dashboard?storm=arb01",
        highlight: false
      },
      {
        id: "invest-92b",
        name: "Invest 92B",
        basin: "Andaman Sea",
        category: "Low Pressure",
        wind: "35 km/h",
        pressure: "1004 hPa",
        coords: "9.5°N, 93.0°E",
        href: "/dashboard?storm=invest92b",
        highlight: false
      },
      {
        id: "insat-scan",
        isBadge: true,
        text: "INSAT-3DR TIR-1: Rapid Scan Active [15m Cycle]",
        color: "text-[#10E7A2]",
        badge: "ISRO TELEMETRY"
      },
      {
        id: "biparjoy",
        name: "Severe Storm BIPARJOY",
        basin: "Arabian Sea",
        category: "Cat 2",
        wind: "165 km/h",
        pressure: "958 hPa",
        coords: "20.4°N, 66.8°E",
        href: "/dashboard?storm=biparjoy",
        highlight: false
      }
    ]
  };

  return NextResponse.json(tickerPayload);
}

