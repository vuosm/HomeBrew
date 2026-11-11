"use strict";
// Creates a working access key without a payment (for yourself, testers or comps).
// Usage: npm run create-key
try { process.loadEnvFile(); } catch {}
const db = require("./db");
const { sha256, token, newAccessKey, keyHash, encryptWith } = require("./crypto");

const key = newAccessKey();
const claim = token(32);
db.prepare(`INSERT INTO orders (id, claim_hash, key_hash, key_enc, status, price_amount, price_currency, created_at, paid_at)
            VALUES (?, ?, ?, ?, 'paid', 0, 'manual', ?, ?)`)
  .run("man_" + token(12), sha256(claim), keyHash(key), encryptWith(claim, key), Date.now(), Date.now());
console.log(key);
