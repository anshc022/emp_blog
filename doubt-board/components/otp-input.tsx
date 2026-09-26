"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

/** Six big digit boxes. Supports typing, backspace, arrow keys and pasting a full code. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function setAt(i: number, chars: string) {
    const next = (value.slice(0, i) + chars).replace(/\D/g, "").slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
    focus(next.length);
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Join code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          autoFocus={i === 0}
          maxLength={length}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const chars = e.target.value.replace(/\D/g, "");
            if (!chars) return;
            // Typing into box i replaces from i onward (also handles paste / autofill).
            setAt(Math.min(i, value.length), chars.length > 1 ? chars : chars.slice(-1));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const at = d ? i : i - 1;
              if (at < 0) return;
              onChange(value.slice(0, at));
              focus(at);
            } else if (e.key === "ArrowLeft") focus(i - 1);
            else if (e.key === "ArrowRight") focus(i + 1);
          }}
          className={cn(
            "bg-card font-display h-14 w-11 rounded-2xl border-2 text-center text-3xl font-bold shadow-xs transition-all outline-none sm:h-20 sm:w-16 sm:text-4xl",
            "focus:border-primary focus:ring-primary/20 focus:-translate-y-0.5 focus:ring-4",
            d && "border-foreground shadow-sticker",
            i === 2 && "mr-2 sm:mr-4",
            invalid && "border-destructive focus:border-destructive focus:ring-destructive/20 animate-[shake_0.3s]",
          )}
        />
      ))}
    </div>
  );
}
