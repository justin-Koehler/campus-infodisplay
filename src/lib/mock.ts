import type { EventItem, EventsPayload, MensaPayload, WeatherPayload } from "./types";

export const MOCK_WEATHER: WeatherPayload = {
  days: [
    { weekday: "Mi", tempC: 11, icon: "rain" },
    { weekday: "Do", tempC: 12, icon: "sunCloud" },
    { weekday: "Fr", tempC: 11, icon: "sun" },
  ],
  source: "mock",
  campusTempC: 11,
};

export const MOCK_MENSA: MensaPayload = {
  hours: "Öffnungszeiten: 11:00 - 14:30 Uhr",
  source: "mock",
  items: [
    {
      category: "tierisch",
      label: "TIERISCH",
      title: "Spareribs vom hällischen Landschwein",
      subtitle: "mit Maisgemüse und Ofenkartoffeln",
    },
    {
      category: "vegetarisch",
      label: "VEGETARISCH",
      title: "Gefüllter Pasta",
      subtitle: "mit fruchtiger Tomatensoße",
    },
    {
      category: "vegan",
      label: "VEGAN",
      title: "Erbsenrisotto",
      subtitle: "mit Sonnenblumenkernen und Pfannengemüse",
    },
  ],
};

const EVENT_COPY = [
  {
    title: "BiNE-Open-Talk: Zwischen Zimt & Netzwerkzauber",
    location: "DHBW CAS Bildungscampus 13, Heilbronn",
    description:
      "Ein Abend zwischen Campus, Zimt und Begegnung: Impulse aus dem Netzwerk, offene Gespräche und Raum, um Ideen weiterzutragen – mit Gästen aus Studium, Praxis und den Einrichtungen am Bildungscampus Heilbronn.",
  },
  {
    title: "Campus Garden Summer Evening",
    location: "Campus Garden, Bildungscampus 9, Heilbronn",
    description:
      "Offener Abend im Campus Garden mit regionaler Küche, Live-Musik und der Gelegenheit, Institutionen, Initiativen und neue Gesichter auf dem Gelände der Dieter Schwarz Stiftung kennenzulernen.",
  },
  {
    title: "LIV Late: Lernen. Informieren. Vernetzen.",
    location: "Bibliothek LIV, Bildungscampus 15, Heilbronn",
    description:
      "Längere Öffnungszeiten, Kurzführungen durch den Bestand und Workspace-Tipps für die Klausurphase – Lernen, Informieren und Vernetzen an einem Abend in der gemeinsamen Bibliothek.",
  },
];

export function mockEvents(from = new Date()): EventsPayload {
  const items: EventItem[] = EVENT_COPY.map((event, index) => {
    const date = new Date(from);
    date.setDate(date.getDate() + 1 + index * 2);
    date.setHours(18, 0, 0, 0);
    const month = date.toLocaleDateString("de-DE", { month: "short" }).replace(".", "");
    return {
      date: `${date.getDate()}.${month}`,
      time: "18:00",
      title: event.title,
      location: event.location,
      description: event.description,
    };
  });
  return { items, source: "mock" };
}
