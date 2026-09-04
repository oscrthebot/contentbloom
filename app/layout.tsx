import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Bloom — Webs para negocios locales",
  description:
    "Webs claras y profesionales para negocios locales en Segovia y España. Diseño, textos y SEO básico. €650 pago único. Escríbeme: rafa@bloomcontent.site",
  metadataBase: new URL("https://bloomcontent.site"),
  icons: {
    icon: "/rocket.svg",
    shortcut: "/rocket.svg",
    apple: "/rocket.svg",
  },
  openGraph: {
    title: "Bloom — Webs para negocios locales",
    description:
      "Webs claras y profesionales para negocios locales en Segovia y España. €650 pago único.",
    url: "https://bloomcontent.site",
    siteName: "Bloom",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bloom — Webs para negocios locales",
      },
    ],
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloom — Webs para negocios locales",
    description:
      "Webs claras y profesionales para negocios locales en Segovia y España. €650 pago único.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=outfit@900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable} style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#f9f8f8" }}>
        {children}
      </body>
    </html>
  );
}
