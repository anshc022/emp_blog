"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowFatUpIcon, DetectiveIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const SEED = [
  { id: 1, text: "why is the derivative of eˣ just… eˣ?", topic: "derivatives", votes: 12 },
  { id: 2, text: "chain rule vs product rule — when?", topic: "derivatives", votes: 9, you: true },
  { id: 3, text: "what does it mean if a limit doesn't exist?", topic: "limits", votes: 6 },
  { id: 4, text: "is this going to be on the exam 👀", topic: "exam", votes: 4 },
];

/** A fake live feed: votes tick up and the list re-ranks, like the real thing. */
export function LiveDemo() {
  const reduced = useReducedMotion();
  const [items, setItems] = useState(SEED);
  const [bumped, setBumped] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      setItems((list) => {
        // Favour lower-ranked doubts so the order actually changes.
        const pick = list[Math.min(list.length - 1, Math.floor(Math.random() ** 0.6 * list.length))];
        setBumped(pick.id);
        return list
          .map((d) => (d.id === pick.id ? { ...d, votes: d.votes + 1 + Math.floor(Math.random() * 3) } : d))
          .sort((a, b) => b.votes - a.votes);
      });
    }, 1700);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((d, i) => (
        <motion.li
          layout
          key={d.id}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className={cn(
            "flex items-center gap-3 rounded-2xl border bg-white p-3 text-[#16131c]",
            d.you ? "border-[#6c47ff] ring-4 ring-[#6c47ff]/15" : "border-[#e5e0d6]",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6b6577]">
              <span className="grid size-4 place-items-center rounded-full bg-[#e4dcff] text-[#3b2a8c]">
                <DetectiveIcon weight="fill" className="size-2.5" />
              </span>
              Anonymous
              {d.you && <span className="rounded bg-[#c6f432] px-1 text-[9px] font-extrabold text-[#16131c]">YOU</span>}
              {i === 0 && <span className="ml-auto rounded-full bg-[#ff7a3d] px-1.5 text-[9px] font-bold text-white">🔥 top</span>}
            </div>
            <p className="mt-1 text-[13px] leading-snug font-semibold">{d.text}</p>
          </div>
          <motion.div
            animate={bumped === d.id ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={cn(
              "flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 text-sm font-extrabold",
              d.you ? "border-[#16131c] bg-[#c6f432]" : "border-[#e5e0d6]",
            )}
          >
            <ArrowFatUpIcon weight={d.you ? "fill" : "bold"} className="size-4" />
            <NumberFlow value={d.votes} />
          </motion.div>
        </motion.li>
      ))}
    </ul>
  );
}
