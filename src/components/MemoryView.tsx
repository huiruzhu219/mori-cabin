import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Settings, Sparkles } from "lucide-react";
import { ActiveTab, JournalEntry, UserProfile } from "../types";
import FootprintMap from "./memory/FootprintMap";
import MonthSwitcher from "./memory/MonthSwitcher";
import MoodChart from "./memory/MoodChart";
import MoodDetailView from "./memory/MoodDetailView";
import { getMoodScore } from "./memory/memoryUtils";
import AvatarImage from "./ui/AvatarImage";
import { getAudioNotes, getDrinkItems, getFoodItems, getLocationItems, getWishlistItems } from "../utils/recordItems";

interface MemoryViewProps {
  entries: JournalEntry[];
  onNavigate?: (tab: ActiveTab) => void;
  userProfile?: UserProfile | null;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function joinNames(items: Array<{ name: string }>) {
  return items.map((item) => item.name).filter(Boolean);
}

function buildLocalMonthlySummary(entries: JournalEntry[], monthLabel: string) {
  if (!entries.length) return "这个月还在等第一条记录。先从一句话、一个地点，或一段语音开始就好。";

  const foods = joinNames(entries.flatMap(getFoodItems)).slice(0, 6);
  const drinks = joinNames(entries.flatMap(getDrinkItems)).slice(0, 6);
  const locations = joinNames(entries.flatMap(getLocationItems)).slice(0, 4);
  const avgMood = entries.reduce((sum, entry) => sum + getMoodScore(entry), 0) / entries.length;
  const moodText = avgMood >= 4 ? "整体偏明亮舒展" : avgMood >= 3 ? "整体平稳" : "有些时刻需要被轻轻照顾";
  const details = [
    foods.length ? `吃过 ${foods.join("、")}` : "",
    drinks.length ? `喝过 ${drinks.join("、")}` : "",
    locations.length ? `去过 ${locations.join("、")}` : "",
  ].filter(Boolean);

  return `${monthLabel}你留下了 ${entries.length} 天生活记录，${moodText}。${details.length ? details.join("，") + "。" : ""}这些小片段拼在一起，就是这个月认真生活的痕迹。`;
}

function buildMonthlySummaryPayload(entries: JournalEntry[], monthLabel: string) {
  const moodScores = entries.map(getMoodScore);
  const averageMood = moodScores.length ? Number((moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length).toFixed(1)) : 0;

  return {
    month: monthLabel,
    stats: {
      recordedDays: entries.length,
      averageMood,
      foodCount: entries.reduce((sum, entry) => sum + getFoodItems(entry).length, 0),
      drinkCount: entries.reduce((sum, entry) => sum + getDrinkItems(entry).length, 0),
      locationCount: entries.reduce((sum, entry) => sum + getLocationItems(entry).length, 0),
      audioCount: entries.reduce((sum, entry) => sum + getAudioNotes(entry).length, 0),
      wishlistPendingCount: entries.reduce((sum, entry) => sum + getWishlistItems(entry).filter((item) => item.status === "pending").length, 0),
      wishlistDoneCount: entries.reduce((sum, entry) => sum + getWishlistItems(entry).filter((item) => item.status === "done").length, 0),
    },
    records: entries.map((entry) => ({
      date: entry.date,
      mood: entry.moodText || entry.mood,
      moodScore: getMoodScore(entry),
      foods: joinNames(getFoodItems(entry)),
      drinks: joinNames(getDrinkItems(entry)),
      locations: joinNames(getLocationItems(entry)),
      wishlist: getWishlistItems(entry).map((item) => ({ name: item.name, type: item.type, status: item.status })),
      dailyReflection: entry.aiReflection,
    })),
  };
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
    const locations = new Set(visibleEntries.flatMap((entry) => getLocationItems(entry).map((item) => item.name)));
    const avg = visibleEntries.length ? visibleEntries.reduce((sum, entry) => sum + getMoodScore(entry), 0) / visibleEntries.length : 0;
    return {
      days: visibleEntries.length,
      moments: visibleEntries.reduce((sum, entry) => sum + 1 + getFoodItems(entry).length + getDrinkItems(entry).length + getLocationItems(entry).length + getAudioNotes(entry).length, 0),
      mood: avg >= 4 ? "😊温和为主" : avg >= 3 ? "😌平稳小晴天" : "🌧需要抱抱",
      footprints: Math.max(visibleEntries.length ? 1 : 0, locations.size),
    };
  }, [visibleEntries]);

  const drinkCount = useMemo(() => visibleEntries.reduce((sum, entry) => sum + getDrinkItems(entry).length, 0), [visibleEntries]);
  const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;
  const localMonthlySummary = useMemo(() => buildLocalMonthlySummary(visibleEntries, monthKey), [monthKey, visibleEntries]);
  const [monthlyReflection, setMonthlyReflection] = useState("");
  const [monthlyReflectionLoading, setMonthlyReflectionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!visibleEntries.length) {
      setMonthlyReflection(localMonthlySummary);
      setMonthlyReflectionLoading(false);
      return;
    }

    setMonthlyReflection("");
    setMonthlyReflectionLoading(true);

    fetch("/api/ai/monthly-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildMonthlySummaryPayload(visibleEntries, monthKey)),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && typeof data?.summary === "string" && data.summary.trim()) {
          setMonthlyReflection(data.summary.trim());
        }
      })
      .catch((error) => {
        console.warn("Monthly summary fallback used", error);
        if (!cancelled) setMonthlyReflection(localMonthlySummary);
      })
      .finally(() => {
        if (!cancelled) setMonthlyReflectionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [localMonthlySummary, monthKey, visibleEntries]);

  const move = (step: number) => {
    if (!visibleEntries.length) return;
    const currentIndex = selectedDayIndex >= 0 ? selectedDayIndex : Math.max(0, Math.min(selectedIndex, visibleEntries.length - 1));
    const nextIndex = Math.min(visibleEntries.length - 1, Math.max(0, currentIndex + step));
    setSelectedDate(new Date(visibleEntries[nextIndex].date));
    setSelectedIndex(nextIndex);
  };

  if (mode === "moodDetail") {
    return <MoodDetailView entries={visibleEntries} onBack={() => setMode("month")} onSelectDate={(date) => { setSelectedDate(new Date(date)); setMode("day"); }} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <header className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarImage
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"}
            name={userProfile?.name || "小葵"}
            className="w-11 h-11 rounded-full object-cover border border-[#dfd6c5] shadow-sm flex-shrink-0"
          />
          <h1 className="text-[20px] font-bold font-serif tracking-wide min-w-0 truncate">{userProfile?.name || "小葵"} 的回忆册</h1>
        </div>
        <button onClick={() => onNavigate?.("settings")} className="w-11 h-11 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm flex-shrink-0">
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </header>

      <div className="mx-auto w-[252px] max-w-full rounded-full bg-white border border-[#ded2bf] p-1 flex gap-1 shadow-sm">
        <button onClick={() => setMode("month")} className={`flex-1 rounded-full py-1.5 text-sm font-bold ${mode === "month" ? "bg-[#8e9a86] text-white" : "text-[#9f907d]"}`}>
          统计回忆
        </button>
        <button onClick={() => setMode("day")} className={`flex-1 rounded-full py-1.5 text-sm font-bold ${mode === "day" ? "bg-[#8e9a86] text-white" : "text-[#9f907d]"}`}>
          每日手账
        </button>
      </div>

      <MonthSwitcher selectedDate={selectedDate} mode={mode === "day" ? "date" : "month"} onDateChange={setSelectedDate} />

      {mode === "month" ? (
        <section className="space-y-4">
          <article className="rounded-[24px] bg-white border border-[#ded2bf] p-5 shadow-sm rotate-[-0.35deg]">
            <div className="flex items-center gap-2 text-[#8e9a86]">
              <Sparkles size={17} />
              <span className="text-sm font-bold">AI 月度小结</span>
            </div>
            <p className="mt-3 min-h-[96px] text-[17px] leading-8 font-serif text-[#6d6358]">
              {monthlyReflectionLoading ? "正在把这个月的记录慢慢整理成一段回忆..." : monthlyReflection}
            </p>
          </article>

          <div className="rounded-full bg-white border border-[#ded2bf] px-4 py-3 text-sm font-bold text-[#7a6b4c] shadow-sm truncate">
            本月：{stats.mood} · ☕{drinkCount}杯饮品 · 📍{stats.footprints}个地点
          </div>

          <button onClick={() => setMode("moodDetail")} className="w-full rounded-[20px] bg-white border border-[#ded2bf] p-4 shadow-sm text-left">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[#8e9a86] font-serif">心情波动指引线 💛</h3>
              <span className="rounded-md bg-[#f4f5f2] px-3 py-1 text-xs font-bold text-[#9f907d]">点击查看详情 →</span>
            </div>
            <MoodChart entries={visibleEntries} />
          </button>

          <FootprintMap count={stats.footprints} />
        </section>
      ) : (
        <section className="rounded-[22px] bg-white border border-[#ded2bf] p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => move(-1)} className="w-9 h-9 rounded-full bg-[#faf6ee] flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-0">
              <p className="text-lg font-bold">{activeEntry?.date || "暂无记录"}</p>
              <p className="text-xs text-[#a0907d]">每日记录回顾</p>
            </div>
            <button onClick={() => move(1)} className="w-9 h-9 rounded-full bg-[#faf6ee] flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>

          {activeEntry ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#faf6ee] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#a0907d]">心情</p>
                  <p className="text-base font-bold">{activeEntry.moodText}</p>
                </div>
                <span className="text-4xl">{activeEntry.mood}</span>
              </div>
              <p className="text-[15px] leading-7 text-[#6d6358] font-serif">{activeEntry.aiReflection}</p>
              {getAudioNotes(activeEntry).length > 0 && (
                <div className="rounded-2xl bg-[#faf6ee] border border-[#eadfce] p-3">
                  <p className="mb-2 text-xs font-bold text-[#a0907d]">当时的声音</p>
                  <div className="space-y-2">
                    {getAudioNotes(activeEntry).map((note) => (
                      <audio key={note.id} controls src={note.dataUrl} className="w-full h-9" />
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-[#fcf9f2] p-4 text-sm leading-7">
                <p>🍽 {getFoodItems(activeEntry).map((item) => item.name).join("、") || "未记录吃的"}</p>
                <p>☕ {getDrinkItems(activeEntry).map((item) => item.name).join("、") || "未记录喝的"}</p>
                <p>📍 {(getLocationItems(activeEntry).length ? getLocationItems(activeEntry).map((item) => item.name) : ["未记录地点"]).join("、")}</p>
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
