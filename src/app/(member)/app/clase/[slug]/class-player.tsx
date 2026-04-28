"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

type Props = {
  classId: string;
  embedUrl: string | null;
  bunnyConfigured: boolean;
  hasVideo: boolean;
  resumeAt: number;
  durationSeconds: number;
};

// Bunny iframe embed exposes a `play` param to start at a given second.
// We don't get fine-grained playback events from the iframe (no postMessage
// API contract is guaranteed), so we report a coarse heartbeat: every 15s we
// estimate position as min(elapsed-since-resume + resumeAt, duration).
// This is good enough for a "continue watching" UX without DRM-grade
// telemetry. Day 6 can swap to a real player if needed.

export function ClassPlayer({
  classId,
  embedUrl,
  bunnyConfigured,
  hasVideo,
  resumeAt,
  durationSeconds,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [startFrom, setStartFrom] = useState(0);
  const [showResume, setShowResume] = useState(resumeAt > 0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    startedAtRef.current = Date.now();
    const iv = setInterval(() => {
      if (!startedAtRef.current) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const pos = startFrom + elapsed;
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          classId,
          positionSeconds: pos,
          completed:
            durationSeconds > 0 && pos >= durationSeconds - 5 ? true : undefined,
        }),
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(iv);
  }, [playing, classId, startFrom, durationSeconds]);

  // Final flush on unmount.
  useEffect(() => {
    return () => {
      if (!playing || !startedAtRef.current) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const pos = startFrom + elapsed;
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ classId, positionSeconds: pos }),
      }).catch(() => {});
    };
  }, [playing, startFrom, classId]);

  function start(from: number) {
    setStartFrom(from);
    setPlaying(true);
    setShowResume(false);
  }

  if (!bunnyConfigured || !hasVideo || !embedUrl) {
    return (
      <div className="mt-4 aspect-video rounded-2xl border bg-muted/40 grid place-items-center text-center px-6">
        <div>
          <p className="font-medium">Video aún no disponible</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {!bunnyConfigured
              ? "El reproductor se activa cuando se configure Bunny Stream."
              : "El video está pendiente de subida o procesamiento."}
          </p>
        </div>
      </div>
    );
  }

  if (showResume && resumeAt > 0) {
    return (
      <div className="mt-4 aspect-video rounded-2xl border bg-muted/40 grid place-items-center px-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Estabas en {formatDuration(resumeAt)}
          </p>
          <p className="mt-1 font-medium">¿Cómo querés ver?</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={() => start(resumeAt)}>Continuar</Button>
            <Button variant="outline" onClick={() => start(0)}>
              Empezar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="mt-4 aspect-video rounded-2xl border bg-muted/40 grid place-items-center">
        <Button size="lg" onClick={() => start(0)}>
          ▶ Reproducir
        </Button>
      </div>
    );
  }

  // Bunny embed accepts `?play=1&start=<sec>` for autoplay + start position.
  const url = new URL(embedUrl);
  url.searchParams.set("autoplay", "1");
  if (startFrom > 0) url.searchParams.set("t", String(startFrom));

  return (
    <div className="mt-4 aspect-video rounded-2xl overflow-hidden border bg-black">
      <iframe
        src={url.toString()}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Reproductor de clase"
      />
    </div>
  );
}
