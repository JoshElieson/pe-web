import { createRoot } from "react-dom/client";
import { ScrollExpandMediaSection } from "../components/ScrollExpandMediaSection";

const mountNode = document.getElementById("scroll-expand-root");

if (mountNode) {
  createRoot(mountNode).render(<ScrollExpandMediaSection />);
}
