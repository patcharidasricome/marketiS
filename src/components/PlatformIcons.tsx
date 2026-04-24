export function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path fill="#1877F2" d="M15 8a7 7 0 00-7-7 7 7 0 00-1.094 13.915v-4.892H5.13V8h1.777V6.458c0-1.754 1.045-2.724 2.644-2.724.766 0 1.567.137 1.567.137v1.723h-.883c-.87 0-1.14.54-1.14 1.093V8h1.941l-.31 2.023H9.094v4.892A7.001 7.001 0 0015 8z" />
      <path fill="#fff" d="M10.725 10.023L11.035 8H9.094V6.687c0-.553.27-1.093 1.14-1.093h.883V3.87s-.801-.137-1.567-.137c-1.6 0-2.644.97-2.644 2.724V8H5.13v2.023h1.777v4.892a7.037 7.037 0 002.188 0v-4.892h1.63z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, id = "ig" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 551.034 551.034" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ig-grad-${id}`} x1="275.517" y1="4.571" x2="275.517" y2="549.720" gradientUnits="userSpaceOnUse" gradientTransform="scale(1,-1) translate(0,-554)">
          <stop offset="0" stopColor="#E09B3D" />
          <stop offset=".3" stopColor="#C74C4D" />
          <stop offset=".6" stopColor="#C21975" />
          <stop offset="1" stopColor="#7024C4" />
        </linearGradient>
      </defs>
      <path fill={`url(#ig-grad-${id})`} d="M386.878 0H164.156C73.64 0 0 73.64 0 164.156v222.722c0 90.516 73.64 164.156 164.156 164.156h222.722c90.516 0 164.156-73.64 164.156-164.156V164.156C551.033 73.64 477.393 0 386.878 0zm108.722 386.878c0 60.045-48.677 108.722-108.722 108.722H164.156c-60.045 0-108.722-48.677-108.722-108.722V164.156c0-60.046 48.677-108.722 108.722-108.722h222.722c60.045 0 108.722 48.676 108.722 108.722v222.722z" />
      <path fill={`url(#ig-grad-${id})`} d="M275.517 133c-78.584 0-142.517 63.933-142.517 142.516s63.933 142.517 142.517 142.517 142.517-63.933 142.517-142.517S354.101 133 275.517 133zm0 229.6c-48.095 0-87.083-38.988-87.083-87.083s38.989-87.083 87.083-87.083c48.095 0 87.083 38.988 87.083 87.083 0 48.095-38.989 87.083-87.083 87.083z" />
      <circle fill={`url(#ig-grad-${id})`} cx="418.306" cy="134.072" r="34.149" />
    </svg>
  );
}

export function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path fill="#0A66C2" d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z" />
    </svg>
  );
}

export function FacebookBadge() {
  return (
    <div
      className="platform-badge"
      style={{ background: "#1877f2", width: 22, height: 22 }}
      title="Facebook"
    >
      <FacebookIcon size={12} />
    </div>
  );
}

export function InstagramBadge({ id = "badge" }: { id?: string }) {
  return (
    <div
      className="platform-badge"
      style={{
        background: "linear-gradient(135deg, #E09B3D 0%, #C74C4D 50%, #C21975 75%, #7024C4 100%)",
        width: 22,
        height: 22,
      }}
      title="Instagram"
    >
      <InstagramIcon size={12} id={id} />
    </div>
  );
}

export function LinkedInBadge() {
  return (
    <div
      className="platform-badge"
      style={{ background: "#0A66C2", width: 22, height: 22 }}
      title="LinkedIn"
    >
      <LinkedInIcon size={12} />
    </div>
  );
}

// Thumbnail SVGs from the prototype
export function MrnaThumb() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 6, display: "block" }}>
      <rect width="52" height="52" rx="6" fill="#dbeafe" />
      <path d="M14 10 Q20 16 26 22 Q32 28 38 34" stroke="#3b82f6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M14 18 Q20 22 26 26 Q32 30 38 34" stroke="#93c5fd" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="17.5" y1="13" x2="17.5" y2="17.5" stroke="#2563eb" strokeWidth="1.4" />
      <line x1="22.5" y1="17.5" x2="22.5" y2="22" stroke="#2563eb" strokeWidth="1.4" />
      <line x1="27.5" y1="22" x2="27.5" y2="26.5" stroke="#2563eb" strokeWidth="1.4" />
      <line x1="32.5" y1="26.5" x2="32.5" y2="31" stroke="#2563eb" strokeWidth="1.4" />
      <rect x="29" y="8" width="7" height="14" rx="2" fill="#60a5fa" transform="rotate(35 32 15)" />
      <line x1="35" y1="6" x2="38" y2="3" stroke="#1d4ed8" strokeWidth="1.5" />
      <circle cx="14" cy="40" r="5" fill="#2563eb" />
      <text x="14" y="43.5" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif" fontWeight="700">Rx</text>
    </svg>
  );
}

export function CrisprThumb() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 6, display: "block" }}>
      <rect width="52" height="52" rx="6" fill="#fce7f3" />
      <path d="M10 8 C10 14 18 14 18 20 C18 26 10 26 10 32 C10 38 18 38 18 44" stroke="#db2777" strokeWidth="2" fill="none" />
      <path d="M28 8 C28 14 20 14 20 20 C20 26 28 26 28 32 C28 38 20 38 20 44" stroke="#f472b6" strokeWidth="2" fill="none" />
      <line x1="10" y1="14" x2="28" y2="14" stroke="#be185d" strokeWidth="1.3" strokeDasharray="2,1.5" />
      <line x1="14" y1="20" x2="24" y2="20" stroke="#be185d" strokeWidth="1.3" strokeDasharray="2,1.5" />
      <line x1="10" y1="26" x2="28" y2="26" stroke="#be185d" strokeWidth="1.3" strokeDasharray="2,1.5" />
      <line x1="14" y1="32" x2="24" y2="32" stroke="#be185d" strokeWidth="1.3" strokeDasharray="2,1.5" />
      <g transform="translate(32, 10) rotate(35)">
        <circle cx="3" cy="3" r="3" fill="none" stroke="#9d174d" strokeWidth="1.5" />
        <circle cx="10" cy="3" r="3" fill="none" stroke="#9d174d" strokeWidth="1.5" />
        <line x1="5.5" y1="5" x2="16" y2="16" stroke="#9d174d" strokeWidth="1.5" />
        <line x1="7.5" y1="5" x2="16" y2="16" stroke="#9d174d" strokeWidth="1.5" />
      </g>
      <line x1="34" y1="24" x2="42" y2="24" stroke="#be185d" strokeWidth="1.5" strokeDasharray="3,2" />
    </svg>
  );
}

export function MedThumb() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 6, display: "block" }}>
      <rect width="52" height="52" rx="6" fill="#ecfdf5" />
      <circle cx="32" cy="28" r="14" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="9" fill="none" stroke="#34d399" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="4" fill="#10b981" />
      <circle cx="17" cy="13" r="5" fill="#059669" />
      <path d="M10 32 C10 22 24 22 24 32 L24 38 L10 38 Z" fill="#059669" />
      <line x1="32" y1="12" x2="32" y2="16" stroke="#047857" strokeWidth="1.3" />
      <line x1="32" y1="40" x2="32" y2="44" stroke="#047857" strokeWidth="1.3" />
      <line x1="16" y1="28" x2="20" y2="28" stroke="#047857" strokeWidth="1.3" />
      <line x1="44" y1="28" x2="48" y2="28" stroke="#047857" strokeWidth="1.3" />
    </svg>
  );
}

export function FdaThumb() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 6, display: "block" }}>
      <rect width="52" height="52" rx="6" fill="#fef9c3" />
      <path d="M26 8 L40 14 L40 26 C40 34 33 41 26 44 C19 41 12 34 12 26 L12 14 Z" fill="#fbbf24" opacity="0.35" />
      <path d="M26 10 L38 15.5 L38 26 C38 33 32 39.5 26 42 C20 39.5 14 33 14 26 L14 15.5 Z" fill="none" stroke="#d97706" strokeWidth="2" />
      <polyline points="19,26 24,31 33,20" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="26" y="48" textAnchor="middle" fontSize="6.5" fill="#92400e" fontFamily="sans-serif" fontWeight="700">FDA</text>
    </svg>
  );
}

