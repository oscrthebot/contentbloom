import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  dark?: boolean; // true = white text (for dark backgrounds)
}

const sizes = {
  sm: { rocket: 18, fontSize: 13 },
  md: { rocket: 22, fontSize: 15 },
  lg: { rocket: 28, fontSize: 18 },
};

export function Logo({ size = "md", href = "/", dark = false }: LogoProps) {
  const { rocket, fontSize } = sizes[size];

  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
      <Image
        src="/rocket.svg"
        alt="BloomContent"
        width={rocket}
        height={rocket}
        style={{ imageRendering: "pixelated", display: "block" }}
        priority
      />
      <span style={{
        fontWeight: 700,
        fontSize,
        color: dark ? "#fff" : "#111827",
        letterSpacing: "-0.01em",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}>
        BloomContent
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex" }}>
      {inner}
    </Link>
  );
}
