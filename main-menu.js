// Main menu overlay and controls
async function loadMainMenu() {
    const container = document.getElementById('main-menu-container');
    if (!container) return;
    try {
        const res = await fetch('main-menu.html');
        container.innerHTML = await res.text();
    } catch (err) {
        console.error('Failed to load main menu', err);
    }
}

function showMainMenu() {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.display = 'none';
    document.querySelector('header').style.filter = 'blur(4px)';
    const overlay = document.getElementById('main-menu-overlay');
    if (overlay) overlay.classList.remove('hidden');

    const saveButton = document.getElementById('menu-save-game');
    if (typeof game === 'undefined' || !game || typeof game.saveGame !== 'function') {
        saveButton.disabled = true;
        saveButton.title = "Save game functionality is not available.";
    } else {
        const characterExists = window.gameState && window.gameState.player && window.gameState.player.name !== 'Lyra';
        saveButton.disabled = !characterExists;
        if (!characterExists) {
            saveButton.title = "No character data to save. Start a new game or load a game.";
        } else {
            saveButton.title = "";
        }
    }
}

function hideMainMenu() {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.display = '';
    document.querySelector('header').style.filter = '';
    const overlay = document.getElementById('main-menu-overlay');
    if (overlay) overlay.classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
    loadMainMenu();
    const btn = document.getElementById('main-menu-btn');
    if (btn) btn.addEventListener('click', showMainMenu);
});
