import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ message: error.message }, { status: error.status });
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const field = issue.path.join(".") || "request";
      (errors[field] ??= []).push(issue.message);
    }
    return NextResponse.json({ message: error.issues[0]?.message || "The submitted data is invalid.", errors }, { status: 422 });
  }
  if (error instanceof Response) return NextResponse.json({ message: error.statusText || "Request failed" }, { status: error.status });
  console.error(error);
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const productionMessage =
    code === "ER_ACCESS_DENIED_ERROR"
      ? "The database rejected the configured credentials. Verify DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD."
      : ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(code)
        ? "The database server could not be reached. Verify the production database host, port, and remote-access settings."
        : ["ER_NO_SUCH_TABLE", "ER_BAD_FIELD_ERROR"].includes(code)
          ? "The production database schema is incomplete or outdated. Import the required schema before signing in."
          : "An unexpected server error occurred. Check the server log for the recorded error.";
  return NextResponse.json(
    { message: process.env.NODE_ENV === "production" ? productionMessage : error instanceof Error ? error.message : "Request failed" },
    { status: 500 },
  );
}
