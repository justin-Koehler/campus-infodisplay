import type { EventsPayload } from "@/lib/types";

function Pin() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 13s4.6-4 4.6-6.6A4.6 4.6 0 1 0 2.4 6.4C2.4 9 7 13 7 13Z" stroke="#c8c8c8" strokeWidth="1.3" />
      <circle cx="7" cy="6.4" r="1.35" fill="#c8c8c8" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg className="chip-arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EventsSlide({ events }: { events: EventsPayload }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div className="panel-chip">
          <Arrow /> Veranstaltungen
        </div>
      </header>
      <ul className="event-list">
        {events.items.map((event) => (
          <li className="event-row" key={`${event.date}-${event.title}`}>
            <div className="event-when">
              <span>{event.date}</span>
              <span>{event.time}</span>
            </div>
            <div>
              <p className="event-title">{event.title}</p>
              <p className="event-loc">
                <Pin />
                {event.location}
              </p>
              <p className="event-desc">{event.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
