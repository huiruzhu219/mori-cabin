import { JournalEntry } from "../../types";

interface ProgressCardProps {
  todayEntry: JournalEntry;
}

export default function ProgressCard({ todayEntry }: ProgressCardProps) {
  const completed = todayEntry?.achievements?.completed?.length || 0;
  const pending = todayEntry?.achievements?.pending?.length || 0;
  const progress = Math.min(100, Math.round((completed / Math.max(1, completed + pending)) * 100));

  return (
    <section className="rounded-2xl bg-white border border-[#dfd6c5] p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">今日进度</h3>
        <span className="text-sm font-bold text-[#8e9a86]">
          {completed}/{Math.max(1, completed + pending)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-[#f4eadb] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#e3a387] to-[#8e9a86]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(todayEntry?.achievements?.completed || ["写下一条记录"]).map((item) => (
          <span key={item} className="rounded-full bg-[#8e9a86]/10 px-2.5 py-1 text-[10px] font-bold text-[#7e8a76]">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
