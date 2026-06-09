import { createRoot } from "react-dom/client";
import { PluginsShowcase } from "../components/PluginsShowcase";

const mountNode = document.getElementById("plugins-showcase-mount");

if (mountNode) {
  createRoot(mountNode).render(<PluginsShowcase />);
}
