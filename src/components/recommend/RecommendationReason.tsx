import { Recommendation } from "../../types";

interface RecommendationReasonProps {
  recommendation: Recommendation;
}

export default function RecommendationReason({ recommendation }: RecommendationReasonProps) {
  return (
    <div className="rounded-2xl bg-white border border-[#ded2bf] px-4 py-3 shadow-sm">
      <p className="truncate text-sm font-bold text-[#7a6b4c]">
        因为你最近喜欢{recommendation.tag} + 评分较高
      </p>
    </div>
  );
}
