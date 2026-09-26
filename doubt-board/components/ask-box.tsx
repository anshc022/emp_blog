"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOffIcon, Loader2Icon, PlusIcon, SendIcon, SparklesIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { UpvoteButton } from "@/components/upvote-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDebounced } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import type { DoubtDTO } from "@/lib/serialize";
import { cn } from "@/lib/utils";

const DEFAULT_TOPICS = ["General", "Concept", "Example", "Homework", "Exam"];
const MAX = 500;

type Props = {
  sessionId: string;
  existingTopics: string[];
  onSubmit: (input: { text: string; topic: string; isAnonymous: boolean }) => Promise<unknown>;
  onUpvote: (doubtId: string) => void;
  /** Live copies of doubts, so upvotes on "similar" suggestions stay in sync. */
  liveDoubts: DoubtDTO[];
};

export function AskBox({ sessionId, existingTopics, onSubmit, onUpvote, liveDoubts }: Props) {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("General");
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      toast.success(isAnonymous ? "Doubt posted anonymously" : "Doubt posted");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="gap-4 p-4 sm:p-5">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="relative">
          <Label htmlFor="doubt-text" className="sr-only">
            Your doubt
          </Label>
          <Textarea
            id="doubt-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="What's confusing you? No question is too small…"
            className="min-h-24 resize-none pb-7 text-base"
            maxLength={MAX + 50}
          />
          <span
            className={cn(
              "text-muted-foreground pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums",
              tooLong && "text-destructive font-medium",
            )}
          >
            {text.length}/{MAX}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-accent/60 rounded-lg border border-dashed p-3">
                <p className="text-accent-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
                  <SparklesIcon className="size-3.5" /> Similar doubts already asked — upvote instead?
                </p>
                <ul className="flex flex-col gap-2">
                  {suggestions.map((d) => (
                    <li key={d.id} className="bg-background flex items-center gap-3 rounded-md border p-2">
                      <UpvoteButton
                        size="sm"
                        count={d.upvoteCount}
                        active={d.hasUpvoted}
                        disabled={d.isMine}
                        title={d.isMine ? "That's your doubt" : undefined}
                        onClick={d.isMine ? undefined : () => onUpvote(d.id)}
                      />
                      <p className="line-clamp-2 flex-1 text-sm">{d.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">Topic</p>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTopic(t);
                  setShowCustom(false);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  !showCustom && topic === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50 hover:text-primary",
                )}
              >
                {t}
              </button>
            ))}
            {showCustom ? (
              <Input
                autoFocus
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value.slice(0, 40))}
                placeholder="Custom topic"
                className="h-7 w-36 rounded-full px-3 text-xs"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="text-muted-foreground hover:text-primary hover:border-primary/50 inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs font-medium"
              >
                <PlusIcon className="size-3" /> Custom
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} aria-label="Post anonymously" />
            <span className="flex items-center gap-1.5">
              {isAnonymous ? <EyeOffIcon className="size-4" /> : <UserIcon className="size-4" />}
              {isAnonymous ? "Anonymous" : "Show my name"}
            </span>
          </label>
          <Button type="submit" disabled={!canSubmit} className="min-w-28">
            {submitting ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            Ask
          </Button>
        </div>
      </form>
    </Card>
  );
}
