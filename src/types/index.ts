export type ActiveTab = "home" | "record" | "memory" | "recommend" | "settings";

export type MoodState = "happy" | "calm" | "neutral" | "sad" | "tired";

export interface FoodItem {
  id: string;
  name: string;
  rating?: number;
  note?: string;
  image?: string;
  tags?: string[];
}

export interface DrinkItem {
  id: string;
  name: string;
  rating?: number;
  note?: string;
  image?: string;
  tags?: string[];
}

export interface LocationItem {
  id: string;
  name: string;
  city?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  image?: string;
  createdAt: string;
}

export interface AudioNote {
  id: string;
  dataUrl: string;
  mimeType: string;
  durationSeconds: number;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  type: "food" | "drink";
  note?: string;
  image?: string;
  status: "pending" | "done";
  createdAt: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  mood?: MoodState;
  moodEmoji?: string;
  moodText?: string;
  food?: FoodItem[];
  drink?: DrinkItem[];
  look?: string[];
  location?: LocationItem;
  locations?: LocationItem[];
  audioNote?: AudioNote;
  aiRawText?: string;
  aiReflection?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  dayOfMonth: number;
  mood: string;
  moodText: string;
  foodText?: string;
  foodRating?: number;
  foodSubtext?: string;
  foodImage?: string;
  foodItems?: FoodItem[];
  drinkText?: string;
  drinkRating?: number;
  drinkSubtext?: string;
  drinkImage?: string;
  drinkItems?: DrinkItem[];
  hasHeartbeat?: boolean;
  heartbeatText?: string;
  heartbeatImage?: string;
  heartbeatTags?: string[];
  wishlistItems?: WishlistItem[];
  outfitImages: string[];
  outfitText?: string;
  outfitRating?: number;
  outfitSubtext?: string;
  location?: string;
  locations?: LocationItem[];
  audioNote?: AudioNote;
  audioNotes?: AudioNote[];
  locationCity?: string;
  locationImage?: string;
  locationTags?: string[];
  aiReflection?: string;
  achievements?: {
    completed: string[];
    pending: string[];
  };
}

export interface Recommendation {
  id?: string;
  name: string;
  type?: "food" | "drink";
  score?: number;
  rating: number;
  match: number;
  tag: string;
  lastTried: string;
  historyEval: string;
  imageUrl: string;
  reason: string;
  reasons?: string[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio?: string;
  phoneNumber?: string;
  isWeChatUser?: boolean;
}
