export function CarouselDots({ index, total }: { index: number; total: number }) {
  return (
    <div className="dots" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i === index ? "dot dot-active" : "dot"} />
      ))}
    </div>
  );
}
