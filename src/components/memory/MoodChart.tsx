import { JournalEntry } from "../../types";
import { buildPath, formatDate, getMoodScore } from "./memoryUtils";

interface MoodChartProps {
  entries: JournalEntry[];
}

export default function MoodChart({ entries }: MoodChartProps) {
  const previewEntries = entries.slice(-5);
  const points = previewEntries.map((entry, index) => ({
    entry,
    x: 56 + index * 118,
    y: 122 - (getMoodScore(entry) - 1) * 18,
  }));
  const path = buildPath(points);

  return (
    <div className="relative h-[168px] rounded-2xl border border-dashed border-[#eadfce] bg-[#fffdf8] overflow-hidden">
      <svg viewBox="0 0 560 168" className="absolute inset-0 w-full h-full">
        {path && <path d={path} fill="none" stroke="#aeb9a8" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 10" />}
      </svg>
      {points.map(({ entry, x, y }) => (
        <div
          key={entry.id}
          className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(x / 560) * 100}%`, top: `${(y / 168) * 100}%` }}
        >
          <span className="text-[32px] drop-shadow-sm">{entry.mood}</span>
          <span className="mt-0.5 text-sm font-bold text-[#a0907d]">{formatDate(entry.date)}</span>
        </div>
      ))}
    </div>
  );
}
