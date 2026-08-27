"use client";

import { useEffect, useRef, useState } from "react";
import { CampusLogo } from "@/components/CampusLogo";
import { CarouselDots } from "@/components/CarouselDots";
import { Clock } from "@/components/Clock";
import { EventsSlide } from "@/components/EventsSlide";
import { MensaSlide } from "@/components/MensaSlide";
import { WeatherBar } from "@/components/WeatherBar";
import { mockEvents, MOCK_MENSA, MOCK_WEATHER } from "@/lib/mock";
import type { EventsPayload, MensaPayload, WeatherPayload } from "@/lib/types";

const ROTATE_MS = 12_000;
const WEATHER_MS = 5 * 60_000;
const CONTENT_MS = 15 * 60_000;
const DESIGN_W = 1920;
const DESIGN_H = 1080;

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
  const [slide, setSlide] = useState(0);
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
    const id = setInterval(() => setSlide((s) => (s + 1) % 2), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

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
            <div className="slide" key={slide}>
              {slide === 0 ? <MensaSlide mensa={mensa} /> : <EventsSlide events={events} />}
            </div>
          </div>
          <div className="photo-wrap">
            <img className="photo" src="/campus.jpg" alt="Luftbild Bildungscampus Heilbronn" />
          </div>
        </div>

        <CarouselDots index={slide} total={2} />
      </main>
    </div>
  );
}
