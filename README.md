# Niche Compounds

A small static website with short, readable profiles of niche compounds (starting with Erdafitinib). Dark, grey, glassy UI; works on mobile and desktop.

## Run

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

It can be hosted as-is on GitHub Pages, Netlify, etc.

## Add a compound

Append an entry to `assets/compounds.js`. A card is created for it automatically, and its page lives at `#/<id>`.

_Educational content only. This is not medical advice._
