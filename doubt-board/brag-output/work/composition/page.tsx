import { BragComposition } from "./composition";

export const metadata = { title: "brag" };

export default function BragPage() {
  return (
    <div style={{ width: 1920, height: 1080, overflow: "hidden" }}>
      <BragComposition />
    </div>
  );
}
