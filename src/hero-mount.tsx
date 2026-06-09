import { createRoot } from "react-dom/client";
import { HeroGrid } from "../components/HeroGrid";

const gridRoot = document.getElementById("hero-grid-root");

if (gridRoot) {
  createRoot(gridRoot).render(<HeroGrid />);
}
