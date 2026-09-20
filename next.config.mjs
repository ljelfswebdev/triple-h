const isDevelopment = process.env.NODE_ENV !== "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com",
  "media-src 'self' https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  },
  ...(isDevelopment
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

const nextConfig = {
  // Local previews are sometimes opened via 127.0.0.1 or the machine's LAN
  // address. Allow those origins so Next's client bundle can hydrate forms.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*"],
  async redirects() {
    return [
      {
        source: "/grounds-maintenace",
        destination: "/services/grounds-maintenance",
        permanent: true,
      },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/tree-surgery", destination: "/services/tree-surgery", permanent: true },
      { source: "/site-clearance", destination: "/services/site-clearance", permanent: true },
      { source: "/rope-access", destination: "/services/rope-access", permanent: true },
      {
        source: "/traffic-management",
        destination: "/services/traffic-management",
        permanent: true,
      },
      { source: "/landscaping", destination: "/services/landscaping", permanent: true },
      {
        source: "/invasive-weed-control",
        destination: "/services/invasive-weed-control",
        permanent: true,
      },
      {
        source: "/emergency-call-out",
        destination: "/services/emergency-call-out",
        permanent: true,
      },
      { source: "/training", destination: "/careers", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.js",
    qualities: [35, 45, 60, 75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withBotId(nextConfig);
import { withBotId } from "botid/next/config";
