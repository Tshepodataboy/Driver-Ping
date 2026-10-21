import React from 'react';
import { SA_PROVINCES, SAProvince } from '../constants/provinces.js';
import { ProvincialPlate } from './ProvincialPlate.js';

export interface NumberPlateProps {
  plate: string;
  provinceCode?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Helper to determine province code from plate string if not explicitly given
export function detectProvinceCode(plate: string, fallbackCode = 'GP'): string {
  if (!plate) return fallbackCode;
  const clean = plate.trim().toUpperCase();

  // Check ending 2 letters or ending 1 letter
  for (const prov of SA_PROVINCES) {
    if (clean.endsWith(prov.code) || clean.endsWith(` ${prov.code}`)) {
      return prov.code;
    }
  }

  // Check prefix for WC (CA, CAA, CY, CF, CEY, etc.) and ZN (ND, PMB, etc.)
  if (clean.startsWith('CA ') || clean.startsWith('CAA ') || clean.startsWith('CY ') || clean.startsWith('CF ')) {
    return 'WC';
  }
  if (clean.startsWith('ND ') || clean.startsWith('PMB ') || clean.startsWith('KZ ') || clean.startsWith('KZN ')) {
    return 'ZN';
  }

  return fallbackCode;
}

// Clean plate text to extract the main registration string without duplicate province code if already in emblem
export function extractPlateCore(plate: string, provCode: string): string {
  if (!plate || !plate.trim()) return '___ ___';
  const clean = plate.trim().toUpperCase();
  if (clean.endsWith(` ${provCode}`)) {
    return clean.slice(0, -(provCode.length + 1)).trim();
  }
  if (clean.endsWith(provCode) && clean.length > provCode.length + 2) {
    return clean.slice(0, -provCode.length).trim();
  }
  return clean;
}

/**
 * Authentic Provincial SVGs & Artwork
 */

// 1. Western Cape: Cape Table Mountain outline & Anchor/Fynbos
const WesternCapeEmblem = () => (
  <svg className="w-full h-full opacity-35" viewBox="0 0 120 40" fill="none" preserveAspectRatio="none">
    {/* Table Mountain, Devil's Peak & Lion's Head silhouette */}
    <path
      d="M5 38 L25 24 L35 25 L45 15 L78 15 L82 22 L95 23 L105 32 L115 38 Z"
      fill="#1E293B"
    />
    <path
      d="M45 15 L78 15"
      stroke="#334155"
      strokeWidth="2"
    />
  </svg>
);

// 2. KwaZulu-Natal: Strelitzia (Bird of Paradise flower) & Zulu shield motif
const KZNEmblem = () => (
  <svg className="w-8 h-8 shrink-0 drop-shadow-xs" viewBox="0 0 40 40" fill="none">
    {/* Strelitzia / Royal shield */}
    <ellipse cx="20" cy="20" rx="9" ry="14" fill="#047857" opacity="0.15" />
    <path d="M12 28 C16 22 22 14 28 8 C25 15 22 22 18 28 Z" fill="#F97316" />
    <path d="M14 26 C18 19 23 12 31 11 C26 18 22 23 19 27 Z" fill="#2563EB" />
    <path d="M16 29 C17 21 21 16 33 16 C25 21 20 26 18 30 Z" fill="#EAB308" />
    <path d="M8 32 Q18 28 22 22" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 3. North West: Giant Sunflower & African Elephant
const NorthWestEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 overflow-hidden">
    {/* Sunflower on left */}
    <svg className="w-9 h-9 opacity-85 shrink-0" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="6" fill="#78350F" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="20"
          rx="3.5"
          ry="9"
          fill="#FBBF24"
          transform={`rotate(${deg} 20 20)`}
          opacity="0.85"
        />
      ))}
      <circle cx="20" cy="20" r="5" fill="#451A03" />
    </svg>

    {/* Elephant silhouette on right */}
    <svg className="w-12 h-8 opacity-40 shrink-0" viewBox="0 0 60 40" fill="#14532D">
      <path d="M5 28 C7 20 12 12 22 10 C32 8 42 12 48 18 C51 14 55 12 58 13 C57 18 54 22 52 26 C54 27 57 28 58 32 L53 33 C51 28 48 27 45 27 L44 38 L38 38 L38 28 L30 28 L30 38 L24 38 L25 27 C20 27 15 28 12 38 L6 38 C7 34 5 32 5 28 Z" />
    </svg>
  </div>
);

// 4. Free State: Running Cheetah & Golden Savannah
const FreeStateEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-4 overflow-hidden">
    {/* Running Cheetah Silhouette */}
    <svg className="w-16 h-8 opacity-40 shrink-0" viewBox="0 0 100 50" fill="#78350F">
      {/* Sleek galloping cheetah */}
      <path d="M5 25 C15 22 25 18 38 18 C48 18 56 12 68 12 C75 12 80 15 85 16 C88 13 92 14 94 17 C92 21 86 24 82 24 C78 28 72 32 68 38 L64 36 C66 31 71 27 75 24 C68 25 58 26 50 34 L45 34 C47 29 48 26 44 25 C35 25 25 32 18 42 L12 40 C16 34 18 29 18 26 C12 28 8 32 5 38 Z" />
      <circle cx="30" cy="22" r="1.5" fill="#92400E" />
      <circle cx="42" cy="21" r="1.5" fill="#92400E" />
      <circle cx="55" cy="18" r="1.5" fill="#92400E" />
    </svg>
  </div>
);

// 5. Northern Cape: Gemsbok (Oryx) with striking long horns & Kalahari Dunes
const NorthernCapeEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 overflow-hidden">
    {/* Dunes at bottom */}
    <svg className="absolute bottom-0 left-0 right-0 h-4 opacity-30" viewBox="0 0 100 20" preserveAspectRatio="none" fill="#B45309">
      <path d="M0 20 Q25 5 50 15 T100 10 L100 20 Z" />
    </svg>

    {/* Gemsbok Horns & Head on right */}
    <svg className="w-10 h-10 ml-auto opacity-70 shrink-0 relative z-10" viewBox="0 0 50 50" fill="none">
      {/* Iconic V-shaped long oryx horns */}
      <line x1="22" y1="30" x2="14" y2="4" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="30" x2="34" y2="4" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      {/* Ringed texture on horns */}
      <line x1="20" y1="22" x2="16" y2="21" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="28" y1="22" x2="32" y2="21" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="18" y1="14" x2="15" y2="13" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="30" y1="14" x2="33" y2="13" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Gemsbok head mask markings */}
      <path d="M19 30 L24 44 L29 30 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.2" />
      <path d="M22 32 L24 42 L26 32 Z" fill="#0F172A" />
      <circle cx="20" cy="34" r="1.5" fill="#0F172A" />
      <circle cx="28" cy="34" r="1.5" fill="#0F172A" />
    </svg>
  </div>
);

// 6. Gauteng: Royal Gauteng Coat of Arms & Security Barcode
const GautengEmblem = () => (
  <div className="flex items-center justify-center shrink-0 mx-1.5 drop-shadow-xs">
    {/* Gauteng Provincial Coat of Arms (Gold lions + shield + bee) */}
    <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
      {/* Central Shield */}
      <path d="M14 12 H26 V24 Q20 32 20 32 Q14 24 14 24 Z" fill="#1D4ED8" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Sun / pickaxe / bee emblem inside shield */}
      <circle cx="20" cy="18" r="3" fill="#FBBF24" />
      <path d="M18 24 L20 21 L22 24 Z" fill="#FBBF24" />
      {/* Left Lion Supporter */}
      <path d="M9 16 C8 12 12 11 14 14 L13 24 L10 26 Z" fill="#D97706" />
      {/* Right Lion Supporter */}
      <path d="M31 16 C32 12 28 11 26 14 L27 24 L30 26 Z" fill="#D97706" />
      {/* Crown on top */}
      <path d="M16 10 L20 7 L24 10 L22 12 H18 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
    </svg>
  </div>
);

// 7. Limpopo: Giant Baobab Tree ("The Great North")
const LimpopoEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
    {/* Baobab Tree in center background */}
    <svg className="w-16 h-12 opacity-35" viewBox="0 0 60 50" fill="#14532D">
      {/* Massive Baobab Trunk */}
      <path d="M22 45 C23 35 20 28 18 22 C22 18 20 12 15 10 C18 9 24 14 25 18 C28 14 28 8 26 4 C29 7 31 12 30 18 C33 13 37 8 40 5 C39 10 35 15 33 19 C38 15 44 14 46 12 C44 16 38 20 36 23 C38 28 36 36 38 45 Z" />
    </svg>
  </div>
);

// 8. Eastern Cape: Flowering Red Aloe (Aloe ferox) & Addo Elephant
const EasternCapeEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 overflow-hidden">
    {/* Red Flowering Aloe on left */}
    <svg className="w-8 h-10 opacity-80 shrink-0" viewBox="0 0 40 50" fill="none">
      {/* Aloe spiky succulent leaves */}
      <path d="M12 45 C15 36 10 28 6 24 C12 28 16 34 18 45 Z" fill="#15803D" />
      <path d="M26 45 C23 36 28 28 32 24 C26 28 22 34 20 45 Z" fill="#15803D" />
      <path d="M16 45 C18 32 15 22 11 18 C17 22 20 30 20 45 Z" fill="#166534" />
      <path d="M22 45 C20 32 23 22 27 18 C21 22 18 30 18 45 Z" fill="#166534" />
      {/* Bright Red Candle Flowers (Aloe ferox spikes) */}
      <path d="M19 22 C19 14 17 8 19 4 C21 8 19 14 19 22 Z" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 25 C14 18 12 13 14 9 C16 13 14 18 14 25 Z" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 25 C24 18 26 13 24 9 C22 13 24 18 24 25 Z" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
    </svg>

    {/* Elephant on right */}
    <svg className="w-11 h-8 opacity-40 shrink-0" viewBox="0 0 60 40" fill="#1E293B">
      <path d="M6 30 C8 22 14 14 24 12 C34 10 44 14 49 19 C52 16 56 14 59 15 C58 20 55 24 53 28 L46 28 L45 38 L39 38 L39 29 L31 29 L31 38 L25 38 L26 28 C21 28 16 29 13 38 L7 38 Z" />
    </svg>
  </div>
);

// 9. Mpumalanga: Radiating Rising Sun & Drakensberg Escarpment
const MpumalangaEmblem = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 overflow-hidden">
    {/* Rising Sun burst on top-left / center */}
    <svg className="w-12 h-10 opacity-75 shrink-0" viewBox="0 0 60 50" fill="none">
      {/* Sun rays */}
      <circle cx="30" cy="35" r="10" fill="#F97316" />
      {[0, 25, 50, 75, 100, 125, 150, 175].map((deg) => (
        <line
          key={deg}
          x1="30"
          y1="35"
          x2={30 + 22 * Math.cos((deg * Math.PI) / 180)}
          y2={35 - 22 * Math.sin((deg * Math.PI) / 180)}
          stroke="#EA580C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      <circle cx="30" cy="35" r="7" fill="#FBBF24" />
      {/* Horizon mountain curve */}
      <path d="M5 38 Q30 32 55 38 L55 45 L5 45 Z" fill="#15803D" opacity="0.6" />
    </svg>
  </div>
);

/**
 * Provincial Style Definitions
 */
export interface ProvincePlateStyle {
  bgGradient: string;
  borderColor: string;
  textColor: string;
  fontFamily: string;
  badgeBg: string;
  badgeTextColor: string;
  emblemComponent: React.ComponentType;
  tagline: string;
  countryBadge: {
    bg: string;
    text: string;
    showRsa: boolean;
  };
}

export const PROVINCE_PLATE_STYLES: Record<string, ProvincePlateStyle> = {
  // 1. Western Cape: Classic pure white with black embossed font, ZA badge and Table Mountain
  WC: {
    bgGradient: 'bg-white',
    borderColor: 'border-black ring-1 ring-black/40',
    textColor: 'text-black',
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-black text-white',
    badgeTextColor: 'text-white',
    emblemComponent: WesternCapeEmblem,
    tagline: 'Western Cape',
    countryBadge: {
      bg: 'bg-emerald-800 text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 2. KwaZulu-Natal: Glossy white/sky with royal blue or emerald lettering and KZN Strelitzia/Shield
  ZN: {
    bgGradient: 'bg-gradient-to-r from-sky-50 via-white to-blue-50',
    borderColor: 'border-blue-900/80 ring-1 ring-blue-500/30',
    textColor: 'text-[#1E3A8A]', // Deep royal blue
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-gradient-to-b from-[#1E3A8A] to-[#0F172A] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: KZNEmblem,
    tagline: 'KwaZulu-Natal',
    countryBadge: {
      bg: 'bg-[#1E3A8A] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 3. North West: Pastel sky blue with golden sunflower and elephant
  NW: {
    bgGradient: 'bg-gradient-to-b from-[#E0F2FE] via-[#F0FDF4] to-[#DCFCE7]',
    borderColor: 'border-[#166534] ring-1 ring-emerald-600/30',
    textColor: 'text-[#14532D]', // Forest green
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#166534] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: NorthWestEmblem,
    tagline: 'North West (Bokone Bophirima)',
    countryBadge: {
      bg: 'bg-[#166534] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 4. Free State: Golden savannah wheat background with running cheetah
  FS: {
    bgGradient: 'bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A]',
    borderColor: 'border-[#92400E] ring-1 ring-amber-700/30',
    textColor: 'text-[#451A03]', // Rich dark bronze/black
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#92400E] text-amber-100',
    badgeTextColor: 'text-amber-100',
    emblemComponent: FreeStateEmblem,
    tagline: 'Free State (Vrystaat)',
    countryBadge: {
      bg: 'bg-[#92400E] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 5. Northern Cape: Red Kalahari dunes, desert sky and noble Gemsbok horns
  NC: {
    bgGradient: 'bg-gradient-to-b from-[#BAE6FD] via-[#FEF2F2] to-[#FED7AA]',
    borderColor: 'border-[#9A3412] ring-1 ring-orange-800/30',
    textColor: 'text-[#1E293B]', // Deep navy/slate
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#9A3412] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: NorthernCapeEmblem,
    tagline: 'Northern Cape',
    countryBadge: {
      bg: 'bg-[#0369A1] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 6. Gauteng: Pure white plate with iconic Gauteng blue letters, coat of arms in center, barcode
  GP: {
    bgGradient: 'bg-white',
    borderColor: 'border-[#1D4ED8] ring-1 ring-blue-600/30',
    textColor: 'text-[#1D4ED8]', // Iconic Gauteng royal/sky blue
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#1D4ED8] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: GautengEmblem,
    tagline: 'Gauteng',
    countryBadge: {
      bg: 'bg-[#1D4ED8] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 7. Limpopo: Bushveld green with majestic giant Baobab Tree
  L: {
    bgGradient: 'bg-gradient-to-b from-[#F0FDF4] via-white to-[#DCFCE7]',
    borderColor: 'border-[#15803D] ring-1 ring-emerald-700/30',
    textColor: 'text-[#14532D]',
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#15803D] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: LimpopoEmblem,
    tagline: 'Limpopo (The Great North)',
    countryBadge: {
      bg: 'bg-[#15803D] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 8. Eastern Cape: Wild coast hills with scarlet flowering Aloe and Addo Elephant
  EC: {
    bgGradient: 'bg-gradient-to-b from-[#ECFDF5] via-white to-[#F0FDF4]',
    borderColor: 'border-[#064E3B] ring-1 ring-emerald-900/30',
    textColor: 'text-[#0F172A]',
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-[#064E3B] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: EasternCapeEmblem,
    tagline: 'Eastern Cape',
    countryBadge: {
      bg: 'bg-[#064E3B] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },

  // 9. Mpumalanga: Sunrise glow with radiating Rising Sun and green escarpment
  MP: {
    bgGradient: 'bg-gradient-to-b from-[#FFF7ED] via-white to-[#FEF3C7]',
    borderColor: 'border-[#C2410C] ring-1 ring-orange-700/30',
    textColor: 'text-[#18181B]',
    fontFamily: 'font-mono font-black',
    badgeBg: 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white',
    badgeTextColor: 'text-white',
    emblemComponent: MpumalangaEmblem,
    tagline: 'Mpumalanga (Place of the Rising Sun)',
    countryBadge: {
      bg: 'bg-[#C2410C] text-white',
      text: 'ZA',
      showRsa: true,
    },
  },
};

export const NumberPlate: React.FC<NumberPlateProps> = ({
  plate,
  provinceCode,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const code = (provinceCode || detectProvinceCode(plate, 'WC')).toUpperCase();
  const style = PROVINCE_PLATE_STYLES[code] || PROVINCE_PLATE_STYLES.GP;
  const Emblem = style.emblemComponent;
  const coreNumber = extractPlateCore(plate, code);

  // Size variations - all using authentic ProvincialPlate
  if (size === 'xs') {
    return (
      <div className={`w-24 max-w-full drop-shadow-2xs inline-block align-middle ${className}`}>
        <ProvincialPlate provinceCode={code} plateText={plate} />
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`w-36 max-w-full drop-shadow-xs inline-block align-middle ${className}`}>
        <ProvincialPlate provinceCode={code} plateText={plate} />
      </div>
    );
  }

  // Large or Medium full graphic plate - use authentic ProvincialPlate
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`w-full ${size === 'lg' ? 'max-w-[360px]' : 'max-w-[320px]'} drop-shadow-sm`}>
        <ProvincialPlate provinceCode={code} plateText={plate} />
      </div>

      {showLabel && (
        <div className="mt-1.5 text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
          <span>{style.tagline}</span>
        </div>
      )}
    </div>
  );
};
