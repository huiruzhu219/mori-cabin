import { Coffee, MapPin, Shirt, Smile, Utensils } from "lucide-react";
import { ActiveTab } from "../../types";

const QUICK_ACTIONS = [
  { label: "心情草稿", icon: Smile, color: "text-[#8e9a86]", ring: "border-[#dfe4d8]" },
  { label: "每日食味", icon: Utensils, color: "text-[#e3a387]", ring: "border-[#f1d6ca]" },
  { label: "流动的光", icon: Coffee, color: "text-[#dda15e]", ring: "border-[#eed9bd]" },
  { label: "今日着物", icon: Shirt, color: "text-[#6d665f]", ring: "border-[#ded7ce]" },
  { label: "停留之地", icon: MapPin, color: "text-[#8b867c]", ring: "border-[#e4ddd4]" },
];

interface QuickActionsProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <section className="flex justify-between items-start gap-4 py-1 max-[520px]:gap-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon, color, ring }) => (
        <button key={label} onClick={() => onNavigate("record")} className="flex flex-col items-center gap-3 min-w-0 group">
          <span className={`w-[58px] h-[58px] rounded-full bg-white border ${ring} flex items-center justify-center shadow-[0_4px_12px_rgba(93,84,73,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_18px_rgba(93,84,73,0.1)] max-[520px]:w-12 max-[520px]:h-12 ${color}`}>
            <Icon size={28} strokeWidth={1.8} className="max-[520px]:w-5 max-[520px]:h-5" />
          </span>
          <span className="text-base font-medium text-[#7a6b4c] whitespace-nowrap max-[520px]:text-[11px]">{label}</span>
        </button>
      ))}
    </section>
  );
}
