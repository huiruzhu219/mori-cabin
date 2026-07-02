import { Recommendation } from "../../types";

interface RecommendationReasonProps {
  recommendation: Recommendation;
}

export default function RecommendationReason({ recommendation }: RecommendationReasonProps) {
  const reasonText =
    recommendation.reason ||
    (recommendation.reasons?.length
      ? `因为${recommendation.reasons.join(" + ")}`
      : `因为你最近喜欢${recommendation.tag} + 评分较高`);

  return (
    <div className="rounded-2xl bg-white border border-[#ded2bf] px-4 py-3 shadow-sm">
      <p className="text-sm font-bold leading-6 text-[#7a6b4c]">
        {reasonText}
      </p>
    </div>
  );
}
