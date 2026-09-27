"use client";

import { useEffect, useRef, useState } from "react";
import { CampusLogo } from "@/components/CampusLogo";
import { CarouselDots } from "@/components/CarouselDots";
import { Clock } from "@/components/Clock";
import { EventsSlide } from "@/components/EventsSlide";
import { FactsSlide } from "@/components/FactsSlide";
import { MensaSlide } from "@/components/MensaSlide";
import { WeatherBar } from "@/components/WeatherBar";
import { FACTS } from "@/lib/facts";
import { mockEvents, MOCK_MENSA, MOCK_WEATHER } from "@/lib/mock";
import type { EventsPayload, MensaPayload, WeatherPayload } from "@/lib/types";

const WEATHER_MS = 5 * 60_000;
const CONTENT_MS = 15 * 60_000;
const DESIGN_W = 1920;
const DESIGN_H = 1080;
const SLIDE_COUNT = 2;
/** Mensa-Fenster Europe/Berlin: 07:00–14:30 inkl. */
const MENSA_FROM = 7 * 60;
const MENSA_TO = 14 * 60 + 30;

function berlinMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function isMensaWindow(now = new Date()) {
  const mins = berlinMinutes(now);
  return mins >= MENSA_FROM && mins <= MENSA_TO;
}

function dwellMs(text: string) {
  const chars = text.replace(/\s+/g, " ").trim().length;
  const read = 5000 + chars * 48;
  const sway = 0.9 + Math.random() * 0.2;
  return Math.round(Math.min(48_000, Math.max(9_000, read * sway)));
}

function mensaText(mensa: MensaPayload) {
  return [mensa.hours, ...mensa.items.flatMap((item) => [item.label, item.title, item.subtitle ?? ""])].join(" ");
}

function eventsText(events: EventsPayload) {
  return events.items.flatMap((event) => [event.date, event.time, event.title, event.location, event.description]).join(" ");
}

function factText(index: number) {
  const fact = FACTS[index % FACTS.length];
  return `${fact.category} ${fact.question} ${fact.answer}`;
}

async function loadJson<T>(url: string, fallback: T, signal?: AbortSignal): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store", signal });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export function Kiosk() {
  const stageRef = useRef<HTMLDivElement>(null);
  /** 0 = Veranstaltungen, 1 = Mensa oder Frage */
  const [slide, setSlide] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [mensaOpen, setMensaOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherPayload>(MOCK_WEATHER);
  const [mensa, setMensa] = useState<MensaPayload>(MOCK_MENSA);
  const [events, setEvents] = useState<EventsPayload>(mockEvents());

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const w = window.visualViewport?.width ?? window.innerWidth;
      const h = window.visualViewport?.height ?? window.innerHeight;
      stage.style.setProperty("--kiosk-scale", String(Math.min(w / DESIGN_W, h / DESIGN_H)));
    };
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const tick = () => setMensaOpen(isMensaWindow());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const secondaryText = mensaOpen ? mensaText(mensa) : factText(factIndex);
    const text = slide === 0 ? eventsText(events) : secondaryText;
    const id = setTimeout(() => {
      if (slide === 1 && !mensaOpen) setFactIndex((i) => (i + 1) % FACTS.length);
      setSlide((s) => (s + 1) % SLIDE_COUNT);
    }, dwellMs(text));
    return () => clearTimeout(id);
  }, [slide, mensa, events, factIndex, mensaOpen]);

  useEffect(() => {
    const ac = new AbortController();
    const loadWeather = () =>
      loadJson("/api/weather", MOCK_WEATHER, ac.signal).then((data) => {
        if (!ac.signal.aborted) setWeather(data);
      });
    const loadContent = () => {
      loadJson("/api/mensa", MOCK_MENSA, ac.signal).then((data) => {
        if (!ac.signal.aborted) setMensa(data);
      });
      loadJson("/api/events", mockEvents(), ac.signal).then((data) => {
        if (!ac.signal.aborted) setEvents(data);
      });
    };
    loadWeather();
    loadContent();
    const w = setInterval(loadWeather, WEATHER_MS);
    const c = setInterval(loadContent, CONTENT_MS);
    return () => {
      ac.abort();
      clearInterval(w);
      clearInterval(c);
    };
  }, []);

  const secondaryKey = mensaOpen ? "mensa" : `fact-${factIndex}`;

  return (
    <div className="stage" ref={stageRef}>
      <main className="kiosk">
        <header className="top">
          <WeatherBar days={weather.days} />
          <Clock />
        </header>

        <div className="body">
          <div className="col">
            <CampusLogo />
            <div className="slide" key={slide === 0 ? "events" : secondaryKey}>
              {slide === 0 ? (
                <EventsSlide events={events} />
              ) : mensaOpen ? (
                <MensaSlide mensa={mensa} />
              ) : (
                <FactsSlide fact={FACTS[factIndex % FACTS.length]} />
              )}
            </div>
          </div>
          <div className="photo-wrap">
            <img className="photo" src="/campus.jpg" alt="Luftbild Bildungscampus Heilbronn" />
          </div>
        </div>

        <CarouselDots index={slide} total={SLIDE_COUNT} />
      </main>
    </div>
  );
}
