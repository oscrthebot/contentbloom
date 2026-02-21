import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ContentBloom — AI Blog Content for Shopify Stores",
  description: "We find Shopify stores with no blog, write daily SEO articles, and drive organic traffic that converts. Starting at €49/month.",
  openGraph: {
    title: "ContentBloom — AI Blog Content for Shopify Stores",
    description: "Daily SEO blog posts for your Shopify store, done for you by AI. Starting at €49/month.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#080808] text-white`}>
        {children}
      </body>
    </html>
  );
}
