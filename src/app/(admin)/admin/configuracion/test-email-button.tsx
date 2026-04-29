"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { sendTestEmailAction } from "@/lib/actions/admin-settings";

export function TestEmailButton() {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [pending, start] = useTransition();

  function send() {
    start(async () => {
      try {
        const r = await sendTestEmailAction(to.trim());
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
        toast.success(r.message);
        setOpen(false);
      } catch {
        toast.error("Falló el envío de prueba.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Enviar email de prueba
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email de prueba</DialogTitle>
            <DialogDescription>
              Si no hay RESEND_API_KEY configurada, se loguea a consola del
              servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="test-to">Destinatario</Label>
            <Input
              id="test-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="vos@ejemplo.com"
              disabled={pending}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button disabled={pending || !to.includes("@")} onClick={send}>
              {pending ? "Enviando…" : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
