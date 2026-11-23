import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CmsProviders } from "@/components/cms/CmsProviders";
import { siteMetadata } from "@/lib/seo";
import { resolveTenant } from "@/lib/tenant";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide SEO (title template, description, share image, favicon) comes from the
// "siteSeo" section of the site page, so editors can change it from the dashboard.
export async function generateMetadata(): Promise<Metadata> {
  const { host, isStandalone } = await resolveTenant();
  const base = await siteMetadata({ title: "Storio Template" });
  // metadataBase turns relative share-image paths into the full URLs social networks need.
  return { ...base, metadataBase: new URL(isStandalone ? "http://localhost:3000" : `https://${host}`) };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CmsProviders>{children}</CmsProviders>
      </body>
    </html>
  );
}
