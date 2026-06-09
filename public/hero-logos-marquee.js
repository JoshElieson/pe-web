(function () {
  var LOOP_MS = 24000;

  function initHeroLogosMarquee() {
    var viewport = document.querySelector(".hero-logos__viewport");
    var track = document.querySelector(".hero-logos__track");
    if (!viewport || !track) return;

    var activeAnimation = null;
    var resizeTimer = 0;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyStaticCenter(center) {
      track.style.transform = "translate3d(" + center + "px, 0, 0)";
    }

    function startAnimation() {
      var viewportWidth = viewport.clientWidth;
      var trackWidth = track.scrollWidth;
      if (!viewportWidth || !trackWidth) return;

      var setWidth = trackWidth / 2;
      var center = (viewportWidth - setWidth) / 2;

      if (activeAnimation) {
        activeAnimation.cancel();
        activeAnimation = null;
      }

      track.style.transform = "";

      if (reducedMotion) {
        applyStaticCenter(center);
        return;
      }

      activeAnimation = track.animate(
        [
          { transform: "translate3d(" + center + "px, 0, 0)" },
          { transform: "translate3d(" + (center - setWidth) + "px, 0, 0)" },
        ],
        {
          duration: LOOP_MS,
          iterations: Infinity,
          easing: "linear",
        },
      );
    }

    function scheduleStart() {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(startAnimation);
      });
    }

    function waitForImages(callback) {
      var images = track.querySelectorAll("img");
      if (!images.length) {
        callback();
        return;
      }

      var remaining = 0;
      images.forEach(function (image) {
        if (image.complete) return;
        remaining += 1;
        image.addEventListener(
          "load",
          function () {
            remaining -= 1;
            if (remaining === 0) callback();
          },
          { once: true },
        );
        image.addEventListener(
          "error",
          function () {
            remaining -= 1;
            if (remaining === 0) callback();
          },
          { once: true },
        );
      });

      if (remaining === 0) callback();
    }

    waitForImages(scheduleStart);

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(scheduleStart, 150);
    });

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
      reducedMotion = event.matches;
      scheduleStart();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroLogosMarquee);
  } else {
    initHeroLogosMarquee();
  }
})();
