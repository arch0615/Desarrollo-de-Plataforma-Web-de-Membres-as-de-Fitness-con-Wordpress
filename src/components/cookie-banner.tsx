"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_NAME = "milagros-cookies-ack";

function readAck(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${COOKIE_NAME}=1`));
}

// Subscribe to cookie changes so accept() updates the banner without a
// re-render trigger. Cookie changes don't fire events natively, so we just
// expose a re-render handle the click handler can call.
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  for (const l of listeners) l();
}

function getSnapshot() {
  return readAck();
}
function getServerSnapshot() {
  return true; // SSR pretends ack=true so banner doesn't flash before hydration
}

export function CookieBanner() {
  const acked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function accept() {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    document.cookie = `${COOKIE_NAME}=1; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
    notify();
  }

  if (acked) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-sm rounded-2xl border bg-background shadow-lg p-4 z-50"
    >
      <p className="text-sm">
        Usamos cookies estrictamente necesarias para que la sesión y la
        suscripción funcionen.{" "}
        <Link href="/cookies" className="underline">
          Más info
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={accept}>
          Entendido
        </Button>
      </div>
    </div>
  );
}
