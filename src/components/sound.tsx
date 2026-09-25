"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { isMuted, play, setMuted, type SoundName } from "@/lib/sound";

/**
 * Plays sounds for any element marked with data-sound="name" (on press) or
 * data-sound-hover="name" (on hover, desktop only). Lets server components
 * opt in to sounds without becoming client components.
 */
export function SoundLayer() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-sound]");
      if (el && !el.hasAttribute("disabled")) play(el.dataset.sound as SoundName);
    };
    let lastHover: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-sound-hover]");
      if (el && el !== lastHover) play(el.dataset.soundHover as SoundName);
      lastHover = el ?? null;
    };
    document.addEventListener("pointerdown", onDown, { capture: true });
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("pointerdown", onDown, { capture: true });
      document.removeEventListener("pointerover", onOver);
    };
  }, []);
  return null;
}

function subscribeMute(onChange: () => void) {
  window.addEventListener("spill:mute", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("spill:mute", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function MuteToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeMute, isMuted, () => false);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) play("success");
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sounds on" : "Mute sounds"}
      title={muted ? "sounds off" : "sounds on"}
      className={`btn-ghost !px-2.5 ${className}`}
    >
      {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
    </button>
  );
}

/** Plays a welcome chime on the first page after logging in. */
export function WelcomeSound() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("spill:hello")) {
        sessionStorage.removeItem("spill:hello");
        play("login");
      }
    } catch {
      /* storage blocked */
    }
  }, []);
  return null;
}
