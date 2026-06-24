import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSwitcherProps {
  selectedDate: Date;
  mode: "month" | "date";
  onDateChange: (date: Date) => void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prefix = firstDay.getDay();
  return [
    ...Array.from({ length: prefix }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

export default function MonthSwitcher({ selectedDate, mode, onDateChange }: MonthSwitcherProps) {
  const [open, setOpen] = useState(false);
  const days = useMemo(() => buildCalendarDays(selectedDate), [selectedDate]);
  const label =
    mode === "month"
      ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
      : `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`;

  const move = (step: number) => {
    if (mode === "month") {
      onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + step, 1));
      return;
    }
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + step));
  };

  const moveYear = (step: number) => {
    onDateChange(new Date(selectedDate.getFullYear() + step, selectedDate.getMonth(), mode === "month" ? 1 : selectedDate.getDate()));
  };

  return (
    <section className="relative rounded-[24px] bg-white border border-[#ded2bf] p-3 shadow-sm flex items-center gap-5">
      <button type="button" onClick={() => move(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-[#9f907d]">
        <ChevronLeft size={26} />
      </button>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex-1 h-12 rounded-2xl border border-[#dfd6c5] bg-[#fffdf8] flex items-center justify-between px-5 text-left"
      >
        <span className="flex items-center gap-3 text-xl font-bold">
          <Calendar size={21} className="text-[#8e9a86]" />
          {label}
        </span>
        <span className="rounded-full bg-[#eef1eb] px-3 py-1 text-sm font-bold text-[#8e9a86]">{open ? "收起⌃" : mode === "month" ? "年月⌄" : "日期⌄"}</span>
      </button>
      <button type="button" onClick={() => move(1)} className="w-10 h-10 rounded-full flex items-center justify-center text-[#9f907d]">
        <ChevronRight size={26} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-[76px] z-40 rounded-[24px] border border-[#ded2bf] bg-[#fffdf8]/98 p-4 shadow-[0_16px_32px_rgba(93,84,73,0.13)] backdrop-blur">
          {mode === "month" ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => moveYear(-1)} className="rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-sm font-bold text-[#9f907d]">
                  上一年
                </button>
                <span className="text-lg font-bold font-serif text-[#5d5449]">{selectedDate.getFullYear()}年</span>
                <button type="button" onClick={() => moveYear(1)} className="rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-sm font-bold text-[#9f907d]">
                  下一年
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      onDateChange(new Date(selectedDate.getFullYear(), index, 1));
                      setOpen(false);
                    }}
                    className={`h-14 rounded-2xl text-sm font-bold transition-all ${
                      index === selectedDate.getMonth()
                        ? "bg-[#8e9a86] text-white shadow-[0_6px_14px_rgba(142,154,134,0.24)]"
                        : "bg-white border border-[#eadfce] text-[#7a6b4c] hover:-translate-y-0.5 hover:bg-[#f7f3ee]"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#a0907d]">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((day, index) =>
                  day ? (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        onDateChange(day);
                        setOpen(false);
                      }}
                      className={`aspect-square rounded-2xl text-sm font-bold transition-all ${
                        sameDay(day, selectedDate)
                          ? "bg-[#8e9a86] text-white shadow-[0_6px_14px_rgba(142,154,134,0.24)]"
                          : "bg-white border border-[#eadfce] text-[#7a6b4c] hover:-translate-y-0.5 hover:bg-[#f7f3ee]"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
