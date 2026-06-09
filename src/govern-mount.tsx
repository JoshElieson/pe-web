import { createRoot } from "react-dom/client";
import { GovernSection } from "../components/GovernSection";

const mountNode = document.getElementById("govern-section-root");

if (mountNode) {
  createRoot(mountNode).render(<GovernSection />);
}
