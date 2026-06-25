import { ArrowLeft, TrendingUp } from "lucide-react";
import { JournalEntry } from "../../types";
import { getAudioNotes, getDrinkItems, getFoodItems, getLocationItems } from "../../utils/recordItems";
import { buildPath, formatDate, getMoodScore, SCORE_LABELS, weekdayName } from "./memoryUtils";

interface MoodDetailViewProps {
  entries: JournalEntry[];
  onBack: () => void;
}

export default function MoodDetailView({ entries, onBack }: MoodDetailViewProps) {
  const sortedEntries = entries.length ? entries : [];
  const xStep = 104;
  const chartWidth = Math.max(500, sortedEntries.length * xStep + 92);
  const points = sortedEntries.map((entry, index) => ({
    entry,
    x: 54 + index * xStep,
    y: 248 - (getMoodScore(entry) - 1) * 42,
  }));
  const path = buildPath(points);

  return (
    <div className="space-y-5 pb-8">
      <header className="flex items-start gap-3">
        <button onClick={onBack} className="mt-1 w-12 h-12 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm flex-shrink-0">
          <ArrowLeft size={23} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold font-serif tracking-wide max-[380px]:text-[21px]">回看 · 情绪起伏 🍃</h1>
          <p className="mt-1 text-sm text-[#a0907d] font-serif">“浮生慢日，倾听心底细碎的回响”</p>
        </div>
      </header>

      <section className="rounded-[24px] bg-white border border-[#ded2bf] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="min-w-0 text-base font-bold text-[#8e9a86] flex items-center gap-2">
            <TrendingUp size={18} />
            情绪波动详细曲线
          </h2>
          <span className="flex-shrink-0 rounded-full bg-[#eef1eb] px-3 py-1 text-sm font-bold text-[#8e9a86]">{sortedEntries.length} 次记录</span>
        </div>

        <div className="relative rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf8] p-2 overflow-hidden">
          <div className="absolute left-2 top-8 bottom-12 z-10 w-6 flex flex-col justify-between text-[13px] font-bold text-[#9f907d]">
            {SCORE_LABELS.map((item) => (
              <span key={item.score} className="flex flex-col items-center leading-tight">
                <span>{item.emoji}</span>
              </span>
            ))}
          </div>

          <div className="ml-7 overflow-x-auto no-scrollbar pb-2">
            <div className="relative h-[292px]" style={{ width: chartWidth }}>
              <div className="absolute inset-x-0 top-8 bottom-14 flex flex-col justify-between">
                {SCORE_LABELS.map((item) => (
                  <div key={item.score} className="border-t border-dashed border-[#eee7db]" />
                ))}
              </div>

              <svg className="absolute inset-0" width={chartWidth} height="292">
                {path && <path d={path} fill="none" stroke="#aeb9a8" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />}
                {points.map((point) => (
                  <line key={point.entry.id} x1={point.x} y1={point.y + 34} x2={point.x} y2="252" stroke="#eadfce" strokeDasharray="4 6" />
                ))}
              </svg>

              {points.map(({ entry, x, y }) => (
                <button key={entry.id} className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
                  <span className="w-[54px] h-[54px] rounded-full bg-white border border-[#dfd6c5] shadow-[0_5px_14px_rgba(93,84,73,0.08)] flex items-center justify-center text-[30px]">
                    {entry.mood}
                  </span>
                  <span className="mt-1 rounded-md bg-white/90 px-2 py-0.5 text-base font-bold text-[#9f907d]">{formatDate(entry.date)}</span>
                  <span className="text-xs text-[#b5aa9a]">{entry.dayOfWeek}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-7 text-center text-base text-[#a0907d] italic font-serif">← 左右滑动查阅历史完整轨迹（可点击各心情圆点） →</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#8e9a86] font-serif">细碎的生活流影 · DIARY LOGS</h2>
        {[...sortedEntries].reverse().map((entry) => (
          <button key={entry.id} className="w-full rounded-[22px] bg-white border border-[#8e9a86] border-l-[6px] p-6 text-left shadow-sm flex items-center justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold font-serif">{entry.date.replace(/-/g, "/")}</span>
                <span className="rounded-md bg-[#f5efe8] px-3 py-1 text-sm font-bold text-[#9f907d]">{weekdayName(entry.dayOfWeek)}</span>
              </div>
              <p className="text-base leading-7 text-[#6d6358] truncate">
                🍽️ {getFoodItems(entry).map((item) => item.name).join("、") || "未记录"}{" "}
                {entry.foodRating ? `（打分 ${entry.foodRating}★）` : ""} · {entry.foodSubtext || "这一口，值得记下。"}
              </p>
              <p className="text-base leading-7 text-[#6d6358] truncate">
                ☕ {getDrinkItems(entry).map((item) => item.name).join("、") || "未记录"}{" "}
                {entry.drinkRating ? `（打分 ${entry.drinkRating}★）` : ""} · {entry.drinkSubtext || "慢慢喝完，心也安静。"}
              </p>
              {entry.outfitText && <p className="text-base leading-7 text-[#6d6358] truncate">👗 {entry.outfitText} {entry.outfitRating ? `（打分 ${entry.outfitRating}★）` : ""} · {entry.outfitSubtext || "今日穿搭记录。"}</p>}
              <p className="text-sm leading-7 text-[#a0907d] italic truncate">
                📍 漫步于 {getLocationItems(entry).map((item) => item.name).join("、") || "某个温柔角落"}
              </p>
              {getAudioNotes(entry).length > 0 && (
                <div className="mt-3 max-w-[360px] rounded-2xl bg-[#faf6ee] border border-[#eadfce] px-3 py-2">
                  <p className="mb-1 text-xs font-bold text-[#a0907d]">当时的声音</p>
                  <div className="space-y-2">
                    {getAudioNotes(entry).map((note) => (
                      <audio key={note.id} controls src={note.dataUrl} className="w-full h-8" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-[116px] h-[96px] rounded-2xl bg-[#fffdf8] border border-[#dfd6c5] flex-shrink-0 flex flex-col items-center justify-center">
              <span className="text-[38px]">{entry.mood}</span>
              <span className="mt-1 text-sm font-bold text-[#a0907d]">{entry.moodText}</span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
