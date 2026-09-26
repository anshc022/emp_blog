"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

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
          <DialogDescription className="line-clamp-3">“{doubt.text}”</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="answer">
            Written answer <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
            placeholder="Answered it out loud? Leave this empty — or jot a quick summary for later."
            className="min-h-28"
            maxLength={2000}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            <CheckIcon /> Mark answered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
