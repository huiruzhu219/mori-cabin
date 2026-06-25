import { Heart } from "lucide-react";

export type MoodOption = {
  char: string;
  text: string;
};

export const MOOD_OPTIONS: MoodOption[] = [
  { char: "😊", text: "开心" },
  { char: "😌", text: "舒心" },
  { char: "😐", text: "平静" },
  { char: "😔", text: "失落" },
  { char: "😵", text: "疲惫" },
];

interface MoodSelectorProps {
  selectedMood: MoodOption;
  onChange: (mood: MoodOption) => void;
}

export default function MoodSelector({ selectedMood, onChange }: MoodSelectorProps) {
  return (
    <section className="rounded-[22px] bg-white border border-[#dfd6c5] p-4 shadow-[0_5px_14px_rgba(93,84,73,0.05)]">
      <h3 className="text-[16px] font-bold font-serif text-[#8e9a86] mb-4 flex items-center gap-2">
        <Heart size={18} strokeWidth={1.9} />
        今日心情 · MOOD
      </h3>
      <div className="flex justify-between items-start">
        {MOOD_OPTIONS.map((item) => {
          const active = selectedMood.char === item.char;
          return (
            <button key={item.char} type="button" onClick={() => onChange(item)} className="flex flex-col items-center gap-2 group">
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border transition-all duration-250 ${
                  active ? "bg-[#fff1e9] border-[#e3a387] ring-[3px] ring-[#e3a387]/60" : "bg-[#fffdf8] border-[#dfd6c5] group-hover:-translate-y-1"
                }`}
              >
                {item.char}
              </span>
              <span className={`text-xs font-bold ${active ? "text-[#c86f50]" : "text-[#a0907d]"}`}>{item.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
