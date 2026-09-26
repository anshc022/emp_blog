"use client";

import { useState } from "react";
import { SealCheckIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DoubtDTO } from "@/lib/serialize";

export function AnswerDialog({
  doubt,
  onAnswer,
  children,
}: {
  doubt: DoubtDTO;
  onAnswer: (answer?: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(doubt.answer ?? "");

  function submit() {
    onAnswer(answer.trim() || undefined);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as answered</DialogTitle>
          <DialogDescription asChild>
            <blockquote className="bg-muted text-foreground mt-2 line-clamp-4 rounded-2xl border-l-4 border-primary px-4 py-3 text-left text-sm font-medium">
              {doubt.text}
            </blockquote>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="answer">
            Quick written answer <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
            placeholder="Answered it out loud? Leave this empty — or jot a summary students can read later."
            className="min-h-28"
            maxLength={2000}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            <SealCheckIcon weight="fill" /> Mark answered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
