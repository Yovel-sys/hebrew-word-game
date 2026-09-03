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
