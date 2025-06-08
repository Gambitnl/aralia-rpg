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
