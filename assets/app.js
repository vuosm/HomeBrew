(function () {
  "use strict";

  const compounds = window.COMPOUNDS || [];
  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid");
  const empty = $("#empty");
  const search = $("#search");
  const home = $("#view-home");
  const detail = $("#view-detail");
  const app = $("#app");

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Render chemical formulas with subscripts: C25H30N6O2 -> C<sub>25</sub>...
  const formula = (s) => esc(s).replace(/(\d+)/g, "<sub>$1</sub>");

  const arrow =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- Home grid ---------- */
  function renderGrid(filter) {
    const q = (filter || "").trim().toLowerCase();
    const list = compounds.filter((c) =>
      !q || [c.name, c.brand, c.class, c.target, c.tagline].join(" ").toLowerCase().includes(q)
    );

    grid.innerHTML = list
      .map(
        (c, i) => `
      <a class="card glass" role="listitem" href="#/${esc(c.id)}" style="--i:${i}">
        <div class="card-top">
          <span class="chip">${esc(c.class)}</span>
          <span class="card-index">${String(compounds.indexOf(c) + 1).padStart(2, "0")}</span>
        </div>
        <h2 class="card-title">${esc(c.name)}</h2>
        <p class="card-brand">${esc(c.brand)}</p>
        <p class="card-tagline">${esc(c.tagline)}</p>
        <div class="card-foot">
          <span class="mono">${esc(c.target)}</span>
          <span class="card-go">${arrow}</span>
        </div>
      </a>`
      )
      .join("");

    empty.hidden = list.length > 0;
  }

  /* ---------- Detail ---------- */
  function renderBody(body) {
    return body
      .map((b) =>
        typeof b === "string"
          ? `<p>${esc(b)}</p>`
          : `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`
      )
      .join("");
  }

  function renderDetail(c) {
    const idx = compounds.indexOf(c);
    const prev = compounds[(idx - 1 + compounds.length) % compounds.length];
    const next = compounds[(idx + 1) % compounds.length];

    detail.innerHTML = `
      <a href="#/" class="back glass">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        All compounds
      </a>

      <header class="detail-hero glass">
        <div class="chips">
          <span class="chip">${esc(c.class)}</span>
          <span class="chip chip-ghost mono">${esc(c.target)}</span>
        </div>
        <h1 class="detail-title">${esc(c.name)}</h1>
        <p class="detail-brand">Marketed as <strong>${esc(c.brand)}</strong></p>
        <p class="detail-tagline">${esc(c.tagline)}</p>
      </header>

      <div class="detail-layout">
        <aside class="facts glass" aria-label="At a glance">
          <h2 class="facts-title">At a glance</h2>
          <dl>
            ${c.facts
              .map(
                ([k, v]) =>
                  `<div class="fact"><dt>${esc(k)}</dt><dd${k === "Formula" ? ' class="mono"' : ""}>${
                    k === "Formula" ? formula(v) : esc(v)
                  }</dd></div>`
              )
              .join("")}
          </dl>
        </aside>

        <div class="sections">
          ${c.sections
            .map(
              (s) => `
            <section class="section glass">
              <h2>${esc(s.title)}</h2>
              ${renderBody(s.body)}
            </section>`
            )
            .join("")}
        </div>
      </div>

      <nav class="pager" aria-label="More compounds">
        <a href="#/${esc(prev.id)}" class="pager-link glass">
          <span class="pager-label">Previous</span>
          <span class="pager-name">${esc(prev.name)}</span>
        </a>
        <a href="#/${esc(next.id)}" class="pager-link glass pager-next">
          <span class="pager-label">Next</span>
          <span class="pager-name">${esc(next.name)}</span>
        </a>
      </nav>
    `;
  }

  /* ---------- Router ---------- */
  let lastHomeScroll = 0;

  function route() {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, "")).toLowerCase();
    const c = id && compounds.find((x) => x.id === id);

    if (c) {
      if (!home.hidden) lastHomeScroll = window.scrollY;
      renderDetail(c);
      home.hidden = true;
      detail.hidden = false;
      document.title = `${c.name} · Niche Compounds`;
      window.scrollTo(0, 0);
      app.focus({ preventScroll: true });
    } else {
      detail.hidden = true;
      home.hidden = false;
      document.title = "Niche Compounds";
      window.scrollTo(0, lastHomeScroll);
    }
  }

  search.addEventListener("input", (e) => renderGrid(e.target.value));
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !detail.hidden) location.hash = "#/";
  });

  renderGrid("");
  route();
})();

// Subtle spotlight that follows the pointer on cards (desktop only)
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest && e.target.closest(".card");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
});
