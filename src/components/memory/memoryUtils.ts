import { JournalEntry } from "../../types";

export const MOOD_SCORES: Record<string, number> = {
  "😵": 1,
  "😔": 2,
  "😐": 3,
  "😌": 4,
  "😊": 5,
  "馃樀": 1,
  "馃様": 2,
  "馃槓": 3,
  "馃槍": 4,
  "馃槉": 5,
};

export const SCORE_LABELS = [
  { score: 5, label: "欢喜", emoji: "😊" },
  { score: 4, label: "舒适", emoji: "😌" },
  { score: 3, label: "平温", emoji: "😐" },
  { score: 2, label: "低迷", emoji: "😔" },
  { score: 1, label: "疲劳", emoji: "😵" },
];

export function getMoodScore(entry: JournalEntry) {
  return MOOD_SCORES[entry.mood] || 3;
}

export function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${month || "06"}/${day || "23"}`;
}

export function weekdayName(day: string) {
  const map: Record<string, string> = {
    Mon: "周一",
    Tue: "周二",
    Wed: "周三",
    Thu: "周四",
    Fri: "周五",
    Sat: "周六",
    Sun: "周日",
  };
  return map[day] || day;
}

export function buildPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const midX = (prev.x + next.x) / 2;
    path += ` C ${midX} ${prev.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}
