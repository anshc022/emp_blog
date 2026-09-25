export const APP_NAME = "spill";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="hover-wiggle grid shrink-0 place-items-center rounded-xl border-[2.5px] border-line bg-lime shadow-[3px_3px_0_0_var(--line)]"
      style={{ width: size, height: size, fontSize: size * 0.52, ["--r" as string]: "-8deg" }}
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
        <span className="text-pink">.</span>
      </span>
    </span>
  );
}
