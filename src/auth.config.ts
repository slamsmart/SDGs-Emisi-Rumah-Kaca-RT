export const sessionCookieName = "jh_session";

export const publicPaths = ["/login"];
export const citizenPrefix = "/beranda";
export const adminPrefix = "/admin";

export type SessionPayload = {
  userId: string;
  role: "WARGA" | "ADMIN_RT" | "ADMIN_RW";
  villageId: string;
  rwId?: string | null;
  rtId?: string | null;
  name: string;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function toJsonBase64(value: object) {
  const bytes = encoder.encode(JSON.stringify(value));
  const raw = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return toBase64Url(raw);
}

function fromJsonBase64<T>(value: string) {
  const raw = fromBase64Url(value);
  const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
  return JSON.parse(decoder.decode(bytes)) as T;
}

async function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "demo-auth-secret-jejak-hijau-rt-rw-2026";
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(input: string) {
  const key = await getSecretKey();
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  const bytes = new Uint8Array(digest);
  const raw = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return toBase64Url(raw);
}

export async function createSessionToken(payload: SessionPayload) {
  const encodedPayload = toJsonBase64(payload);
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await sign(payloadPart);
  if (expectedSignature !== signaturePart) {
    return null;
  }

  const payload = fromJsonBase64<SessionPayload>(payloadPart);
  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
