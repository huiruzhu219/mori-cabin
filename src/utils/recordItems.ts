import { AudioNote, DrinkItem, FoodItem, JournalEntry, LocationItem, WishlistItem } from "../types";

function splitNames(value?: string) {
  return (
    value
      ?.split(/[、,，]/)
      .map((item) => item.trim())
      .filter(Boolean) || []
  );
}

function uniqueByName<T extends { name: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => {
    const key = item.name.trim();
    if (key && !map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => {
    if (item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

export function getFoodItems(entry: JournalEntry): FoodItem[] {
  const legacyItems = splitNames(entry.foodText).map((name, index) => ({
    id: `${entry.id}-food-${index}`,
    name,
    rating: entry.foodRating,
    note: entry.foodSubtext,
    image: entry.foodImage,
  }));
  return uniqueByName([...(entry.foodItems || []), ...legacyItems]);
}

export function getDrinkItems(entry: JournalEntry): DrinkItem[] {
  const legacyItems = splitNames(entry.drinkText).map((name, index) => ({
    id: `${entry.id}-drink-${index}`,
    name,
    rating: entry.drinkRating,
    note: entry.drinkSubtext,
    image: entry.drinkImage,
  }));
  return uniqueByName([...(entry.drinkItems || []), ...legacyItems]);
}

export function getAudioNotes(entry: JournalEntry): AudioNote[] {
  return uniqueById([...(entry.audioNotes || []), ...(entry.audioNote ? [entry.audioNote] : [])]);
}

export function getLocationItems(entry: JournalEntry): LocationItem[] {
  const legacyLocations = splitNames(entry.location).map((name, index) => ({
    id: `${entry.id}-location-${index}`,
    name,
    city: entry.locationCity,
    tags: entry.locationTags,
    createdAt: `${entry.date}T00:00:00.000Z`,
  }));
  return uniqueByName([...(entry.locations || []), ...legacyLocations]);
}

export function getWishlistItems(entry: JournalEntry): WishlistItem[] {
  const legacyItem =
    entry.hasHeartbeat && entry.heartbeatText
      ? [
          {
            id: `${entry.id}-wishlist-legacy`,
            name: entry.heartbeatText,
            type: "food" as const,
            note: "来自心动清单",
            image: entry.heartbeatImage,
            status: "pending" as const,
            createdAt: `${entry.date}T00:00:00.000Z`,
          },
        ]
      : [];
  const map = new Map<string, WishlistItem>();
  [...(entry.wishlistItems || []), ...legacyItem].forEach((item) => {
    const key = `${item.type}-${item.name.trim()}`;
    if (item.name.trim() && !map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
}

export function makeFoodItems(entryId: string, text: string, rating?: number, note?: string, image?: string): FoodItem[] {
  return splitNames(text).map((name, index) => ({
    id: `${entryId}-food-${Date.now()}-${index}`,
    name,
    rating,
    note,
    image,
  }));
}

export function makeDrinkItems(entryId: string, text: string, rating?: number, note?: string, image?: string): DrinkItem[] {
  return splitNames(text).map((name, index) => ({
    id: `${entryId}-drink-${Date.now()}-${index}`,
    name,
    rating,
    note,
    image,
  }));
}

export function summarizeNames(items: Array<{ name: string }>) {
  return items.map((item) => item.name).filter(Boolean).join("、");
}
