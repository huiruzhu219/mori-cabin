import { BarChart2, BookOpen, Sparkles } from "lucide-react";
import { ActiveTab } from "../../types";

interface FeatureCardsProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function FeatureCards({ onNavigate }: FeatureCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3">
      <button onClick={() => onNavigate("recommend")} className="h-36 rounded-2xl bg-white border border-[#dfd6c5] p-4 text-left shadow-sm rotate-[-1deg]">
        <Sparkles size={18} className="text-[#e3a387]" />
        <h3 className="mt-3 text-sm font-bold">帮我选一个</h3>
        <p className="mt-1 text-[10px] text-[#a0907d]">吃什么喝什么都可以交给小屋</p>
      </button>
      <div className="space-y-3">
        <button onClick={() => onNavigate("memory")} className="w-full h-[66px] rounded-2xl bg-white border border-[#dfd6c5] p-3 text-left shadow-sm">
          <BookOpen size={16} className="text-[#8e9a86]" />
          <span className="block mt-1 text-xs font-bold">生活回忆册</span>
        </button>
        <button onClick={() => onNavigate("memory")} className="w-full h-[66px] rounded-2xl bg-[#f7fbfa] border border-[#d7e7e3] p-3 text-left shadow-sm">
          <BarChart2 size={16} className="text-[#6f9b91]" />
          <span className="block mt-1 text-xs font-bold">今日统计</span>
        </button>
      </div>
    </section>
  );
}
