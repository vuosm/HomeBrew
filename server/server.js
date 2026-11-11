"use strict";
try { process.loadEnvFile(); } catch { /* no .env file: use real environment */ }

const path = require("node:path");
const express = require("express");
const db = require("./db");
const np = require("./nowpayments");
const { sha256, token, newAccessKey, keyHash, encryptWith, decryptWith, safeEqual } = require("./crypto");
const compounds = require("./data/compounds");

const PORT = Number(process.env.PORT) || 3000;
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const PRICE_AMOUNT = Number(process.env.PRICE_AMOUNT || 19);
const PRICE_CURRENCY = (process.env.PRICE_CURRENCY || "usd").toLowerCase();
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const SECURE_COOKIE = SITE_URL.startsWith("https://");
const COOKIE = "nc_session";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
  });
  next();
});

/* ---------- helpers ---------- */
const now = () => Date.now();

function readCookie(req, name) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function currentOrder(req) {
  const sid = readCookie(req, COOKIE);
  if (!sid) return null;
  const row = db.prepare(`
    SELECT o.* FROM sessions s JOIN orders o ON o.id = s.order_id
    WHERE s.id_hash = ? AND s.expires_at > ?`).get(sha256(sid), now());
  return row && row.status === "paid" ? row : null;
}

function requireAccess(req, res, next) {
  if (!currentOrder(req)) return res.status(401).json({ error: "Log in with your access key to continue." });
  next();
}

// Very small in-memory limiter for login / claim attempts.
const hits = new Map();
function limit(max, windowMs) {
  return (req, res, next) => {
    const k = req.path + "|" + req.ip;
    const t = now();
    const h = (hits.get(k) || []).filter((x) => t - x < windowMs);
    if (h.length >= max) return res.status(429).json({ error: "Too many attempts. Wait a minute and try again." });
    h.push(t); hits.set(k, h); next();
  };
}
setInterval(() => hits.clear(), 10 * 60 * 1000).unref();

/* ---------- public API ---------- */
app.get("/api/config", (req, res) => {
  res.json({ price: { amount: PRICE_AMOUNT, currency: PRICE_CURRENCY }, paymentsEnabled: np.configured() });
});

app.get("/api/me", (req, res) => res.json({ authenticated: Boolean(currentOrder(req)) }));

// Start a purchase: create an order + NOWPayments invoice, return where to pay.
app.post("/api/checkout", limit(10, 60_000), async (req, res) => {
  if (!np.configured()) return res.status(503).json({ error: "Payments aren't set up on this server yet." });

  const orderId = "ord_" + token(12);
  const claim = token(32);              // secret the buyer keeps to collect their key
  const accessKey = newAccessKey();     // stays inactive until payment confirms

  db.prepare(`INSERT INTO orders (id, claim_hash, key_hash, key_enc, price_amount, price_currency, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(orderId, sha256(claim), keyHash(accessKey), encryptWith(claim, accessKey), PRICE_AMOUNT, PRICE_CURRENCY, now());

  try {
    const inv = await np.createInvoice({
      orderId,
      amount: PRICE_AMOUNT,
      currency: PRICE_CURRENCY,
      description: "Niche Compounds — library access",
      ipnUrl: `${SITE_URL}/api/nowpayments/ipn`,
      successUrl: `${SITE_URL}/#/claim?order=${orderId}&token=${claim}`,
      cancelUrl: `${SITE_URL}/`,
    });
    db.prepare("UPDATE orders SET invoice_id = ? WHERE id = ?").run(String(inv.id), orderId);
    res.json({ orderId, claim, invoiceUrl: inv.invoice_url });
  } catch (err) {
    console.error(err);
    db.prepare("DELETE FROM orders WHERE id = ? AND status = 'pending'").run(orderId);
    res.status(502).json({ error: "Couldn't start the payment. Try again in a moment." });
  }
});

// NOWPayments calls this when a payment changes status.
app.post("/api/nowpayments/ipn", async (req, res) => {
  if (!np.verifyIpn(req.body, req.get("x-nowpayments-sig"))) {
    console.warn("IPN rejected: bad signature");
    return res.status(401).end();
  }
  const { order_id: orderId, payment_id: paymentId } = req.body;
  const order = orderId && db.prepare("SELECT * FROM orders WHERE id = ?").get(String(orderId));
  if (!order) return res.status(200).end(); // not ours; acknowledge so it isn't retried forever
  if (order.status === "paid") return res.status(200).end();

  try {
    // Don't trust the notification alone: ask NOWPayments for the payment itself.
    const p = await np.getPayment(paymentId);
    const sameOrder = String(p.order_id) === order.id;
    const sameCurrency = String(p.price_currency || "").toLowerCase() === order.price_currency;
    const enough = Number(p.price_amount) >= order.price_amount - 1e-9;

    if (sameOrder && sameCurrency && enough && np.PAID_STATUSES.has(p.payment_status)) {
      db.prepare("UPDATE orders SET status = 'paid', payment_id = ?, paid_at = ? WHERE id = ? AND status != 'paid'")
        .run(String(paymentId), now(), order.id);
      console.log(`Order ${order.id} paid (payment ${paymentId}, ${p.payment_status})`);
    } else if (sameOrder && p.payment_status === "partially_paid") {
      db.prepare("UPDATE orders SET status = 'partially_paid', payment_id = ? WHERE id = ?").run(String(paymentId), order.id);
    } else if (sameOrder && np.FAILED_STATUSES.has(p.payment_status)) {
      db.prepare("UPDATE orders SET status = ?, payment_id = ? WHERE id = ? AND status = 'pending'")
        .run(p.payment_status, String(paymentId), order.id);
    }
    res.status(200).end();
  } catch (err) {
    console.error("IPN handling failed:", err.message);
    res.status(500).end(); // NOWPayments will retry
  }
});

// Buyer polls this after paying. Returns the key once the payment has confirmed.
app.post("/api/claim", limit(60, 60_000), (req, res) => {
  const { orderId, claim } = req.body || {};
  const order = orderId && db.prepare("SELECT * FROM orders WHERE id = ?").get(String(orderId));
  if (!order || !claim || !safeEqual(order.claim_hash, sha256(claim))) {
    return res.status(404).json({ error: "We couldn't find that order." });
  }
  if (order.status !== "paid") return res.json({ status: order.status });
  res.json({ status: "paid", key: decryptWith(claim, order.key_enc) });
});

app.post("/api/login", limit(10, 60_000), (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE key_hash = ?").get(keyHash(req.body && req.body.key));
  if (!order || order.status !== "paid") return res.status(401).json({ error: "That key isn't valid." });

  const sid = token(32);
  const maxAge = SESSION_DAYS * 86400;
  db.prepare("INSERT INTO sessions (id_hash, order_id, expires_at) VALUES (?, ?, ?)")
    .run(sha256(sid), order.id, now() + maxAge * 1000);
  res.set("Set-Cookie",
    `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${SECURE_COOKIE ? "; Secure" : ""}`);
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  const sid = readCookie(req, COOKIE);
  if (sid) db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(sha256(sid));
  res.set("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${SECURE_COOKIE ? "; Secure" : ""}`);
  res.json({ ok: true });
});

/* ---------- members-only content ---------- */
app.get("/api/compounds", requireAccess, (req, res) => {
  res.set("Cache-Control", "private, no-store");
  res.json(compounds);
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

/* ---------- static front end ---------- */
app.use(express.static(path.join(__dirname, "..", "public"), { extensions: ["html"] }));

setInterval(() => db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now()), 3600_000).unref();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Niche Compounds running at ${SITE_URL} (port ${PORT})`);
    if (!np.configured()) console.warn("NOWPayments is not configured: set NOWPAYMENTS_API_KEY and NOWPAYMENTS_IPN_SECRET.");
  });
}

module.exports = app;
