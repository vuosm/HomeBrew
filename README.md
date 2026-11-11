# Niche Compounds

A paid library of plain-language profiles of niche compounds. Visitors pay in crypto through
[NOWPayments](https://nowpayments.io), receive a personal access key, and use that key to log in.
Nothing in the library is visible before login: the compound profiles live on the server and are
only sent to logged-in visitors.

## How it works

1. **Get access** creates an order and a NOWPayments invoice, then sends the buyer to the NOWPayments checkout.
2. NOWPayments notifies the server (`/api/nowpayments/ipn`) when the payment status changes. The server checks the
   notification's signature, then asks the NOWPayments API for the payment directly before it trusts it.
3. When the payment is confirmed, the buyer's return page (`/#/claim`) shows their access key (`NC-XXXX-XXXX-XXXX-XXXX-XXXX`).
4. **I have a key** logs in with that key. The login lasts 30 days per device (configurable).

Access keys are stored only as hashes. The copy shown on the return page is encrypted with a secret only the buyer's browser has.

## Project layout

```
public/                 Front end (served to everyone; contains no library content)
server/server.js        Web server and API
server/nowpayments.js   NOWPayments invoice, signature check and payment lookup
server/data/compounds.js  The library content (members only). Add compounds here.
server/create-key.js    Makes a free key (for yourself, testers or gifts)
```

## Run it

Needs Node.js 22.13 or newer.

```sh
npm install
cp .env.example .env    # then fill it in
npm start
```

Make a key for yourself without paying:

```sh
npm run create-key
```

## Setting up NOWPayments

1. Create a NOWPayments account and add the wallet you want to be paid to.
2. In the dashboard, create an **API key** and set an **IPN secret key** (Instant payment notifications).
3. Put both in `.env` as `NOWPAYMENTS_API_KEY` and `NOWPAYMENTS_IPN_SECRET`.
4. Set `SITE_URL` to your public https address. NOWPayments must be able to reach `SITE_URL/api/nowpayments/ipn`.
5. Set the price with `PRICE_AMOUNT` and `PRICE_CURRENCY` (buyers pay the equivalent in the crypto they choose).

To test without real money, use a NOWPayments sandbox account and set `NOWPAYMENTS_SANDBOX=true`.

## Hosting

Any host that runs a Node.js server with a persistent disk works (for example a small VPS, Railway or Render with a disk).
The database is a single SQLite file at `data/app.db` (change it with `DATABASE_PATH`). Back it up: it holds every key that has been sold.

_Educational content only. This is not medical advice._
