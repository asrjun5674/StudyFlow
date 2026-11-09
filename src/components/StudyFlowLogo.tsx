import React, { useState } from 'react';

export type LogoVariant = 'icon' | 'horizontal' | 'vertical' | 'full' | 'orb-only';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface StudyFlowLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  glow?: boolean;
  animate?: boolean;
  showTagline?: boolean;
  useImage?: boolean;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, { px: number; iconClass: string; textClass: string; subClass: string }> = {
  xs: { px: 20, iconClass: 'w-5 h-5', textClass: 'text-xs font-bold', subClass: 'text-[8px]' },
  sm: { px: 32, iconClass: 'w-8 h-8', textClass: 'text-sm font-bold', subClass: 'text-[9px]' },
  md: { px: 40, iconClass: 'w-10 h-10', textClass: 'text-base font-bold', subClass: 'text-[10px]' },
  lg: { px: 56, iconClass: 'w-14 h-14', textClass: 'text-xl font-bold', subClass: 'text-xs' },
  xl: { px: 80, iconClass: 'w-20 h-20', textClass: 'text-2xl font-extrabold', subClass: 'text-xs' },
  hero: { px: 180, iconClass: 'w-44 h-44 sm:w-52 sm:h-52', textClass: 'text-3xl sm:text-4xl font-black', subClass: 'text-xs sm:text-sm' },
};

/**
 * Pure SVG Vector Emblem of the StudyFlow Logo
 * Iridescent glass orb with open book, reaching student figure, and guiding star
 */
export const StudyFlowVectorOrb: React.FC<{ size?: number; className?: string; glow?: boolean; animate?: boolean }> = ({
  size = 48,
  className = '',
  glow = true,
  animate = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${animate ? 'hover:scale-105 transition-transform duration-300' : ''} ${className}`}
      aria-label="StudyFlow Emblem"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="sfGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="sfStarGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="starBlur" />
          <feComposite in="SourceGraphic" in2="starBlur" operator="over" />
        </filter>

        {/* Gradients */}
        <linearGradient id="orbBorder" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#e879f9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.95" />
        </linearGradient>

        <radialGradient id="orbFill" cx="100" cy="90" r="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#090d16" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </radialGradient>

        <radialGradient id="glassHighlight" cx="65" cy="50" r="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Left Book Wing: Cyan to Sky */}
        <linearGradient id="bookLeft" x1="45" y1="90" x2="98" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Right Book Wing: Magenta to Pink */}
        <linearGradient id="bookRight" x1="102" y1="90" x2="155" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>

        {/* Student Body: Cyan-Violet-Pink */}
        <linearGradient id="studentBody" x1="90" y1="50" x2="110" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Ambient Outer Halo */}
      {glow && (
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="url(#orbBorder)"
          strokeWidth="3"
          strokeOpacity="0.4"
          filter="url(#sfGlow)"
        />
      )}

      {/* Main Glass Orb Body */}
      <circle cx="100" cy="100" r="88" fill="url(#orbFill)" stroke="url(#orbBorder)" strokeWidth="3.5" />

      {/* Upper Specular Glass Reflection */}
      <ellipse cx="80" cy="45" rx="52" ry="24" fill="url(#glassHighlight)" transform="rotate(-15 80 45)" />

      {/* Lower Rim Reflection */}
      <path
        d="M 45 145 C 75 178 125 178 155 145"
        stroke="url(#orbBorder)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Stylized Open Book - Left Wing (Cyan) */}
      <path
        d="M 97 132 C 84 133 60 126 48 116 C 45 113 45 74 46 72 C 60 81 85 86 97 89 Z"
        fill="url(#bookLeft)"
        stroke="#7dd3fc"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner Page Sheet Left */}
      <path
        d="M 95 125 C 83 125 63 118 53 110"
        stroke="#e0f2fe"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Stylized Open Book - Right Wing (Magenta) */}
      <path
        d="M 103 132 C 116 133 140 126 152 116 C 155 113 155 74 154 72 C 140 81 115 86 103 89 Z"
        fill="url(#bookRight)"
        stroke="#f472b6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner Page Sheet Right */}
      <path
        d="M 105 125 C 117 125 137 118 147 110"
        stroke="#fdf2f8"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Energetic Student Silhouette: Head */}
      <circle
        cx="100"
        cy="58"
        r="11.5"
        fill="#e0f2fe"
        stroke="#38bdf8"
        strokeWidth="2.5"
        filter="url(#sfStarGlow)"
      />

      {/* Energetic Student Silhouette: Reaching Arms & Torso */}
      <path
        d="M 100 74 
           C 92 84 82 98 72 68 
           C 80 72 90 74 96 79
           L 96 112 
           C 98 117 102 117 104 112
           L 104 79
           C 110 74 120 72 128 68
           C 118 98 108 84 100 74 Z"
        fill="url(#studentBody)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Guiding Four-Point Star ✨ Above Reaching Student */}
      <g filter="url(#sfStarGlow)">
        {/* Star Center */}
        <path
          d="M 116 35 
             Q 116 41 122 41 
             Q 116 41 116 47 
             Q 116 41 110 41 
             Q 116 41 116 35 Z"
          fill="#ffffff"
        />
        <circle cx="116" cy="41" r="1.5" fill="#fbcfe8" />
      </g>

      {/* Additional Tiny Twinkle Sparkle */}
      <circle cx="74" cy="52" r="1.5" fill="#7dd3fc" opacity="0.8" />
      <circle cx="140" cy="58" r="1.5" fill="#f472b6" opacity="0.8" />
      <circle cx="58" cy="138" r="1" fill="#bae6fd" opacity="0.6" />
      <circle cx="148" cy="136" r="1" fill="#fbcfe8" opacity="0.6" />
    </svg>
  );
};

export const StudyFlowLogo: React.FC<StudyFlowLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  glow = true,
  animate = true,
  showTagline = true,
  useImage = true,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  // Render the emblem graphic (Image with vector fallback)
  const renderEmblem = () => {
    if (useImage && !imageError) {
      return (
        <div
          className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center p-[2px] transition-transform duration-300 ${
            animate ? 'hover:scale-105' : ''
          } ${sizeConfig.iconClass}`}
          style={{
            boxShadow: glow
              ? '0 0 20px rgba(56, 189, 248, 0.35), 0 0 35px rgba(236, 72, 153, 0.25)'
              : undefined,
          }}
        >
          {/* Subtle gradient border ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 opacity-80" />
          {/* Inner image container */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src="/studyflow-logo.png"
              alt="StudyFlow Official Logo"
              className="w-full h-full object-cover transform scale-110"
              onError={() => setImageError(true)}
              loading="eager"
            />
          </div>
        </div>
      );
    }

    return (
      <StudyFlowVectorOrb
        size={sizeConfig.px}
        glow={glow}
        animate={animate}
        className={sizeConfig.iconClass}
      />
    );
  };

  // 1. Orb Only / Icon Only
  if (variant === 'icon' || variant === 'orb-only') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        title="StudyFlow — PLAN | LEARN | GROW"
      >
        {renderEmblem()}
      </div>
    );
  }

  // 2. Horizontal (Navbar / Sidebar header)
  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {renderEmblem()}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-0.5 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent font-extrabold font-sans">
              Study
            </span>
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-extrabold font-sans">
              Flow
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                PLAN <span className="text-sky-400">|</span> LEARN <span className="text-pink-400">|</span> GROW
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Vertical / Full / Hero Card Representation
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center text-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="relative mb-3">
        {renderEmblem()}
        {glow && (
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-pink-500/20 rounded-full blur-xl -z-10 pointer-events-none" />
        )}
      </div>

      <div className="flex items-center gap-1 tracking-tight leading-none">
        <span className={`${sizeConfig.textClass} bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent`}>
          Study
        </span>
        <span className={`${sizeConfig.textClass} bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent`}>
          Flow
        </span>
      </div>

      {showTagline && (
        <>
          <p className={`${sizeConfig.subClass} font-bold tracking-widest text-slate-300 uppercase mt-1.5`}>
            PLAN <span className="text-sky-400">•</span> LEARN <span className="text-pink-400">•</span> GROW
          </p>

          {/* Glowing bottom gradient accent pill bar */}
          <div className="mt-2 w-20 sm:w-28 h-1 rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-pink-500 shadow-sm shadow-pink-500/30" />
        </>
      )}
    </div>
  );
};
