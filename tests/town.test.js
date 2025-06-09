/* eslint-disable jest/require-top-level-describe */
import { jest } from '@jest/globals';

function setupStorage() {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
  };
  global.SimplexNoise = class {
    noise2D() { return 0; }
  };
}

test('generateTown uses seed deterministically', async () => {
  setupStorage();
  const { generateTown } = await import('../src/town.js');
  const t1 = generateTown('seed123');
  const t2 = generateTown('seed123');
  expect(t1).toEqual(t2);
});

test('different seeds produce different towns', async () => {
  setupStorage();
  const { generateTown } = await import('../src/town.js');
  const t1 = generateTown('seedA');
  const t2 = generateTown('seedB');
  expect(t1).not.toEqual(t2);
});

test('town navigation and display', async () => {
  setupStorage();
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(`
    <div id="town-overlay" class="hidden"></div>
    <div id="town-map"></div>
    <p id="building-name"></p>
    <button id="open-town"></button>
  `);
  global.document = dom.window.document;
  global.window = dom.window;
  const { openTownMap, moveTown, gameState } = await import('../src/game.js');

  gameState.player.x = 25;
  gameState.player.y = 25;
  openTownMap();

  expect(document.getElementById('town-overlay').classList.contains('hidden')).toBe(false);
  expect(gameState.townState).toEqual({ x: 0, y: 0 });

  moveTown('east');
  expect(gameState.townState.x).toBe(1);
  const cells = document.getElementById('town-map').children;
  expect(cells[1].className).toContain('bg-amber-500/50');
  expect(document.getElementById('building-name').textContent).not.toBe('');
  expect(document.querySelectorAll('#town-map img').length).toBeGreaterThan(0);
});

test('building counts do not exceed limits', async () => {
  setupStorage();
  const { generateTown, BUILDINGS } = await import('../src/town.js');
  const town = generateTown('seed-limit');
  const counts = {};
  for (const row of town.grid) {
    for (const tile of row) {
      if (tile && tile.type) {
        counts[tile.type] = (counts[tile.type] || 0) + 1;
      }
    }
  }
  for (const b of BUILDINGS) {
    expect((counts[b.type] || 0)).toBeLessThanOrEqual(b.max);
  }
});

test('buildings use custom names', async () => {
  setupStorage();
  const { generateTown, BUILDINGS } = await import('../src/town.js');
  const town = generateTown('seed-names');
  const map = new Map(BUILDINGS.map((b) => [b.type, b.names]));
  for (const row of town.grid) {
    for (const tile of row) {
      if (tile && tile.type) {
        expect(map.get(tile.type)).toContain(tile.name);
      }
    }
  }
});

test('building overlay displays image', async () => {
  setupStorage();
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(`
    <div id="building-overlay" class="hidden"></div>
    <img id="building-overlay-image" />
    <h3 id="building-overlay-name"></h3>
    <p id="building-overlay-desc"></p>
    <div id="building-actions"></div>
    <div id="building-log"></div>
    <div id="log"></div>
  `);
  global.document = dom.window.document;
  global.window = dom.window;
  const { openBuildingOverlay, handleBuildingAction, game } = await import('../src/game.js');
  game.callGemini = jest.fn().mockResolvedValue('desc');
  const tile = { name: 'The Golden Griffin', type: 'Inn', image: 'test.png' };
  await openBuildingOverlay(tile);
  expect(document.getElementById('building-overlay').classList.contains('hidden')).toBe(false);
  expect(document.getElementById('building-overlay-image').getAttribute('src')).toBe('test.png');
  expect(game.callGemini).toHaveBeenCalled();
  await handleBuildingAction('talk');
  expect(game.callGemini).toHaveBeenCalledTimes(4);
});

test('escape closes overlays', async () => {
  setupStorage();
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(`
    <div id="town-overlay" class="hidden"></div>
    <div id="building-overlay" class="hidden"></div>
    <div id="town-map"></div>
    <p id="building-name"></p>
    <button id="open-town"></button>
    <img id="building-overlay-image" />
    <p id="building-overlay-desc"></p>
    <h3 id="building-overlay-name"></h3>
    <div id="building-actions"></div>
    <div id="building-log"></div>
    <div id="log"></div>
  `);
  global.document = dom.window.document;
  global.window = dom.window;
  const { openTownMap, openBuildingOverlay } = await import('../src/game.js');
  openTownMap();
  const tile = { name: 'Inn', type: 'Inn', image: 'x.png' };
  await openBuildingOverlay(tile);
  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  expect(document.getElementById('building-overlay').classList.contains('hidden')).toBe(true);
  expect(document.getElementById('town-overlay').classList.contains('hidden')).toBe(false);
  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  expect(document.getElementById('town-overlay').classList.contains('hidden')).toBe(true);
});
