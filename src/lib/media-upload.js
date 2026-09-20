export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export function mediaUploadError(file) {
  if (!file || typeof file.arrayBuffer !== "function") return "File required";
  if (!/^(image\/(?:jpeg|png|gif|webp|avif)|video\/(?:mp4|webm|quicktime))$/.test(file.type))
    return "Only JPEG, PNG, GIF, WebP, AVIF, MP4, WebM and QuickTime files are supported";
  if (file.size <= 0) return "The selected file is empty";
  if (file.size > MAX_MEDIA_BYTES) return "Files must be 25MB or smaller";
  return "";
}

export function detectedMediaKind(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return "";
  const hex = buffer.subarray(0, 16).toString("hex");
  const ascii = buffer.subarray(0, 16).toString("ascii");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a")) return "image/gif";
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") return "image/webp";
  if (ascii.slice(4, 12).includes("ftypavif") || ascii.slice(4, 12).includes("ftypavis"))
    return "image/avif";
  if (ascii.slice(4, 8) === "ftyp") return "video/mp4";
  if (hex.startsWith("1a45dfa3")) return "video/webm";
  return "";
}

export function mediaSignatureMatches(declaredType, detectedType) {
  if (!detectedType) return false;
  if (declaredType === detectedType) return true;
  return declaredType === "video/quicktime" && detectedType === "video/mp4";
}

export async function readMediaUploadResponse(response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback =
      response.status === 413
        ? "Files must be 25MB or smaller"
        : response.status === 401
          ? "Your session has expired. Please sign in and try again."
          : "Upload failed. Please try again.";
    throw new Error(result?.error || fallback);
  }
  if (!result || !(result.secureUrl || result.url)) {
    throw new Error("The server returned an incomplete upload response. Please try again.");
  }
  return result;
}
