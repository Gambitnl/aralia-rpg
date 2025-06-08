/* eslint-disable jest/require-top-level-describe */

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
});
