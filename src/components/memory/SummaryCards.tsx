export interface MemoryStats {
  days: number;
  moments: number;
  mood: string;
  footprints: number;
}

interface SummaryCardsProps {
  stats: MemoryStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    ["手账记事", `${stats.days}`, "天", "text-[#8e9a86]", "-rotate-[1.8deg] origin-bottom-right"],
    ["收集瞬间", `${stats.moments}`, "个", "text-[#e3a387]", "rotate-[1.8deg] origin-bottom-left"],
    ["平均心情", stats.mood, "", "text-[#8e9a86]", "-rotate-[1.4deg] origin-top-right"],
    ["停留地段", `${stats.footprints}`, "处", "text-[#d96e15]", "rotate-[1.4deg] origin-top-left"],
  ];

  return (
    <section className="grid grid-cols-2 gap-5">
      {cards.map(([label, value, unit, color, tilt]) => (
        <div
          key={label}
          className={`h-[140px] rounded-[22px] bg-white border border-[#ded2bf] p-6 shadow-[0_5px_14px_rgba(93,84,73,0.05)] transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ${tilt}`}
        >
          <p className="text-base font-bold text-[#a0907d] font-serif">{label}</p>
          <p className={`mt-8 font-bold ${color} ${label === "平均心情" ? "text-xl" : "text-[34px] font-serif"}`}>
            {label === "平均心情" ? "🌿 " : ""}
            {value}
            <span className="ml-2 text-lg text-[#7a6b4c]">{unit}</span>
          </p>
        </div>
      ))}
    </section>
  );
}
