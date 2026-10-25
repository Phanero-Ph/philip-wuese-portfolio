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
  return NextResponse.json(
    { message: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error instanceof Error ? error.message : "Request failed" },
    { status: 500 },
  );
}
