import fs from "fs";
import path from "path";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export async function GET(req, { params }) {
  const segments = (await params).path;
  if (!segments || segments.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  // Prevent directory traversal
  if (segments.some((s) => s.includes(".."))) {
    return new Response("Forbidden", { status: 403 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", ...segments);

  if (!fs.existsSync(filePath)) {
    return new Response("Not Found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  return new Response(buffer, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
