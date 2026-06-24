import { BookOpen, Edit3, Home, Plus, Settings, UtensilsCrossed } from "lucide-react";
import { ActiveTab } from "../../types";

const NAV_ITEMS: Array<{ key: ActiveTab; label: string; icon: typeof Home }> = [
  { key: "home", label: "首页", icon: Home },
  { key: "record", label: "记录", icon: Edit3 },
  { key: "memory", label: "回忆", icon: BookOpen },
  { key: "recommend", label: "推荐", icon: UtensilsCrossed },
];

interface BottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="bg-white/96 backdrop-blur-md border border-[#eadfd0] h-[104px] px-14 fixed md:absolute bottom-0 left-0 right-0 z-50 flex justify-between items-center rounded-t-[24px] rounded-b-[42px] shadow-[0_-8px_28px_rgba(93,84,73,0.08)] max-[520px]:px-5">
      {NAV_ITEMS.slice(0, 2).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onNavigate(key)}
          className={`w-[74px] h-[72px] flex flex-col items-center justify-center rounded-full transition-all ${
            activeTab === key ? "bg-[#f1f3ee] border border-[#e2e5de] text-[#8e9a86] font-bold" : "text-[#aa9d8d]"
          }`}
        >
          <Icon size={25} strokeWidth={1.8} />
          <span className="text-base mt-1 max-[520px]:text-xs">{label}</span>
        </button>
      ))}

      <button
        onClick={() => onNavigate("record")}
        className="w-[66px] h-[66px] bg-[#e3a387] hover:bg-[#df9371] text-white rounded-full flex items-center justify-center shadow-[0_7px_20px_rgba(227,163,135,0.48)] active:scale-95 -translate-y-8 border-[4px] border-white"
        title="快速新增"
      >
        <Plus size={34} strokeWidth={2.6} />
      </button>

      {NAV_ITEMS.slice(2).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onNavigate(key)}
          className={`w-[74px] h-[72px] flex flex-col items-center justify-center rounded-full transition-all ${
            activeTab === key ? "bg-[#f1f3ee] border border-[#e2e5de] text-[#8e9a86] font-bold" : "text-[#aa9d8d]"
          }`}
        >
          <Icon size={25} strokeWidth={1.8} />
          <span className="text-base mt-1 max-[520px]:text-xs">{label}</span>
        </button>
      ))}

      <button
        onClick={() => onNavigate("settings")}
        className="absolute right-3 -top-11 w-8 h-8 bg-white border border-[#dfd6c5] rounded-full flex items-center justify-center text-[#a0907d] shadow-sm"
        title="设置"
      >
        <Settings size={15} />
      </button>
    </nav>
  );
}
