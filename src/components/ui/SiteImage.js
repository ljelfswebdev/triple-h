import Image from "next/image";

export default function SiteImage({
  alt,
  aspectRatio,
  className = "",
  fill = false,
  height,
  objectFit = "cover",
  objectPosition = "center",
  preload = false,
  quality = 75,
  sizes = "100vw",
  src,
  style,
  width,
  ...props
}) {
  const mediaSource = typeof src === "object" ? src?.secureUrl || src?.url : src;
  const source = mediaSource;
  if (!source) return null;
  const imageAlt = alt ?? (typeof src === "object" ? src?.alt : "") ?? "";
  const resolvedAlt = imageAlt;
  const shouldFill = fill || (Boolean(aspectRatio) && !width && !height);
  const resolvedWidth = width || (typeof src === "object" ? src?.width : null) || 1600;
  const resolvedHeight = height || (typeof src === "object" ? src?.height : null) || 900;
  const image = (
    <Image
      {...props}
      alt={resolvedAlt}
      className={className}
      fill={shouldFill}
      height={shouldFill ? undefined : resolvedHeight}
      preload={preload}
      quality={quality}
      sizes={sizes}
      src={source}
      style={{ objectFit, objectPosition, ...style }}
      width={shouldFill ? undefined : resolvedWidth}
    />
  );

  if (!aspectRatio) return image;

  return (
    <span className="site-image" style={{ aspectRatio }}>
      {image}
    </span>
  );
}
