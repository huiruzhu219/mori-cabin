import { JournalEntry } from "../../types";

interface ProgressCardProps {
  todayEntry: JournalEntry;
}

export default function ProgressCard({ todayEntry }: ProgressCardProps) {
  const completed = todayEntry?.achievements?.completed?.length || 0;
  const pending = todayEntry?.achievements?.pending?.length || 0;
  const progress = Math.min(100, Math.round((completed / Math.max(1, completed + pending)) * 100));

  return (
    <section className="rounded-full bg-white border border-[#dfd6c5] px-4 py-3 shadow-sm">
      <div className="flex justify-between items-center gap-3">
        <h3 className="text-sm font-bold whitespace-nowrap">今日进度</h3>
        <div className="h-2 flex-1 rounded-full bg-[#f4eadb] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e3a387] to-[#8e9a86]" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm font-bold text-[#8e9a86]">
          {completed}/{Math.max(1, completed + pending)}
        </span>
      </div>
    </section>
  );
}
