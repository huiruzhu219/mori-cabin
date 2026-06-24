import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import BottomNav from "./components/layout/BottomNav";
import PageContainer from "./components/layout/PageContainer";
import HomeView from "./pages/HomeView";
import LoginView from "./pages/LoginView";
import MemoryView from "./pages/MemoryView";
import RecommendView from "./pages/RecommendView";
import RecordView from "./pages/RecordView";
import SettingsView from "./pages/SettingsView";
import { INITIAL_ENTRIES } from "./mockData";
import { ActiveTab, JournalEntry, LocationItem, UserProfile } from "./types";
import { getAudioNotes, getDrinkItems, getFoodItems, summarizeNames } from "./utils/recordItems";
import { removeStorage, STORAGE_KEYS, writeStorage } from "./utils/storage";

const DEFAULT_TEXT_VALUES = new Set([
  "治愈的一餐",
  "这一口，是治愈的味道...",
  "午后温热",
  "热茶暖胃，咖啡醒神 ☕",
  "松弛感穿搭",
  "今日松弛感拉满 🍃",
  "西湖畔的小书店",
  "生活小屋附近",
  "想去吹吹晚风，放空自己...",
]);

const DEFAULT_IMAGE_VALUES = new Set([
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=360&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=360&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=360&auto=format&fit=crop",
]);

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function uniqueStrings(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  );
}

function splitLocationNames(value?: string) {
  return value
    ?.split("、")
    .map((item) => item.trim())
    .filter(Boolean) || [];
}

function chooseText(existing?: string, incoming?: string) {
  if (!existing) return incoming;
  if (!incoming) return existing;
  if (DEFAULT_TEXT_VALUES.has(incoming) && !DEFAULT_TEXT_VALUES.has(existing)) return existing;
  return incoming;
}

function chooseImage(existing?: string, incoming?: string) {
  if (!existing) return incoming;
  if (!incoming) return existing;
  if (DEFAULT_IMAGE_VALUES.has(incoming) && !DEFAULT_IMAGE_VALUES.has(existing)) return existing;
  return incoming;
}

function mergeLocations(existing: LocationItem[] = [], incoming: LocationItem[] = []) {
  const map = new Map<string, LocationItem>();
  [...existing, ...incoming].forEach((location) => {
    const key = location.id || `${location.name}-${location.lat ?? ""}-${location.lng ?? ""}-${location.createdAt}`;
    map.set(key, location);
  });
  return Array.from(map.values());
}

function mergeNamedItems<T extends { name: string }>(existing: T[], incoming: T[]) {
  const map = new Map<string, T>();
  [...existing, ...incoming].forEach((item) => {
    const key = item.name.trim();
    if (!key) return;
    map.set(key, { ...map.get(key), ...item });
  });
  return Array.from(map.values());
}

function mergeAudioNotes(existing: JournalEntry, incoming: JournalEntry) {
  const map = new Map<string, NonNullable<JournalEntry["audioNote"]>>();
  [...getAudioNotes(existing), ...getAudioNotes(incoming)].forEach((note) => map.set(note.id, note));
  return Array.from(map.values());
}

function mergeEntry(existing: JournalEntry | undefined, incoming: JournalEntry) {
  if (!existing) return incoming;

  const locations = mergeLocations(existing.locations, incoming.locations);
  const foodItems = mergeNamedItems(getFoodItems(existing), getFoodItems(incoming));
  const drinkItems = mergeNamedItems(getDrinkItems(existing), getDrinkItems(incoming));
  const audioNotes = mergeAudioNotes(existing, incoming);
  const incomingLocation =
    incoming.location && DEFAULT_TEXT_VALUES.has(incoming.location) && existing.location && !DEFAULT_TEXT_VALUES.has(existing.location)
      ? undefined
      : incoming.location;
  const locationNames = uniqueStrings([
    ...locations.map((item) => item.name),
    ...splitLocationNames(existing.location),
    ...splitLocationNames(incomingLocation),
  ]);
  const outfitImages = uniqueStrings([...(existing.outfitImages || []), ...(incoming.outfitImages || [])]);
  const completed = uniqueStrings([
    ...(existing.achievements?.completed || []),
    ...(incoming.achievements?.completed || []),
  ]);
  const pending = uniqueStrings([...(existing.achievements?.pending || []), ...(incoming.achievements?.pending || [])]);

  return {
    ...existing,
    ...incoming,
    mood: incoming.mood || existing.mood,
    moodText: incoming.moodText || existing.moodText,
    foodItems,
    foodText: summarizeNames(foodItems) || chooseText(existing.foodText, incoming.foodText),
    foodRating: incoming.foodRating ?? existing.foodRating,
    foodSubtext: chooseText(existing.foodSubtext, incoming.foodSubtext),
    foodImage: chooseImage(existing.foodImage, incoming.foodImage),
    drinkItems,
    drinkText: summarizeNames(drinkItems) || chooseText(existing.drinkText, incoming.drinkText),
    drinkRating: incoming.drinkRating ?? existing.drinkRating,
    drinkSubtext: chooseText(existing.drinkSubtext, incoming.drinkSubtext),
    drinkImage: chooseImage(existing.drinkImage, incoming.drinkImage),
    hasHeartbeat: incoming.hasHeartbeat || existing.hasHeartbeat,
    heartbeatText: chooseText(existing.heartbeatText, incoming.heartbeatText),
    heartbeatImage: chooseImage(existing.heartbeatImage, incoming.heartbeatImage),
    wishlistItems: mergeNamedItems(existing.wishlistItems || [], incoming.wishlistItems || []),
    outfitImages,
    outfitText: chooseText(existing.outfitText, incoming.outfitText),
    outfitRating: incoming.outfitRating ?? existing.outfitRating,
    outfitSubtext: chooseText(existing.outfitSubtext, incoming.outfitSubtext),
    location: locationNames.join("、") || existing.location || incoming.location,
    locations,
    audioNote: audioNotes[audioNotes.length - 1],
    audioNotes,
    locationCity: incoming.locationCity || existing.locationCity,
    locationImage: incoming.locationImage || existing.locationImage,
    locationTags: uniqueStrings([...(existing.locationTags || []), ...(incoming.locationTags || [])]),
    aiReflection: incoming.aiReflection || existing.aiReflection,
    achievements: { completed, pending },
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settingsBackTab, setSettingsBackTab] = useState<ActiveTab>("home");
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || "theme-mori");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.user) || localStorage.getItem(STORAGE_KEYS.legacyUser);
      const savedEntries = localStorage.getItem(STORAGE_KEYS.records) || localStorage.getItem(STORAGE_KEYS.legacyRecords);

      if (savedUser) setUserProfile(JSON.parse(savedUser));
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      } else {
        setEntries(INITIAL_ENTRIES);
        writeStorage(STORAGE_KEYS.records, INITIAL_ENTRIES);
      }
    } catch (error) {
      console.error("Failed to load local data", error);
      setEntries(INITIAL_ENTRIES);
    }
  }, []);

  const navigate = (tab: ActiveTab) => {
    if (tab === "settings") setSettingsBackTab(activeTab);
    setActiveTab(tab);
  };

  const addEntry = (entry: JournalEntry) => {
    setEntries((current) => {
      const existing = current.find((item) => item.id === entry.id || item.date === entry.date);
      const mergedEntry = mergeEntry(existing, entry);
      const updated = [
        ...current.filter((item) => item.id !== entry.id && item.date !== entry.date),
        mergedEntry,
      ].sort((a, b) => a.date.localeCompare(b.date));
      writeStorage(STORAGE_KEYS.records, updated);
      return updated;
    });
  };

  const changeProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    writeStorage(STORAGE_KEYS.user, profile);
  };

  const logout = () => {
    removeStorage(STORAGE_KEYS.user);
    removeStorage(STORAGE_KEYS.legacyUser);
    setUserProfile(null);
    setActiveTab("home");
  };

  const changeTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  };

  const renderPage = () => {
    const latestEntry = entries[entries.length - 1] || INITIAL_ENTRIES[INITIAL_ENTRIES.length - 1];
    const todayEntry = entries.find((entry) => entry.id === todayKey() || entry.date === todayKey());

    switch (activeTab) {
      case "home":
        return (
          <HomeView
            onNavigate={navigate}
            entries={entries}
            todayEntry={latestEntry}
            userProfile={userProfile}
            onLogout={logout}
          />
        );
      case "record":
        return <RecordView onAddEntry={addEntry} onNavigate={navigate} existingEntry={todayEntry} />;
      case "memory":
        return <MemoryView entries={entries} onNavigate={navigate} userProfile={userProfile} />;
      case "recommend":
        return <RecommendView onNavigate={navigate} onAddEntry={addEntry} userProfile={userProfile} entries={entries} />;
      case "settings":
        return (
          <SettingsView
            userProfile={userProfile}
            onChangeProfile={changeProfile}
            activeTheme={theme}
            onChangeTheme={changeTheme}
            onBack={() => setActiveTab(settingsBackTab)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen w-full bg-[#e6d4b7] text-[#5d5449] flex justify-center ${theme}`}>
      <div className="w-full max-w-[672px] bg-[#fcf9f2] min-h-screen relative flex flex-col border-x border-[#e1d1b8] md:shadow-2xl md:overflow-hidden paper-texture">
        {!userProfile ? (
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <LoginView onLoginSuccess={changeProfile} />
          </main>
        ) : (
          <>
            <PageContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </PageContainer>
            <BottomNav activeTab={activeTab} onNavigate={navigate} />
          </>
        )}
      </div>
    </div>
  );
}
