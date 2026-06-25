import { useState } from "react";
import { Bell } from "lucide-react";
import { ActiveTab, JournalEntry, UserProfile } from "../types";
import FeatureCards from "./home/FeatureCards";
import HeroHouse from "./home/HeroHouse";
import ProgressCard from "./home/ProgressCard";
import QuickActions from "./home/QuickActions";

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  entries: JournalEntry[];
  todayEntry: JournalEntry;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export default function HomeView({ onNavigate, todayEntry, userProfile, onLogout }: HomeViewProps) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="space-y-4 pb-4">
      <header className="flex justify-between items-start">
        <div className="min-w-0">
          <h1 className="text-[24px] leading-none font-bold font-serif">今天也很好</h1>
          <p className="text-sm text-[#a0907d] mt-2 truncate">Hi，{userProfile?.name || "小葵"} 🌻 今天也很好</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-10 h-10 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm">
            <Bell size={18} strokeWidth={1.8} />
          </button>
          <button onClick={onLogout} className="text-xs text-[#a0907d] underline">
            退出
          </button>
        </div>
      </header>

      <HeroHouse onOpenSummary={() => setShowSummary(true)} />
      <ProgressCard todayEntry={todayEntry} />
      <QuickActions onNavigate={onNavigate} />
      <FeatureCards onNavigate={onNavigate} />

      {showSummary && (
        <div className="fixed inset-0 z-[80] bg-[#5d5449]/40 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-[#fffdf8] rounded-3xl border border-[#dfd6c5] p-5 shadow-xl max-w-xs">
            <h3 className="text-sm font-bold mb-2">今日小屋总结</h3>
            <p className="text-xs leading-6 text-[#7a6b4c]">{todayEntry?.aiReflection || "你今天也认真生活了，这就很好。"}</p>
            <button onClick={() => setShowSummary(false)} className="mt-4 w-full rounded-full bg-[#8e9a86] py-2 text-xs font-bold text-white">
              收好这句话
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
