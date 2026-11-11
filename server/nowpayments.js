"use strict";
// Minimal NOWPayments client: create hosted invoices, verify IPN signatures,
// and look up a payment's status directly from the API.
const crypto = require("node:crypto");
const { safeEqual } = require("./crypto");

const BASE = process.env.NOWPAYMENTS_API_BASE || (process.env.NOWPAYMENTS_SANDBOX === "true"
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1");

const apiKey = () => process.env.NOWPAYMENTS_API_KEY;
const configured = () => Boolean(process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_IPN_SECRET);

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "x-api-key": apiKey(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`NOWPayments ${method} ${path} failed: ${res.status} ${data.message || text}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Returns { id, invoice_url, ... }
function createInvoice({ orderId, amount, currency, description, ipnUrl, successUrl, cancelUrl }) {
  return call("POST", "/invoice", {
    price_amount: amount,
    price_currency: currency,
    order_id: orderId,
    order_description: description,
    ipn_callback_url: ipnUrl,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

function getPayment(paymentId) {
  return call("GET", "/payment/" + encodeURIComponent(paymentId));
}

// NOWPayments signs the IPN body as HMAC-SHA512 of the JSON with keys sorted
// (recursively), sent in the x-nowpayments-sig header.
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.keys(v).sort().reduce((o, k) => ((o[k] = sortKeys(v[k])), o), {});
  }
  return v;
}
function verifyIpn(body, signature) {
  if (!signature || !body || typeof body !== "object") return false;
  const expected = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
    .update(JSON.stringify(sortKeys(body)))
    .digest("hex");
  return safeEqual(expected, String(signature).toLowerCase());
}

// Statuses that mean the money has arrived.
const PAID_STATUSES = new Set(["confirmed", "sending", "finished"]);
const FAILED_STATUSES = new Set(["failed", "expired", "refunded"]);

module.exports = { configured, createInvoice, getPayment, verifyIpn, PAID_STATUSES, FAILED_STATUSES };
