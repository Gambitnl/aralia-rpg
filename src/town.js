// Town generation module

import { worldSeed } from './world.js';

function mulberry32(a) {
  return function() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUILDINGS = [
  'Inn',
  'Blacksmith',
  'Market',
  'Temple',
  'Town Hall',
  'Tavern',
  'Stable',
  'Library',
  'Alchemist',
];

function generateTown(seed) {
  const rand = mulberry32(hashCode(seed));
  const width = 8;
  const height = 8;
  const grid = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const isRoad = x === centerX || y === centerY;
      if (isRoad) {
        row.push({ road: true });
        continue;
      }
      const nearRoad = Math.abs(x - centerX) <= 1 || Math.abs(y - centerY) <= 1;
      const chance = nearRoad ? 0.6 : 0.3;
      if (rand() < chance) {
        const name = BUILDINGS[Math.floor(rand() * BUILDINGS.length)];
        row.push({ x, y, name });
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }
  return { width, height, grid };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

// Cache of towns keyed by "x,y" coordinates
const townCache = {};

function getTown(x, y) {
  const key = `${x},${y}`;
  if (!townCache[key]) {
    const seed = `${worldSeed}-${x}-${y}`;
    townCache[key] = generateTown(seed);
  }
  return townCache[key];
}

// A default town using only the world seed is kept for backward compatibility
const town = generateTown(worldSeed);

export { generateTown, getTown, town };
