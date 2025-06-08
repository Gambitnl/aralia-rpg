import {
  game,
  openInventory,
  closeInventory,
  openParty,
  closeParty,
  openCompanion,
  closeCompanion,
  openGlossary,
  closeGlossary,
} from './game.js';

window.addEventListener('load', () => {
  document.getElementById('open-inventory').addEventListener('click', openInventory);
  document.getElementById('close-inventory').addEventListener('click', closeInventory);
  document.getElementById('open-party').addEventListener('click', openParty);
  document.getElementById('close-party').addEventListener('click', closeParty);
  document.getElementById('close-companion').addEventListener('click', closeCompanion);
  document.getElementById('open-glossary').addEventListener('click', openGlossary);
  document.getElementById('close-glossary').addEventListener('click', closeGlossary);
  document.getElementById('save-game').addEventListener('click', () => game.saveGame());

  game.init();
});

export { game, openCompanion };
