export const APP_NAME = "spill";

/** NextQom's NQ mark beside the app's name. The mark is nextqom.com's own logo, trimmed. */
export function Logo({ size = 22, byline = false }: { size?: number; byline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed 19 KB mark; nothing to optimise */}
      <img src="/nq-mark.png" alt="NextQom" width={Math.round(size * 1.3 * 1.6)} height={Math.round(size * 1.3)} />
      <span className="inline-flex flex-col leading-none">
        <span className="font-display font-semibold tracking-tight" style={{ fontSize: size }}>
          {APP_NAME}
          <span className="text-accent-ink">.</span>
        </span>
        {byline && <span className="meta mt-1 tracking-wide uppercase">by NextQom</span>}
      </span>
    </span>
  );
}
