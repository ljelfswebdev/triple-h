import { v2 as cloudinary } from "cloudinary";

const DEFAULT_CLOUDINARY_FOLDER = "triple-h/website";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function cloudinaryFolder() {
  const configured = String(process.env.CLOUDINARY_FOLDER || DEFAULT_CLOUDINARY_FOLDER)
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return configured || DEFAULT_CLOUDINARY_FOLDER;
}

export default cloudinary;
