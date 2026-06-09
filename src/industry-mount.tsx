import { createRoot } from "react-dom/client";
import { IndustrySection } from "../components/IndustrySection";

const mountNode = document.getElementById("industry-section-root");

if (mountNode) {
  createRoot(mountNode).render(<IndustrySection />);
}
