import { useRef, useState } from "react";
import { Bookmark, Camera, ChevronLeft, Heart, Plus, Trash2 } from "lucide-react";
import { ActiveTab, AudioNote, DrinkItem, FoodItem, JournalEntry, LocationItem, WishlistItem } from "../types";
import AIInputBox from "./record/AIInputBox";
import DrinkCard from "./record/DrinkCard";
import FoodCard from "./record/FoodCard";
import LocationPicker from "./record/LocationPicker";
import LookUploader from "./record/LookUploader";
import MoodSelector, { MOOD_OPTIONS, MoodOption } from "./record/MoodSelector";
import { getAudioNotes, getDrinkItems, getFoodItems, makeDrinkItems, makeFoodItems, summarizeNames } from "../utils/recordItems";

interface RecordViewProps {
  onAddEntry: (entry: JournalEntry) => void;
  onNavigate: (tab: ActiveTab) => void;
  existingEntry?: JournalEntry;
}

type ParsedRecord = {
  mood?: string;
  moodText?: string;
  foodText?: string;
  foodRating?: number;
  foodSubtext?: string;
  drinkText?: string;
  drinkRating?: number;
  drinkSubtext?: string;
  outfitText?: string;
  outfitRating?: number;
  outfitSubtext?: string;
  location?: string;
  locationTags?: string[];
};

const FOOD_IMAGE = "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=360&auto=format&fit=crop";
const DRINK_IMAGE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=360&auto=format&fit=crop";
const OUTFIT_IMAGE = "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=360&auto=format&fit=crop";
const DEFAULT_OUTFIT_TEXT = "松弛感穿搭";
const DEFAULT_OUTFIT_NOTE = "今日松弛感拉满 🍃";

function readImageAsDataUrl(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

function getInitialMood(existingEntry?: JournalEntry) {
  return (
    MOOD_OPTIONS.find((item) => item.char === existingEntry?.mood || item.text === existingEntry?.moodText) ||
    MOOD_OPTIONS[0]
  );
}

function createDraftId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createFoodItem(partial: Partial<FoodItem> = {}): FoodItem {
  return {
    id: partial.id || createDraftId("food"),
    name: partial.name || "治愈的一餐",
    rating: partial.rating || 4,
    note: partial.note || "这一口，是治愈的味道...",
    image: partial.image || FOOD_IMAGE,
    tags: partial.tags,
  };
}

function createDrinkItem(partial: Partial<DrinkItem> = {}): DrinkItem {
  return {
    id: partial.id || createDraftId("drink"),
    name: partial.name || "午后温热",
    rating: partial.rating || 4,
    note: partial.note || "热茶暖胃，咖啡醒神 ☕",
    image: partial.image || DRINK_IMAGE,
    tags: partial.tags,
  };
}

function normalizeFoodItems(items: FoodItem[]) {
  return items.filter((item) => item.name.trim()).map((item) => createFoodItem(item));
}

function normalizeDrinkItems(items: DrinkItem[]) {
  return items.filter((item) => item.name.trim()).map((item) => createDrinkItem(item));
}

export default function RecordView({ onAddEntry, onNavigate, existingEntry }: RecordViewProps) {
  const [inputText, setInputText] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodOption>(() => getInitialMood(existingEntry));
  const existingFoodItems = existingEntry ? getFoodItems(existingEntry) : [];
  const existingDrinkItems = existingEntry ? getDrinkItems(existingEntry) : [];
  const existingAudioNotes = existingEntry ? getAudioNotes(existingEntry) : [];
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() =>
    existingFoodItems.length ? existingFoodItems.map(createFoodItem) : [createFoodItem()],
  );
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>(() =>
    existingDrinkItems.length ? existingDrinkItems.map(createDrinkItem) : [createDrinkItem()],
  );
  const [outfitText, setOutfitText] = useState(existingEntry?.outfitText || DEFAULT_OUTFIT_TEXT);
  const [outfitRating, setOutfitRating] = useState(existingEntry?.outfitRating || 4);
  const [outfitNote, setOutfitNote] = useState(existingEntry?.outfitSubtext || DEFAULT_OUTFIT_NOTE);
  const [outfitImage, setOutfitImage] = useState(existingEntry?.outfitImages?.[0] || OUTFIT_IMAGE);
  const [location, setLocation] = useState(existingEntry?.location || existingEntry?.locations?.[0]?.name || "西湖畔的小书店");
  const [locations, setLocations] = useState<LocationItem[]>(existingEntry?.locations || []);
  const [locationTags, setLocationTags] = useState<string[]>(existingEntry?.locationTags || ["今日", "记录"]);
  const [wishlistEnabled, setWishlistEnabled] = useState(Boolean(existingEntry?.hasHeartbeat));
  const [wishlistText, setWishlistText] = useState(existingEntry?.wishlistItems?.length ? "" : existingEntry?.heartbeatText || "");
  const [wishlistImage, setWishlistImage] = useState(existingEntry?.heartbeatImage || "");
  const [wishlistType, setWishlistType] = useState<WishlistItem["type"]>("food");
  const [wishlistNote, setWishlistNote] = useState("");
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(existingEntry?.wishlistItems || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseHint, setParseHint] = useState("");
  const [audioNote, setAudioNote] = useState<AudioNote | null>(existingAudioNotes[existingAudioNotes.length - 1] || null);
  const wishlistInputRef = useRef<HTMLInputElement | null>(null);

  const updateFoodItem = (id: string, patch: Partial<FoodItem>) => {
    setFoodItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateDrinkItem = (id: string, patch: Partial<DrinkItem>) => {
    setDrinkItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeFoodItem = (id: string) => {
    setFoodItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  };

  const removeDrinkItem = (id: string) => {
    setDrinkItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  };

  const addWishlistItem = () => {
    const name = wishlistText.trim();
    if (!name) return;
    const item: WishlistItem = {
      id: createDraftId("wishlist"),
      name,
      type: wishlistType,
      note: wishlistNote.trim() || "之前心动过，还没真正兑现",
      image: wishlistImage,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setWishlistItems((current) => [...current, item]);
    setWishlistText("");
    setWishlistNote("");
    setWishlistImage("");
  };

  const removeWishlistItem = (id: string) => {
    setWishlistItems((current) => current.filter((item) => item.id !== id));
  };

  const applyParsedRecord = (parsed: ParsedRecord) => {
    if (parsed.mood) {
      const matchedMood = MOOD_OPTIONS.find((item) => item.char === parsed.mood || item.text === parsed.moodText);
      if (matchedMood) setSelectedMood(matchedMood);
    }
    if (parsed.foodText) {
      setFoodItems(
        makeFoodItems(`parsed-${Date.now()}`, parsed.foodText, parsed.foodRating || 4, parsed.foodSubtext || "", FOOD_IMAGE).map(createFoodItem),
      );
    }
    if (!parsed.foodText && (parsed.foodRating || parsed.foodSubtext)) {
      setFoodItems((current) => current.map((item) => ({ ...item, rating: parsed.foodRating || item.rating, note: parsed.foodSubtext || item.note })));
    }
    if (parsed.drinkText) {
      setDrinkItems(
        makeDrinkItems(`parsed-${Date.now()}`, parsed.drinkText, parsed.drinkRating || 4, parsed.drinkSubtext || "", DRINK_IMAGE).map(createDrinkItem),
      );
    }
    if (!parsed.drinkText && (parsed.drinkRating || parsed.drinkSubtext)) {
      setDrinkItems((current) => current.map((item) => ({ ...item, rating: parsed.drinkRating || item.rating, note: parsed.drinkSubtext || item.note })));
    }
    if (parsed.outfitText) setOutfitText(parsed.outfitText);
    if (parsed.outfitRating) setOutfitRating(parsed.outfitRating);
    if (parsed.outfitSubtext) setOutfitNote(parsed.outfitSubtext);
    if (parsed.location) setLocation(parsed.location);
    if (parsed.locationTags?.length) setLocationTags(parsed.locationTags);
  };

  const handleAIParse = async () => {
    if (!inputText.trim()) {
      setParseHint("先写一句今天的小事，再让 AI 帮你整理。");
      return;
    }

    setIsParsing(true);
    setParseHint("");
    try {
      const response = await fetch("/api/ai/parse-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      if (data?.parsed) {
        applyParsedRecord(data.parsed);
        setParseHint(data.fallback ? "已使用本地模拟解析填充。" : "AI 已帮你整理进对应模块。");
      }
    } catch (error) {
      console.warn("AI parse failed", error);
      setParseHint("解析遇到一点小问题，可以先手动记录。");
    } finally {
      setIsParsing(false);
    }
  };

  const finishToday = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const id = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const normalizedFoodItems = normalizeFoodItems(foodItems);
    const normalizedDrinkItems = normalizeDrinkItems(drinkItems);
    const foodText = summarizeNames(normalizedFoodItems);
    const drinkText = summarizeNames(normalizedDrinkItems);
    const primaryFood = normalizedFoodItems[0];
    const primaryDrink = normalizedDrinkItems[0];

    let aiReflection = "今天的你已经把生活好好接住了。小小一笔，也算把温柔留了下来。";
    try {
      const response = await fetch("/api/ai/daily-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood.char,
          moodText: selectedMood.text,
          foodText,
          foodRating: primaryFood?.rating,
          drinkText,
          drinkRating: primaryDrink?.rating,
          location: locations.map((item) => item.name).join("、") || location,
          locations,
          customNotes: inputText,
        }),
      });
      const data = await response.json();
      if (data?.reflection) aiReflection = data.reflection;
    } catch (error) {
      console.warn("AI reflection fallback used", error);
    }

    const hasRealOutfit =
      Boolean(existingEntry?.outfitText) ||
      outfitText.trim() !== DEFAULT_OUTFIT_TEXT ||
      outfitNote.trim() !== DEFAULT_OUTFIT_NOTE ||
      outfitImage !== OUTFIT_IMAGE;

    const audioNotes = [...existingAudioNotes, ...(audioNote && !existingAudioNotes.some((item) => item.id === audioNote.id) ? [audioNote] : [])];

    const entry: JournalEntry = {
      id,
      date: id,
      dayOfWeek: weekdayNames[now.getDay()],
      dayOfMonth: now.getDate(),
      mood: selectedMood.char,
      moodText: selectedMood.text,
      foodText: foodText || "今日小食",
      foodRating: primaryFood?.rating,
      foodSubtext: primaryFood?.note,
      foodImage: primaryFood?.image,
      foodItems: normalizedFoodItems,
      drinkText: drinkText || "温热饮品",
      drinkRating: primaryDrink?.rating,
      drinkSubtext: primaryDrink?.note,
      drinkImage: primaryDrink?.image,
      drinkItems: normalizedDrinkItems,
      hasHeartbeat: wishlistEnabled,
      heartbeatText: wishlistEnabled ? wishlistItems.map((item) => item.name).join("、") || wishlistText : undefined,
      heartbeatImage: wishlistEnabled ? wishlistImage : undefined,
      wishlistItems: wishlistEnabled ? wishlistItems : [],
      outfitImages: hasRealOutfit ? [outfitImage] : [],
      outfitText: hasRealOutfit ? outfitText : undefined,
      outfitRating: hasRealOutfit ? outfitRating : undefined,
      outfitSubtext: hasRealOutfit ? outfitNote : undefined,
      location: locations.map((item) => item.name).join("、") || location || "生活小屋附近",
      locations,
      audioNote: audioNote || undefined,
      audioNotes,
      locationCity: "上海",
      locationTags,
      aiReflection,
      achievements: {
        completed: ["完成今日小记", foodText ? "记录了吃的" : "留下一句话", drinkText ? "记录了喝的" : "照顾了自己"],
        pending: wishlistEnabled && wishlistItems.length ? wishlistItems.map((item) => item.name) : ["睡前放松"],
      },
    };

    onAddEntry(entry);
    setIsSubmitting(false);
    onNavigate("home");
  };

  return (
    <div className="space-y-7 pb-6">
      <header className="flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="w-10 h-10 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[22px] font-bold font-serif">今日小记</h1>
        <span className="w-10" />
      </header>

      <AIInputBox
        value={inputText}
        onChange={setInputText}
        hint={parseHint}
        isParsing={isParsing}
        audioNote={audioNote}
        onAudioNoteChange={setAudioNote}
        onParse={handleAIParse}
      />
      <MoodSelector selectedMood={selectedMood} onChange={setSelectedMood} />

      <section className="space-y-4">
        {foodItems.map((item, index) => (
          <FoodCard
            key={item.id}
            title={index === 0 ? "今日食味" : `今日食味 ${index + 1}`}
            subtitle="DINING"
            iconColor="text-[#8e9a86]"
            imageUrl={item.image || FOOD_IMAGE}
            onImageChange={(value) => updateFoodItem(item.id, { image: value })}
            name={item.name}
            onNameChange={(value) => updateFoodItem(item.id, { name: value })}
            namePlaceholder="例如：抹茶千层"
            rating={item.rating || 4}
            onRatingChange={(value) => updateFoodItem(item.id, { rating: value })}
            note={item.note || ""}
            onNoteChange={(value) => updateFoodItem(item.id, { note: value })}
            notePlaceholder="给这一口写一句话..."
            onRemove={foodItems.length > 1 ? () => removeFoodItem(item.id) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={() => setFoodItems((current) => [...current, createFoodItem({ name: "", note: "" })])}
          className="w-full rounded-full border border-dashed border-[#dfd6c5] bg-white/70 py-3 text-sm font-bold text-[#8e9a86] flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={17} />
          再记一份好吃的
        </button>
      </section>

      <article className="rounded-[24px] bg-white border border-[#dfd6c5] p-7 shadow-[0_5px_14px_rgba(93,84,73,0.05)] max-[520px]:p-5 max-[380px]:p-4">
        <div className="flex items-center justify-between mb-5 gap-3 max-[380px]:items-start">
          <h3 className="text-[20px] font-bold font-serif text-[#e3a387] flex items-center gap-2 min-w-0 max-[380px]:text-[17px]">
            <Heart size={21} strokeWidth={1.9} />
            心动清单 · WISHLIST
          </h3>
          <label className="flex items-center gap-2 text-base font-bold text-[#8a7d70] flex-shrink-0 max-[380px]:text-sm">
            <input
              type="checkbox"
              checked={wishlistEnabled}
              onChange={(event) => setWishlistEnabled(event.target.checked)}
              className="w-5 h-5 rounded border-[#dfd6c5] accent-[#2f80ed]"
            />
            开启此记
          </label>
        </div>
        {wishlistEnabled ? (
          <>
            <div className="flex gap-6 items-center max-[520px]:gap-4 max-[380px]:flex-col max-[380px]:items-stretch">
              <button
                type="button"
                onClick={() => wishlistInputRef.current?.click()}
                className="relative w-[168px] h-[168px] rounded-2xl border border-dashed border-[#dfd6c5] bg-[#faf6ee] flex flex-col items-center justify-center text-[#e3a387] flex-shrink-0 overflow-hidden group max-[520px]:w-[112px] max-[520px]:h-[112px] max-[380px]:w-full max-[380px]:h-[150px]"
              >
                {wishlistImage ? (
                  <img src={wishlistImage} alt="心动照片" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Plus size={32} />
                    <span className="mt-3 text-sm font-bold text-[#a0907d]">放入心动照片</span>
                  </>
                )}
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100">
                  <Camera size={24} />
                  <span className="mt-2 text-sm font-bold">上传照片</span>
                </span>
                <input
                  ref={wishlistInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) readImageAsDataUrl(file, setWishlistImage);
                  }}
                />
              </button>
              <div className="flex-1 space-y-4 min-w-0">
                <div className="inline-flex rounded-full border border-[#dfd6c5] bg-[#fffdf8] p-1">
                  <button
                    type="button"
                    onClick={() => setWishlistType("food")}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${wishlistType === "food" ? "bg-[#e3a387] text-white" : "text-[#8a7d70]"}`}
                  >
                    想吃
                  </button>
                  <button
                    type="button"
                    onClick={() => setWishlistType("drink")}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${wishlistType === "drink" ? "bg-[#8e9a86] text-white" : "text-[#8a7d70]"}`}
                  >
                    想喝
                  </button>
                </div>
                <input
                  value={wishlistText}
                  onChange={(event) => setWishlistText(event.target.value)}
                  placeholder={wishlistType === "food" ? "例如：想吃寿喜锅..." : "例如：想喝葡萄冰茶..."}
                  className="w-full border-b border-[#dfd6c5] bg-transparent pb-2 text-[20px] font-bold text-[#5d5449] outline-none max-[520px]:text-base"
                />
                <input
                  value={wishlistNote}
                  onChange={(event) => setWishlistNote(event.target.value)}
                  placeholder="为什么心动？比如：路过没买到、朋友推荐..."
                  className="w-full bg-transparent text-sm text-[#a0907d] outline-none placeholder:text-[#b8ad9f]"
                />
                <div className="flex gap-3 flex-wrap">
                  <span className="rounded-full bg-[#fff3ec] border border-[#f0d2c5] px-4 py-2 text-sm font-bold text-[#c86f50]">下次一定</span>
                  <button
                    type="button"
                    onClick={addWishlistItem}
                    className="rounded-full bg-[#fffdf8] border border-[#dfd6c5] px-4 py-2 text-sm font-bold text-[#8a7d70] active:scale-95"
                  >
                    + 记录
                  </button>
                </div>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {wishlistItems.map((item) => (
                  <span
                    key={item.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${
                      item.type === "food"
                        ? "border-[#f0d2c5] bg-[#fff3ec] text-[#c86f50]"
                        : "border-[#d8dfd0] bg-[#f2f5ef] text-[#7e8a76]"
                    }`}
                  >
                    {item.type === "food" ? "想吃" : "想喝"} · {item.name}
                    <button type="button" onClick={() => removeWishlistItem(item.id)} className="text-[#a0907d]">
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-[17px] leading-8 text-[#a0907d] italic font-serif">“有没有那一瞬间，心里泛起小小的涟漪？”</p>
        )}
      </article>

      <section className="space-y-4">
        {drinkItems.map((item, index) => (
          <DrinkCard
            key={item.id}
            title={index === 0 ? "流动的光" : `流动的光 ${index + 1}`}
            subtitle="COFFEE & TEA"
            iconColor="text-[#8e9a86]"
            imageUrl={item.image || DRINK_IMAGE}
            onImageChange={(value) => updateDrinkItem(item.id, { image: value })}
            name={item.name}
            onNameChange={(value) => updateDrinkItem(item.id, { name: value })}
            namePlaceholder="例如：燕麦拿铁"
            rating={item.rating || 4}
            onRatingChange={(value) => updateDrinkItem(item.id, { rating: value })}
            note={item.note || ""}
            onNoteChange={(value) => updateDrinkItem(item.id, { note: value })}
            notePlaceholder="给这杯饮品写一句话..."
            onRemove={drinkItems.length > 1 ? () => removeDrinkItem(item.id) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={() => setDrinkItems((current) => [...current, createDrinkItem({ name: "", note: "" })])}
          className="w-full rounded-full border border-dashed border-[#dfd6c5] bg-white/70 py-3 text-sm font-bold text-[#8e9a86] flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={17} />
          再记一杯喝的
        </button>
      </section>

      <LookUploader
        title="今日着物"
        subtitle="OUTFIT"
        iconColor="text-[#8e9a86]"
        imageUrl={outfitImage}
        onImageChange={setOutfitImage}
        name={outfitText}
        onNameChange={setOutfitText}
        namePlaceholder="例如：亚麻衬衫"
        rating={outfitRating}
        onRatingChange={setOutfitRating}
        note={outfitNote}
        onNoteChange={setOutfitNote}
        notePlaceholder="给今天的穿搭写一句话..."
      />

      <LocationPicker location={location} locations={locations} onLocationChange={setLocation} onLocationsChange={setLocations} />

      <button onClick={finishToday} disabled={isSubmitting} className="w-full rounded-full bg-[#8e9a86] py-4 text-lg font-bold text-white shadow-[0_4px_12px_rgba(142,154,134,0.25)] flex items-center justify-center gap-2">
        <Bookmark size={19} />
        {isSubmitting ? "正在保存..." : "完成今天"}
      </button>
    </div>
  );
}
