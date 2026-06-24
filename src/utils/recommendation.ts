import { JournalEntry, Recommendation } from "../types";
import { getDrinkItems, getFoodItems, getWishlistItems } from "./recordItems";

export function getRecommendation(records: JournalEntry[], type: "food" | "drink" = "food"): Recommendation | null {
  const fulfilledWishlistKeys = new Set(
    records.flatMap((record) =>
      getWishlistItems(record)
        .filter((item) => item.status === "done")
        .map((item) => `${item.type}-${item.name}`),
    ),
  );

  const historyCandidates = records
    .flatMap((record) =>
      (type === "food" ? getFoodItems(record) : getDrinkItems(record)).map((item) => ({
        id: item.id || record.id,
        name: item.name,
        rating: item.rating || 0,
        imageUrl: item.image || "",
        note: item.note,
        source: "history" as const,
      })),
    )
    .filter((item) => item.name);

  const wishlistCandidates = records
    .flatMap((record) =>
      getWishlistItems(record)
        .filter((item) => item.status !== "done" && item.type === type && !fulfilledWishlistKeys.has(`${item.type}-${item.name}`))
        .map((item) => ({
          id: item.id,
          name: item.name,
          rating: 4.6,
          imageUrl: item.image || "",
          note: item.note,
          source: "wishlist" as const,
        })),
    )
    .filter((item) => item.name);

  const candidates = [...wishlistCandidates, ...historyCandidates];
  const best = candidates.sort((a, b) => {
    if (a.source !== b.source) return a.source === "wishlist" ? -1 : 1;
    return b.rating - a.rating;
  })[0];
  if (!best?.name) return null;

  const isWishlist = best.source === "wishlist";

  return {
    id: best.id,
    name: best.name,
    type,
    score: best.rating,
    rating: best.rating,
    match: Math.min(98, 70 + best.rating * 5),
    tag: isWishlist ? "心动备选" : type === "food" ? "历史高分" : "常喝偏好",
    lastTried: isWishlist ? "曾经想过，但还没兑现" : "来自历史记录",
    historyEval: isWishlist ? "等待实现" : best.rating >= 5 ? "极佳" : "不错",
    imageUrl: best.imageUrl,
    reason:
      best.note ||
      (isWishlist
        ? `你之前把 ${best.name} 放进了心动清单，今天抽到它，像是生活偷偷递回来的一个小选择。`
        : "你最近喜欢，评分也不错，适合今天再试一次。"),
    reasons: isWishlist ? ["来自心动清单", "还没有真正吃/喝到", "适合给今天一点惊喜"] : ["你最近喜欢", "历史评分较高", "来自你的生活记录"],
  };
}
