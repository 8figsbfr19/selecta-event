import { randomUUID } from "crypto";
import { imageSize } from "image-size";
import { getSupabaseAdmin, getStorageBucket } from "@/lib/supabase";

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 *
 * `folder` groups files by purpose (logo, gallery, events, services) inside
 * the shared bucket - purely organizational, doesn't affect behavior.
 */
export async function saveUploadedFile(file: File, folder: string = "misc"): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBuffer(buffer, folder, file.type || "application/octet-stream", file.name);
}

/**
 * Same as saveUploadedFile, but also returns the image's pixel dimensions
 * (read from the file bytes, no client round-trip) so callers can preserve
 * portrait/landscape orientation in layout without probing the image later.
 */
export async function saveUploadedImage(
  file: File,
  folder: string = "misc"
): Promise<{ url: string; width: number | null; height: number | null }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadBuffer(buffer, folder, file.type || "application/octet-stream", file.name);

  let width: number | null = null;
  let height: number | null = null;
  try {
    const size = imageSize(buffer);
    width = size.width ?? null;
    height = size.height ?? null;
  } catch {
    // Not a recognized raster format (e.g. an SVG or corrupt file) - layout
    // code falls back to a sensible default when dimensions are unknown.
  }

  return { url, width, height };
}

/**
 * Uploads a base64 data URL (e.g. a signature pad's canvas export) to
 * Supabase Storage and returns its public URL.
 */
export async function saveDataUrlImage(dataUrl: string, folder: string = "misc"): Promise<string> {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data URL.");

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const ext = contentType.split("/")[1] || "png";

  return uploadBuffer(buffer, folder, contentType, `signature.${ext}`);
}

async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  contentType: string,
  originalName: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const bucket = getStorageBucket();

  const extMatch = /\.[a-zA-Z0-9]+$/.exec(originalName);
  const ext = extMatch ? extMatch[0] : "";
  const path = `${folder}/${randomUUID()}${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload to Supabase Storage failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
