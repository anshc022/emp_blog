"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy",
  icon,
  ...props
}: { value: string; label?: string; icon?: React.ReactNode } & Omit<
  React.ComponentProps<typeof Button>,
  "value" | "onClick"
>) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      {...props}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied!");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy — select it manually");
        }
      }}
    >
      {copied ? <CheckIcon weight="bold" /> : (icon ?? <CopyIcon weight="bold" />)}
      {copied ? "Copied" : label}
    </Button>
  );
}
