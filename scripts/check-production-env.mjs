const required = ["NEXT_PUBLIC_APP_URL", "DATABASE_HOST", "DATABASE_NAME", "DATABASE_USER", "AUTH_SECRET", "TOTP_ENCRYPTION_KEY"];
const missing = required.filter((key) => !process.env[key]);
const errors = [];
if (missing.length) errors.push(`Missing: ${missing.join(", ")}`);
if ((process.env.AUTH_SECRET || "").length < 32) errors.push("AUTH_SECRET must be at least 32 characters.");
if (!/^[a-f\d]{64}$/i.test(process.env.TOTP_ENCRYPTION_KEY || "")) errors.push("TOTP_ENCRYPTION_KEY must be exactly 64 hexadecimal characters.");
if (process.env.NEXT_PUBLIC_APP_URL && !/^https:\/\//i.test(process.env.NEXT_PUBLIC_APP_URL)) errors.push("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
if ([...required, "DATABASE_PASSWORD"].some((key) => /replace|example\.com/i.test(process.env[key] || ""))) errors.push("Replace every example/placeholder production value.");
if (errors.length) {
  console.error(`Production environment is not ready:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Production environment validation passed.");
