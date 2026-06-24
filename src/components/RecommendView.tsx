import { useEffect, useState } from "react";
import { Bookmark, Check, RotateCw, Settings } from "lucide-react";
import { ActiveTab, JournalEntry, Recommendation, UserProfile } from "../types";
import MagicCard from "./recommend/MagicCard";
import RecommendationReason from "./recommend/RecommendationReason";
import RecommendToggle from "./recommend/RecommendToggle";
import AvatarImage from "./ui/AvatarImage";
import { makeDrinkItems, makeFoodItems } from "../utils/recordItems";
import { getRecommendation } from "../utils/recommendation";

interface RecommendViewProps {
  onNavigate?: (tab: ActiveTab) => void;
  onAddEntry?: (entry: JournalEntry) => void;
  userProfile?: UserProfile | null;
  entries?: JournalEntry[];
}

const FALLBACKS: Record<"eat" | "drink", Recommendation[]> = {
  eat: [
    {
      name: "慢炖苹果牛肉咖喱饭",
      type: "food",
      rating: 4.7,
      match: 89,
      tag: "温热饱腹",
      lastTried: "22天前",
      historyEval: "极佳",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=900&auto=format&fit=crop",
      reason: "苹果的果甜正好中和了咖喱的辛香，伴随慢炖牛肉的软烂。一盘温热敦实的咖喱饭，能给你的夜晚带来满满的安全感和充实。",
    },
  ],
  drink: [
    {
      name: "桂花热红茶",
      type: "drink",
      rating: 4.7,
      match: 91,
      tag: "花香安静",
      lastTried: "14天前",
      historyEval: "舒心",
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=900&auto=format&fit=crop",
      reason: "桂花的香气轻轻的，红茶温温的。它适合陪你度过一个不用太用力的下午。",
    },
  ],
};

function buildRecommendationEntry(recommendation: Recommendation, type: "eat" | "drink"): JournalEntry {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const rating = Math.max(1, Math.min(5, Math.round(recommendation.rating)));
  const foodItems = type === "eat" ? makeFoodItems(date, recommendation.name, rating, recommendation.reason, recommendation.imageUrl) : [];
  const drinkItems = type === "drink" ? makeDrinkItems(date, recommendation.name, rating, recommendation.reason, recommendation.imageUrl) : [];

  return {
    id: date,
    date,
    dayOfWeek: weekdayNames[now.getDay()],
    dayOfMonth: now.getDate(),
    mood: "😌",
    moodText: "被照顾",
    foodText: type === "eat" ? recommendation.name : undefined,
    foodRating: type === "eat" ? rating : undefined,
    foodSubtext: type === "eat" ? recommendation.reason : undefined,
    foodImage: type === "eat" ? recommendation.imageUrl : undefined,
    foodItems,
    drinkText: type === "drink" ? recommendation.name : undefined,
    drinkRating: type === "drink" ? rating : undefined,
    drinkSubtext: type === "drink" ? recommendation.reason : undefined,
    drinkImage: type === "drink" ? recommendation.imageUrl : undefined,
    drinkItems,
    outfitImages: [],
    location: "生活小屋",
    locationCity: "今日",
    locationTags: ["推荐", recommendation.tag],
    wishlistItems: [
      {
        id: recommendation.id || `${date}-wishlist-done`,
        name: recommendation.name,
        type: type === "eat" ? "food" : "drink",
        note: "已通过推荐页兑现",
        image: recommendation.imageUrl,
        status: "done",
        createdAt: now.toISOString(),
      },
    ],
    aiReflection: `今天听从了小屋的推荐，选择了${recommendation.name}。不用纠结太久，也是一种温柔照顾自己。`,
    achievements: {
      completed: [type === "eat" ? "采纳吃的推荐" : "采纳喝的推荐", "完成一次生活选择"],
      pending: ["记下真实感受"],
    },
  };
}

export default function RecommendView({ onNavigate, onAddEntry, userProfile, entries = [] }: RecommendViewProps) {
  const [type, setType] = useState<"eat" | "drink">("eat");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadRecommendation = async (nextType = type) => {
    setLoading(true);
    setSaved(false);
    const localRecommendation = getRecommendation(entries, nextType === "eat" ? "food" : "drink");
    if (localRecommendation) {
      setRecommendation(localRecommendation);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/get-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: nextType }),
      });
      const data = await response.json();
      if (data?.recommendation) {
        setRecommendation(data.recommendation);
        return;
      }
    } catch (error) {
      console.warn("Recommendation fallback used", error);
    } finally {
      setLoading(false);
    }

    setRecommendation(FALLBACKS[nextType][0]);
  };

  useEffect(() => {
    loadRecommendation(type);
  }, [type]);

  const acceptRecommendation = () => {
    if (!recommendation) return;
    onAddEntry?.(buildRecommendationEntry(recommendation, type));
    setSaved(true);
    window.setTimeout(() => onNavigate?.("home"), 420);
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <AvatarImage
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"}
            name={userProfile?.name || "小葵"}
            className="w-12 h-12 rounded-full object-cover border border-[#dfd6c5] shadow-sm"
          />
          <h1 className="text-[24px] leading-none font-bold font-serif tracking-wide">选择困难终结者</h1>
        </div>
        <button onClick={() => onNavigate?.("settings")} className="w-[54px] h-[54px] rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm">
          <Settings size={25} strokeWidth={1.8} />
        </button>
      </header>

      <section className="text-center space-y-5 pt-6">
        <h2 className="text-[26px] font-bold font-serif tracking-wide">今天吃点/喝点什么？ ☘</h2>
        <RecommendToggle type={type} onChange={setType} />
      </section>

      {loading || !recommendation ? (
        <div className="h-80 flex flex-col items-center justify-center gap-3 text-[#a0907d]">
          <div className="w-8 h-8 rounded-full border-2 border-[#8e9a86] border-t-transparent animate-spin" />
          <p className="text-xs">正在翻找你的生活偏好...</p>
        </div>
      ) : (
        <section className="space-y-8">
          <MagicCard recommendation={recommendation} />
          <RecommendationReason recommendation={recommendation} />

          <div className="space-y-5">
            <button onClick={acceptRecommendation} className="w-full h-[60px] rounded-full bg-[#8e9a86] py-3 text-xl font-bold text-white flex items-center justify-center gap-3 shadow-sm">
              {saved ? <Check size={22} /> : <Bookmark size={22} />}
              {saved ? "已加入今日记录 ✨" : "就决定是它了！ ✨"}
            </button>
            <button onClick={() => loadRecommendation(type)} className="w-full h-[60px] rounded-full bg-white border border-[#dfd6c5] py-3 text-xl font-bold text-[#8e9a86] flex items-center justify-center gap-3 shadow-sm">
              <RotateCw size={20} />
              不中意，再转一次 🍀
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
