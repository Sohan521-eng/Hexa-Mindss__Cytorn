import type { Metadata } from "next";
import { 
  Orbitron, 
  Rajdhani, 
  Outfit, 
  Plus_Jakarta_Sans, 
  JetBrains_Mono, 
  Space_Grotesk, 
  Inter, 
  Chakra_Petch, 
  Share_Tech_Mono,
  Syne,
  Unbounded
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { Scanner } from "@/components/ui/Scanner";

const magilio = localFont({
  src: [
    {
      path: "../fonts/Magilio.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Magilio.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-magilio",
  display: "swap",
});

const azonix = localFont({
  src: "../fonts/Azonix.otf",
  variable: "--font-azonix",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CYTORN | Tropical Cyclone AI Prediction & Monitoring System",
  description:
    "Next-generation AI-powered cyclone tracking, rapid intensification prediction, and multi-source satellite monitoring dashboard for SIH 2026.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=2026", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=2026", type: "image/png", sizes: "16x16" },
      { url: "/favicon.png?v=2026", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico?v=2026", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=2026",
    apple: [
      { url: "/apple-touch-icon.png?v=2026", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = [
    orbitron.variable,
    rajdhani.variable,
    outfit.variable,
    plusJakartaSans.variable,
    jetbrainsMono.variable,
    spaceGrotesk.variable,
    inter.variable,
    chakraPetch.variable,
    shareTechMono.variable,
    syne.variable,
    unbounded.variable,
    magilio.variable,
    azonix.variable,
  ].join(" ");

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2026" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2026" />
        <link rel="shortcut icon" href="/favicon.ico?v=2026" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2026" />
      </head>
      <body
        className={`${fontVariables} font-jakarta bg-[#050B14] text-white antialiased min-h-screen flex flex-col selection:bg-[#00F2FE]/30 selection:text-[#00F2FE] relative`}
      >
        {/* React Bits Scanner Full-Screen Atmospheric Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <Scanner
            color1="#0094ff"
            color2="#00eaff"
            color3="#ff6d07"
            speed={0.5}
            sweepSpeed={0.5}
            sweepWidth={2}
            sweepFalloff={6}
            scale={1.5}
            frequency={2}
            ripple={0.25}
            bandDensity={11}
            lineSharpness={4}
            glow={0}
            scanDirection="vertical"
            colorSpread={1}
            brightness={1.0}
            contrast={1.5}
            softness={3}
            vignette={0.7}
            scanline={true}
            grain={false}
            grainIntensity={0}
            opacity={0.9}
            mouseInteraction={true}
            mouseRadius={0.3}
            mouseStrength={1.25}
            className="w-full h-full"
          />
        </div>

        <GlobalNav />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
