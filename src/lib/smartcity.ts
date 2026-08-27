import { mockEvents, MOCK_MENSA, MOCK_WEATHER } from "./mock";
import type {
  MensaCategory,
  MensaItem,
  MensaPayload,
  WeatherDay,
  WeatherIcon,
  WeatherPayload,
} from "./types";

const WEATHER_URL =
  process.env.SMARTCITY_WEATHER_URL ??
  "https://apis.smartcity.hn/bildungscampus/iotplatform/weatherstation/v1";
const THM_URL =
  process.env.SMARTCITY_THM_URL ??
  "https://apis.smartcity.hn/bildungscampus/iotplatform/thm/v1";
const MENSA_URL =
  process.env.SMARTCITY_MENSA_URL ??
  "https://apis.smartcity.hn/bildungscampus/smartcampus/mensamenu/v1";

const CAMPUS_LAT = 49.148;
const CAMPUS_LNG = 9.216;
const OPENMENSA_ID = 277;

function apiKey(): string | undefined {
  return process.env.SMARTCITY_API_KEY || process.env.SMARTCITY_CLIENT_ID || undefined;
}

const ALLOWED_HOSTS = new Set(["apis.smartcity.hn", "api.open-meteo.com", "openmensa.org"]);
const WEATHER_TTL_MS = 5 * 60_000;
const MENSA_TTL_MS = 15 * 60_000;

function assertAllowedUrl(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error("blocked url");
  }
}

async function getJson(url: string, timeoutMs = 8000, key?: string): Promise<unknown> {
  assertAllowedUrl(url);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["x-apikey"] = key;
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers,
  });
  if (!res.ok) throw new Error("upstream error");
  return res.json();
}

function withKey(url: string): { url: string; key: string } {
  const key = apiKey();
  if (!key) throw new Error("missing api key");
  return { url, key };
}

type CacheEntry<T> = { at: number; data: T };

function readCache<T>(entry: CacheEntry<T> | null, ttlMs: number): T | null {
  if (!entry || Date.now() - entry.at > ttlMs) return null;
  return entry.data;
}

type TsPoint = { ts?: number; value?: string | number };
type Entity = {
  TIME_SERIES?: Record<string, TsPoint>;
};

function num(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function pickSeries(series: Record<string, TsPoint> | undefined, pattern: RegExp): number | null {
  if (!series) return null;
  for (const [key, point] of Object.entries(series)) {
    if (pattern.test(key)) return num(point?.value);
  }
  return null;
}

async function campusLatestTemp(baseUrl: string): Promise<number | null> {
  const groupsReq = withKey(`${baseUrl.replace(/\/$/, "")}/authGroup`);
  const groups = (await getJson(groupsReq.url, 8000, groupsReq.key)) as {
    authGroup?: { authGroupName?: string }[];
  };
  const group = groups.authGroup?.[0]?.authGroupName;
  if (!group) return null;
  const pageReq = withKey(
    `${baseUrl.replace(/\/$/, "")}/authGroup/${encodeURIComponent(group)}/entityId?page=0`,
  );
  const page = (await getJson(pageReq.url, 8000, pageReq.key)) as { entities?: Entity[] };

  const temps: number[] = [];
  for (const entity of page.entities ?? []) {
    const t = pickSeries(entity.TIME_SERIES, /temp/i);
    if (t != null) temps.push(t);
  }
  if (!temps.length) return null;
  return Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
}

function wmoIcon(code: number): WeatherIcon {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "sunCloud";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  if (code >= 51) return "rain";
  return "cloud";
}

function weekdayDe(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
}

async function openMeteoDays(): Promise<WeatherDay[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(CAMPUS_LAT));
  url.searchParams.set("longitude", String(CAMPUS_LNG));
  url.searchParams.set("daily", "weather_code,temperature_2m_max");
  url.searchParams.set("timezone", "Europe/Berlin");
  url.searchParams.set("forecast_days", "3");
  const data = (await getJson(url.toString())) as {
    daily?: { time?: string[]; weather_code?: number[]; temperature_2m_max?: number[] };
  };
  const times = data.daily?.time ?? [];
  return times.slice(0, 3).map((time, i) => ({
    weekday: weekdayDe(time),
    tempC: Math.round(data.daily?.temperature_2m_max?.[i] ?? 0),
    icon: wmoIcon(data.daily?.weather_code?.[i] ?? 3),
  }));
}

let weatherCache: CacheEntry<WeatherPayload> | null = null;

async function loadWeather(): Promise<WeatherPayload> {
  let days: WeatherDay[] = [];
  try {
    days = await openMeteoDays();
  } catch {
    days = [];
  }

  let campusTempC: number | null = null;
  if (apiKey()) {
    for (const base of [WEATHER_URL, THM_URL]) {
      try {
        campusTempC = await campusLatestTemp(base);
        if (campusTempC != null) break;
      } catch {
        /* try next source */
      }
    }
  }

  if (!days.length && campusTempC == null) return MOCK_WEATHER;

  if (!days.length) {
    const now = new Date();
    days = [0, 1, 2].map((offset) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      return {
        weekday: d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", ""),
        tempC: campusTempC ?? MOCK_WEATHER.days[offset]?.tempC ?? 11,
        icon: MOCK_WEATHER.days[offset]?.icon ?? "sunCloud",
      };
    });
  }

  if (campusTempC != null && days[0]) {
    days = [{ ...days[0], tempC: Math.round(campusTempC) }, ...days.slice(1)];
  }

  return {
    days,
    campusTempC,
    source: campusTempC != null ? "campus" : "forecast",
  };
}

export async function getWeather(): Promise<WeatherPayload> {
  const hit = readCache(weatherCache, WEATHER_TTL_MS);
  if (hit) return hit;
  const data = await loadWeather();
  weatherCache = { at: Date.now(), data };
  return data;
}

type Gericht = {
  text?: string;
  prodart?: string;
};
type Linie = { ausgabe?: string; gericht?: Gericht[] };
type Tagesplan = { datum?: string; tag?: string; linie?: Linie[] };

function classify(ausgabe: string, prodart: string, text: string): MensaCategory {
  const blob = `${ausgabe} ${prodart} ${text}`.toLowerCase();
  if (/vegan|vg\b/.test(blob)) return "vegan";
  if (/vegetar|ovo|lacto|fleischlos/.test(blob)) return "vegetarisch";
  return "tierisch";
}

const CATEGORY_LABEL: Record<MensaCategory, string> = {
  tierisch: "TIERISCH",
  vegetarisch: "VEGETARISCH",
  vegan: "VEGAN",
};

function splitDish(text: string): { title: string; subtitle: string } {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^(.*?)\s+(mit\s+.+)$/i);
  if (match) return { title: match[1], subtitle: match[2] };
  if (cleaned.length > 42) {
    const cut = cleaned.lastIndexOf(" ", 40);
    return { title: cleaned.slice(0, cut > 20 ? cut : 40), subtitle: cleaned.slice(cut > 20 ? cut + 1 : 40) };
  }
  return { title: cleaned, subtitle: "" };
}

function isSideDish(ausgabe: string, prodart: string, text: string): boolean {
  return /dessert|nachtisch|suppe|suppentopf|beilage|salat|cremesüpp/i.test(
    `${ausgabe} ${prodart} ${text}`,
  );
}

function pickMensaItems(plan: Tagesplan): MensaItem[] {
  const dishes: MensaItem[] = [];
  const sides: MensaItem[] = [];
  for (const linie of plan.linie ?? []) {
    for (const gericht of linie.gericht ?? []) {
      const text = gericht.text?.trim();
      if (!text) continue;
      const category = classify(linie.ausgabe ?? "", gericht.prodart ?? "", text);
      const { title, subtitle } = splitDish(text);
      const item = {
        category,
        label: CATEGORY_LABEL[category],
        title,
        subtitle,
      };
      if (isSideDish(linie.ausgabe ?? "", gericht.prodart ?? "", text)) sides.push(item);
      else dishes.push(item);
    }
  }
  const chosen: MensaItem[] = [];
  for (const category of ["tierisch", "vegetarisch", "vegan"] as MensaCategory[]) {
    const hit = dishes.find((d) => d.category === category);
    if (hit) chosen.push(hit);
  }
  if (chosen.length < 3) {
    for (const dish of [...dishes, ...sides]) {
      if (chosen.length >= 3) break;
      if (!chosen.some((c) => c.title === dish.title)) chosen.push(dish);
    }
  }
  return chosen.slice(0, 3);
}

function todayIso(timeZone = "Europe/Berlin"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

function parseCampusMensa(raw: unknown): MensaItem[] | null {
  const data = raw as { tagesplan?: Tagesplan[] };
  const plans = data.tagesplan ?? [];
  if (!plans.length) return null;
  const today = todayIso();
  const plan = plans.find((p) => (p.datum ?? "").startsWith(today)) ?? plans[0];
  const items = pickMensaItems(plan);
  return items.length ? items : null;
}

type OpenMensaMeal = { name?: string; notes?: string[]; category?: string };

function parseOpenMensa(meals: OpenMensaMeal[]): MensaItem[] {
  const fakePlan: Tagesplan = {
    linie: meals
      .filter((m) => m.name)
      .map((m) => ({
        ausgabe: m.category ?? "",
        gericht: [{ text: m.name, prodart: m.category ?? "" }],
      })),
  };
  return pickMensaItems(fakePlan);
}

let mensaCache: CacheEntry<MensaPayload> | null = null;

async function loadMensa(): Promise<MensaPayload> {
  if (apiKey()) {
    try {
      const menuReq = withKey(`${MENSA_URL.replace(/\/$/, "")}/menu`);
      const raw = await getJson(menuReq.url, 8000, menuReq.key);
      const items = parseCampusMensa(raw);
      if (items?.length) return { hours: MOCK_MENSA.hours, items, source: "campus" };
    } catch {
      /* fall through */
    }
  }

  try {
    const iso = todayIso();
    const meals = (await getJson(
      `https://openmensa.org/api/v2/canteens/${OPENMENSA_ID}/days/${iso}/meals`,
    )) as OpenMensaMeal[];
    const items = parseOpenMensa(meals);
    if (items.length) return { hours: MOCK_MENSA.hours, items, source: "openmensa" };
  } catch {
    /* fall through */
  }

  return MOCK_MENSA;
}

export async function getMensa(): Promise<MensaPayload> {
  const hit = readCache(mensaCache, MENSA_TTL_MS);
  if (hit) return hit;
  const data = await loadMensa();
  mensaCache = { at: Date.now(), data };
  return data;
}

export async function getEvents() {
  return mockEvents();
}
