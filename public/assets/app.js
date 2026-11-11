(function () {
  "use strict";

  let compounds = [];
  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid");
  const empty = $("#empty");
  const search = $("#search");
  const home = $("#view-home");
  const landing = $("#view-landing");
  const login = $("#view-login");
  const claimView = $("#view-claim");
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
      <a href="#/library" class="back glass">
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

  const views = () => [landing, login, claimView, home, detail];
  function show(view) {
    views().forEach((v) => (v.hidden = v !== view));
  }

  /* ---------- API ---------- */
  async function api(path, body) {
    const res = await fetch("/api/" + path, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const err = new Error(data.error || "Couldn't reach the server. Check your connection and try again.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Loads the members-only content. Returns false if the visitor isn't logged in.
  async function ensureContent() {
    if (compounds.length) return true;
    try {
      compounds = await api("compounds");
      renderGrid(search.value);
      return true;
    } catch (e) {
      return false;
    }
  }

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  function showError(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query] = raw.split("?");
    return { id: decodeURIComponent(path || "").toLowerCase(), params: new URLSearchParams(query || "") };
  }

  let routeSeq = 0;
  async function route() {
    const seq = ++routeSeq;
    const { id, params } = parseHash();
    stopPolling();

    if (id === "login") {
      show(login);
      document.title = "Enter your key · Niche Compounds";
      window.scrollTo(0, 0);
      return;
    }
    if (id === "claim") {
      show(claimView);
      document.title = "Your access key · Niche Compounds";
      window.scrollTo(0, 0);
      startClaim(params);
      return;
    }
    if (id === "library" || (id && id !== "")) {
      const ok = await ensureContent();
      if (seq !== routeSeq) return;
      if (!ok) { location.replace("#/login"); return; }

      const c = compounds.find((x) => x.id === id);
      if (c) {
        if (!home.hidden) lastHomeScroll = window.scrollY;
        renderDetail(c);
        show(detail);
        document.title = `${c.name} · Niche Compounds`;
        window.scrollTo(0, 0);
        app.focus({ preventScroll: true });
      } else {
        const fromDetail = !detail.hidden;
        show(home);
        document.title = "Library · Niche Compounds";
        window.scrollTo(0, fromDetail ? lastHomeScroll : 0);
      }
      return;
    }
    show(landing);
    document.title = "Niche Compounds";
    window.scrollTo(0, 0);
  }

  /* ---------- Checkout ---------- */
  const buyBtn = $("#buy");
  const buyError = $("#buy-error");

  api("config").then((cfg) => {
    const { amount, currency } = cfg.price;
    let label;
    try {
      label = new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
    } catch { label = `${amount} ${currency.toUpperCase()}`; }
    $("#price").textContent = "· " + label;
  }).catch(() => {});

  buyBtn.addEventListener("click", async () => {
    showError(buyError, "");
    buyBtn.disabled = true;
    buyBtn.classList.add("is-busy");
    try {
      const { orderId, claim, invoiceUrl } = await api("checkout", {});
      store.set("nc_order", { orderId, claim });
      location.href = invoiceUrl;
    } catch (e) {
      showError(buyError, e.message);
      buyBtn.disabled = false;
      buyBtn.classList.remove("is-busy");
    }
  });

  /* ---------- Login ---------- */
  const loginForm = $("#login-form");
  const keyInput = $("#key-input");
  const loginError = $("#login-error");

  async function logIn(key) {
    await api("login", { key });
    compounds = [];
    location.hash = "#/library";
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = keyInput.value.trim();
    if (!key) return showError(loginError, "Enter your access key.");
    showError(loginError, "");
    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      await logIn(key);
      keyInput.value = "";
    } catch (err) {
      showError(loginError, err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $("#logout").addEventListener("click", async () => {
    try { await api("logout", {}); } catch {}
    compounds = [];
    grid.innerHTML = "";
    location.hash = "#/";
  });

  /* ---------- After payment: collect the key ---------- */
  let pollTimer = null;
  let claimedKey = "";
  function stopPolling() { clearTimeout(pollTimer); pollTimer = null; }

  const STATUS_TEXT = {
    pending: "Crypto payments can take a few minutes to confirm. Keep this page open and your key will appear here.",
    partially_paid: "We received only part of the payment. Send the remaining amount from the payment page to receive your key.",
    failed: "This payment failed. No key was issued. You can start a new purchase from the home page.",
    expired: "This payment expired before it arrived. You can start a new purchase from the home page.",
    refunded: "This payment was refunded, so no key was issued.",
  };

  function startClaim(params) {
    const saved = store.get("nc_order") || {};
    const orderId = params.get("order") || saved.orderId;
    const claim = params.get("token") || (saved.orderId === orderId ? saved.claim : null);
    $("#claim-wait").hidden = false;
    $("#claim-done").hidden = true;

    if (!orderId || !claim) {
      $("#claim-title").textContent = "No order found";
      $("#claim-text").textContent = "Open this page from the link you were sent back to after paying, on the same device you paid from.";
      return;
    }
    // Remember it so a refresh or return visit still works.
    store.set("nc_order", { orderId, claim });

    const tick = async () => {
      try {
        const r = await api("claim", { orderId, claim });
        if (r.status === "paid") {
          claimedKey = r.key;
          $("#claim-key").textContent = r.key;
          $("#claim-wait").hidden = true;
          $("#claim-done").hidden = false;
          return;
        }
        $("#claim-title").textContent = r.status === "pending" ? "Waiting for your payment" : "Payment not completed";
        $("#claim-text").textContent = STATUS_TEXT[r.status] || STATUS_TEXT.pending;
        if (r.status === "pending" || r.status === "partially_paid") pollTimer = setTimeout(tick, 5000);
      } catch (e) {
        $("#claim-text").textContent = e.message;
        if (e.status !== 404) pollTimer = setTimeout(tick, 8000);
      }
    };
    tick();
  }

  $("#copy-key").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(claimedKey);
      btn.textContent = "Copied";
    } catch {
      const r = document.createRange();
      r.selectNodeContents($("#claim-key"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      btn.textContent = "Selected";
    }
    setTimeout(() => (btn.textContent = "Copy"), 2000);
  });

  $("#claim-enter").addEventListener("click", async () => {
    try {
      await logIn(claimedKey);
      store.del("nc_order");
    } catch (e) {
      $("#claim-key").textContent = claimedKey + "  (" + e.message + ")";
    }
  });

  search.addEventListener("input", (e) => renderGrid(e.target.value));
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !detail.hidden) location.hash = "#/library";
  });

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
