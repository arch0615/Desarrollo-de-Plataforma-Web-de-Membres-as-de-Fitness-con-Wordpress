"use client";

import { useRef, useState } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  classId: string;
  bunnyVideoId: string | null;
  bunnyConfigured: boolean;
};

export function VideoUploadCard({
  classId,
  bunnyVideoId,
  bunnyConfigured,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<TusUpload | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!bunnyConfigured) {
    return (
      <div className="rounded-2xl border p-5 bg-muted/40">
        <p className="font-medium">Video</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Configurá Bunny Stream en <code className="text-xs">.env</code> para
          habilitar la subida.
        </p>
      </div>
    );
  }

  async function startUpload(file: File) {
    setError(null);
    setDone(false);
    setProgress(0);

    const res = await fetch(`/api/admin/classes/${classId}/upload-info`, {
      method: "POST",
    });
    if (!res.ok) {
      setError("No pudimos generar el link de subida. Probá de nuevo.");
      setProgress(null);
      return;
    }
    const data = (await res.json()) as {
      endpoint: string;
      headers: Record<string, string>;
      videoId: string;
    };

    const upload = new TusUpload(file, {
      endpoint: data.endpoint,
      retryDelays: [0, 1000, 3000, 5000],
      chunkSize: 50 * 1024 * 1024,
      metadata: {
        filetype: file.type || "video/mp4",
        filename: file.name,
      },
      headers: data.headers,
      onError(err) {
        console.error(err);
        setError(err.message);
        setProgress(null);
      },
      onProgress(uploaded, total) {
        setProgress(Math.round((uploaded / total) * 100));
      },
      onSuccess() {
        setProgress(100);
        setDone(true);
        toast.success("Video subido. Bunny está procesando…");
      },
    });
    uploadRef.current = upload;
    upload.start();
  }

  function pauseOrResume() {
    const u = uploadRef.current;
    if (!u) return;
    if (paused) {
      u.start();
      setPaused(false);
    } else {
      u.abort();
      setPaused(true);
    }
  }

  function cancel() {
    const u = uploadRef.current;
    if (u) u.abort(true);
    uploadRef.current = null;
    setProgress(null);
    setPaused(false);
  }

  return (
    <div className="rounded-2xl border p-5 space-y-3">
      <p className="font-medium">Video</p>

      {bunnyVideoId ? (
        <p className="text-xs text-muted-foreground break-all">
          ID Bunny: <code>{bunnyVideoId}</code>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aún no se subió ningún video.
        </p>
      )}

      {progress === null && !done && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) startUpload(f);
            }}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Formatos: MP4, MOV, WebM. Hasta varios GB — la subida es resumible.
          </p>
        </>
      )}

      {progress !== null && progress < 100 && (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {paused ? "Pausada" : "Subiendo"} · {progress}%
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={pauseOrResume}>
              {paused ? "Reanudar" : "Pausar"}
            </Button>
            <Button size="sm" variant="destructive" onClick={cancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {done && (
        <p className="text-sm text-green-600">
          ✓ Subida completa. Bunny puede tardar unos minutos en codificar.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
