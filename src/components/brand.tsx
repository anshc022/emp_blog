export const APP_NAME = "spill";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="hover-wiggle grid shrink-0 place-items-center rounded-[34%] shadow-[0_8px_20px_-6px_rgb(255_79_154/0.6)]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        backgroundImage: "var(--grad)",
        ["--r" as string]: "-8deg",
      }}
      aria-hidden
    >
      ☕
    </span>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.8 }}>
        {APP_NAME}
        <span className="grad-text">.</span>
      </span>
    </span>
  );
}
