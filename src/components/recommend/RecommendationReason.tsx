import { Heart, RotateCw } from "lucide-react";
import { Recommendation } from "../../types";

interface RecommendationReasonProps {
  recommendation: Recommendation;
}

export default function RecommendationReason({ recommendation }: RecommendationReasonProps) {
  return (
    <div className="relative rounded-2xl bg-white border border-[#ded2bf] p-10 shadow-sm text-center">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#8e9a86] px-6 py-1.5 text-sm font-bold text-white shadow-sm">
        小屋推荐推荐物语 🌸
      </div>
      <p className="text-[17px] leading-9 text-[#6d6358] font-serif">“{recommendation.reason}”</p>
      <div className="my-7 border-t border-dashed border-[#dfd6c5]" />
      <div className="flex justify-between text-base font-bold text-[#a0907d]">
        <span className="flex items-center gap-2">
          <RotateCw size={16} /> 最近品尝: {recommendation.lastTried}
        </span>
        <span className="flex items-center gap-2">
          <Heart size={16} className="text-[#e3a387]" /> 历史评价: {recommendation.historyEval}
        </span>
      </div>
    </div>
  );
}
