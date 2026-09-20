"use client";

export default function cloudinaryLoader({ src, width, quality }) {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }

  const resolvedQuality = Math.min(Number(quality) || 60, 75);
  const transformation = `f_auto,q_${resolvedQuality},w_${width},c_limit`;
  return src.replace("/image/upload/", `/image/upload/${transformation}/`);
}
