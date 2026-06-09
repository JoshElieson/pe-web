import { useState } from "react";
import { PluginsPreviewPanel } from "./PluginsPreviewPanel";

const FEATURES = [
  {
    id: "01",
    title: "Add models to the Round Table",
    description:
      "Stop choosing one model. Let them work together.\nSelect any combination of AI providers.",
  },
  {
    id: "02",
    title: "Weight their influence",
    description: "Give more authority to the models you trust most.",
  },
  {
    id: "03",
    title: "Receive a synthesized answer",
    description:
      "FORGE combines the best reasoning from every model into one result.",
  },
] as const;

export function PluginsShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section
      id="plugins-showcase-root"
      className="plugins-section"
      aria-labelledby="plugins-heading"
    >
      <div className="plugins-section__showcase">
        <div className="plugins-section__showcase-inner">
          <div className="plugins-section__copy">
            <h2 id="plugins-heading" className="plugins-section__headline">
              Build with multiple AI models at once.
            </h2>
            <ul className="plugins-section__features" role="list">
              {FEATURES.map((feature, index) => {
                const isActive = index === activeFeature;
                return (
                  <li key={feature.id}>
                    <button
                      type="button"
                      className={`plugins-section__feature${isActive ? " plugins-section__feature--active" : ""}`}
                      onClick={() => setActiveFeature(index)}
                      aria-expanded={isActive}
                    >
                      <span className="plugins-section__feature-num">
                        {feature.id}
                      </span>
                      <span className="plugins-section__feature-body">
                        <span className="plugins-section__feature-title">
                          {feature.title}
                        </span>
                        {isActive && (
                          <span className="plugins-section__feature-desc">
                            {feature.description}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <PluginsPreviewPanel />
        </div>
      </div>
    </section>
  );
}
