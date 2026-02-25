import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { w: 120, h: 24 },
  md: { w: 160, h: 32 },
  lg: { w: 200, h: 40 },
};

export function Logo({ size = "md", href = "/", className }: LogoProps) {
  const { w, h } = sizes[size];

  const img = (
    <Image
      src="/logo.svg"
      alt="BloomContent"
      width={w}
      height={h}
      priority
      style={{ display: "block" }}
    />
  );

  if (!href) return <span className={className}>{img}</span>;

  return (
    <Link href={href} style={{ display: "inline-block", textDecoration: "none" }} className={className}>
      {img}
    </Link>
  );
}
