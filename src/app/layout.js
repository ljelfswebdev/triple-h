import { Bebas_Neue, Outfit } from "next/font/google";
import "@/styles/globals.css";
import { getSiteUrl } from "@/lib/site-url";
import { getGlobals } from "@/lib/site-data";
import { mergeSiteCopy } from "@/lib/site-copy";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const bebas = Bebas_Neue({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const siteUrl = getSiteUrl();

export async function generateMetadata() {
  const copy = mergeSiteCopy((await getGlobals())?.siteCopy).branding;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: copy.name, template: `%s | ${copy.shortName}` },
    openGraph: { title: copy.name, description: copy.strapline, siteName: copy.name, type: "website", url: siteUrl },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      className={`${outfit.variable} ${bebas.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <head>
        <link crossOrigin="anonymous" href="https://res.cloudinary.com" rel="preconnect" />
        <link href="https://res.cloudinary.com" rel="dns-prefetch" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
