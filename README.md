# Aralia: The Shattered Crown

This is a small browser RPG prototype. The game logic lives in the `src` folder and is loaded via ES modules.

## Running the game

Open `index.html` in a modern web browser. The page includes a serverless proxy (`/api/gemini`) used for AI-powered descriptions.

## Development

Install dependencies and run tests with:

```bash
npm install
npm test
```

The main modules are:

- `src/world.js` – world generation and map data
- `src/game.js` – game state and logic
- `src/main.js` – initialization and DOM event wiring

