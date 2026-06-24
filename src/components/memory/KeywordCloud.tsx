import { Sparkles } from "lucide-react";
import { MemoryStats } from "./SummaryCards";

interface KeywordCloudProps {
  stats: MemoryStats;
}

export default function KeywordCloud({ stats }: KeywordCloudProps) {
  return (
    <section className="rounded-[24px] bg-white border border-[#ded2bf] p-7 shadow-sm">
      <div className="flex items-center gap-2 text-[#e3a387] text-base font-bold mb-3">
        <Sparkles size={18} />
        AI 月度总结
      </div>
      <p className="text-[17px] leading-9 text-[#6d6358] font-serif">
        这个月你留下了 {stats.days} 天生活碎片，也收集了 {stats.moments} 个小瞬间。整体心情像一片温和晴天，继续保持这种慢慢记录、慢慢照顾自己的节奏就很好。
      </p>
    </section>
  );
}
