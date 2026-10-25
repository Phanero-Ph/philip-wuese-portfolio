import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const key = () => {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  const parsed = raw ? Buffer.from(raw, "hex") : Buffer.alloc(0);
  if (parsed.length !== 32) throw new Error("TOTP_ENCRYPTION_KEY must contain exactly 64 hexadecimal characters.");
  return parsed;
};

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `next:v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith("next:v1:")) throw new Error("This 2FA secret uses an unsupported format. Reset 2FA for this administrator.");
  const [, , iv, tag, encrypted] = value.split(":");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
}
