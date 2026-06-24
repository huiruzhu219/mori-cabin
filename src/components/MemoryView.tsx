import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { ActiveTab, JournalEntry, UserProfile } from "../types";
import FootprintMap from "./memory/FootprintMap";
import KeywordCloud from "./memory/KeywordCloud";
import MonthSwitcher from "./memory/MonthSwitcher";
import MoodChart from "./memory/MoodChart";
import MoodDetailView from "./memory/MoodDetailView";
import SummaryCards from "./memory/SummaryCards";
import { getMoodScore } from "./memory/memoryUtils";
import AvatarImage from "./ui/AvatarImage";
import { getAudioNotes, getDrinkItems, getFoodItems, getLocationItems } from "../utils/recordItems";

interface MemoryViewProps {
  entries: JournalEntry[];
  onNavigate?: (tab: ActiveTab) => void;
  userProfile?: UserProfile | null;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function MemoryView({ entries, onNavigate, userProfile }: MemoryViewProps) {
  const [mode, setMode] = useState<"month" | "day" | "moodDetail">("month");
  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);
  const latestEntryDate = sortedEntries[sortedEntries.length - 1]?.date;
  const [selectedDate, setSelectedDate] = useState(() => (latestEntryDate ? new Date(latestEntryDate) : new Date()));
  const visibleEntries = useMemo(
    () =>
      sortedEntries.filter((entry) => {
        const date = new Date(entry.date);
        return date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth();
      }),
    [selectedDate, sortedEntries],
  );
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, visibleEntries.length - 1));
  const selectedDayIndex = visibleEntries.findIndex((entry) => entry.date === toDateKey(selectedDate));
  const activeEntry = mode === "day" ? visibleEntries[selectedDayIndex] : visibleEntries[selectedIndex] || visibleEntries[visibleEntries.length - 1];

  useEffect(() => {
    setSelectedIndex(Math.max(0, visibleEntries.length - 1));
  }, [visibleEntries.length]);

  const stats = useMemo(() => {
    const locations = new Set(
      visibleEntries.flatMap((entry) => {
        return getLocationItems(entry).map((item) => item.name);
      }),
    );
    const avg = visibleEntries.length ? visibleEntries.reduce((sum, entry) => sum + getMoodScore(entry), 0) / visibleEntries.length : 0;

    return {
      days: visibleEntries.length,
      moments: visibleEntries.reduce(
        (sum, entry) => sum + 1 + getFoodItems(entry).length + getDrinkItems(entry).length + getLocationItems(entry).length + getAudioNotes(entry).length,
        0,
      ),
      mood: avg >= 4 ? "温和晴天 😊" : avg >= 3 ? "平稳小晴天 😌" : "需要抱抱 🌧",
      footprints: Math.max(visibleEntries.length ? 1 : 0, locations.size),
    };
  }, [visibleEntries]);

  const move = (step: number) => {
    if (!visibleEntries.length) return;
    if (mode === "day") {
      const currentIndex = selectedDayIndex >= 0 ? selectedDayIndex : Math.max(0, Math.min(selectedIndex, visibleEntries.length - 1));
      const nextIndex = Math.min(visibleEntries.length - 1, Math.max(0, currentIndex + step));
      setSelectedDate(new Date(visibleEntries[nextIndex].date));
      setSelectedIndex(nextIndex);
      return;
    }
    setSelectedIndex((current) => Math.min(visibleEntries.length - 1, Math.max(0, current + step)));
  };

  if (mode === "moodDetail") {
    return <MoodDetailView entries={visibleEntries} onBack={() => setMode("month")} />;
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <AvatarImage
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"}
            name={userProfile?.name || "山野雏菊"}
            className="w-12 h-12 rounded-full object-cover border border-[#dfd6c5] shadow-sm flex-shrink-0 max-[380px]:w-10 max-[380px]:h-10"
          />
          <h1 className="text-[24px] font-bold font-serif tracking-wide min-w-0 break-words max-[520px]:text-[20px] max-[380px]:text-[18px]">
            {userProfile?.name || "山野雏菊"} 🌼 的回忆册
          </h1>
        </div>
        <button onClick={() => onNavigate?.("settings")} className="w-[54px] h-[54px] rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm flex-shrink-0 max-[380px]:w-11 max-[380px]:h-11">
          <Settings size={25} strokeWidth={1.8} />
        </button>
      </header>

      <div className="mx-auto w-[312px] max-w-full rounded-full bg-white border border-[#ded2bf] p-1 flex gap-1 shadow-sm">
        <button onClick={() => setMode("month")} className={`flex-1 rounded-full py-2 text-lg font-bold ${mode === "month" ? "bg-[#8e9a86] text-white" : "text-[#9f907d]"}`}>
          统计回忆 🌌
        </button>
        <button onClick={() => setMode("day")} className={`flex-1 rounded-full py-2 text-lg font-bold ${mode === "day" ? "bg-[#8e9a86] text-white" : "text-[#9f907d]"}`}>
          每日手账 🌸
        </button>
      </div>

      <MonthSwitcher selectedDate={selectedDate} mode={mode === "day" ? "date" : "month"} onDateChange={setSelectedDate} />

      {mode === "month" ? (
        <>
          <SummaryCards stats={stats} />

          <button onClick={() => setMode("moodDetail")} className="w-full rounded-[24px] bg-white border border-[#ded2bf] p-7 shadow-sm text-left">
            <div className="flex items-center justify-between mb-6 gap-3 max-[380px]:flex-col max-[380px]:items-start">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#8e9a86] font-serif">心情波动指引线 🧡</h3>
              </div>
              <span className="rounded-md bg-[#f4f5f2] px-3 py-1 text-sm font-bold text-[#9f907d] max-[380px]:text-xs">点击查看详情 →</span>
            </div>
            <MoodChart entries={visibleEntries} />
            <p className="mt-6 text-center text-base text-[#a0907d] italic font-serif">“点击此部分进入情绪流回看，细阅每一次心情浮沉。”</p>
          </button>

          <KeywordCloud stats={stats} />
          <FootprintMap count={stats.footprints} />
        </>
      ) : (
        <section className="rounded-[24px] bg-white border border-[#ded2bf] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => move(-1)} className="w-10 h-10 rounded-full bg-[#faf6ee] flex items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <p className="text-xl font-bold">{activeEntry?.date || "暂无记录"}</p>
              <p className="text-sm text-[#a0907d]">每日记录回顾</p>
            </div>
            <button onClick={() => move(1)} className="w-10 h-10 rounded-full bg-[#faf6ee] flex items-center justify-center">
              <ChevronRight size={20} />
            </button>
          </div>

          {activeEntry ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#faf6ee] p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a0907d]">心情</p>
                  <p className="text-lg font-bold">{activeEntry.moodText}</p>
                </div>
                <span className="text-5xl">{activeEntry.mood}</span>
              </div>
              <p className="text-[17px] leading-9 text-[#6d6358] font-serif">{activeEntry.aiReflection}</p>
              {getAudioNotes(activeEntry).length > 0 && (
                <div className="rounded-2xl bg-[#faf6ee] border border-[#eadfce] p-4">
                  <p className="mb-2 text-sm font-bold text-[#a0907d]">当时的声音</p>
                  <div className="space-y-2">
                    {getAudioNotes(activeEntry).map((note) => (
                      <audio key={note.id} controls src={note.dataUrl} className="w-full h-9" />
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 max-[380px]:grid-cols-1">
                <div className="rounded-2xl bg-[#fcf9f2] p-4">
                  <p className="text-sm text-[#a0907d]">吃的</p>
                  <p className="text-base font-bold mt-1">{getFoodItems(activeEntry).map((item) => item.name).join("、") || "未记录"}</p>
                </div>
                <div className="rounded-2xl bg-[#fcf9f2] p-4">
                  <p className="text-sm text-[#a0907d]">喝的</p>
                  <p className="text-base font-bold mt-1">{getDrinkItems(activeEntry).map((item) => item.name).join("、") || "未记录"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#fcf9f2] p-4">
                <p className="text-sm text-[#a0907d]">停留之地</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(getLocationItems(activeEntry).length ? getLocationItems(activeEntry).map((item) => item.name) : ["未记录"]).map((name) => (
                    <span key={name} className="rounded-full border border-[#dfd6c5] bg-white px-3 py-1 text-sm font-bold text-[#7a6b4c]">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-[#a0907d]">还没有记录，先去写一条今日小记吧。</p>
          )}
        </section>
      )}
    </div>
  );
}
