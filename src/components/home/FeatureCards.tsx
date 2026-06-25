import { Sparkles } from "lucide-react";
import { ActiveTab } from "../../types";

interface FeatureCardsProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function FeatureCards({ onNavigate }: FeatureCardsProps) {
  return (
    <section>
      <button onClick={() => onNavigate("recommend")} className="w-full min-h-[92px] rounded-[22px] bg-white border border-[#dfd6c5] p-4 text-left shadow-sm rotate-[-0.6deg] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3ec] px-3 py-1 text-[11px] font-bold text-[#c86f50]">
            <Sparkles size={13} /> 今日推荐
          </span>
          <h3 className="mt-2 text-base font-bold">帮我选一个</h3>
          <p className="mt-1 text-xs text-[#a0907d] truncate">从你的记录和心动清单里抽一个惊喜</p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-[#8e9a86] px-4 py-2 text-xs font-bold text-white">去看看</span>
      </button>
    </section>
  );
}
