# Hebrew Word Game

A Hebrew word-finding puzzle game built with Expo and React Native, in the style of Spelling Bee: given a set of letters arranged in a circle (with one required letter), find as many valid Hebrew words as you can.

## Getting started

Install dependencies:

```bash
npm install
```

Start the Expo dev server:

```bash
npm start
```

Or launch directly on a platform:

```bash
npm run android
npm run ios
npm run web
```

## Project structure

- `src/screens` — app screens (splash, level select, game, settings, explanation)
- `src/utils` — game logic, word validation, letter/circle layout helpers
- `src/data` — dictionary, puzzle definitions, and level data
- `scripts` — offline scripts for generating the word dictionary

## Bug reports (Web3Forms)

The in-app report forms — "דיווח על באג" in Settings and "דיווח על מילה שגויה" in the
game — submit to [Web3Forms](https://web3forms.com), which forwards them to your inbox.

1. Get a free Access Key at https://web3forms.com using the email that should receive reports.
2. Copy `.env.example` to `.env` and fill in the key:

   ```bash
   cp .env.example .env
   # WEB3FORMS_ACCESS_KEY=your-access-key
   ```

3. Restart the dev server so `app.config.js` picks up the new value.

`.env` is git-ignored, so the key never lands in this public repository.
Without a key the forms show a friendly error instead of sending.

### Shipping to the stores

`app.config.js` is evaluated by EAS at build time, so the key has to live in EAS
rather than in `.env` (which stays on your machine). Register it once per
environment:

```bash
eas env:create --name WEB3FORMS_ACCESS_KEY --value <your-access-key> \
  --environment production --visibility sensitive
```

Each build profile in `eas.json` is bound to a matching environment via its
`environment` field, so `eas build --profile production` picks the value up
automatically.

Use `sensitive`, not `secret`. Secret variables are unreadable outside EAS servers,
which breaks `eas update` and local config resolution. They also buy nothing here:
the key is embedded in the shipped bundle either way, so anyone who unpacks the app
can read it. That is expected — Web3Forms access keys are designed for client-side
use. Keeping it out of the public repo is what actually matters, since a key sitting
in a public repo gets scraped and turned into inbox spam. If that happens anyway,
rotate the key in the Web3Forms dashboard and re-run the command above.
