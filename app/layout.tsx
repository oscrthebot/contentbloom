import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BloomContent — AI Blog Content for Shopify Stores",
  description: "Daily SEO blog posts for your Shopify store, done for you by AI. Starting at €49/month.",
  metadataBase: new URL("https://bloomcontent.site"),
  icons: {
    icon: "/rocket.svg",
    shortcut: "/rocket.svg",
    apple: "/rocket.svg",
  },
  openGraph: {
    title: "BloomContent — AI Blog Content for Shopify Stores",
    description: "Daily SEO blog posts for your Shopify store, done for you by AI. Starting at €49/month.",
    url: "https://bloomcontent.site",
    siteName: "BloomContent",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BloomContent — AI Blog Content for Shopify Stores",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloomContent — AI Blog Content for Shopify Stores",
    description: "Daily SEO blog posts for your Shopify store, done for you by AI. Starting at €49/month.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable} style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#f9f8f8" }}>
        {children}
      </body>
    </html>
  );
}
