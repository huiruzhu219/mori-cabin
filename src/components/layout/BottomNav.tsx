import { BookOpen, Home, Plus, Settings, UtensilsCrossed } from "lucide-react";
import { ActiveTab } from "../../types";

const SIDE_TABS: Array<{ key: ActiveTab; label: string; icon: typeof Home }> = [
  { key: "home", label: "首页", icon: Home },
  { key: "memory", label: "回忆", icon: BookOpen },
  { key: "recommend", label: "推荐", icon: UtensilsCrossed },
  { key: "settings", label: "设置", icon: Settings },
];

interface BottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const renderTab = (item: (typeof SIDE_TABS)[number]) => {
    const active = activeTab === item.key;
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => onNavigate(item.key)}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors max-[520px]:py-1.5 ${
          active ? "text-[#8e9a86]" : "text-[#aa9d8d]"
        }`}
      >
        <Icon size={23} strokeWidth={active ? 2.2 : 1.8} className="max-[520px]:h-[21px] max-[520px]:w-[21px]" />
        <span className={`text-[13px] leading-none max-[520px]:text-[11px] ${active ? "font-bold" : "font-medium"}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[672px] bg-white/95 backdrop-blur-md border-t border-[#eadfd0] rounded-t-[24px] shadow-[0_-6px_24px_rgba(93,84,73,0.1)] px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] max-[520px]:rounded-t-[20px]">
        <div className="flex items-end">
          {renderTab(SIDE_TABS[0])}
          {renderTab(SIDE_TABS[1])}
          <div className="flex flex-1 flex-col items-center justify-end pb-1">
            <button
              onClick={() => onNavigate("record")}
              className="-mt-7 h-[56px] w-[56px] rounded-full bg-[#e3a387] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(227,163,135,0.45)] active:scale-95 border-[3px] border-white transition-transform max-[520px]:h-[48px] max-[520px]:w-[48px] max-[520px]:-mt-6"
              title="快速记录"
            >
              <Plus size={28} strokeWidth={2.6} className="max-[520px]:h-6 max-[520px]:w-6" />
            </button>
            <span className="mt-1 text-[11px] leading-none text-[#aa9d8d] max-[520px]:hidden">记录</span>
          </div>
          {renderTab(SIDE_TABS[2])}
          {renderTab(SIDE_TABS[3])}
        </div>
      </div>
    </nav>
  );
}
