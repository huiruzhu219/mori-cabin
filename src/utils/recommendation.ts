import { DrinkItem, FoodItem, JournalEntry, Recommendation, WishlistItem } from "../types";
import { getDrinkItems, getFoodItems, getWishlistItems } from "./recordItems";

type CandidateSource = "history" | "wishlist";
type RecommendMode = "comfort" | "surprise" | "stable" | "fresh";

interface Candidate {
  id: string;
  name: string;
  type: "food" | "drink";
  rating: number;
  imageUrl: string;
  note?: string;
  source: CandidateSource;
  firstDate: string;
  lastDate: string;
  frequency: number;
  tags: string[];
  wishlist?: WishlistItem;
}

interface RecommendationOptions {
  excludeIds?: string[];
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_IMAGES = {
  food: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=900&auto=format&fit=crop",
  drink: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=900&auto=format&fit=crop",
};

function daysBetween(date: string, now: Date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 7;
  return Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / DAY_MS));
}

function normalizeRating(value?: number) {
  if (!value || Number.isNaN(value)) return 4;
  return Math.max(1, Math.min(5, value));
}

function itemKey(type: "food" | "drink", name: string) {
  return `${type}-${name.trim().toLowerCase()}`;
}

function collectHistoryCandidates(records: JournalEntry[], type: "food" | "drink") {
  const map = new Map<string, Candidate>();

  records.forEach((record) => {
    const items: Array<FoodItem | DrinkItem> = type === "food" ? getFoodItems(record) : getDrinkItems(record);
    items.forEach((item) => {
      const name = item.name.trim();
      if (!name) return;
      const key = itemKey(type, name);
      const existing = map.get(key);
      const rating = normalizeRating(item.rating);
      const tags = item.tags || [];

      if (!existing) {
        map.set(key, {
          id: item.id || key,
          name,
          type,
          rating,
          imageUrl: item.image || "",
          note: item.note,
          source: "history",
          firstDate: record.date,
          lastDate: record.date,
          frequency: 1,
          tags,
        });
        return;
      }

      const nextFrequency = existing.frequency + 1;
      map.set(key, {
        ...existing,
        id: item.id || existing.id,
        rating: (existing.rating * existing.frequency + rating) / nextFrequency,
        imageUrl: item.image || existing.imageUrl,
        note: item.note || existing.note,
        firstDate: record.date < existing.firstDate ? record.date : existing.firstDate,
        lastDate: record.date > existing.lastDate ? record.date : existing.lastDate,
        frequency: nextFrequency,
        tags: Array.from(new Set([...existing.tags, ...tags])),
      });
    });
  });

  return Array.from(map.values());
}

function collectWishlistCandidates(records: JournalEntry[], type: "food" | "drink") {
  const fulfilledKeys = new Set(
    records.flatMap((record) =>
      getWishlistItems(record)
        .filter((item) => item.status === "done")
        .map((item) => itemKey(item.type, item.name)),
    ),
  );
  const map = new Map<string, Candidate>();

  records.forEach((record) => {
    getWishlistItems(record)
      .filter((item) => item.status !== "done" && item.type === type && !fulfilledKeys.has(itemKey(item.type, item.name)))
      .forEach((item) => {
        const name = item.name.trim();
        if (!name) return;
        const key = itemKey(type, name);
        if (map.has(key)) return;
        map.set(key, {
          id: item.id,
          name,
          type,
          rating: 4.7,
          imageUrl: item.image || "",
          note: item.note,
          source: "wishlist",
          firstDate: record.date,
          lastDate: record.date,
          frequency: 0,
          tags: ["心动清单"],
          wishlist: item,
        });
      });
  });

  return Array.from(map.values());
}

function inferMode(records: JournalEntry[], now: Date): RecommendMode {
  const latest = [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  const moodText = `${latest?.mood || ""}${latest?.moodText || ""}`;
  const hour = now.getHours();

  if (/疲|累|失落|难过|😔|😵/.test(moodText)) return "comfort";
  if (hour >= 21 || hour <= 5) return "comfort";
  if (hour >= 14 && hour <= 17) return "surprise";
  if ((hour >= 11 && hour <= 13) || (hour >= 18 && hour <= 20)) return "stable";
  return "fresh";
}

function textOf(candidate: Candidate) {
  return `${candidate.name} ${candidate.note || ""} ${candidate.tags.join(" ")}`;
}

function modeScore(candidate: Candidate, mode: RecommendMode) {
  const text = textOf(candidate);
  if (mode === "comfort") {
    return /热|温|汤|咖喱|牛肉|拿铁|红茶|粥|面|饭|暖/.test(text) ? 18 : 4;
  }
  if (mode === "surprise") {
    return candidate.source === "wishlist" || candidate.frequency <= 1 ? 20 : 5;
  }
  if (mode === "stable") {
    return candidate.rating >= 4.5 ? 18 : 7;
  }
  return /冰|茶|果|柠檬|草莓|沙拉|三明治|清爽|花/.test(text) ? 18 : 6;
}

function buildReasons(candidate: Candidate, daysSince: number, mode: RecommendMode) {
  const reasons: string[] = [];

  if (candidate.source === "wishlist") reasons.push("它在心动清单里");
  if (candidate.rating >= 4.5) reasons.push("你之前评分很高");
  if (daysSince >= 14 && candidate.source === "history") reasons.push(`${daysSince}天没见它了`);
  if (mode === "comfort") reasons.push("今天更适合温柔稳妥一点");
  if (mode === "surprise") reasons.push("今天适合来点小惊喜");
  if (mode === "fresh") reasons.push("现在适合轻一点的选择");
  if (!reasons.length) reasons.push("它和你的历史偏好很接近");

  return reasons.slice(0, 3);
}

function scoreCandidate(candidate: Candidate, records: JournalEntry[], now: Date) {
  const mode = inferMode(records, now);
  const daysSince = candidate.source === "wishlist" ? daysBetween(candidate.firstDate, now) : daysBetween(candidate.lastDate, now);
  const ratingScore = candidate.rating * 15;
  const recencyScore = Math.min(30, daysSince) * 1.15;
  const wishlistBoost = candidate.source === "wishlist" ? 38 : 0;
  const frequencyPenalty = Math.min(24, candidate.frequency * 4);
  const hiddenModeScore = modeScore(candidate, mode);
  const score = ratingScore + recencyScore + wishlistBoost + hiddenModeScore - frequencyPenalty;

  return {
    candidate,
    daysSince,
    mode,
    reasons: buildReasons(candidate, daysSince, mode),
    score,
  };
}

function weightedPick<T extends { score: number }>(items: T[]) {
  const min = Math.min(...items.map((item) => item.score));
  const weighted = items.map((item) => ({ item, weight: Math.max(1, item.score - min + 8) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const entry of weighted) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.item;
  }

  return weighted[0]?.item;
}

export function getRecommendation(records: JournalEntry[], type: "food" | "drink" = "food", options: RecommendationOptions = {}): Recommendation | null {
  const now = options.now || new Date();
  const excluded = new Set(options.excludeIds || []);
  const candidates = [...collectWishlistCandidates(records, type), ...collectHistoryCandidates(records, type)].filter((item) => item.name);
  const scored = candidates
    .map((candidate) => scoreCandidate(candidate, records, now))
    .sort((a, b) => b.score - a.score);
  const pool = scored.filter((item) => !excluded.has(item.candidate.id));
  const selected = weightedPick((pool.length ? pool : scored).slice(0, 5));

  if (!selected?.candidate.name) return null;

  const { candidate, daysSince, reasons, score } = selected;
  const isWishlist = candidate.source === "wishlist";
  const roundedRating = Number(candidate.rating.toFixed(1));

  return {
    id: candidate.id,
    name: candidate.name,
    type,
    source: candidate.source,
    score: Math.round(score),
    rating: roundedRating,
    match: Math.max(78, Math.min(98, Math.round(68 + score / 2.6))),
    tag: isWishlist ? "心动备选" : reasons[0]?.replace("你之前", "").replace("它", "") || (type === "food" ? "历史偏好" : "常喝偏好"),
    lastTried: isWishlist ? "还没真正兑现" : daysSince <= 0 ? "今天刚记录过" : `${daysSince}天前`,
    historyEval: isWishlist ? "等待实现" : roundedRating >= 4.8 ? "极佳" : roundedRating >= 4.2 ? "不错" : "可以再试",
    imageUrl: candidate.imageUrl || DEFAULT_IMAGES[type],
    reason:
      candidate.note ||
      (isWishlist
        ? `你之前把 ${candidate.name} 放进了心动清单，今天抽到它，像是生活偷偷递回来的一个小选择。`
        : `你对 ${candidate.name} 的记录还不错，也有一阵子没认真想起它了。`),
    reasons,
  };
}
