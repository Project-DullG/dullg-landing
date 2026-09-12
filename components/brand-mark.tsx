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
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M23 7C33 7 41 14 41 24S33 41 23 41H10V21"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="square"
      />
      <rect x="7.25" y="4.25" width="9.5" height="9.5" rx="1" fill="#c96645" />
    </svg>
  );
}
