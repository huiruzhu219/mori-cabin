interface RecommendToggleProps {
  type: "eat" | "drink";
  onChange: (type: "eat" | "drink") => void;
}

export default function RecommendToggle({ type, onChange }: RecommendToggleProps) {
  return (
    <div className="mx-auto w-[286px] rounded-full bg-white border border-[#ded2bf] p-1 flex gap-1 shadow-sm">
      <button
        onClick={() => onChange("eat")}
        className={`flex-1 rounded-full py-2 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(142,154,134,0.18)] ${
          type === "eat" ? "bg-[#8e9a86] text-white floating-tab" : "text-[#9f907d] hover:bg-[#f3f0e9]"
        }`}
      >
        吃点好的 🍰
      </button>
      <button
        onClick={() => onChange("drink")}
        className={`flex-1 rounded-full py-2 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(142,154,134,0.18)] ${
          type === "drink" ? "bg-[#8e9a86] text-white floating-tab" : "text-[#9f907d] hover:bg-[#f3f0e9]"
        }`}
      >
        喝杯清茶 ☕
      </button>
    </div>
  );
}
