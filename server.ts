import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "8mb" }));

type AIProvider = "mock" | "deepseek" | "openai-compatible";

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
  keywords?: string[];
};

const PARSE_RECORD_SYSTEM_PROMPT = `
你是生活记录 App 的结构化解析器。你的任务是“抽取”，不是创作。

硬性规则：
1. 只提取用户原文中明确出现的信息，禁止猜测、补全、扩写、替换。
2. 如果原文没有出现某类信息，对应字段必须省略，不要编造默认值。
3. foodText / drinkText / outfitText / location 的值必须是原文中的词或短语。
4. foodSubtext / drinkSubtext / outfitSubtext 只能摘取原文里的描述短句；没有就省略。
5. rating 只有用户明确说了评分、星级、很好/一般/差等强烈评价时才输出，否则省略。
6. mood 可以根据明确情绪词判断，例如开心、舒心、平静、失落、疲惫；没有明确情绪就省略。
7. keywords 只能来自已提取字段，不能新增原文没有的词。
8. 如果同一类出现多个项目，用“、”合并到同一个字段，例如“葡萄冰茶、可乐”，不要把第二个饮品放进 outfitText 或其他类别。
9. outfitText 只有原文明确出现衣服、穿搭、裙子、外套、衬衫、裤子、鞋、今日Look 等穿着信息时才允许输出；食物和饮品绝不能进入 outfitText。
10. 只输出 JSON，不要 Markdown，不要解释，不要代码块。

输出字段只允许：
{
  "mood": "😊|😌|😐|😔|😵",
  "moodText": "开心|舒心|平静|失落|疲惫",
  "foodText": "原文出现的食物",
  "foodRating": 1-5,
  "foodSubtext": "原文摘取短句",
  "drinkText": "原文出现的饮品",
  "drinkRating": 1-5,
  "drinkSubtext": "原文摘取短句",
  "outfitText": "原文出现的穿搭",
  "outfitRating": 1-5,
  "outfitSubtext": "原文摘取短句",
  "location": "原文出现的地点",
  "locationTags": ["原文出现的地点标签"],
  "keywords": ["只来自上述已提取字段"]
}

示例：
用户：今天喝了奶茶有点开心，在公园散步，还吃了蛋糕
输出：{"mood":"😊","moodText":"开心","foodText":"蛋糕","drinkText":"奶茶","location":"公园","keywords":["开心","蛋糕","奶茶","公园"]}
用户：我今天吃了披萨好吃，买了葡萄冰茶还喝了可乐，葡萄冰茶一般，可乐好喝，今天呆在学校了，今天还挺舒服的，开心
输出：{"mood":"😊","moodText":"开心","foodText":"披萨","foodRating":5,"foodSubtext":"披萨好吃","drinkText":"葡萄冰茶、可乐","drinkSubtext":"葡萄冰茶一般，可乐好喝","location":"学校","keywords":["开心","披萨","葡萄冰茶","可乐","学校"]}
`;

type Recommendation = {
  name: string;
  rating: number;
  match: number;
  tag: string;
  lastTried: string;
  historyEval: string;
  imageUrl: string;
  reason: string;
};

type ReverseGeocodeResult = {
  name: string;
  city?: string;
  address?: string;
  provider: "amap" | "bigdatacloud" | "mock";
};

const recommendations: Record<"eat" | "drink", Recommendation[]> = {
  eat: [
    {
      name: "慢炖苹果牛肉咖喱饭",
      rating: 4.7,
      match: 89,
      tag: "温热饱腹",
      lastTried: "22天前",
      historyEval: "极佳",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=900&auto=format&fit=crop",
      reason: "苹果的果甜正好中和了咖喱的辛香，伴随慢炖牛肉的软烂。一盘温热敦实的咖喱饭，能给你的夜晚带来满满的安全感和充实。",
    },
    {
      name: "草莓抹茶千层",
      rating: 4.9,
      match: 92,
      tag: "甜甜下午",
      lastTried: "5天前",
      historyEval: "高分",
      imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=900&auto=format&fit=crop",
      reason: "抹茶的微苦托住草莓的清甜，不是正餐压力，只是一枚小小的生活奖励。",
    },
  ],
  drink: [
    {
      name: "燕麦拿铁",
      rating: 4.9,
      match: 94,
      tag: "温柔醇香",
      lastTried: "2天前",
      historyEval: "常点",
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=900&auto=format&fit=crop",
      reason: "燕麦奶会让咖啡变得更圆润，适合慢慢喝，也适合把心情慢慢放平。",
    },
    {
      name: "桂花红茶",
      rating: 4.7,
      match: 91,
      tag: "花香安静",
      lastTried: "14天前",
      historyEval: "舒心",
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=900&auto=format&fit=crop",
      reason: "桂花香轻轻的，红茶温温的。它适合陪你度过一个不用太用力的下午。",
    },
  ],
};

function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (provider === "deepseek") return "deepseek";
  if (provider === "openai-compatible") return "openai-compatible";
  return "mock";
}

function getAIConfig() {
  const provider = getProvider();
  const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
  const baseUrl =
    process.env.AI_BASE_URL ||
    (provider === "deepseek" ? "https://api.deepseek.com/chat/completions" : "https://api.openai.com/v1/chat/completions");
  const model = process.env.AI_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");

  return { provider, apiKey, baseUrl, model };
}

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

function mockParseRecord(text: string): ParsedRecord {
  const parsed: ParsedRecord = {
    mood: "😌",
    moodText: "舒心",
    foodRating: 4,
    drinkRating: 4,
    outfitRating: 4,
    keywords: [],
  };

  if (/开心|高兴|快乐|幸福/.test(text)) {
    parsed.mood = "😊";
    parsed.moodText = "开心";
  } else if (/累|疲惫|困|崩溃/.test(text)) {
    parsed.mood = "😵";
    parsed.moodText = "疲惫";
  } else if (/难过|低落|失落/.test(text)) {
    parsed.mood = "😔";
    parsed.moodText = "失落";
  } else if (/平静|普通|还好/.test(text)) {
    parsed.mood = "😐";
    parsed.moodText = "平静";
  }

  const extractedDrinks = extractMentionedDrinks(text);
  if (extractedDrinks.length) {
    parsed.drinkText = extractedDrinks.join("、");
    parsed.drinkSubtext = extractEvaluationSnippet(text, extractedDrinks);
  } else if (text.includes("奶茶")) {
    parsed.drinkText = "奶茶";
    parsed.drinkSubtext = "甜甜的一杯，把今天轻轻托住。";
  } else if (text.includes("咖啡")) {
    parsed.drinkText = "咖啡";
    parsed.drinkSubtext = "咖啡醒神，也让心慢慢安静。";
  } else if (text.includes("茶")) {
    parsed.drinkText = "热茶";
    parsed.drinkSubtext = "热茶暖胃，适合慢慢喝完。";
  }

  if (text.includes("披萨")) {
    parsed.foodText = "披萨";
    parsed.foodSubtext = "披萨好吃";
  } else if (text.includes("蛋糕")) {
    parsed.foodText = "蛋糕";
    parsed.foodSubtext = "这一口，是治愈的味道。";
  } else if (text.includes("咖喱")) {
    parsed.foodText = "咖喱饭";
    parsed.foodSubtext = "温热饱腹，很适合今天。";
  } else if (text.includes("面")) {
    parsed.foodText = "面";
    parsed.foodSubtext = "热乎乎的一碗，给身体补一点能量。";
  }

  if (/穿|搭|衣服|裙|衬衫|外套/.test(text)) {
    parsed.outfitText = "今日穿搭";
    parsed.outfitSubtext = "今天的穿搭也有自己的小情绪。";
  }

  const locationMatch = text.match(/在(.{2,12}?)(?:喝|吃|散步|玩|看|坐|，|。|$)/);
  if (locationMatch?.[1]) {
    parsed.location = locationMatch[1].trim();
  } else if (text.includes("公园")) {
    parsed.location = "公园";
  } else if (text.includes("咖啡馆")) {
    parsed.location = "咖啡馆";
  }

  parsed.keywords = [parsed.foodText, parsed.drinkText, parsed.location, parsed.moodText].filter(Boolean) as string[];
  return parsed;
}

function appearsInSource(source: string, value?: string) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return false;
  if (cleaned.includes("、")) {
    return cleaned.split("、").every((item) => appearsInSource(source, item));
  }
  if (source.includes(cleaned)) return true;
  const compact = cleaned.replace(/^(吃了|喝了|去了|在|穿了|今天|今日)/, "").trim();
  return Boolean(compact && source.includes(compact));
}

const KNOWN_DRINK_WORDS = [
  "葡萄冰茶",
  "冰美式",
  "燕麦拿铁",
  "抹茶拿铁",
  "热抹茶",
  "奶茶",
  "可乐",
  "咖啡",
  "拿铁",
  "果茶",
  "冰茶",
  "红茶",
  "绿茶",
  "乌龙茶",
  "热茶",
  "茶",
].sort((a, b) => b.length - a.length);

const OUTFIT_HINT_PATTERN = /穿搭|衣服|裙|裙子|衬衫|外套|裤|裤子|鞋|帽|包|今日Look|look/i;

function extractMentionedDrinks(source: string) {
  const found: string[] = [];
  for (const drink of KNOWN_DRINK_WORDS) {
    if (source.includes(drink) && !found.some((item) => item.includes(drink) || drink.includes(item))) {
      found.push(drink);
    }
  }
  return found;
}

function extractEvaluationSnippet(source: string, items: string[]) {
  const snippets = items
    .map((item) => {
      const match = source.match(new RegExp(`(${item}[^，。；;,.]{0,12}(?:好喝|一般|不错|普通|难喝|喜欢|不喜欢|好|差))`));
      return match?.[1];
    })
    .filter(Boolean);
  return snippets.join("，") || undefined;
}

function isOutfitAllowed(source: string, value?: string) {
  if (!value) return false;
  if (extractMentionedDrinks(source).includes(value)) return false;
  if (!OUTFIT_HINT_PATTERN.test(source) && !OUTFIT_HINT_PATTERN.test(value)) return false;
  return appearsInSource(source, value);
}

function hasExplicitRating(source: string) {
  return /[1-5]\s*(星|分|颗)|一星|二星|三星|四星|五星|好吃|好喝|难吃|难喝|一般|普通|不错|极佳|满分|喜欢|不喜欢/.test(source);
}

function sanitizeParsedRecord(parsed: ParsedRecord, source: string): ParsedRecord {
  const next: ParsedRecord = { ...parsed };
  const ratingIsExplicit = hasExplicitRating(source);

  if (!appearsInSource(source, next.foodText)) {
    delete next.foodText;
    delete next.foodRating;
    delete next.foodSubtext;
  } else if (!ratingIsExplicit) {
    delete next.foodRating;
  }

  const mentionedDrinks = extractMentionedDrinks(source);
  if (mentionedDrinks.length) {
    next.drinkText = mentionedDrinks.join("、");
    next.drinkSubtext = extractEvaluationSnippet(source, mentionedDrinks) || next.drinkSubtext;
  }

  if (!appearsInSource(source, next.drinkText)) {
    delete next.drinkText;
    delete next.drinkRating;
    delete next.drinkSubtext;
  } else if (!ratingIsExplicit) {
    delete next.drinkRating;
  }

  if (!isOutfitAllowed(source, next.outfitText)) {
    delete next.outfitText;
    delete next.outfitRating;
    delete next.outfitSubtext;
  } else if (!ratingIsExplicit) {
    delete next.outfitRating;
  }

  if (!appearsInSource(source, next.location)) {
    delete next.location;
    delete next.locationTags;
  }

  next.keywords = [
    next.moodText,
    next.foodText,
    next.drinkText,
    next.outfitText,
    next.location,
    ...(next.locationTags || []),
  ].filter((item): item is string => Boolean(item && appearsInSource(source, item)));

  return Object.fromEntries(Object.entries(next).filter(([, value]) => value !== undefined && (!Array.isArray(value) || value.length > 0))) as ParsedRecord;
}

function buildDailyReflection(body: any) {
  const parts = [
    "今天的你也在认真生活。",
    body.foodText ? `你给自己留了 ${body.foodText} 这样一份小小奖励。` : "",
    body.drinkText ? `${body.drinkText} 像一枚温柔的书签，把今天轻轻夹住。` : "",
    body.location ? `在 ${body.location} 停留过的片刻，也值得被记下来。` : "",
    body.customNotes ? "那些零碎的话，都会慢慢变成你的生活纹理。" : "",
  ].filter(Boolean);
  return parts.join("");
}

function coordinateFallback(lat: number, lng: number): ReverseGeocodeResult {
  return {
    name: `当前位置 ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    provider: "mock",
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const amapKey = process.env.AMAP_WEB_SERVICE_KEY || process.env.AMAP_API_KEY || "";

  if (amapKey) {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${encodeURIComponent(amapKey)}&location=${lng},${lat}&extensions=base&radius=1000&roadlevel=0`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json() as any;
      const regeocode = data?.regeocode;
      const address = String(regeocode?.formatted_address || "");
      const component = regeocode?.addressComponent || {};
      const pois = Array.isArray(regeocode?.pois) ? regeocode.pois : [];
      const poiName = pois[0]?.name ? String(pois[0].name) : "";
      const township = typeof component.township === "string" ? component.township : "";
      const district = typeof component.district === "string" ? component.district : "";
      const city = Array.isArray(component.city) ? String(component.province || "") : String(component.city || component.province || "");
      const name = poiName || township || district || address;
      if (name) return { name, city, address, provider: "amap" };
    }
  }

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json() as any;
    const locality = String(data?.locality || data?.city || data?.principalSubdivision || "");
    const address = [data?.locality, data?.city, data?.principalSubdivision].filter(Boolean).join(" · ");
    if (locality) {
      return {
        name: locality,
        city: String(data?.city || data?.principalSubdivision || ""),
        address,
        provider: "bigdatacloud",
      };
    }
  }

  return coordinateFallback(lat, lng);
}

async function callCompatibleChat(messages: Array<{ role: "system" | "user"; content: string }>, temperature = 0.4) {
  const { provider, apiKey, baseUrl, model } = getAIConfig();
  if (provider === "mock" || !apiKey) return null;

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI provider request failed: ${response.status} ${detail}`);
  }

  const data = await response.json() as any;
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

app.get("/api/health", (_req, res) => {
  const { provider, model } = getAIConfig();
  res.json({ status: "ok", aiProvider: provider, aiModel: model, time: new Date().toISOString() });
});

app.post("/api/geocode/reverse", async (req, res) => {
  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ success: false, error: "Invalid coordinates" });
    return;
  }

  try {
    const result = await reverseGeocode(lat, lng);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Reverse geocode failed", error);
    res.json({ success: true, ...coordinateFallback(lat, lng), fallback: true });
  }
});

app.post("/api/ai/parse-record", async (req, res) => {
  const text = String(req.body?.text || "");
  if (!text.trim()) {
    res.json({ success: true, provider: "mock", parsed: mockParseRecord("") });
    return;
  }

  try {
    const content = await callCompatibleChat([
      {
        role: "system",
        content: PARSE_RECORD_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `请严格按原文抽取，不要补全：${text}`,
      },
    ], 0);

    if (!content) {
      res.json({ success: true, provider: "mock", parsed: mockParseRecord(text) });
      return;
    }

    const parsed = sanitizeParsedRecord(JSON.parse(extractJson(content)) as ParsedRecord, text);
    res.json({ success: true, provider: getProvider(), parsed });
  } catch (error) {
    console.error("AI parse failed", error);
    res.json({ success: true, provider: "mock", parsed: mockParseRecord(text), fallback: true });
  }
});

app.post("/api/ai/daily-reflection", async (req, res) => {
  const fallback = buildDailyReflection(req.body || {});

  try {
    const content = await callCompatibleChat([
      {
        role: "system",
        content: "你是温柔的生活手账助手。用朋友聊天的中文语气，生成60-120字今日总结，不要数据感，不要说自己是AI。",
      },
      {
        role: "user",
        content: JSON.stringify(req.body || {}),
      },
    ], 0.8);

    res.json({ reflection: content || fallback });
  } catch (error) {
    console.error("Daily reflection failed", error);
    res.json({ reflection: fallback || "今天也很好。哪怕只是简单记下一笔，也是在温柔地照看自己。" });
  }
});

app.post("/api/ai/monthly-summary", async (req, res) => {
  const fallback = "这个月你留下了很多细碎的小瞬间。它们不一定宏大，却一点点组成了你认真生活的证据。";
  try {
    const content = await callCompatibleChat([
      {
        role: "system",
        content:
          "你是 Mori Cabin 的月度回忆整理助手。请根据用户这一整个月的生活记录，生成一段中文月度小结。要求：1. 必须综合整个月的数据，不要只总结某一天；2. 可以提到本月出现较多的心情、食物、饮品、地点和生活节奏；3. 语气温柔、具体，像朋友帮用户回看这个月，不要像数据报告；4. 不要编造记录里没有的事件、地点、食物或情绪；5. 不要说 AI、算法、模型、数据分析；6. 长度 100-180 个中文字符；7. 如果记录很少，要诚实说明这个月记录还不多，但仍然给出温柔总结；8. 只输出正文，不要 Markdown。",
      },
      {
        role: "user",
        content: JSON.stringify(req.body || {}),
      },
    ], 0.7);

    res.json({ summary: content || fallback });
  } catch (error) {
    console.error("Monthly summary failed", error);
    res.json({ summary: fallback });
  }
});

function normalizeRecommendationReason(value: unknown, fallback: string) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 118)}...` : text;
}

function normalizeReasonChips(value: unknown, fallback: string[]) {
  const chips = Array.isArray(value) ? value : fallback;
  return chips
    .map((item) => String(item || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => (item.length > 12 ? item.slice(0, 12) : item));
}

app.post("/api/ai/recommend-reason", async (req, res) => {
  const recommendation = req.body?.recommendation || {};
  const type = req.body?.type === "drink" ? "drink" : "food";
  const fallbackReasons = normalizeReasonChips(recommendation.reasons, [
    recommendation.tag ? `偏好${recommendation.tag}` : "贴合最近偏好",
    Number(recommendation.rating) >= 4.5 ? "评分较高" : "适合今天",
  ]);
  const fallbackReason = normalizeRecommendationReason(
    recommendation.reason,
    `因为${fallbackReasons.join(" + ")}，今天可以把选择交给它。`,
  );

  try {
    const content = await callCompatibleChat([
      {
        role: "system",
        content:
          "你是 Mori Cabin 的温柔推荐文案助手。请把算法给出的吃喝推荐整理成一段更有画面感的中文推荐理由。要求：1. 像朋友轻声建议，不要营销腔；2. 不要说 AI、算法、模型、数据；3. 只能使用用户提供的字段，不要编造没出现过的经历、地点、口味或情绪；4. reason 输出 60-100 个中文字符，可以有一点生活感和场景感；5. reasons 输出 2-3 个短依据，每个不超过 8 个中文字符；6. 如果来自心动清单，突出之前想试、现在可以兑现；7. 如果来自历史记录，突出评分、最近多久没尝试、标签偏好；8. 只输出 JSON，不要 Markdown。JSON 格式：{\"reason\":\"...\",\"reasons\":[\"...\",\"...\"]}",
      },
      {
        role: "user",
        content: JSON.stringify({
          type,
          name: recommendation.name,
          rating: recommendation.rating,
          tag: recommendation.tag,
          source: recommendation.source,
          lastTried: recommendation.lastTried,
          historyEval: recommendation.historyEval,
          rawReason: recommendation.reason,
          algorithmReasons: recommendation.reasons || [],
        }),
      },
    ], 0.65);

    if (!content) {
      res.json({ success: true, provider: "mock", reason: fallbackReason, reasons: fallbackReasons });
      return;
    }

    const parsed = JSON.parse(extractJson(content)) as { reason?: string; reasons?: string[] };
    res.json({
      success: true,
      provider: getProvider(),
      reason: normalizeRecommendationReason(parsed.reason, fallbackReason),
      reasons: normalizeReasonChips(parsed.reasons, fallbackReasons),
    });
  } catch (error) {
    console.error("Recommendation reason polish failed", error);
    res.json({ success: true, provider: "mock", reason: fallbackReason, reasons: fallbackReasons, fallback: true });
  }
});

app.post("/api/ai/recommend", async (req, res) => {
  const type = req.body?.type === "drink" ? "drink" : "eat";
  const pool = recommendations[type];
  const selection = pool[0];
  res.json({ success: true, recommendation: selection });
});

app.post("/api/generate-ai-reflection", async (req, res) => {
  const fallback = buildDailyReflection(req.body || {});
  try {
    const content = await callCompatibleChat([
      {
        role: "system",
        content: "你是温柔的生活手账助手。用朋友聊天的中文语气，生成60-120字今日总结。",
      },
      {
        role: "user",
        content: JSON.stringify(req.body || {}),
      },
    ], 0.8);

    res.json({ reflection: content || fallback });
  } catch (error) {
    console.error("Reflection failed", error);
    res.json({ reflection: fallback || "今天也很好。你已经好好走过这一天了。" });
  }
});

app.post("/api/get-recommendation", async (req, res) => {
  const type = req.body?.type === "drink" ? "drink" : "eat";
  const pool = recommendations[type];
  const selection = pool[0];
  res.json({ success: true, recommendation: selection });
});

async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const { provider, model } = getAIConfig();
    console.log(`[Today is Also Good] running at http://localhost:${PORT} (${provider}/${model})`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
});
