"use client";

import { useEffect, useState } from "react";

function pad(n: string | number) {
  return String(n).replace(/\D/g, "").padStart(2, "0");
}

function formatNow(now: Date) {
  const berlin = { timeZone: "Europe/Berlin" as const };
  const timeParts = new Intl.DateTimeFormat("de-DE", {
    ...berlin,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = pad(timeParts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = pad(timeParts.find((p) => p.type === "minute")?.value ?? "0");

  const dateParts = new Intl.DateTimeFormat("de-DE", {
    ...berlin,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).formatToParts(now);
  const get = (type: string) => dateParts.find((p) => p.type === type)?.value.replace(".", "") ?? "";

  return {
    time: `${hour}:${minute}`,
    date: `${get("weekday")}. ${get("day")}. ${get("month")}`,
  };
}

export function Clock() {
  const [now, setNow] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const tick = () => setNow(formatNow(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clock">
      <div className="clock-time">{now?.time ?? "--:--"}</div>
      <div className="clock-date">{now?.date ?? ""}</div>
    </div>
  );
}
