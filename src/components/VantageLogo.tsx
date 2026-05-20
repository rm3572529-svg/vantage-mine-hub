interface VantageLogoProps {
  size?: number;
  className?: string;
}

export default function VantageLogo({ size = 64, className }: VantageLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="22" fill="#1a1a2e" />
      <rect width="100" height="100" rx="22" fill="url(#grad)" fillOpacity="0.3" />
      <path
        d="M22 28L42 72C43.5 75 46 76.5 50 76.5C54 76.5 56.5 75 58 72L78 28"
        stroke="#4CAF50"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 28L50 60L65 28"
        stroke="#81C784"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4CAF50" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
