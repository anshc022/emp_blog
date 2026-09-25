export const APP_NAME = "spill";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-baseline font-semibold tracking-tight" style={{ fontSize: size }}>
      {APP_NAME}
      <span
        className="ml-[1px] inline-block rounded-full bg-star"
        style={{ width: size * 0.26, height: size * 0.26 }}
        aria-hidden
      />
    </span>
  );
}
