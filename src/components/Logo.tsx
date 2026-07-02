"use client";

interface LogoProps {
  size?: "desktop" | "tablet" | "mobile" | "custom";
  customSizeClass?: string;
}

export default function Logo({ size = "desktop", customSizeClass }: LogoProps) {
  return null;
}
