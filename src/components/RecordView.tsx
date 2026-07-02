import { ReactNode, useRef, useState } from "react";
import { Bookmark, Camera, ChevronLeft, Coffee, Heart, MapPin, Plus, Shirt, Trash2, Utensils } from "lucide-react";
import { ActiveTab, AudioNote, DrinkItem, FoodItem, JournalEntry, LocationItem, WishlistItem } from "../types";
import AIInputBox from "./record/AIInputBox";
import LocationPicker from "./record/LocationPicker";
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

function readImageAsDataUrl(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

function createDraftId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialMood(existingEntry?: JournalEntry) {
  return MOOD_OPTIONS.find((item) => item.char === existingEntry?.mood || item.text === existingEntry?.moodText) || MOOD_OPTIONS[0];
}

function createFoodItem(partial: Partial<FoodItem> = {}): FoodItem {
  return {
    id: partial.id || createDraftId("food"),
    name: partial.name || "",
    rating: partial.rating || 4,
    note: partial.note || "",
    image: partial.image || "",
    tags: partial.tags,
  };
}

function createDrinkItem(partial: Partial<DrinkItem> = {}): DrinkItem {
  return {
    id: partial.id || createDraftId("drink"),
    name: partial.name || "",
    rating: partial.rating || 4,
    note: partial.note || "",
    image: partial.image || "",
    tags: partial.tags,
  };
}

function normalizeFoodItems(items: FoodItem[]) {
  return items.filter((item) => item.name.trim()).map((item) => ({ ...createFoodItem(item), image: item.image || FOOD_IMAGE }));
}

function normalizeDrinkItems(items: DrinkItem[]) {
  return items.filter((item) => item.name.trim()).map((item) => ({ ...createDrinkItem(item), image: item.image || DRINK_IMAGE }));
}

function Stars({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className={`text-[20px] leading-none ${star <= value ? "text-amber-400" : "text-[#d6d0c4]"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function ImagePicker({ image, label, onChange, className = "" }: { image?: string; label: string; onChange: (value: string) => void; className?: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-2xl border border-dashed border-[#dfd6c5] bg-[#faf6ee] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#e3a387] ${className || "w-[88px] h-[88px]"}`}
    >
      {image ? <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover" /> : <Camera size={22} />}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) readImageAsDataUrl(file, onChange);
        }}
      />
    </button>
  );
}

function ItemEditor({
  item,
  title,
  subtitle,
  icon,
  imageLabel,
  namePlaceholder,
  notePlaceholder,
  onChange,
  onRemove,
}: {
  key?: string;
  item: FoodItem | DrinkItem;
  title: string;
  subtitle: string;
  icon: ReactNode;
  imageLabel: string;
  namePlaceholder: string;
  notePlaceholder: string;
  onChange: (patch: Partial<FoodItem & DrinkItem>) => void;
  onRemove?: () => void;
}) {
  return (
    <article className="relative rounded-[22px] bg-white border border-[#dfd6c5] p-4 shadow-[0_5px_14px_rgba(93,84,73,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 flex items-center gap-2 text-[16px] font-bold font-serif text-[#8e9a86]">
          {icon}
          <span className="truncate">{title} · {subtitle}</span>
        </h3>
        {onRemove && (
          <button type="button" onClick={onRemove} className="w-8 h-8 rounded-full bg-[#fffdf8] border border-[#dfd6c5] text-[#a0907d] flex items-center justify-center flex-shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="flex gap-3 items-start">
        <ImagePicker image={item.image} label={imageLabel} onChange={(image) => onChange({ image })} className="w-[104px] h-[104px] flex-shrink-0 max-[380px]:w-[88px] max-[380px]:h-[88px]" />
        <div className="flex-1 min-w-0 space-y-2 pt-1">
          <div className="flex gap-2">
            <input
              value={item.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder={namePlaceholder}
              className="min-w-0 flex-1 border-b border-[#dfd6c5] bg-transparent pb-1 text-[15px] font-bold outline-none placeholder:text-[#b8ad9f]"
            />
          </div>
          <Stars value={item.rating || 4} onChange={(rating) => onChange({ rating })} />
          <input
            value={item.note || ""}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder={notePlaceholder}
            className="w-full bg-transparent text-xs text-[#8a7d70] outline-none placeholder:text-[#b8ad9f]"
          />
        </div>
      </div>
    </article>
  );
}

function JournalCard({ title, subtitle, icon, children, action }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <article className="rounded-[22px] bg-white border border-[#dfd6c5] p-4 shadow-[0_5px_14px_rgba(93,84,73,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 flex items-center gap-2 text-[16px] font-bold font-serif text-[#8e9a86]">
          {icon}
          <span className="truncate">{title} · {subtitle}</span>
        </h3>
        {action}
      </div>
      {children}
    </article>
  );
}

export default function RecordView({ onAddEntry, onNavigate, existingEntry }: RecordViewProps) {
  const [inputText, setInputText] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodOption>(() => getInitialMood(existingEntry));
  const existingFoodItems = existingEntry ? getFoodItems(existingEntry) : [];
  const existingDrinkItems = existingEntry ? getDrinkItems(existingEntry) : [];
  const existingAudioNotes = existingEntry ? getAudioNotes(existingEntry) : [];
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => (existingFoodItems.length ? existingFoodItems.map(createFoodItem) : [createFoodItem()]));
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>(() => (existingDrinkItems.length ? existingDrinkItems.map(createDrinkItem) : [createDrinkItem()]));
  const [outfitText, setOutfitText] = useState(existingEntry?.outfitText || "");
  const [outfitRating, setOutfitRating] = useState(existingEntry?.outfitRating || 4);
  const [outfitNote, setOutfitNote] = useState(existingEntry?.outfitSubtext || "");
  const [outfitImage, setOutfitImage] = useState(existingEntry?.outfitImages?.[0] || "");
  const [location, setLocation] = useState(existingEntry?.location || existingEntry?.locations?.[0]?.name || "");
  const [locations, setLocations] = useState<LocationItem[]>(existingEntry?.locations || []);
  const [locationTags, setLocationTags] = useState<string[]>(existingEntry?.locationTags || ["今日", "记录"]);
  const [wishlistEnabled, setWishlistEnabled] = useState(Boolean(existingEntry?.hasHeartbeat || existingEntry?.wishlistItems?.length));
  const [wishlistText, setWishlistText] = useState("");
  const [wishlistImage, setWishlistImage] = useState("");
  const [wishlistType, setWishlistType] = useState<WishlistItem["type"]>("food");
  const [wishlistNote, setWishlistNote] = useState("");
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(existingEntry?.wishlistItems || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseHint, setParseHint] = useState("");
  const [audioNote, setAudioNote] = useState<AudioNote | null>(existingAudioNotes[existingAudioNotes.length - 1] || null);

  const updateFoodItem = (id: string, patch: Partial<FoodItem>) => setFoodItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const updateDrinkItem = (id: string, patch: Partial<DrinkItem>) => setDrinkItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const removeFoodItem = (id: string) => setFoodItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  const removeDrinkItem = (id: string) => setDrinkItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));

  const addWishlistItem = () => {
    const name = wishlistText.trim();
    if (!name) return;
    setWishlistItems((current) => [
      ...current,
      {
        id: createDraftId("wishlist"),
        name,
        type: wishlistType,
        note: wishlistNote.trim() || "之前心动过，还没真正兑现",
        image: wishlistImage,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ]);
    setWishlistText("");
    setWishlistNote("");
    setWishlistImage("");
  };

  const applyParsedRecord = (parsed: ParsedRecord) => {
    if (parsed.mood) {
      const matchedMood = MOOD_OPTIONS.find((item) => item.char === parsed.mood || item.text === parsed.moodText);
      if (matchedMood) setSelectedMood(matchedMood);
    }
    if (parsed.foodText) setFoodItems(makeFoodItems(`parsed-${Date.now()}`, parsed.foodText, parsed.foodRating || 4, parsed.foodSubtext || "", FOOD_IMAGE).map(createFoodItem));
    if (parsed.drinkText) setDrinkItems(makeDrinkItems(`parsed-${Date.now()}`, parsed.drinkText, parsed.drinkRating || 4, parsed.drinkSubtext || "", DRINK_IMAGE).map(createDrinkItem));
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
        setParseHint(data.fallback ? "已使用本地模拟解析填充。" : "AI 已帮你整理到对应模块。");
      }
    } catch (error) {
      console.warn("AI parse failed", error);
      setParseHint("解析遇到一点问题，可以先手动记录。");
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
    const audioNotes = [...existingAudioNotes, ...(audioNote && !existingAudioNotes.some((item) => item.id === audioNote.id) ? [audioNote] : [])];
    const hasOutfit = Boolean(outfitText.trim() || outfitNote.trim() || outfitImage);

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

    onAddEntry({
      id,
      date: id,
      dayOfWeek: weekdayNames[now.getDay()],
      dayOfMonth: now.getDate(),
      mood: selectedMood.char,
      moodText: selectedMood.text,
      foodText,
      foodRating: primaryFood?.rating,
      foodSubtext: primaryFood?.note,
      foodImage: primaryFood?.image,
      foodItems: normalizedFoodItems,
      drinkText,
      drinkRating: primaryDrink?.rating,
      drinkSubtext: primaryDrink?.note,
      drinkImage: primaryDrink?.image,
      drinkItems: normalizedDrinkItems,
      hasHeartbeat: wishlistEnabled,
      heartbeatText: wishlistEnabled ? wishlistItems.map((item) => item.name).join("、") || wishlistText : undefined,
      heartbeatImage: wishlistEnabled ? wishlistImage : undefined,
      wishlistItems: wishlistEnabled ? wishlistItems : [],
      outfitImages: hasOutfit ? [outfitImage || OUTFIT_IMAGE] : [],
      outfitText: hasOutfit ? outfitText : undefined,
      outfitRating: hasOutfit ? outfitRating : undefined,
      outfitSubtext: hasOutfit ? outfitNote : undefined,
      location: locations.map((item) => item.name).join("、") || location || "生活小屋附近",
      locations,
      audioNote: audioNote || undefined,
      audioNotes,
      locationCity: "今日",
      locationTags,
      aiReflection,
      achievements: {
        completed: ["完成今日小记", foodText ? "记录了吃的" : "留下一句话", drinkText ? "记录了喝的" : "照顾了自己"],
        pending: wishlistEnabled && wishlistItems.length ? wishlistItems.map((item) => item.name) : ["睡前放松"],
      },
    });
    setIsSubmitting(false);
    onNavigate("home");
  };

  return (
    <div className="space-y-4 pb-28">
      <header className="flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="w-10 h-10 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86] shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[22px] font-bold font-serif">今日小记</h1>
        <span className="w-10" />
      </header>

      <AIInputBox value={inputText} onChange={setInputText} hint={parseHint} isParsing={isParsing} audioNote={audioNote} onAudioNoteChange={setAudioNote} onParse={handleAIParse} />

      <MoodSelector selectedMood={selectedMood} onChange={setSelectedMood} />

      <section className="space-y-3">
        {foodItems.map((item, index) => (
          <ItemEditor
            key={item.id}
            item={item}
            title={index === 0 ? "今日食味" : `今日食味 ${index + 1}`}
            subtitle="DINING"
            icon={<Utensils size={18} strokeWidth={1.8} />}
            imageLabel="食物照片"
            namePlaceholder="例如：披萨"
            notePlaceholder="这一口是什么感觉..."
            onChange={(patch) => updateFoodItem(item.id, patch)}
            onRemove={foodItems.length > 1 ? () => removeFoodItem(item.id) : undefined}
          />
        ))}
        <button type="button" onClick={() => setFoodItems((current) => [...current, createFoodItem()])} className="w-full rounded-full border border-dashed border-[#dfd6c5] bg-white/70 py-2.5 text-sm font-bold text-[#8e9a86] flex items-center justify-center gap-2 shadow-sm">
          <Plus size={17} /> 再记一份好吃的
        </button>
      </section>

      <JournalCard
        title="心动清单"
        subtitle="WISHLIST"
        icon={<Heart size={18} strokeWidth={1.8} />}
        action={
          <label className="flex items-center gap-2 text-xs font-bold text-[#8a7d70]">
            <input type="checkbox" checked={wishlistEnabled} onChange={(event) => setWishlistEnabled(event.target.checked)} className="w-4 h-4 rounded border-[#dfd6c5] accent-[#8e9a86]" />
            开启此记
          </label>
        }
      >
        {wishlistEnabled ? (
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <ImagePicker image={wishlistImage} label="心动照片" onChange={setWishlistImage} className="w-[104px] h-[104px] flex-shrink-0 max-[380px]:w-[88px] max-[380px]:h-[88px]" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="inline-flex rounded-full border border-[#dfd6c5] bg-[#fffdf8] p-1">
                  <button type="button" onClick={() => setWishlistType("food")} className={`rounded-full px-3 py-1 text-xs font-bold ${wishlistType === "food" ? "bg-[#e3a387] text-white" : "text-[#8a7d70]"}`}>想吃</button>
                  <button type="button" onClick={() => setWishlistType("drink")} className={`rounded-full px-3 py-1 text-xs font-bold ${wishlistType === "drink" ? "bg-[#8e9a86] text-white" : "text-[#8a7d70]"}`}>想喝</button>
                </div>
                <input value={wishlistText} onChange={(event) => setWishlistText(event.target.value)} placeholder="例如：寿喜锅 / 葡萄冰茶" className="w-full border-b border-[#dfd6c5] bg-transparent pb-1 text-sm font-bold outline-none placeholder:text-[#b8ad9f]" />
                <input value={wishlistNote} onChange={(event) => setWishlistNote(event.target.value)} placeholder="为什么心动？" className="w-full bg-transparent text-xs text-[#a0907d] outline-none placeholder:text-[#b8ad9f]" />
              </div>
            </div>
            <button type="button" onClick={addWishlistItem} className="rounded-full bg-[#fffdf8] border border-[#dfd6c5] px-4 py-2 text-xs font-bold text-[#8a7d70]">+ 记录</button>
            <div className="flex flex-wrap gap-2">
              {wishlistItems.map((item) => (
                <span key={item.id} className="inline-flex items-center gap-2 rounded-full border border-[#f0d2c5] bg-[#fff3ec] px-3 py-1.5 text-xs font-bold text-[#c86f50]">
                  {item.type === "food" ? "想吃" : "想喝"} · {item.name}
                  <button type="button" onClick={() => setWishlistItems((current) => current.filter((next) => next.id !== item.id))} className="text-[#a0907d]">
                    <Trash2 size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#a0907d] italic font-serif">“有没有那一瞬间，心里泛起小小的涟漪？”</p>
        )}
      </JournalCard>

      <section className="space-y-3">
        {drinkItems.map((item) => (
          <ItemEditor
            key={item.id}
            item={item}
            title="流动的光"
            subtitle="COFFEE & TEA"
            icon={<Coffee size={18} strokeWidth={1.8} />}
            imageLabel="饮品照片"
            namePlaceholder="例如：葡萄冰茶"
            notePlaceholder="这杯喝起来怎么样..."
            onChange={(patch) => updateDrinkItem(item.id, patch)}
            onRemove={drinkItems.length > 1 ? () => removeDrinkItem(item.id) : undefined}
          />
        ))}
        <button type="button" onClick={() => setDrinkItems((current) => [...current, createDrinkItem()])} className="w-full rounded-full border border-dashed border-[#dfd6c5] bg-white/70 py-2.5 text-sm font-bold text-[#8e9a86] flex items-center justify-center gap-2 shadow-sm">
          <Plus size={17} /> 再记一杯喝的
        </button>
      </section>

      <JournalCard title="今日着物" subtitle="OUTFIT" icon={<Shirt size={18} strokeWidth={1.8} />}>
        <div className="flex gap-3 items-start">
          <ImagePicker image={outfitImage} label="穿搭照片" onChange={setOutfitImage} className="w-[104px] h-[104px] flex-shrink-0 max-[380px]:w-[88px] max-[380px]:h-[88px]" />
          <div className="flex-1 min-w-0 space-y-2 pt-1">
            <input value={outfitText} onChange={(event) => setOutfitText(event.target.value)} placeholder="例如：松弛感穿搭" className="w-full border-b border-[#dfd6c5] bg-transparent pb-1 text-[15px] font-bold outline-none placeholder:text-[#b8ad9f]" />
            <Stars value={outfitRating} onChange={setOutfitRating} />
            <input value={outfitNote} onChange={(event) => setOutfitNote(event.target.value)} placeholder="给今天的穿搭写一句话..." className="w-full bg-transparent text-xs text-[#8a7d70] outline-none placeholder:text-[#b8ad9f]" />
          </div>
        </div>
      </JournalCard>

      <LocationPicker location={location} locations={locations} onLocationChange={setLocation} onLocationsChange={setLocations} />

      <div className="fixed left-1/2 bottom-[92px] z-[60] w-full max-w-[672px] -translate-x-1/2 px-5 pointer-events-none max-[520px]:bottom-[calc(88px+env(safe-area-inset-bottom))]">
        <button onClick={finishToday} disabled={isSubmitting} className="pointer-events-auto w-full rounded-full bg-[#8e9a86] py-3.5 text-base font-bold text-white shadow-[0_8px_22px_rgba(142,154,134,0.32)] flex items-center justify-center gap-2">
          <Bookmark size={19} />
          {isSubmitting ? "正在保存..." : "完成今天"}
        </button>
      </div>
    </div>
  );
}
