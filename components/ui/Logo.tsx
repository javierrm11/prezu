type LogoProps = {
  size?: number;
  className?: string;
};

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        fill="#F4A623"
      />
      <path
        d="M8.5 10.5v2.5M12 8.5v6M15.5 10v3.5"
        stroke="#1A2B6D"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
