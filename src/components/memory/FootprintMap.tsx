import { MapPin } from "lucide-react";

interface FootprintMapProps {
  count: number;
}

export default function FootprintMap({ count }: FootprintMapProps) {
  return (
    <section className="rounded-[24px] bg-white border border-[#ded2bf] overflow-hidden shadow-sm">
      <div className="p-5 flex justify-between items-center border-b border-[#dfd6c5]">
        <h3 className="text-base font-bold flex items-center gap-2">
          <MapPin size={18} className="text-[#8e9a86]" />
          足迹分布
        </h3>
        <span className="text-sm text-[#a0907d]">{count} 处停留</span>
      </div>
      <div className="h-44 relative overflow-hidden bg-[#f5efe4]">
        <div className="absolute inset-0 opacity-80 bg-[linear-gradient(28deg,transparent_0_42%,#e3d5bf_42%_45%,transparent_45%_100%),linear-gradient(145deg,transparent_0_55%,#d8e0d2_55%_58%,transparent_58%_100%),radial-gradient(circle_at_22%_28%,#e8d9bd_0_10%,transparent_11%),radial-gradient(circle_at_76%_68%,#dbe4d7_0_12%,transparent_13%)]" />
        <div className="absolute inset-0 paper-texture opacity-35" />
        <MapPin className="absolute top-10 left-28 text-[#e3a387] fill-[#e3a387]/20" size={30} />
        <MapPin className="absolute bottom-9 right-32 text-[#8e9a86] fill-[#8e9a86]/20" size={30} />
      </div>
    </section>
  );
}
