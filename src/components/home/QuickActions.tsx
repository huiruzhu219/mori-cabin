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
    <section className="flex items-start justify-between gap-1 py-1 max-w-[420px] mx-auto">
      {QUICK_ACTIONS.map(({ label, icon: Icon, color, ring }) => (
        <button key={label} onClick={() => onNavigate("record")} className="flex flex-1 flex-col items-center gap-2 min-w-0 group">
          <span className={`w-11 h-11 rounded-full bg-white border ${ring} flex items-center justify-center shadow-[0_4px_12px_rgba(93,84,73,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_18px_rgba(93,84,73,0.1)] ${color}`}>
            <Icon size={20} strokeWidth={1.8} />
          </span>
          <span className="text-[11px] font-medium text-[#7a6b4c] whitespace-nowrap">{label}</span>
        </button>
      ))}
    </section>
  );
}
