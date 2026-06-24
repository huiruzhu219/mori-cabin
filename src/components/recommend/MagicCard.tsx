import { useEffect, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { Recommendation } from "../../types";

interface MagicCardProps {
  recommendation: Recommendation;
}

export default function MagicCard({ recommendation }: MagicCardProps) {
  const filledStars = Math.max(1, Math.min(5, Math.round(recommendation.rating)));
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [recommendation.imageUrl]);

  return (
    <div className="relative rounded-[28px] bg-white border border-[#e6dccb] p-5 shadow-[0_6px_20px_rgba(93,84,73,0.06)]">
      <div className="washi-tape-green -top-4 left-[34%]" />
      <div className="relative h-[506px] rounded-2xl overflow-hidden border border-[#7f7468] max-[520px]:h-[330px]">
        {imageFailed ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#fff7d8_0%,transparent_24%),linear-gradient(135deg,#8e9a86_0%,#e3a387_100%)] flex items-center justify-center">
            <div className="rounded-[28px] bg-white/88 border border-white/70 px-8 py-7 text-center shadow-[0_12px_28px_rgba(93,84,73,0.16)]">
              <div className="text-[54px] mb-3">{recommendation.type === "drink" ? "☕" : "🍛"}</div>
              <p className="text-2xl font-bold font-serif text-[#5d5449]">{recommendation.name}</p>
              <p className="mt-2 text-sm font-bold text-[#8e9a86]">小屋今日推荐</p>
            </div>
          </div>
        ) : (
          <img src={recommendation.imageUrl} alt={recommendation.name} className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
        )}
        <Sparkles className="absolute left-[15%] top-[25%] text-white drop-shadow" size={22} />
        <div className="absolute right-7 top-7 w-[78px] h-[78px] rounded-full bg-[#e3a387]/95 border-[3px] border-white shadow-md rotate-12 flex flex-col items-center justify-center text-white font-bold">
          <span className="text-xs">匹配度</span>
          <span className="text-xl leading-none">{recommendation.match}%</span>
        </div>
      </div>
      <div className="pt-7 pb-8 flex items-start justify-between">
        <div>
          <h3 className="text-[22px] font-bold font-serif text-[#5d5449]">{recommendation.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={17} className={star <= filledStars ? "fill-amber-400" : "text-[#d6d0c4]"} />
            ))}
            <span className="ml-1 text-sm font-bold text-[#9f907d]">({recommendation.rating})</span>
          </div>
        </div>
        <span className="mt-5 rounded-full border border-[#f0d2c5] bg-[#fffaf7] px-4 py-1.5 text-sm font-bold text-[#c86f50]">#{recommendation.tag}</span>
      </div>
    </div>
  );
}
