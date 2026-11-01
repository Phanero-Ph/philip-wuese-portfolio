import { readFile } from "node:fs/promises";
import path from "node:path";
import { errorResponse } from "@/lib/http";

const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
};

// Production's public-file index is built at startup. Serve newly uploaded
// images here so they are available immediately, without restarting the app.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const [year, month, filename] = segments;
  if (segments.length !== 3 || !/^\d{4}$/.test(year) || !/^(0[1-9]|1[0-2])$/.test(month) || !/^[a-f0-9]{36}\.(jpg|png|webp|gif)$/.test(filename)) {
    return new Response(null, { status: 404 });
  }
  try {
    const content = await readFile(path.join(process.cwd(), "public", "uploads", ...segments));
    return new Response(new Uint8Array(content), { headers: {
      "Content-Type": mimeTypes[filename.split(".").pop()!],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return new Response(null, { status: 404 });
    return errorResponse(error);
  }
}
