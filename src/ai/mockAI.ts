import { DailyRecord, MoodState } from "../types";

function detectMood(text: string): { mood: MoodState; moodEmoji: string; moodText: string } {
  if (/开心|高兴|快乐|幸福|满足/.test(text)) return { mood: "happy", moodEmoji: "😊", moodText: "开心" };
  if (/平静|安静|舒服|舒心|放松/.test(text)) return { mood: "calm", moodEmoji: "😌", moodText: "舒心" };
  if (/难过|低落|失落|委屈/.test(text)) return { mood: "sad", moodEmoji: "😔", moodText: "失落" };
  if (/累|疲惫|困|崩溃/.test(text)) return { mood: "tired", moodEmoji: "😵", moodText: "疲惫" };
  return { mood: "neutral", moodEmoji: "😐", moodText: "平静" };
}

export function mockParseDiary(text: string): Partial<DailyRecord> {
  const mood = detectMood(text);
  const foodName = text.includes("蛋糕") ? "蛋糕" : text.includes("咖喱") ? "咖喱饭" : text.includes("面") ? "面" : undefined;
  const drinkName = text.includes("奶茶") ? "奶茶" : text.includes("咖啡") ? "咖啡" : text.includes("茶") ? "热茶" : undefined;
  const locationName = text.includes("公园") ? "公园" : text.includes("咖啡馆") ? "咖啡馆" : undefined;

  return {
    ...mood,
    food: foodName ? [{ id: crypto.randomUUID(), name: foodName, rating: 4, note: "这一口，值得记下。" }] : [],
    drink: drinkName ? [{ id: crypto.randomUUID(), name: drinkName, rating: 4, note: "慢慢喝完，心也安静了一点。" }] : [],
    look: /穿|搭|衣服|裙|衬衫|外套/.test(text) ? ["今日穿搭"] : [],
    location: locationName
      ? { id: crypto.randomUUID(), name: locationName, createdAt: new Date().toISOString() }
      : undefined,
    aiRawText: text,
  };
}
