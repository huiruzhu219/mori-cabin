import { useState } from "react";

interface HeroHouseProps {
  onOpenSummary: () => void;
}

function CabinFallback() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="生活小屋手绘插画">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf6ec" />
          <stop offset="60%" stopColor="#f7eedb" />
          <stop offset="100%" stopColor="#efe2ca" />
        </linearGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c08361" />
          <stop offset="100%" stopColor="#a8694a" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e4cc" />
          <stop offset="100%" stopColor="#e6d2b3" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9c4a8" />
          <stop offset="100%" stopColor="#9bab8e" />
        </linearGradient>
      </defs>
      <rect width="400" height="165" fill="url(#sky)" />
      <circle cx="320" cy="42" r="22" fill="#f3c969" opacity="0.9" />
      <circle cx="320" cy="42" r="14" fill="#f6d98a" />
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="78" cy="40" rx="26" ry="13" />
        <ellipse cx="100" cy="46" rx="20" ry="11" />
        <ellipse cx="60" cy="46" rx="16" ry="9" />
      </g>
      <g fill="#ffffff" opacity="0.7">
        <ellipse cx="250" cy="28" rx="18" ry="9" />
        <ellipse cx="265" cy="33" rx="14" ry="8" />
      </g>
      <path d="M0 150 Q60 115 120 140 Q180 110 240 138 Q300 120 360 142 L400 145 L400 165 L0 165 Z" fill="#cdd6c4" opacity="0.6" />
      <rect y="160" width="400" height="60" fill="url(#grass)" />
      <g>
        <rect x="52" y="120" width="6" height="44" rx="3" fill="#9a7d5e" />
        <circle cx="55" cy="108" r="22" fill="#8ea77a" />
        <circle cx="44" cy="116" r="15" fill="#7e9a6c" />
        <circle cx="67" cy="114" r="15" fill="#7e9a6c" />
        <circle cx="55" cy="100" r="14" fill="#9bb288" />
      </g>
      <g>
        <circle cx="340" cy="155" r="16" fill="#8ea77a" />
        <circle cx="356" cy="158" r="13" fill="#7e9a6c" />
        <circle cx="328" cy="158" r="11" fill="#7e9a6c" />
      </g>
      <g>
        <rect x="232" y="78" width="16" height="32" rx="2" fill="#b08968" />
        <rect x="229" y="74" width="22" height="8" rx="2" fill="#9a7355" />
        <g fill="#ffffff" opacity="0.7">
          <circle cx="240" cy="68" r="5" />
          <circle cx="248" cy="56" r="6" />
          <circle cx="258" cy="42" r="7" />
        </g>
        <rect x="168" y="108" width="120" height="62" fill="url(#wall)" />
        <path d="M158 112 L228 70 L298 112 Z" fill="url(#roof)" />
        <path d="M158 112 L228 70 L298 112 L292 116 L228 76 L164 116 Z" fill="#946049" opacity="0.4" />
        <line x1="190" y1="93" x2="266" y2="93" stroke="#8a5740" strokeWidth="1" opacity="0.35" />
        <rect x="222" y="132" width="12" height="38" rx="6" fill="#8e9a86" stroke="#75806f" strokeWidth="1" />
        <circle cx="232" cy="152" r="1.4" fill="#5d5449" />
        <rect x="184" y="122" width="24" height="22" rx="2" fill="#fdf6e3" stroke="#c9b18a" strokeWidth="1.5" />
        <line x1="196" y1="122" x2="196" y2="144" stroke="#c9b18a" strokeWidth="1" />
        <line x1="184" y1="133" x2="208" y2="133" stroke="#c9b18a" strokeWidth="1" />
        <rect x="182" y="144" width="28" height="4" rx="1" fill="#cbb596" />
        <circle cx="190" cy="142" r="2.5" fill="#e3a387" />
        <circle cx="196" cy="141" r="2.5" fill="#dda15e" />
        <circle cx="202" cy="142" r="2.5" fill="#e3a387" />
        <rect x="250" y="122" width="24" height="22" rx="2" fill="#fdf6e3" stroke="#c9b18a" strokeWidth="1.5" />
        <line x1="262" y1="122" x2="262" y2="144" stroke="#c9b18a" strokeWidth="1" />
        <line x1="250" y1="133" x2="274" y2="133" stroke="#c9b18a" strokeWidth="1" />
        <rect x="206" y="148" width="44" height="14" rx="3" fill="#fffdf8" stroke="#d8c7ad" strokeWidth="1" />
        <text x="228" y="158" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7a6b4c" fontFamily="Inter, sans-serif">生活小屋</text>
      </g>
      <g>
        <circle cx="100" cy="178" r="3.5" fill="#e3a387" />
        <circle cx="92" cy="182" r="3" fill="#dda15e" />
        <circle cx="110" cy="182" r="3" fill="#e3a387" />
        <line x1="100" y1="178" x2="100" y2="190" stroke="#7e9a6c" strokeWidth="1.2" />
        <circle cx="300" cy="180" r="3.5" fill="#dda15e" />
        <circle cx="308" cy="184" r="3" fill="#e3a387" />
        <line x1="300" y1="180" x2="300" y2="192" stroke="#7e9a6c" strokeWidth="1.2" />
        <path d="M130 178 q3 -8 6 0" fill="none" stroke="#7e9a6c" strokeWidth="1.4" />
        <path d="M280 180 q3 -8 6 0" fill="none" stroke="#7e9a6c" strokeWidth="1.4" />
        <path d="M150 182 q2 -6 4 0" fill="none" stroke="#8ea77a" strokeWidth="1.2" />
        <path d="M260 184 q2 -6 4 0" fill="none" stroke="#8ea77a" strokeWidth="1.2" />
      </g>
      <path d="M210 190 Q228 180 246 190 L250 200 L206 200 Z" fill="#e6d2b3" opacity="0.7" />
    </svg>
  );
}

export default function HeroHouse({ onOpenSummary }: HeroHouseProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      onClick={onOpenSummary}
      className="relative w-full rounded-[24px] bg-white border border-[#e7dccb] p-3 shadow-[0_6px_18px_rgba(93,84,73,0.06)] text-left"
    >
      <div className="washi-tape-green -top-2 left-8 h-5 w-[110px] opacity-50" />
      <div className="relative h-[280px] rounded-[20px] overflow-hidden bg-[#f3f2ef] shadow-inner max-[520px]:h-[240px] max-[380px]:h-[210px]">
        {!imageFailed ? (
          <img
            src="/cabin.png"
            alt="生活小屋手绘插画"
            className="w-full h-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <CabinFallback />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-4 bottom-3 rounded-full bg-white/95 px-3 py-1.5 shadow-[0_3px_10px_rgba(93,84,73,0.14)] flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f0c7b6]" />
          <span className="text-sm font-bold text-[#7a6b4c] max-[520px]:text-[11px]">小屋暖暖的，风里有花香 🌸</span>
        </div>
      </div>
    </button>
  );
}
