import { useState } from "react";
import { LocateFixed, MapPin, Plus, Trash2, X } from "lucide-react";
import { LocationItem } from "../../types";

interface LocationPickerProps {
  location: string;
  locations: LocationItem[];
  onLocationChange: (value: string) => void;
  onLocationsChange: (value: LocationItem[]) => void;
}

function createLocation(name: string, lat?: number, lng?: number, city?: string): LocationItem {
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 10000)}`,
    name,
    city,
    lat,
    lng,
    tags: ["今日", "停留"],
    createdAt: new Date().toISOString(),
  };
}

export default function LocationPicker({ location, locations, onLocationChange, onLocationsChange }: LocationPickerProps) {
  const [status, setStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const addManualLocation = () => {
    const name = location.trim();
    if (!name) {
      setStatus("先写下这个地方的名字，再加入今日停留。");
      return;
    }
    onLocationsChange([...locations, createLocation(name)]);
    onLocationChange("");
    setStatus("已加入今日停留。");
  };

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      setStatus("当前浏览器不支持定位，可以先手动添加地点。");
      return;
    }

    setIsLocating(true);
    setStatus("正在请求定位权限...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const shortLat = Number(latitude.toFixed(6));
        const shortLng = Number(longitude.toFixed(6));
        setStatus("定位成功，正在识别地点名称...");

        let name = `当前位置 ${shortLat}, ${shortLng}`;
        let city = "当前位置";
        try {
          const response = await fetch("/api/geocode/reverse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: shortLat, lng: shortLng }),
          });
          const data = await response.json();
          if (data?.name) {
            name = data.name;
            city = data.city || data.address || "当前位置";
          }
        } catch (error) {
          console.warn("Reverse geocode failed", error);
        }

        const current = createLocation(name, shortLat, shortLng, city);
        onLocationsChange([...locations, current]);
        onLocationChange(current.name);
        setStatus("已识别地点名称，并加入今日停留。");
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "定位权限被拒绝了，可以在浏览器地址栏重新允许定位。"
            : error.code === error.POSITION_UNAVAILABLE
              ? "暂时拿不到当前位置，可以稍后再试或手动添加。"
              : "定位超时了，可以换个网络环境再试。";
        setStatus(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const removeLocation = (id: string) => {
    const next = locations.filter((item) => item.id !== id);
    onLocationsChange(next);
    if (!next.length) onLocationChange("");
  };

  return (
    <article className="rounded-[24px] bg-white border border-[#dfd6c5] p-7 shadow-[0_5px_14px_rgba(93,84,73,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="text-[20px] font-bold font-serif text-[#8e9a86] flex items-center gap-2">
          <MapPin size={21} strokeWidth={1.9} />
          停留之地 · LOCATION
        </h3>
        <button
          type="button"
          onClick={locateCurrentPosition}
          disabled={isLocating}
          className="rounded-full bg-[#8e9a86] px-4 py-2 text-sm font-bold text-white shadow-sm flex items-center gap-2 disabled:opacity-60"
        >
          <LocateFixed size={16} className={isLocating ? "animate-pulse" : ""} />
          {isLocating ? "定位中" : "添加定位"}
        </button>
      </div>

      <div className="relative h-48 rounded-[18px] overflow-hidden border border-[#dfd6c5] bg-[#f4efe8]">
        <div className="absolute inset-0 opacity-70 bg-[linear-gradient(30deg,transparent_0_42%,#e3d5bf_42%_45%,transparent_45%_100%),linear-gradient(145deg,transparent_0_55%,#d8e0d2_55%_58%,transparent_58%_100%),radial-gradient(circle_at_30%_32%,#e8d9bd_0_12%,transparent_13%),radial-gradient(circle_at_75%_70%,#dbe4d7_0_14%,transparent_15%)]" />
        <div className="absolute inset-0 paper-texture opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/20 to-transparent" />
        <button
          type="button"
          onClick={() => {
            onLocationChange("");
            setStatus("");
          }}
          className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/95 border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm"
        >
          <X size={16} />
        </button>
        <div className="absolute left-1/2 top-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 border border-[#dfd6c5] p-3 shadow-sm">
          <input
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="例如：静安公园 / 今天经过的小路"
            className="w-full bg-transparent text-base font-bold text-[#5d5449] text-center outline-none placeholder:text-[#b5aa9a]"
          />
          <button
            type="button"
            onClick={addManualLocation}
            className="mx-auto mt-3 rounded-full border border-[#dfd6c5] bg-[#fffdf8] px-4 py-1.5 text-sm font-bold text-[#8e9a86] flex items-center gap-1.5"
          >
            <Plus size={14} />
            加入今日停留
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-5 text-sm text-[#a0907d]">{status}</div>

      {locations.length > 0 && (
        <div className="mt-3 space-y-2">
          {locations.map((item, index) => (
            <div key={item.id} className="rounded-2xl bg-[#fffdf8] border border-[#eadfce] px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#5d5449] truncate">
                  {index + 1}. {item.name}
                </p>
                {typeof item.lat === "number" && typeof item.lng === "number" && (
                  <p className="mt-1 text-xs text-[#a0907d]">
                    {item.city ? `${item.city} · ` : ""}
                    {item.lat}, {item.lng}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => removeLocation(item.id)} className="w-8 h-8 rounded-full bg-[#f7f1e8] text-[#a0907d] flex items-center justify-center flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
