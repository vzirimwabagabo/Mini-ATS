import React from 'react';

interface AtsLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * High-precision vector SVG of the futuristic ATS emblem:
 * Orbital swooshes, italic techno typography, and chevron accents.
 */
export const AtsLogo: React.FC<AtsLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="ATS Logo"
      role="img"
    >
      {/* Outer Top Orbit Swoosh */}
      <path
        d="M 18 52 C 22 28, 50 14, 88 18 C 96 19, 104 22, 108 26 C 96 22, 78 20, 52 24 C 28 28, 16 40, 18 52 Z"
        fill="currentColor"
      />
      {/* Outer Right & Bottom Orbit Ring */}
      <path
        d="M 108 26 C 114 36, 114 54, 102 68 C 88 84, 56 90, 32 86 C 44 88, 72 86, 92 76 C 106 68, 110 52, 108 26 Z"
        fill="currentColor"
      />
      {/* Inner Swoosh Arc Over Letters */}
      <path
        d="M 24 58 C 26 40, 42 28, 72 30 C 78 30, 84 32, 88 34 C 76 33, 62 33, 44 38 C 30 42, 24 50, 24 58 Z"
        fill="currentColor"
      />
      {/* Left Wing Crest Accent */}
      <path
        d="M 14 62 C 16 48, 28 36, 48 32 C 34 38, 22 48, 20 62 Z"
        fill="currentColor"
      />

      {/* Letter 'A' */}
      <path
        d="M 32 64 L 41 38 L 49 38 L 56 64 L 49.5 64 L 47.5 56.5 L 38.5 56.5 L 36.5 64 Z M 40 51.5 L 46 51.5 L 43.5 43 Z"
        fill="currentColor"
      />

      {/* Letter 'T' */}
      <path
        d="M 54 38 L 76 38 L 74.5 44 L 67 44 L 63 64 L 56.5 64 L 60.5 44 L 53 44 Z"
        fill="currentColor"
      />

      {/* Letter 'S' */}
      <path
        d="M 76 64 L 88 64 C 92 64, 95 62, 95 58 C 95 55, 93 53, 89 52 L 83 51 C 80 50, 79 49, 79 47.5 C 79 45.5, 81 44, 85 44 L 94 44 L 92.5 49 L 85 49 C 83.5 49, 82.5 49.5, 82.5 50.5 C 82.5 51.5, 83.5 52, 86 52.5 L 92 53.5 C 97 54.5, 99 57, 99 60.5 C 99 64.5, 95 67, 88 67 L 74.5 67 Z"
        fill="currentColor"
      />

      {/* Sub-bar Left Chevrons: <<< */}
      <path d="M 42 72 L 40 74 L 42 76 L 41 76 L 39 74 L 41 72 Z" fill="currentColor" />
      <path d="M 45 72 L 43 74 L 45 76 L 44 76 L 42 74 L 44 72 Z" fill="currentColor" />
      <path d="M 48 72 L 46 74 L 48 76 L 47 76 L 45 74 L 47 72 Z" fill="currentColor" />

      {/* Center 4-Window Grid Icon */}
      <rect x="52" y="72" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="55" y="72" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="52" y="75" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="55" y="75" width="2" height="2" rx="0.3" fill="currentColor" />

      {/* Sub-bar Right Chevrons: >>> */}
      <path d="M 60 72 L 62 74 L 60 76 L 61 76 L 63 74 L 61 72 Z" fill="currentColor" />
      <path d="M 63 72 L 65 74 L 63 76 L 64 76 L 66 74 L 64 72 Z" fill="currentColor" />
      <path d="M 66 72 L 68 74 L 66 76 L 67 76 L 69 74 L 67 72 Z" fill="currentColor" />

      {/* Bottom Underline Swoosh */}
      <path
        d="M 36 80 C 50 84, 76 83, 88 77 C 82 79, 60 81, 42 78 Z"
        fill="currentColor"
      />
    </svg>
  );
};
