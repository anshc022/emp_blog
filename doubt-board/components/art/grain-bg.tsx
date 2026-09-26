"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

// WebGL shader — client only. A CSS gradient underneath is shown until it
// mounts (and stays as the fallback if WebGL is unavailable).
const GrainGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.GrainGradient), {
  ssr: false,
});

export const GRAIN_PRESETS = {
  /** Deep ink with violet / pink / lime light leaks. The signature look. */
  aurora: {
    colorBack: "#0d0b12",
    colors: ["#5b3bf0", "#e04a98", "#241654", "#a6d72a"],
    shape: "corners",
    fallback:
      "radial-gradient(60% 60% at 15% 20%, #6c47ff 0%, transparent 60%), radial-gradient(50% 50% at 85% 30%, #ff5ca8 0%, transparent 60%), radial-gradient(40% 40% at 60% 90%, #c6f432 0%, transparent 60%), #0d0b12",
  },
  /** Violet → tangerine wave, for callouts. */
  sunset: {
    colorBack: "#1a0f3d",
    colors: ["#6c47ff", "#ff7a3d", "#ff5ca8", "#8f73ff"],
    shape: "wave",
    fallback: "linear-gradient(135deg, #6c47ff, #ff5ca8 60%, #ff7a3d)",
  },
  /** Soft and light, for backgrounds behind content. */
  lilac: {
    colorBack: "#f6f3ec",
    colors: ["#cbbcff", "#ffc2e0", "#e4ff9a", "#b9e6ff"],
    shape: "blob",
    fallback:
      "radial-gradient(50% 50% at 20% 20%, #cbbcff 0%, transparent 70%), radial-gradient(50% 50% at 80% 70%, #ffc2e0 0%, transparent 70%), #f6f3ec",
  },
  /** Lilac's dark twin. */
  night: {
    colorBack: "#0d0b12",
    colors: ["#2b1f63", "#4a1f45", "#26361a", "#10263a"],
    shape: "blob",
    fallback: "radial-gradient(50% 50% at 20% 20%, #2b1f63 0%, transparent 70%), #0d0b12",
  },
} as const;

export type GrainPreset = keyof typeof GRAIN_PRESETS;

export function GrainBg({
  preset = "aurora",
  className,
  speed = 0.6,
  intensity = 0.55,
  softness = 0.6,
  noise = 0.3,
  scrim,
}: {
  preset?: GrainPreset;
  className?: string;
  speed?: number;
  intensity?: number;
  softness?: number;
  noise?: number;
  /** Darken behind text: "left" for split heroes, "center" for centered copy. */
  scrim?: "left" | "center";
}) {
  const reduced = useReducedMotion();
  const p = GRAIN_PRESETS[preset];
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0" style={{ background: p.fallback }} />
      <GrainGradient
        className="absolute inset-0 size-full"
        colorBack={p.colorBack}
        colors={[...p.colors]}
        shape={p.shape}
        softness={softness}
        intensity={intensity}
        noise={noise}
        speed={reduced ? 0 : speed}
      />
      {scrim === "left" && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b12]/85 via-[#0d0b12]/45 to-transparent max-lg:bg-gradient-to-b max-lg:via-[#0d0b12]/55 max-lg:to-[#0d0b12]/20" />
      )}
      {scrim === "center" && (
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,rgb(13_11_18/0.8),transparent)]" />
      )}
    </div>
  );
}
