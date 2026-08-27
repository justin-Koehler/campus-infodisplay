export type WeatherIcon = "sun" | "sunCloud" | "cloud" | "rain" | "storm" | "snow" | "fog";

export type WeatherDay = {
  weekday: string;
  tempC: number;
  icon: WeatherIcon;
};

export type WeatherPayload = {
  days: WeatherDay[];
  source: "campus" | "forecast" | "mock";
  campusTempC: number | null;
};

export type MensaCategory = "tierisch" | "vegetarisch" | "vegan";

export type MensaItem = {
  category: MensaCategory;
  label: string;
  title: string;
  subtitle: string;
};

export type MensaPayload = {
  hours: string;
  items: MensaItem[];
  source: "campus" | "openmensa" | "mock";
};

export type EventItem = {
  date: string;
  time: string;
  title: string;
  location: string;
  description: string;
};

export type EventsPayload = {
  items: EventItem[];
  source: "campus" | "mock";
};
