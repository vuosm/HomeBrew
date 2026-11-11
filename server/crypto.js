"use strict";
const crypto = require("node:crypto");

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const token = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");

// Access keys look like NC-7K2M-Q9XD-4HTR-B8WN-3PFA (100 bits of randomness).
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I
function newAccessKey() {
  const bytes = crypto.randomBytes(20);
  let out = "";
  for (let i = 0; i < 20; i++) out += ALPHABET[bytes[i] & 31];
  return "NC-" + out.match(/.{4}/g).join("-");
}
const normalizeKey = (k) => String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^NC/, "");
const keyHash = (k) => sha256("key:" + normalizeKey(k));

// The access key is stored encrypted with the buyer's claim token, so the
// database alone never reveals a usable key.
function encryptWith(secret, plaintext) {
  const k = crypto.createHash("sha256").update("key-enc:" + secret).digest();
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([c.update(plaintext, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), ct].map((b) => b.toString("base64url")).join(".");
}
function decryptWith(secret, blob) {
  const [iv, tag, ct] = blob.split(".").map((s) => Buffer.from(s, "base64url"));
  const k = crypto.createHash("sha256").update("key-enc:" + secret).digest();
  const d = crypto.createDecipheriv("aes-256-gcm", k, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { sha256, token, newAccessKey, keyHash, encryptWith, decryptWith, safeEqual };
