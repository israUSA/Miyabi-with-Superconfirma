const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

root.classList.add("js");

function countUp(el) {
  const target = parseFloat(el.dataset.countTo);
  const duration = 1400;
  const start = performance.now();
  const tick = (t) => {
    const p = Math.min((t - start) / duration, 1);
    const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = String(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (!reduced) {
  const revealEls = [...document.querySelectorAll("[data-reveal]")];
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("is-in");
        for (const c of el.querySelectorAll("[data-count-to]")) countUp(c);
        io.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  for (const el of revealEls) io.observe(el);

  const parallaxEls = [...document.querySelectorAll("[data-parallax]")].map((el) => ({
    el,
    factor: parseFloat(el.dataset.parallax || "0.12"),
  }));
  let scheduled = false;
  const applyParallax = () => {
    scheduled = false;
    const vh = innerHeight;
    for (const p of parallaxEls) {
      const rect = p.el.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > vh + 160) continue;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      p.el.style.setProperty("--py", (progress * p.factor * 100).toFixed(1) + "px");
    }
  };
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(applyParallax);
      }
    },
    { passive: true }
  );
  applyParallax();

  const header = document.querySelector("[data-elevate]");
  const progressBar = document.querySelector(".scroll-progress");
  const applyChrome = () => {
    header?.classList.toggle("is-scrolled", scrollY > 8);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.setProperty("--sp", max > 0 ? (scrollY / max).toFixed(4) : "0");
    }
  };
  addEventListener("scroll", applyChrome, { passive: true });
  applyChrome();
}
