// Edy — o mini inventor mascote do Lab (jaleco, cabelo arrepiado, óculos, bigode e a lâmpada da ideia).
type Mood = "oi" | "pensando" | "festa";

export default function Edy({ size = 120, mood = "oi", className }: { size?: number; mood?: Mood; className?: string }) {
  const lit = mood !== "pensando";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Edy, o mascote do Lab Inventores 3D">
      <g transform="translate(60 4)">
        {lit && <circle cx="0" cy="12" r="15" fill="#d4f55a" opacity=".45" />}
        <path d="M-8 12a8 8 0 1 1 16 0c0 4-3 5.5-3.5 9h-9C-5 17.5-8 16-8 12Z" fill={lit ? "#ffe066" : "#e9e6f0"} stroke="#15121f" strokeWidth="2" />
        <rect x="-4.5" y="21" width="9" height="5" rx="1.5" fill="#6b6878" />
      </g>
      <path d="M32 116c0-20 12-32 28-32s28 12 28 32Z" fill="#ffffff" stroke="#15121f" strokeWidth="2.5" />
      <path d="M60 86v30" stroke="#15121f" strokeWidth="2" />
      <path d="M52 86l8 10 8-10" fill="#6d4aff" stroke="#15121f" strokeWidth="2" strokeLinejoin="round" />
      <rect x="66" y="100" width="10" height="7" rx="1.5" fill="#efeaff" stroke="#15121f" strokeWidth="1.5" />
      {mood === "oi" && (
        <g>
          <path d="M86 104c8-6 12-16 10-26" fill="none" stroke="#15121f" strokeWidth="9" strokeLinecap="round" />
          <path d="M86 104c8-6 12-16 10-26" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <circle cx="96" cy="74" r="6" fill="#f4c7a1" stroke="#15121f" strokeWidth="2" />
        </g>
      )}
      <circle cx="60" cy="62" r="22" fill="#f4c7a1" stroke="#15121f" strokeWidth="2.5" />
      <path
        d="M38 58c-6-4-4-12 2-13-3-6 4-11 9-8 1-6 9-7 11-2 3-5 11-3 11 2 6-2 11 4 8 9 6 2 6 10 0 12-3-8-9-13-21-13S41 50 38 58Z"
        fill="#ece9f2"
        stroke="#15121f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="62" r="2.6" fill="#15121f" />
      <circle cx="68" cy="62" r="2.6" fill="#15121f" />
      <circle cx="52" cy="62" r="6.5" fill="none" stroke="#15121f" strokeWidth="1.8" />
      <circle cx="68" cy="62" r="6.5" fill="none" stroke="#15121f" strokeWidth="1.8" />
      <path d="M58.5 62h3" stroke="#15121f" strokeWidth="1.8" />
      <path d="M50 73c4-3 7-3 10-1 3-2 6-2 10 1-4 2-7 1.5-10 0-3 1.5-6 2-10 0Z" fill="#ece9f2" stroke="#15121f" strokeWidth="1.6" strokeLinejoin="round" />
      {mood === "pensando" && <circle cx="72" cy="80" r="5.5" fill="#f4c7a1" stroke="#15121f" strokeWidth="2" />}
      {mood === "festa" && (
        <g>
          <path d="M54 77q6 5 12 0" fill="none" stroke="#15121f" strokeWidth="2" strokeLinecap="round" />
          <rect x="14" y="30" width="6" height="6" rx="1" fill="#ff6b5b" transform="rotate(20 17 33)" />
          <rect x="100" y="26" width="6" height="6" rx="1" fill="#6d4aff" transform="rotate(-15 103 29)" />
          <circle cx="22" cy="78" r="3" fill="#d4f55a" stroke="#15121f" strokeWidth="1" />
          <circle cx="104" cy="60" r="3" fill="#ffc93c" />
        </g>
      )}
    </svg>
  );
}
