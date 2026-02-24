import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { randomUUID } from "crypto";
import { UPLOAD_CONFIG } from "@/config";
import { put } from "@vercel/blob";

// Use Vercel Blob in production, local filesystem in development
const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${UPLOAD_CONFIG.allowedTypes.join(", ")}` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > UPLOAD_CONFIG.maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max size: ${Math.round(UPLOAD_CONFIG.maxSize / 1024 / 1024)}MB` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${randomUUID()}.${ext}`;

      if (isVercel) {
        // Production: Upload to Vercel Blob
        const blob = await put(`uploads/${filename}`, file, {
          access: "public",
          addRandomSuffix: false,
        });
        urls.push(blob.url);
      } else {
        // Local development: Write to filesystem
        const { writeFile, mkdir } = await import("fs/promises");
        const path = await import("path");
        const uploadDir = path.join(process.cwd(), UPLOAD_CONFIG.uploadDir);
        await mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        urls.push(`${UPLOAD_CONFIG.publicPath}/${filename}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
