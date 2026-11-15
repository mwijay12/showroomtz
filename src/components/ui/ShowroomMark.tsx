/**
 * ShowroomMark — official ShowroomTZ brand mark (inline SVG).
 * Dark tile, champagne italic-serif "S", crimson road-dash beneath.
 * Matches public/icons/icon-192x192.svg and icon-512x512.svg.
 */
export function ShowroomMark({ className, title = 'ShowroomTZ' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1D1815" />
          <stop offset="1" stopColor="#0D0B0A" />
        </linearGradient>
        <linearGradient id="stm-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9ECD6" />
          <stop offset="0.55" stopColor="#E3C089" />
          <stop offset="1" stopColor="#B98A4E" />
        </linearGradient>
        <linearGradient id="stm-road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E5483C" />
          <stop offset="0.5" stopColor="#D42B1E" />
          <stop offset="1" stopColor="#7E1B12" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="23" fill="url(#stm-bg)" />
      <rect x="1" y="1" width="98" height="98" rx="22" fill="none" stroke="#D4A24E" strokeOpacity="0.28" strokeWidth="2" />
      <text x="50" y="63" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="52" fill="url(#stm-s)">S</text>
      <rect x="22" y="71.5" width="56" height="5.5" rx="2.75" fill="url(#stm-road)" />
      <rect x="34" y="81" width="32" height="3" rx="1.5" fill="#D4A24E" fillOpacity="0.85" />
    </svg>
  );
}
