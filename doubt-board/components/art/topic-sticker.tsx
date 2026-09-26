import { hashString } from "@/components/art/avatar";
import { cn } from "@/lib/utils";

const STICKERS = [
  "bg-[#ece7ff] text-[#4a2fd6] border-[#d6ccff] dark:bg-[#231d3b] dark:text-[#cbbcff] dark:border-[#352b5c]",
  "bg-[#f1ffcc] text-[#3f5205] border-[#dcf58f] dark:bg-[#222c0c] dark:text-[#d2ff4d] dark:border-[#3a4a12]",
  "bg-[#ffe6da] text-[#9a3a0e] border-[#ffcdb4] dark:bg-[#34200f] dark:text-[#ffb08a] dark:border-[#533219]",
  "bg-[#ffe0ef] text-[#a0145c] border-[#ffc2de] dark:bg-[#341627] dark:text-[#ff9ccb] dark:border-[#52213b]",
  "bg-[#dff4ff] text-[#0b5a86] border-[#bfe7fd] dark:bg-[#10283a] dark:text-[#8fdcff] dark:border-[#1b3d56]",
];

export function TopicSticker({ topic, className }: { topic: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        STICKERS[hashString(topic.toLowerCase()) % STICKERS.length],
        className,
      )}
    >
      #{topic.replace(/\s+/g, "").toLowerCase()}
    </span>
  );
}
