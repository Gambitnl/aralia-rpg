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

// Each building type defines its display names, a maximum count per town
// and a simple placeholder image to use in the building overlay.
const BUILDINGS = [
  {
    type: 'Inn',
    max: 2,
    names: ['The Golden Griffin', "Traveler's Rest", 'Silver Stag'],
    image: 'https://placehold.co/64x64?text=Inn',
  },
  {
    type: 'Blacksmith',
    max: 1,
    names: ['Ironforge Smithy', 'Molten Hammer'],
    image: 'https://placehold.co/64x64?text=Smith',
  },
  {
    type: 'Market',
    max: 1,
    names: ['Grand Bazaar', 'Trader Square'],
    image: 'https://placehold.co/64x64?text=Market',
  },
  {
    type: 'Temple',
    max: 1,
    names: ['Temple of Light', 'Shrine of Dawn'],
    image: 'https://placehold.co/64x64?text=Temple',
  },
  {
    type: 'Town Hall',
    max: 1,
    names: ['Town Hall'],
    image: 'https://placehold.co/64x64?text=Hall',
  },
  {
    type: 'Tavern',
    max: 2,
    names: ['The Rusty Flagon', 'The Merry Goose'],
    image: 'https://placehold.co/64x64?text=Tavern',
  },
  {
    type: 'Stable',
    max: 1,
    names: ['Wayfarer Stables'],
    image: 'https://placehold.co/64x64?text=Stable',
  },
  {
    type: 'Library',
    max: 1,
    names: ['Hall of Tomes'],
    image: 'https://placehold.co/64x64?text=Library',
  },
  {
    type: 'Alchemist',
    max: 1,
    names: ['The Crystal Cauldron'],
    image: 'https://placehold.co/64x64?text=Alch',
  },
];

function generateTown(seed) {
  const rand = mulberry32(hashCode(seed));
  const width = 8;
  const height = 8;
  const grid = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const counts = {};
  for (const b of BUILDINGS) counts[b.type] = 0;

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
        const available = BUILDINGS.filter((b) => counts[b.type] < b.max);
        if (available.length > 0) {
          const b = available[Math.floor(rand() * available.length)];
          counts[b.type] += 1;
          const name = b.names[Math.floor(rand() * b.names.length)];
          row.push({ x, y, type: b.type, name, image: b.image });
          continue;
        }
      }
      row.push(null);
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

export { generateTown, getTown, town, BUILDINGS };
