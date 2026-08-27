import type { MensaCategory, MensaPayload } from "@/lib/types";

function PigIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
      <path
        d="M8 14.5c0-2.2 1.7-4 4.2-4.2C13.4 8.4 15.4 7.5 17 7.5c1.6 0 3.6.9 4.8 2.8 2.5.2 4.2 2 4.2 4.2 0 .6-.1 1.1-.3 1.6 1.4.9 2.3 2.3 2.3 4 0 3.4-4.8 6.4-11 6.4s-11-3-11-6.4c0-1.7.9-3.1 2.3-4 .2-.5.3-1 .3-1.6Z"
        fill="#fff"
      />
      <circle cx="13.2" cy="16.8" r="1.15" fill="#1B3358" />
      <circle cx="20.8" cy="16.8" r="1.15" fill="#1B3358" />
      <ellipse cx="17" cy="21.2" rx="3.2" ry="2.1" fill="#1B3358" />
      <circle cx="15.7" cy="21.2" r=".55" fill="#fff" />
      <circle cx="18.3" cy="21.2" r=".55" fill="#fff" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <path
        d="M7.5 16.5c0-6 5.2-12.8 14.8-13.2-1.6 8.2-4.2 13.8-10.2 17.2-2.4 1.4-4.6 1.2-4.6-4Z"
        fill="#fff"
      />
      <path d="M9.2 22.8c2.2-3.8 5.8-8.2 13.2-12.6" stroke="#1B3358" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CategoryIcon({ category }: { category: MensaCategory }) {
  return <div className="cat-icon">{category === "tierisch" ? <PigIcon /> : <LeafIcon />}</div>;
}

function Arrow() {
  return (
    <svg className="chip-arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MensaSlide({ mensa }: { mensa: MensaPayload }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div className="panel-chip">
          <Arrow /> Mensa heute
        </div>
        <p className="hours">{mensa.hours}</p>
      </header>
      <ul className="menu-list">
        {mensa.items.map((item) => (
          <li className="menu-row" key={`${item.category}-${item.title}`}>
            <CategoryIcon category={item.category} />
            <div>
              <p className="menu-label">{item.label}</p>
              <p className="menu-title">{item.title}</p>
              {item.subtitle ? <p className="menu-sub">{item.subtitle}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
