import React from 'react';
import { Lock, X } from 'lucide-react';
import { NumberPlateOption } from '../constants/plates.js';

export type SAProvinceKey = 'EC' | 'FS' | 'GP' | 'KZN' | 'ZN' | 'LP' | 'L' | 'MP' | 'NC' | 'NW' | 'WC';

interface ProvincialPlateProps {
  provinceCode: string; // Accepts 'EC', 'FS', 'GP', 'KZN', 'ZN', 'LP', 'L', 'MP', 'NC', 'NW', 'WC'
  plateText?: string;
  imageUrl?: string; // Optional image link to display the plate image directly
  className?: string;
  showCaption?: boolean;
}

/**
 * Registry mapping province codes to image links.
 * Set image URLs here or pass imageUrl prop directly to <ProvincialPlate imageUrl="..." />
 */
export const PROVINCE_IMAGE_URLS: Record<string, string> = {
  EC: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Eastern_Cape_qrxmua.png',
  FS: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Free_State_l0w82s.png',
  GP: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Gauteng_tnjxv3.png',
  KZN: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/KwaZulu-Natal_fgzcvx.png',
  ZN: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/KwaZulu-Natal_fgzcvx.png',
  LP: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Limpopo_tu2zv2.png',
  L: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Limpopo_tu2zv2.png',
  MP: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Mpumalanga_ovclxz.png',
  NC: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Northern_Cape_al0quc.png',
  NW: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/North_West_bqjsyu.png',
  WC: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Western_Cape_eeg4qm.png',
  CA: 'https://res.cloudinary.com/dwd83begj/image/upload/v1792822017/Western_Cape_eeg4qm.png',
};

// Canonical province codes mapping
export function normalizeProvinceCode(code: string): 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC' {
  const upper = (code || '').toUpperCase().trim();
  if (upper === 'ZN' || upper === 'KZN') return 'KZN';
  if (upper === 'L' || upper === 'LP') return 'LP';
  if (upper === 'EC') return 'EC';
  if (upper === 'FS') return 'FS';
  if (upper === 'GP') return 'GP';
  if (upper === 'MP') return 'MP';
  if (upper === 'NC') return 'NC';
  if (upper === 'NW') return 'NW';
  if (upper === 'WC' || upper === 'CA') return 'WC';
  return 'WC'; // fallback default
}

export const PROVINCE_NAMES: Record<string, string> = {
  EC: 'Eastern Cape',
  FS: 'Free State',
  GP: 'Gauteng',
  KZN: 'KwaZulu-Natal',
  LP: 'Limpopo',
  MP: 'Mpumalanga',
  NC: 'Northern Cape',
  NW: 'North West',
  WC: 'Western Cape',
};

export const PROVINCE_DEFAULT_PLATES: Record<string, string> = {
  EC: 'CBB 574 EC',
  FS: 'CAM 69 FS',
  GP: 'CF 10 VD GP',
  KZN: 'NUR 18083',
  LP: 'BKS 214 L',
  MP: 'RGZ 191 MP',
  NC: 'BKK 973 NC',
  NW: 'KTZ 747 NW',
  WC: 'CA 232-577',
};

export interface ProvinceCodeInfo {
  norm: 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC';
  position: 'prefix' | 'suffix';
  codeDisplay: string;
  defaultRegistration: string;
  samplePlaceholder: string;
}

/**
 * Returns structural layout information for the province plate:
 * whether the immutable province code is a prefix (WC: CA, KZN: NUR) or suffix (GP, EC, FS, etc.)
 */
export function getProvinceCodeInfo(provCode: string): ProvinceCodeInfo {
  const norm = normalizeProvinceCode(provCode);
  switch (norm) {
    case 'WC':
      return { norm, position: 'prefix', codeDisplay: 'CA', defaultRegistration: '232-577', samplePlaceholder: '232-577' };
    case 'KZN':
      return { norm, position: 'prefix', codeDisplay: 'NUR', defaultRegistration: '18083', samplePlaceholder: '18083' };
    case 'LP':
      return { norm, position: 'suffix', codeDisplay: 'L', defaultRegistration: 'BKS 214', samplePlaceholder: 'BKS 214' };
    case 'GP':
      return { norm, position: 'suffix', codeDisplay: 'GP', defaultRegistration: 'CF 10 VD', samplePlaceholder: 'CF 10 VD' };
    case 'EC':
      return { norm, position: 'suffix', codeDisplay: 'EC', defaultRegistration: 'CBB 574', samplePlaceholder: 'CBB 574' };
    case 'FS':
      return { norm, position: 'suffix', codeDisplay: 'FS', defaultRegistration: 'CAM 69', samplePlaceholder: 'CAM 69' };
    case 'MP':
      return { norm, position: 'suffix', codeDisplay: 'MP', defaultRegistration: 'RGZ 191', samplePlaceholder: 'RGZ 191' };
    case 'NC':
      return { norm, position: 'suffix', codeDisplay: 'NC', defaultRegistration: 'BKK 973', samplePlaceholder: 'BKK 973' };
    case 'NW':
      return { norm, position: 'suffix', codeDisplay: 'NW', defaultRegistration: 'KTZ 747', samplePlaceholder: 'KTZ 747' };
    default:
      return { norm: 'WC', position: 'prefix', codeDisplay: 'CA', defaultRegistration: '232-577', samplePlaceholder: '232-577' };
  }
}

/**
 * Ensures user input cannot tamper with or edit the province code.
 * Strips any province code suffix or prefix typed or pasted by the user.
 */
export function stripProvinceCodeFromInput(raw: string, provCode: string): string {
  if (!raw) return '';
  const info = getProvinceCodeInfo(provCode);
  let clean = raw.trim().toUpperCase().replace(/[^A-Z0-9 -]/g, '');

  if (info.position === 'prefix') {
    // Strip leading code (e.g. CA or NUR)
    if (clean.startsWith(info.codeDisplay)) {
      clean = clean.substring(info.codeDisplay.length).trim();
    }
  } else {
    // Strip trailing province code (e.g. GP, EC, etc.)
    if (clean.endsWith(info.codeDisplay)) {
      clean = clean.substring(0, clean.length - info.codeDisplay.length).trim();
    }
    if (info.norm === 'LP' && clean.endsWith('LP')) {
      clean = clean.substring(0, clean.length - 2).trim();
    }
  }
  return clean;
}

/**
 * Combines registration number with the uneditable province code.
 */
export function formatFullProvincialPlate(regNumber: string, provCode: string): string {
  const clean = stripProvinceCodeFromInput(regNumber, provCode);
  if (!clean) return '';
  const info = getProvinceCodeInfo(provCode);
  if (info.position === 'prefix') {
    return `${info.codeDisplay} ${clean}`;
  } else {
    return `${clean} ${info.codeDisplay}`;
  }
}

/**
 * Intelligent helper to extract or guess province from a South African registration plate string.
 */
export function detectProvinceFromPlate(plate: string, fallback = 'GP'): string {
  if (!plate) return fallback;
  const clean = plate.trim().toUpperCase();
  const tokens = clean.split(/[\s-]+/).filter(Boolean);
  const lastPart = tokens[tokens.length - 1] || '';
  if (['GP', 'WC', 'ZN', 'KZN', 'FS', 'EC', 'MP', 'NC', 'NW', 'L', 'LP'].includes(lastPart)) {
    return lastPart;
  }
  const firstPart = tokens[0] || '';
  if (['CA', 'CAA', 'CBR', 'CCT', 'CF', 'CY', 'CAM', 'CL', 'CK', 'CN', 'CEO', 'CW'].includes(firstPart)) {
    // If CAM ... FS, check if FS is in tokens
    if (tokens.includes('FS')) return 'FS';
    return 'WC';
  }
  if (['ND', 'NP', 'NU', 'NUR', 'NRB', 'NZ', 'NK'].includes(firstPart)) return 'KZN';
  return fallback;
}

/**
 * Shared SVG Symbols and Filters used across all South African provincial plates.
 * Embedded directly into each SVG or rendered once per plate for self-contained, leak-free rendering.
 */
function PlateSvgDefs({ idPrefix = 'sa' }: { idPrefix?: string }) {
  return (
    <defs>
      <filter id={`${idPrefix}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id={`${idPrefix}-soft1`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.1" />
      </filter>

      {/* Elephant Symbol (Used in EC, NW) */}
      <symbol id={`${idPrefix}-elephant`} viewBox="0 0 100 70">
        <path
          fill="currentColor"
          d="M26 26Q28 8 52 8Q82 7 90 26Q95 44 88 62L79 62L77 44L64 45L62 62L52 62L50 47L38 47L34 62L24 62L27 44Q24 40 25 34Q12 36 12 52Q12 62 6 66L16 68Q26 60 24 46Q22 34 26 26Z"
        />
      </symbol>

      {/* Cheetah Symbol (Used in Free State) */}
      <symbol id={`${idPrefix}-cheetah`} viewBox="0 0 100 50">
        <g fill="#d9b36a" stroke="#8a6a2a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14Q-2 22 8 30" fill="none" strokeWidth="3" />
          <ellipse cx="48" cy="24" rx="30" ry="9" />
          <path d="M70 18Q74 10 82 8Q92 8 94 15Q92 22 82 22Z" />
          <path d="M26 30L10 42M34 32L24 44M62 30L80 40M70 28L92 36" fill="none" strokeWidth="3.4" />
        </g>
      </symbol>

      {/* Oryx / Gemsbok Symbol (Used in Northern Cape) */}
      <symbol id={`${idPrefix}-oryx`} viewBox="0 0 70 90">
        <g stroke="#6a5a46" strokeLinecap="round" fill="none">
          <path d="M44 14L60 -2M46 15L66 6" strokeWidth="2.2" />
        </g>
        <g fill="#b9a58a" stroke="#6a5a46" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M46 16L56 22L52 28L44 26L38 40Z" />
          <ellipse cx="26" cy="46" rx="20" ry="11" />
          <path d="M10 56L8 84M18 58L18 84M34 58L34 84M42 56L46 84" fill="none" strokeWidth="3" />
        </g>
      </symbol>

      {/* Corn / Maize Symbol (Used in North West) */}
      <symbol id={`${idPrefix}-corn`} viewBox="0 0 40 90">
        <path d="M20 4Q34 10 33 44Q31 70 20 74Q9 70 7 44Q6 10 20 4Z" fill="#f2c230" stroke="#b58a10" />
        <path d="M20 90Q2 70 4 40Q12 60 20 72Z M20 90Q38 70 36 40Q28 60 20 72Z" fill="#4fa046" stroke="#2f6f2a" />
      </symbol>

      {/* Gauteng Provincial Crest */}
      <symbol id={`${idPrefix}-crest-gp`} viewBox="0 0 40 46">
        <path d="M12 4l4 4 4-5 4 5 4-4v6H12z" fill="#d8aa2c" />
        <path d="M6 10h28v14c0 9-7 16-14 19C13 40 6 33 6 24z" fill="#e8c24a" stroke="#6b4e12" strokeWidth="1.6" />
        <path d="M10 14h20v10c0 6-4 10-10 13-6-3-10-7-10-13z" fill="#2c4aa8" />
        <path d="M20 14v23M10 24h20" stroke="#fff" strokeWidth="1.4" />
      </symbol>

      {/* Limpopo Provincial Crest */}
      <symbol id={`${idPrefix}-crest-lp`} viewBox="0 0 40 46">
        <path d="M13 4l3 4 4-5 4 5 3-4v6H13z" fill="#c9a24a" />
        <path d="M7 10h26v14c0 9-6 16-13 19C13 40 7 33 7 24z" fill="#2f7a4a" stroke="#6b4e12" strokeWidth="1.6" />
        <path d="M11 14h18v9c0 5-4 9-9 11-5-2-9-6-9-11z" fill="#c4372c" />
        <path d="M14 20h12M14 25h12" stroke="#f2c230" strokeWidth="2" />
      </symbol>
    </defs>
  );
}

/**
 * Renders the provincial plate using the official Cloudinary plate background images.
 */
export function ProvincialPlate({
  provinceCode,
  plateText,
  imageUrl,
  className = '',
  showCaption = false,
}: ProvincialPlateProps) {
  const norm = normalizeProvinceCode(provinceCode);
  const info = getProvinceCodeInfo(norm);
  const uid = React.useId().replace(/[:]/g, '');

  const plateImageUrl = imageUrl || PROVINCE_IMAGE_URLS[norm] || PROVINCE_IMAGE_URLS.GP;

  // Extract user registration portion (excluding province code)
  const isExplicitEmpty = plateText !== undefined && plateText.trim().length === 0;
  const userReg = plateText ? stripProvinceCodeFromInput(plateText, norm) : '';
  const displayReg = userReg || (isExplicitEmpty ? '' : info.defaultRegistration);
  const isGhost = isExplicitEmpty;
  const hasUserText = Boolean(userReg && userReg.trim().length > 0);

  // If a plateImageUrl exists (official Cloudinary images), render it cleanly without text overlaid on the plate
  if (plateImageUrl) {
    return (
      <figure className={`m-0 relative inline-block overflow-hidden rounded-xl border border-gray-300 shadow-sm ${className}`}>
        <img
          src={plateImageUrl}
          alt={`${PROVINCE_NAMES[norm] || norm} License Plate`}
          className="w-full h-auto block object-cover rounded-xl"
          loading="lazy"
        />

        {showCaption && (
          <figcaption className="mt-1 font-bold text-[11px] text-gray-700">
            {PROVINCE_NAMES[norm]}
          </figcaption>
        )}
      </figure>
    );
  }

  // Helper to render customized plate text with uneditable province code
  const renderPlateSvg = () => {
    switch (norm) {
      /* =========================================================================
         1. EASTERN CAPE (EC) - Province Code EC is Uneditable
         ========================================================================= */
      case 'EC': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 340 90" role="img" aria-label="Eastern Cape plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-ec`}>
                <rect x="1.25" y="1.25" width="337.5" height="87.5" rx="7" />
              </clipPath>
              <linearGradient id={`${uid}-bg-ec`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#f3f5e4" />
              </linearGradient>
            </defs>

            {/* Base plate & background gradient */}
            <rect x="1.25" y="1.25" width="337.5" height="87.5" rx="7" fill={`url(#${uid}-bg-ec)`} />

            {/* Province Art: Elephant, Aloe, Green & Yellow Hills, Blue Wave */}
            <g clipPath={`url(#${uid}-c-ec)`}>
              <g filter={`url(#${uid}-soft)`} opacity=".55">
                <g color="#a9b94f">
                  <use href={`#${uid}-elephant`} x="82" y="4" width="68" height="48" />
                </g>
                <path d="M246 54V22M241 56L236 28M251 56L258 28" stroke="#c9503a" strokeWidth="3" strokeLinecap="round" />
                <path d="M0 76Q90 68 170 76T340 72V90H0Z" fill="#cfe39a" />
                <path d="M0 84Q120 76 230 85T340 82V90H0Z" fill="#f0d96b" />
                <path d="M20 86Q120 80 220 87" stroke="#4a8fd0" strokeWidth="1.5" fill="none" />
              </g>
            </g>

            {/* Registration Text & Immutable EC Province Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="13" y="74" textLength="95" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    CBB
                  </text>
                  <text x="138" y="74" textLength="95" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    574
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="13" y="74" textLength="95" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    {parts[0]}
                  </text>
                  <text x="138" y="74" textLength="95" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="135" y="74" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 74.4} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Eastern Cape Province Code */}
              <text x="268" y="74" textLength="55" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                EC
              </text>
            </g>

            {/* Provincial slogan */}
            <text x="170" y="8.5" fontSize="5" textAnchor="middle" fill="#6a7a2a" fontFamily="Arial,sans-serif" letterSpacing=".6">
              FRIENDLY PROVINCE of the EASTERN CAPE
            </text>

            {/* Border */}
            <rect x="1.25" y="1.25" width="337.5" height="87.5" rx="7" fill="none" stroke="#555" strokeWidth="2.5" />
          </svg>
        );
      }

      /* =========================================================================
         2. FREE STATE (FS) - Province Code FS is Uneditable
         ========================================================================= */
      case 'FS': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 344 94" role="img" aria-label="Freestate plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-fs`}>
                <rect x="1.5" y="1.5" width="341" height="91" rx="7" />
              </clipPath>
              <linearGradient id={`${uid}-bg-fs`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#bfe8cb" />
                <stop offset="1" stopColor="#8fd4a6" />
              </linearGradient>
            </defs>

            {/* Base plate & background gradient */}
            <rect x="1.5" y="1.5" width="341" height="91" rx="7" fill={`url(#${uid}-bg-fs)`} />

            {/* Province Art: Golden & Green Hills, Cheetah */}
            <g clipPath={`url(#${uid}-c-fs)`}>
              <g filter={`url(#${uid}-soft)`} opacity=".8">
                <path d="M0 60Q90 48 180 58T344 50V76H0Z" fill="#e8bd62" />
                <path d="M0 74Q110 64 220 74T344 68V94H0Z" fill="#4fb277" />
                <g opacity=".9">
                  <use href={`#${uid}-cheetah`} x="196" y="28" width="68" height="34" />
                </g>
              </g>
            </g>

            {/* Registration Text & Immutable FS Province Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="12" y="79" textLength="102" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    CAM
                  </text>
                  <text x="141" y="79" textLength="53" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    69
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="12" y="79" textLength="102" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    {parts[0]}
                  </text>
                  <text x="141" y="79" textLength="53" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="135" y="79" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 74.4} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Free State Province Code */}
              <text x="271" y="79" textLength="58" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                FS
              </text>
            </g>

            {/* Provincial slogan */}
            <text x="300" y="12" fontSize="5" textAnchor="middle" fill="#2c4a38" fontFamily="Arial,sans-serif" letterSpacing=".6">
              FREE STATE PROVINCE
            </text>

            {/* Border */}
            <rect x="1.5" y="1.5" width="341" height="91" rx="7" fill="none" stroke="#34503f" strokeWidth="3" />
          </svg>
        );
      }

      /* =========================================================================
         3. GAUTENG (GP) - Province Code GP is Uneditable
         ========================================================================= */
      case 'GP': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 347 75" role="img" aria-label="Gauteng plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-gp`}>
                <rect x="2.0" y="2.0" width="343" height="71" rx="6" />
              </clipPath>
              <linearGradient id={`${uid}-bg-gp`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#f1f5fd" />
              </linearGradient>
            </defs>

            {/* Base plate & background gradient */}
            <rect x="2.0" y="2.0" width="343" height="71" rx="6" fill={`url(#${uid}-bg-gp)`} />

            {/* Province Art: Subtle wavy blue lines */}
            <g clipPath={`url(#${uid}-c-gp)`}>
              <g filter={`url(#${uid}-soft1)`} opacity=".5">
                <path d="M0 40Q60 30 120 40T240 40T347 38" stroke="#9fb4e6" strokeWidth="1" fill="none" />
                <path d="M0 46Q60 36 120 46T240 46T347 44" stroke="#c4d2f0" strokeWidth="1" fill="none" />
              </g>
            </g>

            {/* Registration Text & Immutable GP Code in Signature Blue (#1d3f9e) */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#1d3f9e">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="15" y="64" textLength="66" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    CF
                  </text>
                  <text x="95" y="64" textLength="53" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    10
                  </text>
                  <text x="173" y="64" textLength="58" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    VD
                  </text>
                </g>
              ) : parts.length >= 3 ? (
                <>
                  <text x="15" y="64" textLength="66" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    {parts[0]}
                  </text>
                  <text x="95" y="64" textLength="53" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    {parts[1]}
                  </text>
                  <text x="173" y="64" textLength="58" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                    {parts.slice(2).join(' ')}
                  </text>
                </>
              ) : (
                <text x="120" y="64" textAnchor="middle" fontSize={displayReg.length > 8 ? 52 : 62} letterSpacing="2">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Gauteng Province Code */}
              <text x="283" y="64" textLength="50" lengthAdjust="spacingAndGlyphs" fontSize="64.1">
                GP
              </text>
            </g>

            {/* Gauteng Crest and Text */}
            <use href={`#${uid}-crest-gp`} x="238" y="17" width="36" height="42" />
            <text x="256" y="66" fontSize="5.5" textAnchor="middle" fill="#7a2a1a" fontFamily="Arial,sans-serif" letterSpacing=".5">
              GAUTENG
            </text>

            {/* Border in Gauteng Signature Blue */}
            <rect x="2.0" y="2.0" width="343" height="71" rx="6" fill="none" stroke="#1d3f9e" strokeWidth="4" />
          </svg>
        );
      }

      /* =========================================================================
         4. KWAZULU-NATAL (KZN) - Province Code NUR is Uneditable
         ========================================================================= */
      case 'KZN': {
        return (
          <svg viewBox="0 0 341 80" role="img" aria-label="KwaZulu-Natal plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-kzn`}>
                <rect x="1.5" y="1.5" width="338" height="77" rx="5" />
              </clipPath>
              <linearGradient id={`${uid}-bg-kzn`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#e9f0fb" />
                <stop offset=".25" stopColor="#fff" />
                <stop offset=".75" stopColor="#fff" />
                <stop offset="1" stopColor="#e9f0fb" />
              </linearGradient>
            </defs>

            {/* Base plate */}
            <rect x="1.5" y="1.5" width="338" height="77" rx="5" fill={`url(#${uid}-bg-kzn)`} />

            {/* Registration Text in KZN Blue (#1d3f9e) */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#1d3f9e">
              {/* Uneditable KwaZulu-Natal Province Code */}
              <text x="32" y="65" textLength="98" lengthAdjust="spacingAndGlyphs" fontSize="71.8">
                NUR
              </text>

              {/* Editable Registration Number */}
              {isGhost ? (
                <text x="160" y="65" textLength="158" lengthAdjust="spacingAndGlyphs" fontSize="71.8" opacity="0.32">
                  18083
                </text>
              ) : (
                <text x="160" y="65" textLength="158" lengthAdjust="spacingAndGlyphs" fontSize="71.8">
                  {displayReg}
                </text>
              )}
            </g>

            {/* Border */}
            <rect x="1.5" y="1.5" width="338" height="77" rx="5" fill="none" stroke="#1d3f9e" strokeWidth="3" />
          </svg>
        );
      }

      /* =========================================================================
         5. LIMPOPO (LP / L) - Province Code L is Uneditable
         ========================================================================= */
      case 'LP': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 344 96" role="img" aria-label="Limpopo plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-lp`}>
                <rect x="2.5" y="2.5" width="339" height="91" rx="8" />
              </clipPath>
              <linearGradient id={`${uid}-bg-lp`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#d9dfe4" />
              </linearGradient>
            </defs>

            {/* Base plate */}
            <rect x="2.5" y="2.5" width="339" height="91" rx="8" fill={`url(#${uid}-bg-lp)`} />

            {/* Inner Border */}
            <g clipPath={`url(#${uid}-c-lp)`}>
              <rect x="7" y="7" width="330" height="82" rx="5" fill="none" stroke="#b4bcc4" strokeWidth="1" opacity=".7" />
            </g>

            {/* Registration Text & Immutable L Province Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="14" y="78" textLength="100" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    BKS
                  </text>
                  <text x="134" y="78" textLength="106" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    214
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="14" y="78" textLength="100" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    {parts[0]}
                  </text>
                  <text x="134" y="78" textLength="106" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="130" y="78" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 75.6} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Limpopo Province Code */}
              <text x="297" y="78" textLength="30" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                L
              </text>
            </g>

            {/* Limpopo Crest and Text */}
            <use href={`#${uid}-crest-lp`} x="247" y="26" width="35" height="43" />
            <text x="167" y="88" fontSize="6.5" textAnchor="middle" fill="#222" fontFamily="Arial,sans-serif" letterSpacing="1.5">
              LIMPOPO
            </text>

            {/* Heavy outer border */}
            <rect x="2.5" y="2.5" width="339" height="91" rx="8" fill="none" stroke="#59606a" strokeWidth="5" />
          </svg>
        );
      }

      /* =========================================================================
         6. MPUMALANGA (MP) - Province Code MP is Uneditable
         ========================================================================= */
      case 'MP': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 342 90" role="img" aria-label="Mpumalanga plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-mp`}>
                <rect x="1.25" y="1.25" width="339.5" height="87.5" rx="7" />
              </clipPath>
              <linearGradient id={`${uid}-bg-mp`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#eef2f5" />
              </linearGradient>
            </defs>

            {/* Base plate */}
            <rect x="1.25" y="1.25" width="339.5" height="87.5" rx="7" fill={`url(#${uid}-bg-mp)`} />

            {/* Province Art: Rising Sun rays & Blue River Waves */}
            <g clipPath={`url(#${uid}-c-mp)`}>
              <g filter={`url(#${uid}-soft1)`} opacity=".8">
                <g stroke="#f2b92e" strokeWidth="2.5" strokeLinecap="round" transform="translate(176 44)">
                  <path d="M-34 -4L-46 -8M-28 -20L-38 -28M-14 -30L-18 -42M0 -34V-46M14 -30L18 -42M28 -20L38 -28M34 -4L46 -8" />
                </g>
                <path d="M148 44A28 28 0 0 1 204 44Z" fill="#f7cf4d" />
                <path d="M128 62Q152 46 178 58T224 56" stroke="#1f6fc7" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M132 69Q156 55 180 66T222 64" stroke="#86b9ea" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </g>

            {/* Registration Text & Immutable MP Province Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="13" y="75" textLength="101" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    RGZ
                  </text>
                  <text x="141" y="75" textLength="75" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    191
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="13" y="75" textLength="101" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    {parts[0]}
                  </text>
                  <text x="141" y="75" textLength="75" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="130" y="75" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 75.6} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Mpumalanga Province Code */}
              <text x="266" y="75" textLength="62" lengthAdjust="spacingAndGlyphs" fontSize="75.6">
                MP
              </text>
            </g>

            {/* Border */}
            <rect x="1.25" y="1.25" width="339.5" height="87.5" rx="7" fill="none" stroke="#555" strokeWidth="2.5" />
          </svg>
        );
      }

      /* =========================================================================
         7. NORTHERN CAPE (NC) - Province Code NC is Uneditable
         ========================================================================= */
      case 'NC': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 348 97" role="img" aria-label="Northern Cape plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-nc`}>
                <rect x="2.0" y="2.0" width="344" height="93" rx="7" />
              </clipPath>
              <linearGradient id={`${uid}-bg-nc`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* Base plate */}
            <rect x="2.0" y="2.0" width="344" height="93" rx="7" fill={`url(#${uid}-bg-nc)`} />

            {/* Province Art: Red-Gold Kalahari Sand Dunes & Oryx */}
            <g clipPath={`url(#${uid}-c-nc)`}>
              <g filter={`url(#${uid}-soft)`} opacity=".6">
                <path d="M0 62Q80 38 170 58T300 52T348 46V76Q250 72 190 82T0 82Z" fill="#f0c864" />
                <g opacity=".85">
                  <use href={`#${uid}-oryx`} x="116" y="10" width="58" height="75" />
                </g>
              </g>
            </g>

            {/* Registration Text in Kalahari Green (#1f6a35) & Immutable NC Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#1f6a35">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="16" y="79" textLength="100" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    BKK
                  </text>
                  <text x="141" y="79" textLength="103" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    973
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="16" y="79" textLength="100" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    {parts[0]}
                  </text>
                  <text x="141" y="79" textLength="103" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="130" y="79" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 76.9} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable Northern Cape Province Code */}
              <text x="268" y="79" textLength="66" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                NC
              </text>
            </g>

            {/* Heavy Green Border */}
            <rect x="2.0" y="2.0" width="344" height="93" rx="7" fill="none" stroke="#2c7a46" strokeWidth="4" />
          </svg>
        );
      }

      /* =========================================================================
         8. NORTH WEST (NW) - Province Code NW is Uneditable
         ========================================================================= */
      case 'NW': {
        const parts = displayReg.split(/[\s-]+/).filter(Boolean);

        return (
          <svg viewBox="0 0 346 92" role="img" aria-label="Northwest plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-nw`}>
                <rect x="1.5" y="1.5" width="343" height="89" rx="7" />
              </clipPath>
              <linearGradient id={`${uid}-bg-nw`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#f4f9ee" />
              </linearGradient>
            </defs>

            {/* Base plate */}
            <rect x="1.5" y="1.5" width="343" height="89" rx="7" fill={`url(#${uid}-bg-nw)`} />

            {/* Province Art: Green landscape, corn/maize, elephant, tree */}
            <g clipPath={`url(#${uid}-c-nw)`}>
              <g filter={`url(#${uid}-soft)`} opacity=".6">
                <path d="M0 74Q90 64 180 74T346 68V92H0Z" fill="#b2e096" />
                <path d="M0 86Q140 78 346 86V92H0Z" fill="#5cb85c" />
                <use href={`#${uid}-corn`} x="10" y="26" width="34" height="62" />
                <g color="#858b90">
                  <use href={`#${uid}-elephant`} x="108" y="42" width="62" height="44" />
                </g>
                <circle cx="236" cy="62" r="8" fill="#4fa046" />
                <path d="M236 68V84" stroke="#6b4a2a" strokeWidth="2.5" />
              </g>
            </g>

            {/* Registration Text & Immutable NW Province Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {isGhost ? (
                <g opacity="0.32">
                  <text x="11" y="80" textLength="103" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    KTZ
                  </text>
                  <text x="137" y="80" textLength="92" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    747
                  </text>
                </g>
              ) : parts.length >= 2 ? (
                <>
                  <text x="11" y="80" textLength="103" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    {parts[0]}
                  </text>
                  <text x="137" y="80" textLength="92" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                    {parts.slice(1).join(' ')}
                  </text>
                </>
              ) : (
                <text x="130" y="80" textAnchor="middle" fontSize={displayReg.length > 7 ? 62 : 76.9} letterSpacing="3">
                  {displayReg}
                </text>
              )}

              {/* Uneditable North West Province Code */}
              <text x="269" y="80" textLength="67" lengthAdjust="spacingAndGlyphs" fontSize="76.9">
                NW
              </text>
            </g>

            {/* Provincial slogan */}
            <text x="175" y="9" fontSize="5" textAnchor="middle" fill="#3a7a3a" fontFamily="Arial,sans-serif" letterSpacing=".6">
              THE PLATINUM PROVINCE
            </text>

            {/* Border */}
            <rect x="1.5" y="1.5" width="343" height="89" rx="7" fill="none" stroke="#666" strokeWidth="3" />
          </svg>
        );
      }

      /* =========================================================================
         9. WESTERN CAPE (WC / CA) - Province Code CA is Uneditable
         ========================================================================= */
      case 'WC':
      default: {
        return (
          <svg viewBox="0 0 344 91" role="img" aria-label="Western Cape plate" className="w-full h-auto block drop-shadow-md">
            <PlateSvgDefs idPrefix={uid} />
            <defs>
              <clipPath id={`${uid}-c-wc`}>
                <rect x="1.5" y="1.5" width="341" height="88" rx="6" />
              </clipPath>
              <linearGradient id={`${uid}-bg-wc`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#e3e8eb" />
              </linearGradient>
            </defs>

            {/* Base plate & subtle gradient */}
            <rect x="1.5" y="1.5" width="341" height="88" rx="6" fill={`url(#${uid}-bg-wc)`} />

            {/* Inner Border Frame */}
            <g clipPath={`url(#${uid}-c-wc)`}>
              <rect x="6" y="6" width="332" height="79" rx="3" fill="none" stroke="#a5afb5" strokeWidth="1" opacity=".7" />
            </g>

            {/* Registration Text in Classic Crisp Black with Uneditable CA Code */}
            <g fontFamily='Oswald, "Arial Narrow", Impact, sans-serif' fontWeight="600" fill="#161616">
              {/* Uneditable Western Cape Province Code */}
              <text x="12" y="75" textLength="51" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                CA
              </text>

              {/* Editable Registration Number */}
              {isGhost ? (
                <text x="98" y="75" textLength="235" lengthAdjust="spacingAndGlyphs" fontSize="74.4" opacity="0.32">
                  232-577
                </text>
              ) : (
                <text x="98" y="75" textLength="235" lengthAdjust="spacingAndGlyphs" fontSize="74.4">
                  {displayReg}
                </text>
              )}
            </g>

            {/* Border */}
            <rect x="1.5" y="1.5" width="341" height="88" rx="6" fill="none" stroke="#222" strokeWidth="3" />
          </svg>
        );
      }
    }
  };

  return (
    <figure className={`m-0 text-center select-none ${className}`}>
      {renderPlateSvg()}
      {showCaption && (
        <figcaption className="mt-1.5 font-bold text-xs text-gray-700">
          {PROVINCE_NAMES[norm]}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Interactive South African Provincial Plate Input.
 * Displays the authentic provincial SVG plate background with live typed text,
 * paired with a text input where the province code cannot be edited and the text field is empty by default.
 */
interface InteractiveProvincialPlateInputProps {
  provinceCode: string;
  value: string;
  onChange: (val: string) => void;
  onProvinceChange?: (provCode: string) => void;
  availablePlates?: NumberPlateOption[];
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export function InteractiveProvincialPlateInput({
  provinceCode,
  value,
  onChange,
  onProvinceChange,
  availablePlates,
  placeholder,
  maxLength = 10,
  autoFocus = false,
}: InteractiveProvincialPlateInputProps) {
  const norm = normalizeProvinceCode(provinceCode);
  const info = getProvinceCodeInfo(norm);
  const effectivePlaceholder = placeholder || info.samplePlaceholder;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any typed/pasted province codes so that the province code cannot be edited
    const stripped = stripProvinceCodeFromInput(e.target.value, norm);
    onChange(stripped);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2.5">
      {/* Authentic Live Provincial Plate Preview with uneditable province code */}
      <div className="rounded-2xl overflow-hidden p-1 bg-white/70 border border-gray-200/80 shadow-md">
        <ProvincialPlate
          provinceCode={norm}
          plateText={value}
          className="w-full max-w-[340px] mx-auto transition-transform hover:scale-[1.01]"
        />
      </div>

      {/* Input Field with Locked Province Code */}
      <div className="space-y-1 relative">
        <div className="flex items-stretch rounded-2xl bg-gray-50 border-2 border-gray-300 focus-within:border-[#941329] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#941329]/20 transition-all shadow-inner overflow-hidden">
          {info.position === 'prefix' && (
            <div
              className="flex items-center gap-1.5 px-3.5 bg-gray-200/90 text-gray-800 font-mono font-black text-sm tracking-wider uppercase select-none border-r-2 border-gray-300 shrink-0"
              title={`Province code (${info.codeDisplay}) cannot be edited`}
            >
              <Lock className="w-3.5 h-3.5 text-gray-600" />
              <span>{info.codeDisplay}</span>
            </div>
          )}

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={`e.g. ${effectivePlaceholder}`}
              maxLength={maxLength}
              autoFocus={autoFocus}
              className="w-full text-center py-2.5 px-8 font-mono font-black text-lg tracking-widest text-gray-900 uppercase focus:outline-none bg-transparent"
            />

            {/* Quick Clear Button */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer"
                title="Clear plate number"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {info.position === 'suffix' && (
            <div
              className="flex items-center gap-1.5 px-3.5 bg-gray-200/90 text-gray-800 font-mono font-black text-sm tracking-wider uppercase select-none border-l-2 border-gray-300 shrink-0"
              title={`Province code (${info.codeDisplay}) cannot be edited`}
            >
              <Lock className="w-3.5 h-3.5 text-gray-600" />
              <span>{info.codeDisplay}</span>
            </div>
          )}
        </div>

        {/* Clear indication that province code cannot be edited */}
        <div className="flex items-center text-[11px] text-gray-500 px-1 pt-0.5">
          <span className="flex items-center gap-1 font-semibold text-gray-600">
            <Lock className="w-3 h-3 text-gray-400" />
            <span>Province code ({info.codeDisplay}) cannot be edited</span>
          </span>
        </div>
      </div>
    </div>
  );
}
