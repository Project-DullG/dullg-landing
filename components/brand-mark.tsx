import artwork from "@/lib/brand-artwork.json";

export function BrandLogo({
  width = 176,
  color = "currentColor",
  variant = "horizontal",
}: {
  width?: number;
  color?: string;
  variant?: "horizontal" | "fullLockup";
}) {
  const shape = artwork[variant];
  return (
    <svg
      className="brand-logo"
      width={width}
      height={width * shape.height / shape.width}
      viewBox={shape.viewBox}
      fill={color}
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
    >
      {shape.paths.map(({ d }, index) => <path key={index} d={d} />)}
    </svg>
  );
}

export function BrandMark({
  size = 32,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      className="brand-mark brand-symbol"
      width={size}
      height={size * artwork.symbol.height / artwork.symbol.width}
      viewBox={artwork.symbol.viewBox}
      fill={color}
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
    >
      {artwork.symbol.paths.map(({ d }, index) => <path key={index} d={d} />)}
    </svg>
  );
}

export function BrandWordmark({
  width = 160,
  color = "currentColor",
}: {
  width?: number;
  color?: string;
}) {
  return (
    <svg
      className="brand-wordmark"
      width={width}
      height={width * artwork.wordmark.height / artwork.wordmark.width}
      viewBox={artwork.wordmark.viewBox}
      fill={color}
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
    >
      {artwork.wordmark.paths.map(({ d }, index) => <path key={index} d={d} />)}
    </svg>
  );
}
