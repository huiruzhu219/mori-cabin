import { Recommendation } from "../../types";

interface RecommendationReasonProps {
  recommendation: Recommendation;
  loading?: boolean;
}

export default function RecommendationReason({ recommendation, loading = false }: RecommendationReasonProps) {
  const reasonText =
    recommendation.reason ||
    (recommendation.reasons?.length
      ? `因为${recommendation.reasons.join(" + ")}`
      : `因为你最近喜欢${recommendation.tag} + 评分较高`);

  return (
    <div className="rounded-2xl bg-white border border-[#ded2bf] px-4 py-3 shadow-sm">
      <p className={`text-sm font-bold leading-6 ${loading ? "text-[#a0907d]" : "text-[#7a6b4c]"}`}>
        {loading ? "正在把这份推荐酝酿成更贴心的理由..." : reasonText}
      </p>
    </div>
  );
}
