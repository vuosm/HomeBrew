"use strict";
// SQLite storage using Node's built-in driver (Node 22.13+). No native modules to build.
const path = require("node:path");
const fs = require("node:fs");
const { DatabaseSync } = require("node:sqlite");

const file = process.env.DATABASE_PATH || path.join(__dirname, "..", "data", "app.db");
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new DatabaseSync(file);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS orders (
    id             TEXT PRIMARY KEY,
    claim_hash     TEXT NOT NULL,
    key_hash       TEXT NOT NULL UNIQUE,
    key_enc        TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending',
    price_amount   REAL NOT NULL,
    price_currency TEXT NOT NULL,
    invoice_id     TEXT,
    payment_id     TEXT,
    created_at     INTEGER NOT NULL,
    paid_at        INTEGER
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id_hash    TEXT PRIMARY KEY,
    order_id   TEXT NOT NULL REFERENCES orders(id),
    expires_at INTEGER NOT NULL
  );
`);

module.exports = db;
