import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ContentBloom — AI Blog Content for Shopify Stores",
  description: "Daily SEO blog posts for your Shopify store, done for you by AI. Starting at €49/month.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#f9f8f8" }}>
        {children}
      </body>
    </html>
  );
}
