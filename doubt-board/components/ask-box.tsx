"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CircleNotchIcon,
  EyesIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Avatar } from "@/components/art/avatar";
import { UpvoteButton } from "@/components/upvote-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMe } from "@/hooks/useMe";
import { useDebounced } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import { celebrate, originOf } from "@/lib/confetti";
import type { DoubtDTO } from "@/lib/serialize";
import { cn } from "@/lib/utils";

const DEFAULT_TOPICS = ["General", "Concept", "Example", "Homework", "Exam"];
const MAX = 500;

const PLACEHOLDERS = [
  "Ask the thing everyone's secretly thinking…",
  "Lost after step 2? Say it.",
  "No question is too small. Promise.",
];

type Props = {
  sessionId: string;
  existingTopics: string[];
  onSubmit: (input: { text: string; topic: string; isAnonymous: boolean }) => Promise<unknown>;
  onUpvote: (doubtId: string) => void;
  /** Live copies of doubts, so upvotes on "similar" suggestions stay in sync. */
  liveDoubts: DoubtDTO[];
  onPosted?: () => void;
  autoFocus?: boolean;
  className?: string;
};

/** Circular character counter. */
function CharRing({ length }: { length: number }) {
  const pct = Math.min(length / MAX, 1);
  const r = 9;
  const c = 2 * Math.PI * r;
  const danger = length > MAX - 40;
  return (
    <span className="flex items-center gap-1.5" aria-label={`${length} of ${MAX} characters`}>
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={length > MAX ? "var(--destructive)" : danger ? "var(--tangerine)" : "var(--primary)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-200"
        />
      </svg>
      {danger && (
        <span className={cn("text-xs font-semibold tabular-nums", length > MAX ? "text-destructive" : "text-tangerine")}>
          {MAX - length}
        </span>
      )}
    </span>
  );
}

export function AskBox({
  sessionId,
  existingTopics,
  onSubmit,
  onUpvote,
  liveDoubts,
  onPosted,
  autoFocus,
  className,
}: Props) {
  const me = useMe();
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("General");
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const sendRef = useRef<HTMLButtonElement>(null);
  const textId = useId();

  const topics = useMemo(
    () => [...new Set([...DEFAULT_TOPICS, ...existingTopics])].slice(0, 12),
    [existingTopics],
  );

  // "Similar doubts already asked" — debounced 400ms while typing.
  const query = useDebounced(text.trim(), 400);
  const similar = useQuery({
    queryKey: ["similar", sessionId, query],
    queryFn: () =>
      api<{ doubts: DoubtDTO[] }>(
        `/api/sessions/${sessionId}/doubts/similar?q=${encodeURIComponent(query)}`,
      ).then((r) => r.doubts),
    enabled: query.length >= 3,
    staleTime: 10_000,
  });
  const liveById = useMemo(() => new Map(liveDoubts.map((d) => [d.id, d])), [liveDoubts]);
  const suggestions = (query.length >= 3 ? (similar.data ?? []) : [])
    .map((d) => liveById.get(d.id) ?? d)
    .filter((d) => d.status === "open");

  const finalTopic = (showCustom ? customTopic : topic).trim() || "General";
  const tooLong = text.length > MAX;
  const canSubmit = text.trim().length >= 3 && !tooLong && !submitting;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), topic: finalTopic, isAnonymous });
      setText("");
      celebrate(originOf(sendRef.current));
      toast.success(isAnonymous ? "Posted anonymously 🕵️ nobody knows it was you" : "Doubt posted ✨");
      onPosted?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "bg-card shadow-soft focus-within:border-primary/60 focus-within:ring-primary/10 rounded-3xl border transition-all focus-within:ring-4",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 sm:px-5">
        {isAnonymous ? (
          <Avatar seed="you-anon" className="ring-0" />
        ) : (
          <Avatar name={me.data?.name ?? "You"} seed="you" className="ring-0" />
        )}
        <div className="text-sm leading-tight">
          <div className="font-semibold">
            {isAnonymous ? "Anonymous" : (me.data?.name ?? "You")}
          </div>
          <div className="text-muted-foreground text-xs">
            {isAnonymous ? "Not even your teacher will see your name" : "Your name will be shown"}
          </div>
        </div>
      </div>

      <label htmlFor={textId} className="sr-only">
        Your doubt
      </label>
      <textarea
        id={textId}
        name="doubt"
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground/70 field-sizing-content block min-h-24 w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[17px] leading-relaxed font-medium outline-none sm:px-5 sm:text-lg"
        maxLength={MAX + 50}
      />

      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 rounded-2xl border border-dashed border-primary/40 bg-accent/60 p-3 sm:mx-4">
              <p className="text-accent-foreground mb-2 flex items-center gap-1.5 text-xs font-bold">
                <EyesIcon weight="duotone" className="size-4" /> someone already asked this — upvote instead?
              </p>
              <ul className="flex flex-col gap-2">
                {suggestions.map((d) => (
                  <li key={d.id} className="bg-card flex items-center gap-3 rounded-xl border p-2 pr-3">
                    <UpvoteButton
                      size="sm"
                      count={d.upvoteCount}
                      active={d.hasUpvoted}
                      disabled={d.isMine}
                      title={d.isMine ? "That's your doubt" : undefined}
                      onClick={d.isMine ? undefined : () => onUpvote(d.id)}
                    />
                    <p className="line-clamp-2 flex-1 text-sm font-medium">{d.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scrollbar-none flex gap-1.5 overflow-x-auto px-4 pb-3 sm:flex-wrap sm:px-5">
        {topics.map((t) => {
          const active = !showCustom && topic === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTopic(t);
                setShowCustom(false);
              }}
              className={cn(
                "h-8 shrink-0 cursor-pointer rounded-full border px-3 text-xs font-semibold transition-all",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
              )}
            >
              #{t.toLowerCase()}
            </button>
          );
        })}
        {showCustom ? (
          <span className="relative shrink-0">
            <input
              autoFocus
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value.slice(0, 40))}
              placeholder="your topic"
              aria-label="Custom topic"
              className="border-primary bg-accent h-8 w-36 rounded-full border px-3 pr-7 text-xs font-semibold outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              aria-label="Cancel custom topic"
              className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
            >
              <XIcon weight="bold" className="size-3" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="text-muted-foreground hover:text-primary hover:border-primary inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-dashed px-3 text-xs font-semibold"
          >
            <PlusIcon weight="bold" className="size-3" /> custom
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-dashed px-4 py-3 sm:px-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold select-none">
          <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} aria-label="Post anonymously" />
          <span className="hidden min-[380px]:inline">Stay anonymous</span>
          <span className="min-[380px]:hidden">Anon</span>
        </label>
        <div className="flex items-center gap-3">
          <CharRing length={text.length} />
          <Button ref={sendRef} type="submit" disabled={!canSubmit} className="min-w-24">
            {submitting ? (
              <CircleNotchIcon weight="bold" className="animate-spin" />
            ) : (
              <PaperPlaneTiltIcon weight="fill" />
            )}
            Ask
          </Button>
        </div>
      </div>
    </form>
  );
}
