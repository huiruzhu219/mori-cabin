import { useState } from "react";

const CABIN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBQIYFVkglHtWlc1sDE3WzoLNzo2j4fFpG-MTfGHE36yEfYD_aYVhZrf8QrRhGMkqyOkCYoPSnliN6l8GH6RoBfdxUq68mM7hPN3DMkyyOyhlpbj1G5Gbv_NVm600Lrrh_TQv348W2vPRsRUAw5fFD7X1v1NMgC84c0XFdqimqvLec0xfEJSq6r0TAKQaErcnQKDxPIOFwTMDZtG8J6HFCgMe1mmsfBv39wtHRsoj9WyrUX3-tZG3yij6UYmhXB8QdS4IlKQl97sg";

interface HeroHouseProps {
  onOpenSummary: () => void;
}

export default function HeroHouse({ onOpenSummary }: HeroHouseProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      onClick={onOpenSummary}
      className="relative w-full rounded-[24px] bg-white border border-[#e7dccb] p-3 shadow-[0_6px_18px_rgba(93,84,73,0.06)] text-left"
    >
      <div className="washi-tape-green -top-2 left-8 h-5 w-[110px] opacity-50" />
      <div className="relative h-[238px] rounded-[20px] overflow-hidden bg-[#f3f2ef] shadow-inner max-[520px]:h-[184px] max-[380px]:h-[168px]">
        {imageFailed ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfaf6_0%,#ebe5d9_100%)] flex items-center justify-center">
            <div className="relative w-[78%] h-[72%] rounded-xl bg-[#fffdf8] border border-[#dfd6c5] shadow-[0_12px_28px_rgba(93,84,73,0.12)] flex items-end justify-center pb-8 overflow-hidden">
              <div className="absolute top-6 right-10 text-[42px]">☀️</div>
              <div className="absolute top-12 left-12 text-[40px] opacity-80">☁️</div>
              <div className="absolute bottom-5 left-8 text-[42px]">🌻</div>
              <div className="absolute bottom-5 right-8 text-[42px]">🌿</div>
              <div className="relative w-[150px] h-[116px] rounded-b-xl bg-[#ead8c4] border border-[#bfa98d] shadow-sm">
                <div className="absolute -top-12 left-[-12px] w-[174px] h-[80px] bg-[#b99574] rotate-[-8deg] rounded-md border border-[#92785f]" />
                <div className="absolute left-1/2 top-10 -translate-x-1/2 rounded-md bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#7a6b4c] border border-[#d8c7ad]">生活小屋</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 rounded-t-full bg-[#8e9a86] border border-[#75806f]" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={CABIN_IMAGE}
            alt="生活小屋手绘插画"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute left-4 bottom-3 rounded-full bg-white/95 px-3 py-1.5 shadow-[0_3px_10px_rgba(93,84,73,0.14)] flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f0c7b6]" />
          <span className="text-sm font-bold text-[#7a6b4c] max-[520px]:text-[11px]">小屋暖暖的，风里有花香 🌸</span>
        </div>
      </div>
    </button>
  );
}
