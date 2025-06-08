// Game world generation
let worldSeed = localStorage.getItem('aralia-world-seed') || Math.random().toString(36).slice(2);
localStorage.setItem('aralia-world-seed', worldSeed);

const world = {
  width: 50,
  height: 50,
  // SimplexNoise is loaded globally from CDN
  noise: new SimplexNoise(worldSeed),
  terrainData: {
    deep_ocean: { symbol: '≈', color: 'text-blue-800', names: ['The Abyssal Void', 'The Sunless Sea'] },
    ocean: { symbol: '≈', color: 'text-blue-500', names: ['The Azure Expanse', 'The Sapphire Sea'] },
    plains: { symbol: '.', color: 'text-green-700', names: ['The Rolling Plains', 'Verdant Fields'] },
    forest: { symbol: 'T', color: 'text-green-500', names: ['The Whispering Woods', 'The Verdant Thicket'] },
    hills: { symbol: '^', color: 'text-yellow-700', names: ['The Stony Hills', 'The Windswept Downs'] },
    mountains: { symbol: 'M', color: 'text-gray-400', names: ["The Jagged Peaks", "The Dragon's Tooth Range"] },
    desert: { symbol: 's', color: 'text-yellow-400', names: ['The Sun-scorched Sands', 'The Glass Desert'] },
    town: { symbol: '#', color: 'text-white', names: ['Oakhaven', 'Stonebridge', 'Last Hope'] },
  },
  getTileData(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    const e = this.noise.noise2D(x / 20, y / 20);
    const m = this.noise.noise2D(x / 15 + 100, y / 15 + 100);
    let terrainType;
    if (e < -0.6) terrainType = 'deep_ocean';
    else if (e < -0.2) terrainType = 'ocean';
    else if (e > 0.6) terrainType = 'mountains';
    else if (e > 0.4) terrainType = 'hills';
    else {
      if (m < -0.3) terrainType = 'desert';
      else if (m > 0.3) terrainType = 'forest';
      else terrainType = 'plains';
    }
    if ((x === 25 && y === 25) || (this.noise.noise2D(x / 10, y / 10) > 0.8 && terrainType === 'plains')) {
      terrainType = 'town';
    }
    const data = this.terrainData[terrainType];
    const nameIndex = (x + y * this.width) % data.names.length;
    return {
      x,
      y,
      terrain: terrainType,
      ...data,
      name: data.names[nameIndex],
      description: `You are in ${data.names[nameIndex]}, a stretch of ${terrainType.replace('_', ' ')}.`,
    };
  },
};

export { worldSeed };
export default world;
