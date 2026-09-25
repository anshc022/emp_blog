"use client";

import { useId, useRef, type ReactNode } from "react";

/**
 * Hand-built 3D-style SVG objects. Monochrome porcelain/gloss shading with a
 * single yellow accent, so they sit inside the black & white UI. Each one
 * floats gently and tilts toward the pointer (see <Tilt>).
 */

/** Perspective tilt that follows the pointer, springs back on leave. */
export function Tilt({ children, max = 14, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className={`[perspective:700px] ${className}`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${x * max * 2}deg) rotateX(${-y * max * 2}deg)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      <div ref={ref} className="transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        <div className="float-3d">{children}</div>
      </div>
    </div>
  );
}

function Shadow({ id, cx = 100, cy = 182, rx = 58 }: { id: string; cx?: number; cy?: number; rx?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-sh`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="shadow-3d" cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill={`url(#${id}-sh)`} />
    </>
  );
}

/** Porcelain teacup on a saucer, spilling a little yellow tea. */
export function TeaCup3D({ size = 160, steam = true }: { size?: number; steam?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#d4d4d4" />
          <stop offset="0.3" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#ececec" />
          <stop offset="1" stopColor="#8f8f8f" />
        </linearGradient>
        <linearGradient id={`${id}-saucer`} x1="0" x2="1">
          <stop offset="0" stopColor="#bdbdbd" />
          <stop offset="0.35" stopColor="#fafafa" />
          <stop offset="1" stopColor="#8a8a8a" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d9d9" />
        </linearGradient>
        <radialGradient id={`${id}-tea`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#0a0a0a" />
        </radialGradient>
        <linearGradient id={`${id}-drip`} x1="0" x2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id={`${id}-handle`} x1="0" x2="1">
          <stop offset="0" stopColor="#f5f5f5" />
          <stop offset="1" stopColor="#7a7a7a" />
        </linearGradient>
      </defs>

      <Shadow id={id} cy={176} rx={70} />

      {/* saucer */}
      <ellipse cx="100" cy="158" rx="74" ry="19" fill="#7d7d7d" />
      <ellipse cx="100" cy="154" rx="74" ry="19" fill={`url(#${id}-saucer)`} />
      <ellipse cx="100" cy="152" rx="46" ry="10" fill="#e3e3e3" />
      {/* yellow puddle on the saucer */}
      <ellipse cx="128" cy="157" rx="20" ry="4.5" fill={`url(#${id}-drip)`} />

      {/* handle */}
      <path d="M142 92c22-4 30 10 26 24s-18 22-32 20" fill="none" stroke="#6b6b6b" strokeWidth="11" strokeLinecap="round" />
      <path d="M142 92c22-4 30 10 26 24s-18 22-32 20" fill="none" stroke={`url(#${id}-handle)`} strokeWidth="8" strokeLinecap="round" />

      {/* body */}
      <path d="M50 78h100c0 34-8 62-24 72-8 5-44 5-52 0-16-10-24-38-24-72z" fill={`url(#${id}-body)`} />
      {/* yellow drip over the rim */}
      <path
        d="M118 80c3 0 6 1 6 4v22c0 5 3 7 3 11a5 5 0 0 1-10 0c0-4 2-6 2-10V86c0-3-3-6-1-6z"
        fill={`url(#${id}-drip)`}
      />
      <ellipse cx="121" cy="118" rx="2" ry="3" fill="#fff" opacity="0.6" />

      {/* rim + tea */}
      <ellipse cx="100" cy="78" rx="50" ry="13" fill={`url(#${id}-rim)`} stroke="#bdbdbd" strokeWidth="1" />
      <ellipse cx="100" cy="80" rx="43" ry="9.5" fill={`url(#${id}-tea)`} />
      <ellipse cx="88" cy="78" rx="12" ry="2.5" fill="#fff" opacity="0.18" />
      {/* specular highlight on the porcelain */}
      <path d="M66 92c2 22 6 38 13 48" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" fill="none" />

      {steam && (
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="steam-3d text-faint">
          <path d="M88 60c-6-8 6-12 0-22" />
          <path d="M108 58c-6-9 7-13 0-25" style={{ animationDelay: "0.8s" }} />
        </g>
      )}
    </svg>
  );
}

/** Envelope with a note popping out and a yellow star seal. */
export function Envelope3D({ size = 160 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`${id}-back`} y1="0" y2="1">
          <stop offset="0" stopColor="#9e9e9e" />
          <stop offset="1" stopColor="#6e6e6e" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfcfcf" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" x2="1">
          <stop offset="0" stopColor="#e8e8e8" />
          <stop offset="1" stopColor="#a8a8a8" />
        </linearGradient>
        <linearGradient id={`${id}-note`} y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ededed" />
        </linearGradient>
        <linearGradient id={`${id}-seal`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      <Shadow id={id} cy={178} rx={66} />

      {/* back + open flap */}
      <path d="M34 82 100 40l66 42v70H34z" fill={`url(#${id}-back)`} />
      {/* note */}
      <g transform="rotate(-6 100 80)">
        <rect x="58" y="34" width="84" height="92" rx="6" fill={`url(#${id}-note)`} stroke="#d4d4d4" />
        <rect x="70" y="50" width="52" height="6" rx="3" fill="#0a0a0a" />
        <rect x="70" y="64" width="60" height="4" rx="2" fill="#bdbdbd" />
        <rect x="70" y="74" width="44" height="4" rx="2" fill="#bdbdbd" />
        <rect x="70" y="84" width="54" height="4" rx="2" fill="#bdbdbd" />
      </g>
      {/* side folds */}
      <path d="M34 82l58 44-58 30z" fill={`url(#${id}-side)`} />
      <path d="M166 82l-58 44 58 30z" fill={`url(#${id}-side)`} transform="matrix(-1 0 0 1 200 0)" opacity="0.9" />
      {/* front pocket */}
      <path d="M34 156l66-44 66 44z" fill={`url(#${id}-front)`} />
      <path d="M34 156l66-44 66 44" fill="none" stroke="#bdbdbd" />
      {/* seal */}
      <circle cx="100" cy="128" r="15" fill="#a16207" />
      <circle cx="100" cy="126" r="15" fill={`url(#${id}-seal)`} />
      <path d="m100 117 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/** Faceted, extruded star. */
export function Star3D({ size = 160 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  // outer/inner points of a 5-point star centred at (100,92)
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 30 : 72;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return [100 + r * Math.cos(a), 92 + r * Math.sin(a)] as const;
  });
  const c = [100, 92] as const;
  const poly = pts.map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="overflow-visible">
      <Shadow id={id} cy={178} rx={60} />
      {/* extrusion */}
      <polygon points={poly} fill="#8a5a00" transform="translate(0 10)" />
      <polygon points={poly} fill="#a16207" transform="translate(0 6)" />
      {/* facets: each spike has a light and a dark half */}
      {pts.map((p, i) => {
        const next = pts[(i + 1) % 10];
        const light = i % 2 === 0 ? i < 5 : i >= 5;
        return (
          <polygon
            key={i}
            points={`${c.join(",")} ${p.join(",")} ${next.join(",")}`}
            fill={light ? "#fde047" : "#eab308"}
            stroke={light ? "#fde047" : "#eab308"}
            strokeWidth="0.6"
          />
        );
      })}
      <circle cx="84" cy="64" r="6" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/** Glossy incognito sunglasses. */
export function Shades3D({ size = 160 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`${id}-lens`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4a4a4a" />
          <stop offset="0.55" stopColor="#0a0a0a" />
          <stop offset="1" stopColor="#262626" />
        </linearGradient>
        <linearGradient id={`${id}-frame`} y1="0" y2="1">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
      <Shadow id={id} cy={170} rx={70} />
      {/* temple arms going back in perspective */}
      <path d="M26 88 8 70" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" />
      <path d="M174 88l18-18" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" />
      {/* frame (drawn twice for thickness) */}
      <path d="M22 84h156v8c0 2-2 4-4 4H26c-2 0-4-2-4-4z" fill="#000" transform="translate(0 4)" />
      <path d="M22 84h156v8c0 2-2 4-4 4H26c-2 0-4-2-4-4z" fill={`url(#${id}-frame)`} />
      {/* lenses */}
      <path d="M28 92h62c0 26-10 40-32 40S28 116 28 92z" fill="#000" transform="translate(0 5)" />
      <path d="M110 92h62c0 26-10 40-32 40s-30-16-30-40z" fill="#000" transform="translate(0 5)" />
      <path d="M28 92h62c0 26-10 40-32 40S28 116 28 92z" fill={`url(#${id}-lens)`} />
      <path d="M110 92h62c0 26-10 40-32 40s-30-16-30-40z" fill={`url(#${id}-lens)`} />
      {/* bridge */}
      <path d="M88 92c6-6 18-6 24 0" stroke="#000" strokeWidth="6" fill="none" />
      {/* reflections */}
      <path d="M40 98l18 22M50 96l12 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      <path d="M122 98l18 22M132 96l12 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      {/* the one yellow sparkle */}
      <path d="m160 58 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#facc15" />
    </svg>
  );
}
