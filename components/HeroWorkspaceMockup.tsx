import type { CSSProperties } from "react";

const PANELS = [
  {
    id: "gpt",
    name: "GPT-4o",
    icon: "assets/icons/openai-wordmark.png",
    iconClass: "hero-mockup__model-icon--openai",
    response:
      "Lead with a single-sentence thesis, then three bullets. Keep the tone direct and avoid hedging—the compare view makes weak answers obvious.",
    accent: "#10a37f",
  },
  {
    id: "claude",
    name: "Claude 3.5",
    icon: "assets/icons/claude-wordmark.svg",
    iconClass: "hero-mockup__model-icon--claude",
    response:
      "Open with the outcome, then rationale. Use parallel structure across bullets so readers can scan differences across models instantly.",
    accent: "#d97757",
  },
  {
    id: "gemini",
    name: "Gemini 1.5",
    icon: "assets/icons/gemini-wordmark.svg",
    iconClass: "hero-mockup__model-icon--gemini",
    response:
      "Start with the recommendation, support with concise evidence, and end with a clear next step your team can ship today.",
    accent: "#4285f4",
  },
] as const;

const SHARED_PROMPT =
  "Rewrite this product update for our launch email. Keep it under 120 words, confident, and scannable.";

export function HeroWorkspaceMockup() {
  return (
    <div className="hero-mockup" aria-hidden="true">
      <div className="hero-mockup__glow" />
      <div className="hero-mockup__shell">
        <div className="hero-mockup__window">
          <header className="hero-mockup__titlebar">
            <div className="hero-mockup__traffic">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-mockup__title">
              <img src="assets/forge-logo.png" alt="" width={64} height={22} />
              <span className="hero-mockup__title-sep" />
              <span>Product launch workspace</span>
            </div>
            <span className="hero-mockup__live">Live compare</span>
          </header>

          <div className="hero-mockup__toolbar">
            <div className="hero-mockup__toolbar-left">
              <span className="hero-mockup__pill hero-mockup__pill--active">Compare</span>
              <span className="hero-mockup__pill">3 models</span>
              <span className="hero-mockup__pill">Synced prompt</span>
            </div>
            <span className="hero-mockup__toolbar-meta">Round 1 · 3 responses</span>
          </div>

          <div className="hero-mockup__shared">
            <span className="hero-mockup__shared-label">Prompt</span>
            <p>{SHARED_PROMPT}</p>
          </div>

          <div className="hero-mockup__panels">
            {PANELS.map((panel) => (
              <article
                key={panel.id}
                className="hero-mockup__panel"
                style={{ "--panel-accent": panel.accent } as CSSProperties}
              >
                <div className="hero-mockup__panel-head">
                  <img
                    className={`hero-mockup__model-icon ${panel.iconClass}`}
                    src={panel.icon}
                    alt=""
                  />
                  <span>{panel.name}</span>
                </div>
                <div className="hero-mockup__bubble hero-mockup__bubble--user">
                  <span className="hero-mockup__bubble-label">You</span>
                  <p>{SHARED_PROMPT}</p>
                </div>
                <div className="hero-mockup__bubble hero-mockup__bubble--assistant">
                  <span className="hero-mockup__bubble-label">{panel.name}</span>
                  <p>{panel.response}</p>
                </div>
              </article>
            ))}
          </div>

          <footer className="hero-mockup__composer">
            <div className="hero-mockup__composer-field">
              <span>Ask all models…</span>
            </div>
            <button type="button" className="hero-mockup__composer-send" tabIndex={-1}>
              Run
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
