import type { Fact } from "@/lib/facts";

function Arrow() {
  return (
    <svg className="chip-arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FactsSlide({ fact }: { fact: Fact }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div className="panel-chip">
          <Arrow /> {fact.category}
        </div>
      </header>
      <div className="fact-body">
        <p className="fact-q">{fact.question}</p>
        <p className="fact-a">{fact.answer}</p>
      </div>
    </section>
  );
}
