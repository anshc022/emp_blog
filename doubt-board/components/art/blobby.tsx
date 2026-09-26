import { cn } from "@/lib/utils";

export type BlobbyMood = "curious" | "happy" | "sleepy" | "shocked" | "proud";

/**
 * Blobby — the Live Doubt Board mascot: a speech bubble with a question on its mind.
 * Hand-built SVG, themable through `currentColor` + CSS vars.
 */
export function Blobby({
  mood = "curious",
  className,
  body = "var(--primary)",
  title,
}: {
  mood?: BlobbyMood;
  className?: string;
  body?: string;
  title?: string;
}) {
  const eyesClosed = mood === "sleepy" || mood === "proud";
  return (
    <svg
      viewBox="0 0 160 150"
      className={cn("size-32", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* shadow */}
      <ellipse cx="80" cy="142" rx="42" ry="5" fill="currentColor" opacity=".12" />
      {/* body: bubble with tail */}
      <path
        d="M34 18h92c13 0 22 9 22 22v50c0 13-9 22-22 22H74l-26 20c-4 3-8 0-7-4l4-16h-11c-13 0-22-9-22-22V40c0-13 9-22 22-22Z"
        fill={body}
        stroke="#16131c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* highlight */}
      <path d="M36 32c8-4 20-5 30-4" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* antenna "?" */}
      <g transform="translate(118 -2) rotate(14)">
        <path
          d="M4 14c0-6 5-10 11-10s11 4 11 9c0 7-9 7-9 14"
          stroke="#16131c"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="17" cy="34" r="3" fill="#16131c" />
      </g>
      {/* cheeks */}
      <ellipse cx="50" cy="74" rx="8" ry="5" fill="#ff5ca8" opacity=".55" />
      <ellipse cx="114" cy="74" rx="8" ry="5" fill="#ff5ca8" opacity=".55" />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke="#16131c" strokeWidth="4" strokeLinecap="round" fill="none">
          {mood === "proud" ? (
            <>
              <path d="M56 60q6-7 12 0" />
              <path d="M96 60q6-7 12 0" />
            </>
          ) : (
            <>
              <path d="M55 60q7 5 14 0" />
              <path d="M95 60q7 5 14 0" />
            </>
          )}
        </g>
      ) : (
        <g style={{ transformOrigin: "82px 58px", animation: "blink 5s infinite" }}>
          <ellipse cx="62" cy="58" rx={mood === "shocked" ? 8 : 7} ry={mood === "shocked" ? 10 : 9} fill="#fff" stroke="#16131c" strokeWidth="3" />
          <ellipse cx="102" cy="58" rx={mood === "shocked" ? 8 : 7} ry={mood === "shocked" ? 10 : 9} fill="#fff" stroke="#16131c" strokeWidth="3" />
          <circle cx={mood === "curious" ? 64 : 62} cy={mood === "curious" ? 56 : 59} r="3.6" fill="#16131c" />
          <circle cx={mood === "curious" ? 104 : 102} cy={mood === "curious" ? 56 : 59} r="3.6" fill="#16131c" />
        </g>
      )}
      {/* mouth */}
      {mood === "happy" || mood === "proud" ? (
        <path d="M70 78q12 12 24 0" stroke="#16131c" strokeWidth="4" strokeLinecap="round" fill="#16131c" />
      ) : mood === "shocked" ? (
        <ellipse cx="82" cy="84" rx="7" ry="8" fill="#16131c" />
      ) : mood === "sleepy" ? (
        <path d="M74 82h16" stroke="#16131c" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M72 82q6-5 10 0t10 0" stroke="#16131c" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
      {mood === "sleepy" && (
        <g fill="#16131c" fontFamily="var(--font-display)" fontWeight="800">
          <text x="128" y="44" fontSize="16">z</text>
          <text x="140" y="30" fontSize="12">z</text>
        </g>
      )}
    </svg>
  );
}
