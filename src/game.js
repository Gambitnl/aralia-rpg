import world, { worldSeed } from './world.js';
import { getTown } from './town.js';

const gameState = {
  // NOTE: If you change the structure of gameState,
  // be sure to update saveGame/loadGame accordingly.
  player: { x: 25, y: 25, name: 'Lyra' },
  inventory: [],
  companions: [
    {
      name: 'Young Phoenix Hatchling',
      stats: { HP: 10, Attack: 2, Defense: 1 },
      gear: [],
      effects: ['Rebirth once per day'],
    },
  ],
  itemLibrary: {
    'Old Map': { icon: '🗺️', description: 'A tattered, well-worn map of a land you barely recognize.' },
    Herbs: { icon: '🌿', description: 'A bundle of common herbs, useful for simple poultices.' },
    'Flint and Steel': { icon: '🔥', description: 'A reliable set for starting a fire.' },
  },
  log: [],
  isApiCallInProgress: false,
  worldSeed,
  townState: { x: 0, y: 0 },
};

let currentTown = null;
let currentBuilding = null;

const game = {
  init() {
    const loaded = this.loadGame();
    if (!loaded) {
      this.addItem('Old Map', 1, true);
      this.addItem('Herbs', 3, true);
      this.addItem('Flint and Steel', 1, true);
    }
    this.renderAll();
    this.logMessage('You begin your journey in the town of Oakhaven. The vast world of Aralia awaits.');
    this.generateContextualActions();
  },

  saveGame() {
    const data = {
      player: gameState.player,
      inventory: gameState.inventory,
      companions: gameState.companions,
      worldSeed: gameState.worldSeed,
      log: gameState.log,
    };
    localStorage.setItem('aralia-save', JSON.stringify(data));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aralia-save.json';
    a.click();
    URL.revokeObjectURL(a.href);
    this.logMessage('[Game saved.]');
  },

  loadGame() {
    const raw = localStorage.getItem('aralia-save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      if (data.player) gameState.player = data.player;
      if (Array.isArray(data.inventory)) gameState.inventory = data.inventory;
      if (Array.isArray(data.companions)) gameState.companions = data.companions;
      if (Array.isArray(data.log)) gameState.log = data.log;
      if (data.worldSeed) {
        gameState.worldSeed = data.worldSeed;
        world.noise = new SimplexNoise(data.worldSeed);
        localStorage.setItem('aralia-world-seed', data.worldSeed);
      }
      return true;
    } catch (e) {
      console.error('Load failed', e);
      return false;
    }
  },

  async callGemini(prompt) {
    if (gameState.isApiCallInProgress) {
      this.logMessage('You pause to consider your next move...');
      return null;
    }
    gameState.isApiCallInProgress = true;
    const apiUrl = '/api/gemini';
    try {
      const payload = { prompt };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`API Proxy Error: ${response.statusText}`);
      }
      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('API proxy call failed:', error);
      this.logMessage("[Error: The world's magic seems to be offline.]");
      return null;
    } finally {
      gameState.isApiCallInProgress = false;
    }
  },

  async performAction(type, detail = '') {
    if (gameState.isApiCallInProgress) {
      this.logMessage('You are busy. You cannot do that right now.');
      return;
    }
    if (type === 'move') this.move(detail);
    else if (type === 'wait') this.logMessage('You take a moment to survey your surroundings.');
    else if (type === 'contextual') await this.handleContextualAction(detail);
    this.renderAll();
    await this.generateContextualActions();
  },

  async handleContextualAction(actionText) {
    const location = world.getTileData(gameState.player.x, gameState.player.y);
    const inventoryList = gameState.inventory.map((item) => `${item.name} (x${item.quantity})`).join(', ') || 'nothing';
    const prompt = `You are a DM for the fantasy RPG Aralia. Player is at "${location.name}" and chose: "${actionText}". Inventory: ${inventoryList}. Describe the outcome in 1-2 sentences. If items change, use ITEM_ADD: [Item], [Qty] or ITEM_REMOVE: [Item], [Qty] on new lines.`;
    this.logMessage(`You decide to: ${actionText}`);
    const contextualActionsContainer = document.getElementById('contextual-actions');
    contextualActionsContainer.innerHTML = '<div class="col-span-2 flex justify-center items-center"><span class="spinner"></span><p class="ml-2">Acting...</p></div>';
    const result = await this.callGemini(prompt);
    if (result) {
      const lines = result.trim().split('\n');
      this.logMessage(lines[0]);
      for (const line of lines.slice(1)) {
        if (line.startsWith('ITEM_ADD:')) {
          const [name, qty] = line.replace('ITEM_ADD:', '').split(',').map((s) => s.trim());
          await this.addItem(name, parseInt(qty, 10) || 1);
        } else if (line.startsWith('ITEM_REMOVE:')) {
          const [name, qty] = line.replace('ITEM_REMOVE:', '').split(',').map((s) => s.trim());
          this.removeItem(name, parseInt(qty, 10) || 1);
        }
      }
    } else this.logMessage('You try, but nothing seems to come of it.');
  },

  async generateItemDetails(itemName) {
    this.logMessage(`[Discovered a new item: ${itemName}. Studying it...]`);
    const prompt = `You are a game master. Generate a short, flavorful description and a single emoji icon for a fantasy RPG item called "${itemName}". Format your response as: icon, description. Example: 💎, A shimmering blue gem, cool to the touch.`;
    const details = await this.callGemini(prompt);
    if (details) {
      const [icon, ...descriptionParts] = details.split(',');
      gameState.itemLibrary[itemName] = {
        icon: icon.trim(),
        description: descriptionParts.join(',').trim(),
      };
    } else {
      gameState.itemLibrary[itemName] = { icon: '❓', description: 'A mysterious and indescribable object.' };
    }
  },

  async addItem(itemName, quantity, silent = false) {
    if (!gameState.itemLibrary[itemName]) {
      await this.generateItemDetails(itemName);
    }
    const existingItem = gameState.inventory.find((item) => item.name === itemName);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      gameState.inventory.push({ name: itemName, quantity });
    }
    if (!silent) this.logMessage(`[Added ${quantity}x ${itemName} to inventory.]`);
    this.renderInventory();
  },

  removeItem(itemName, quantity) {
    const itemIndex = gameState.inventory.findIndex((item) => item.name === itemName);
    if (itemIndex > -1) {
      gameState.inventory[itemIndex].quantity -= quantity;
      if (gameState.inventory[itemIndex].quantity <= 0) {
        gameState.inventory.splice(itemIndex, 1);
      }
      this.logMessage(`[Removed ${quantity}x ${itemName} from inventory.]`);
      this.renderInventory();
    }
  },

  async generateContextualActions() {
    const contextualActionsContainer = document.getElementById('contextual-actions');
    contextualActionsContainer.innerHTML = '<div class="col-span-2 flex justify-center items-center"><span class="spinner"></span><p class="ml-2">Thinking...</p></div>';
    const location = world.getTileData(gameState.player.x, gameState.player.y);
    const inventoryList = gameState.inventory.map((item) => item.name).join(', ') || 'nothing';
    const locDescription = document.getElementById('location-description').textContent;
    const recentLog = gameState.log.slice(0, 3).join(' | ');
    const prompt = `You are a DM for a fantasy RPG. Player is at "${location.name}" (${location.terrain}). Description: "${locDescription}". Recent events: ${recentLog}. Inventory: ${inventoryList}. Provide a comma-separated list of exactly 6 creative, context-appropriate actions (not movement).`;
    const actionsString = await this.callGemini(prompt);
    contextualActionsContainer.innerHTML = '';
    if (actionsString) {
      actionsString
        .split(',')
        .map((a) => a.trim())
        .slice(0, 6)
        .forEach((actionText) => {
          if (!actionText) return;
          const button = document.createElement('button');
          button.textContent = actionText;
          button.className = 'bg-gray-600 hover:bg-sky-800 text-sky-100 font-bold py-2 px-3 rounded-lg text-sm';
          button.onclick = () => this.performAction('contextual', actionText);
          contextualActionsContainer.appendChild(button);
        });
    } else {
      contextualActionsContainer.innerHTML = '<p class="text-gray-500 col-span-2">Could not get actions.</p>';
    }
  },

  move(direction) {
    let { x, y } = gameState.player;
    if (direction === 'north') y--;
    if (direction === 'south') y++;
    if (direction === 'west') x--;
    if (direction === 'east') x++;
    const newTile = world.getTileData(x, y);
    if (!newTile) {
      this.logMessage('You cannot go that way. The edge of the world looms.');
      return;
    }
    if (newTile.terrain.includes('ocean')) {
      this.logMessage('The ocean is too deep to cross without a ship.');
      return;
    }
    gameState.player.x = x;
    gameState.player.y = y;
    this.logMessage(`You travel ${direction}.`);
    this.renderAll();
  },

  logMessage(message) {
    gameState.log.unshift(message);
    if (gameState.log.length > 500) gameState.log.pop();
    const logEl = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = message;
    p.className = 'text-gray-400';
    if (message.startsWith('[')) p.className = 'text-yellow-400/80 italic text-sm';
    logEl.insertBefore(p, logEl.firstChild);
  },

  renderAll() {
    const location = world.getTileData(gameState.player.x, gameState.player.y);
    document.getElementById('player-name').textContent = gameState.player.name;
    document.getElementById('location-name').textContent = location.name;
    document.getElementById('location-description').textContent = location.description;
    document.getElementById('player-location').textContent = `(${location.x}, ${location.y})`;
    this.renderMap();
    this.renderInventory();
    this.renderCompanions();
    this.updateTownButton(location);
  },

  renderMap() {
    const mapDisplay = document.getElementById('map-display');
    const mapRadius = 7;
    let mapHTML = '';
    for (let r = -mapRadius; r <= mapRadius; r++) {
      let rowHTML = '';
      for (let c = -mapRadius; c <= mapRadius; c++) {
        const tileX = gameState.player.x + c;
        const tileY = gameState.player.y + r;
        if (r === 0 && c === 0) {
          rowHTML += '<span class="text-amber-300 font-bold">@</span> ';
        } else {
          const tile = world.getTileData(tileX, tileY);
          rowHTML += tile ? `<span class="${tile.color}">${tile.symbol}</span> ` : '  ';
        }
      }
      mapHTML += rowHTML.trimEnd() + '\n';
    }
    mapDisplay.innerHTML = mapHTML;
  },

  renderInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    if (gameState.inventory.length === 0) {
      inventoryList.innerHTML = '<li class="italic text-gray-500">Your bags are empty.</li>';
    } else {
      gameState.inventory.forEach((item) => {
        const itemInfo = gameState.itemLibrary[item.name] || { icon: '❓', description: 'An unknown item.' };
        const li = document.createElement('li');
        li.className = 'text-gray-300';
        li.title = itemInfo.description;
        li.innerHTML = `<span class="mr-2">${itemInfo.icon}</span> ${item.name} (x${item.quantity})`;
        inventoryList.appendChild(li);
      });
    }
  },

  renderCompanions() {
    const partyList = document.getElementById('party-list');
    partyList.innerHTML = '';
    if (gameState.companions.length === 0) {
      partyList.innerHTML = '<li class="italic text-gray-500">You travel alone.</li>';
    } else {
      gameState.companions.forEach((comp, idx) => {
        const li = document.createElement('li');
        li.className = 'text-gray-300 cursor-pointer';
        li.textContent = comp.name;
        li.onclick = () => openCompanion(idx);
        partyList.appendChild(li);
      });
    }
  },

  updateTownButton(location) {
    const btn = document.getElementById('open-town');
    if (!btn) return;
    btn.disabled = location.terrain !== 'town';
  },

  renderTownMap() {
    if (!currentTown) return;
    const container = document.getElementById('town-map');
    container.innerHTML = '';
    for (let y = 0; y < currentTown.height; y++) {
      for (let x = 0; x < currentTown.width; x++) {
        const cell = document.createElement('div');
        cell.className = 'w-6 h-6 flex items-center justify-center border border-gray-600 text-xs cursor-pointer overflow-hidden';
        const tile = currentTown.grid[y][x];
        if (tile && tile.road) {
          cell.textContent = '-';
          cell.classList.add('text-yellow-500');
        } else {
          if (tile) {
            const img = document.createElement('img');
            img.src = tile.image;
            img.alt = tile.type;
            img.className = 'w-full h-full object-cover';
            cell.appendChild(img);
          } else {
            cell.textContent = '.';
          }
        }
        if (gameState.townState.x === x && gameState.townState.y === y) {
          cell.classList.add('bg-amber-500/50');
        }
        cell.onclick = () => {
          gameState.townState.x = x;
          gameState.townState.y = y;
          if (tile && !tile.road && tile.name) {
            openBuildingOverlay(tile);
          }
          const name = tile ? (tile.road ? 'Road' : tile.name) : 'Empty Lot';
          document.getElementById('building-name').textContent = name;
          game.renderTownMap();
        };
        container.appendChild(cell);
      }
    }
  },

  async generateVividDescription() {
    if (gameState.isApiCallInProgress) return;
    const describeButton = document.getElementById('describe-button');
    const descriptionEl = document.getElementById('location-description');
    const originalText = descriptionEl.textContent;
    describeButton.disabled = true;
    describeButton.innerHTML = '✨<span class="spinner"></span>';
    const location = world.getTileData(gameState.player.x, gameState.player.y);
    const prompt = `You are a DM for a fantasy RPG. Player is at "${location.name}". Description: "${location.description}". Write a more detailed, atmospheric paragraph (50-70 words).`;
    const vividDescription = await this.callGemini(prompt);
    if (vividDescription) descriptionEl.textContent = vividDescription;
    else descriptionEl.textContent = originalText;
    describeButton.disabled = false;
    describeButton.innerHTML = '✨ Describe';
  },
};

function openInventory() {
  const overlay = document.getElementById('inventory-overlay');
  overlay.classList.remove('hidden');
  game.renderInventory();
}

function closeInventory() {
  document.getElementById('inventory-overlay').classList.add('hidden');
}

function openParty() {
  const overlay = document.getElementById('party-overlay');
  overlay.classList.remove('hidden');
  game.renderCompanions();
}

function closeParty() {
  document.getElementById('party-overlay').classList.add('hidden');
}

function openTownMap() {
  const location = world.getTileData(gameState.player.x, gameState.player.y);
  if (location.terrain !== 'town') {
    game.logMessage('There is no town here to explore.');
    return;
  }
  currentTown = getTown(location.x, location.y);
  gameState.townState = { x: 0, y: 0 };
  const overlay = document.getElementById('town-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('building-name').textContent = '';
  game.renderTownMap();
  window.addEventListener('keydown', handleTownKey);
}

function closeTownMap() {
  document.getElementById('town-overlay').classList.add('hidden');
  window.removeEventListener('keydown', handleTownKey);
}

function handleTownKey(e) {
  if (e.key === 'ArrowUp') moveTown('north');
  if (e.key === 'ArrowDown') moveTown('south');
  if (e.key === 'ArrowLeft') moveTown('west');
  if (e.key === 'ArrowRight') moveTown('east');
  if (e.key === 'Escape') {
    if (!document.getElementById('building-overlay').classList.contains('hidden')) {
      closeBuildingOverlay();
    } else {
      closeTownMap();
    }
  }
}

function moveTown(dir) {
  if (!currentTown) return;
  const { width, height } = currentTown;
  let { x, y } = gameState.townState;
  if (dir === 'north' && y > 0) y--;
  if (dir === 'south' && y < height - 1) y++;
  if (dir === 'west' && x > 0) x--;
  if (dir === 'east' && x < width - 1) x++;
  gameState.townState = { x, y };
  const tile = currentTown.grid[y][x];
  const name = tile ? (tile.road ? 'Road' : tile.name) : 'Empty Lot';
  document.getElementById('building-name').textContent = name;
  game.renderTownMap();
}

function openBuildingOverlay(tile) {
  currentBuilding = tile;
  document.getElementById('building-overlay-name').textContent = tile.name;
  const img = document.getElementById('building-overlay-image');
  if (img) {
    img.src = tile.image || '';
    img.alt = tile.type || 'building';
  }
  const descEl = document.getElementById('building-overlay-desc');
  if (descEl) descEl.textContent = '';
  document.getElementById('building-overlay').classList.remove('hidden');
  if (descEl) {
    descEl.textContent = '...';
    game.callGemini(`You are a DM. Describe ${tile.name}, a ${tile.type} in one sentence.`)
      .then((text) => { if (text) descEl.textContent = text; else descEl.textContent = ''; });
  }
}

function closeBuildingOverlay() {
  document.getElementById('building-overlay').classList.add('hidden');
  const img = document.getElementById('building-overlay-image');
  if (img) img.src = '';
  const descEl = document.getElementById('building-overlay-desc');
  if (descEl) descEl.textContent = '';
  currentBuilding = null;
}

async function handleBuildingAction(action) {
  if (!currentBuilding) return;
  const prompt = `You are a DM. The player chooses to ${action} at ${currentBuilding.name}, a ${currentBuilding.type}. Respond in one short sentence.`;
  const text = await game.callGemini(prompt);
  if (text) game.logMessage(text);
}

function openCompanion(index) {
  const comp = gameState.companions[index];
  if (!comp) return;
  document.getElementById('companion-name').textContent = comp.name;
  document.getElementById('companion-stats').textContent = Object.entries(comp.stats || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
  document.getElementById('companion-gear').textContent = 'Gear: ' + (comp.gear && comp.gear.length ? comp.gear.join(', ') : 'None');
  document.getElementById('companion-effects').textContent = 'Effects: ' + (comp.effects && comp.effects.length ? comp.effects.join(', ') : 'None');
  document.getElementById('companion-overlay').classList.remove('hidden');
}

function closeCompanion() {
  document.getElementById('companion-overlay').classList.add('hidden');
}

function openGlossary() {
  document.getElementById('glossary-overlay').classList.remove('hidden');
}

function closeGlossary() {
  document.getElementById('glossary-overlay').classList.add('hidden');
}

window.game = game;

export {
  game,
  gameState,
  openInventory,
  closeInventory,
  openParty,
  closeParty,
  openCompanion,
  closeCompanion,
  openGlossary,
  closeGlossary,
  openTownMap,
  closeTownMap,
  openBuildingOverlay,
  closeBuildingOverlay,
  handleBuildingAction,
  moveTown,
};
