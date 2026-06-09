const CARDS = [
  {
    id: "round-table",
    title: "Round Table",
    placement: "round-table",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M6 21V9a9 9 0 0 0 9 9" />
      </svg>
    ),
    items: ["Multiple models collaborate", "Weight model influence", "Synthesized answer"],
  },
  {
    id: "custom-agents",
    title: "Custom Agents",
    placement: "custom-agents",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8V4H8" />
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    ),
    items: ["Specialized AI", "Shared project context", "Persistent memory"],
  },
  {
    id: "multi-panel",
    title: "Multi-Panel Workspace",
    placement: "multi-panel",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    items: ["Multiple chats at once", "Side-by-side reasoning", "Built for parallel work"],
  },
] as const;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.25 4.75 8.5 9.5 3.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroFeatureCards() {
  return (
    <div className="hero-forge__cards-inner">
      {CARDS.map((card) => (
        <article
          key={card.id}
          className={`hero-forge__card hero-forge__card--${card.placement}`}
        >
          <header className="hero-forge__card-head">
            <span className="hero-forge__card-icon">{card.icon}</span>
            <h2 className="hero-forge__card-title">{card.title}</h2>
          </header>
          <ul className="hero-forge__card-list">
            {card.items.map((item) => (
              <li key={item} className="hero-forge__card-row">
                <span className="hero-forge__card-check" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
