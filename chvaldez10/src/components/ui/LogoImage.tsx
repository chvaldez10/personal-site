"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

function imageSource(source: string | null | undefined): string | null {
  const value = source?.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function ImageAttempt({
  src,
  alt,
  size,
  naturalHeight,
}: {
  src: string | null;
  alt: string;
  size: number;
  naturalHeight: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    /* eslint-disable jsx-a11y/prefer-tag-over-role -- This inline SVG uses image semantics for its accessible label. */
    return (
      <ImageOff
        role="img"
        aria-hidden={false}
        aria-label={alt + " (image unavailable)"}
        width={size}
        height={size}
        className="shrink-0 rounded-md bg-muted p-1.5 text-muted-foreground"
      />
    );
    /* eslint-enable jsx-a11y/prefer-tag-over-role */
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: naturalHeight ? "auto" : size }}
      className="shrink-0 object-contain"
      draggable={false}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export default function LogoImage({
  src,
  alt,
  size = 36,
  naturalHeight = false,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  naturalHeight?: boolean;
}) {
  const source = imageSource(src);
  // A changed URL gets a fresh attempt instead of retaining the previous failure.
  // These small logos load directly from their configured media host.
  return (
    <ImageAttempt
      key={source ?? "missing"}
      src={source}
      alt={alt}
      size={size}
      naturalHeight={naturalHeight}
    />
  );
}
