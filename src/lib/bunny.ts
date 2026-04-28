import { createHash, createHmac } from "node:crypto";

// Bunny Stream integration. Built so that all callers can ask `isBunnyConfigured()`
// up front and either disable upload UI or proceed. Keeps ALL Bunny knowledge here.

const BUNNY_API = "https://video.bunnycdn.com";
const BUNNY_TUS = "https://video.bunnycdn.com/tusupload";

type Env = {
  libraryId: string;
  apiKey: string;
  cdnHostname: string;
  tokenAuthKey: string;
};

function readEnv(): Env | null {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
  const tokenAuthKey = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY;
  if (!libraryId || !apiKey || !cdnHostname || !tokenAuthKey) return null;
  return { libraryId, apiKey, cdnHostname, tokenAuthKey };
}

export function isBunnyConfigured() {
  return readEnv() !== null;
}

function requireEnv(): Env {
  const env = readEnv();
  if (!env) {
    throw new Error(
      "Bunny Stream not configured. Set BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY, BUNNY_STREAM_CDN_HOSTNAME, BUNNY_STREAM_TOKEN_AUTH_KEY in your .env.",
    );
  }
  return env;
}

// ─── Library API (server-side only) ─────────────────────────────────────

type CreateVideoResult = { videoId: string };

export async function createVideo(title: string): Promise<CreateVideoResult> {
  const env = requireEnv();
  const res = await fetch(
    `${BUNNY_API}/library/${env.libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: env.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );
  if (!res.ok) {
    throw new Error(`Bunny createVideo failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { guid: string };
  return { videoId: data.guid };
}

export async function deleteVideo(videoId: string) {
  const env = readEnv();
  if (!env) return; // silently noop in stub mode
  await fetch(
    `${BUNNY_API}/library/${env.libraryId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: { AccessKey: env.apiKey },
    },
  ).catch((e) => console.error("Bunny deleteVideo failed:", e));
}

export type BunnyVideoMeta = {
  status: number; // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error, 6=upload-failed, 7=jit-segmenting, 8=jit-playlists-created
  length: number; // duration in seconds
  thumbnailFileName: string | null;
};

export async function getVideoMeta(
  videoId: string,
): Promise<BunnyVideoMeta | null> {
  const env = readEnv();
  if (!env) return null;
  const res = await fetch(
    `${BUNNY_API}/library/${env.libraryId}/videos/${videoId}`,
    { headers: { AccessKey: env.apiKey } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status: number;
    length: number;
    thumbnailFileName: string | null;
  };
  return {
    status: data.status,
    length: data.length,
    thumbnailFileName: data.thumbnailFileName,
  };
}

// ─── TUS upload (client-side via tus-js-client; server returns headers) ───

export type TusUploadInfo = {
  endpoint: string;
  headers: {
    AuthorizationSignature: string;
    AuthorizationExpire: string;
    VideoId: string;
    LibraryId: string;
  };
};

export function buildTusUploadInfo(videoId: string, ttlSeconds = 3600): TusUploadInfo {
  const env = requireEnv();
  const expire = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHash("sha256")
    .update(`${env.libraryId}${env.apiKey}${expire}${videoId}`)
    .digest("hex");
  return {
    endpoint: BUNNY_TUS,
    headers: {
      AuthorizationSignature: sig,
      AuthorizationExpire: String(expire),
      VideoId: videoId,
      LibraryId: env.libraryId,
    },
  };
}

// ─── Playback (signed URL/token for player) ─────────────────────────────

export type PlaybackInfo = {
  hlsUrl: string;
  thumbnailUrl: string;
  embedUrl: string;
};

export function buildPlaybackInfo(
  videoId: string,
  opts: { ttlSeconds?: number } = {},
): PlaybackInfo {
  const env = requireEnv();
  const ttl = opts.ttlSeconds ?? 60 * 60 * 4; // 4 hours
  const expires = Math.floor(Date.now() / 1000) + ttl;
  // Bunny's "secure token" scheme: sha256(token_auth_key + path + expires) base64-url-safe.
  const path = `/${videoId}/playlist.m3u8`;
  const tokenRaw = createHmac("sha256", env.tokenAuthKey)
    .update(`${env.tokenAuthKey}${path}${expires}`)
    .digest("base64");
  const token = tokenRaw
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const baseHls = `https://${env.cdnHostname}${path}`;
  return {
    hlsUrl: `${baseHls}?token=${token}&expires=${expires}`,
    thumbnailUrl: `https://${env.cdnHostname}/${videoId}/thumbnail.jpg`,
    embedUrl: `https://iframe.mediadelivery.net/embed/${env.libraryId}/${videoId}?token=${token}&expires=${expires}`,
  };
}

// ─── Webhook signature ───────────────────────────────────────────────────

// Bunny signs webhooks with HMAC-SHA256(WebhookSecret, raw body).
export function verifyWebhookSignature(rawBody: string, providedSig: string) {
  const secret = process.env.BUNNY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // constant-time compare
  if (expected.length !== providedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}
