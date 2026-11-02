import React from "react";

interface ReboothLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

export function ReboothLogo({
  size = "md",
  withWordmark = true,
  className = "",
}: ReboothLogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Mark: Dual Photostrip Aperture Geometry */}
      <div
        className={`relative ${iconDimensions} flex items-center justify-center rounded-xl bg-[#1d1d1f] text-white shadow-xs overflow-hidden shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          aria-hidden="true"
        >
          {/* Twin vertical photo film strip columns */}
          <rect
            x="6.5"
            y="6.5"
            width="8"
            height="19"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-white"
          />
          <rect
            x="17.5"
            y="6.5"
            width="8"
            height="19"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-zinc-400"
          />

          {/* Individual frame dividers on Left Strip */}
          <line x1="8" y1="12.5" x2="13" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="8" y1="17.5" x2="13" y2="17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />

          {/* Lens flash shutter center mark on Right Strip */}
          <circle cx="21.5" cy="11.5" r="1.4" fill="currentColor" className="text-white" />
          <line x1="19" y1="17.5" x2="24" y2="17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {withWordmark && (
        <span className={`font-bold tracking-tight text-zinc-900 ${textSize}`}>
          Rebooth
        </span>
      )}
    </div>
  );
}
