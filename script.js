(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
})();

(function initHeroVideo() {
  const video = document.getElementById("hero-video");
  if (!video) return;

  const media = video.closest(".hero-media");

  const ensureMuted = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.playsInline = true;
  };

  const startPlayback = () => {
    ensureMuted();
    video.play().catch(() => {});
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused) startPlayback();
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && video.paused) startPlayback();
  });
})();

(function initHeroIntro() {
  const root = document.documentElement;
  if (!root.classList.contains("hero-intro")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finish = () => root.classList.remove("hero-intro");

  if (reducedMotion.matches) {
    finish();
    return;
  }

  window.setTimeout(finish, 6200);
})();
