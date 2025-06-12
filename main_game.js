// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    let gameState = null;
    // --- DOM Element References ---
    // Header
    // Corrected to target the dynamic span for player name in header
    const headerPlayerNameDynamic = document.getElementById('header-player-name-dynamic');

    // Player Stats Panel
    const statsPlayerName = document.getElementById('stat-player-name');
    const statsPlayerClass = document.getElementById('stat-player-class');
    const statsPlayerLevel = document.getElementById('stat-player-level'); // Assuming this might exist
    const statsPlayerHp = document.getElementById('stat-player-hp');

    // Main Content Area
    const locationDescription = document.getElementById('location-description');

    // Message Log Panel
    const messageList = document.getElementById('message-list');
    const messageLogPanel = document.getElementById('message-log-panel'); // For scrolling

    // Action Panel Buttons
    const exploreButton = document.getElementById('action-explore');
    const lookButton = document.getElementById('action-look');
    const inventoryButton = document.getElementById('action-inventory');
    const skillsButton = document.getElementById('action-skills'); // Assuming this might exist
    const enterTownButton = document.getElementById('action-enter-town');
    const openTownViewButton = document.getElementById('action-open-town-view');

    // --- addMessage Function ---
    /**
     * Adds a new message string to the message log.
     * @param {string} messageText - The message text to add.
     */
    function addMessage(messageText) {
        if (!messageList) {
            console.warn("Message list DOM element (#message-list) not found. Cannot add message:", messageText);
            return;
        }
        const newMessageItem = document.createElement('li');
        newMessageItem.textContent = messageText;
        messageList.appendChild(newMessageItem);

        // Scroll to the bottom of the message log
        if (messageLogPanel) { // messageLogPanel is the scrollable container
            messageLogPanel.scrollTop = messageLogPanel.scrollHeight;
        }
    }

    // --- Update UI Function ---
    /**
     * Updates all relevant DOM elements with data from the gameState object.
     * @param {object} gameState - The game state object from the backend.
     */
    function updateUI(newState) {
        if (!newState) {
            console.error("UpdateUI called with null or undefined gameState.");
            addMessage("Error: Could not update UI, game state is missing.");
            return;
        }
        gameState = newState;

        console.log("Updating UI with gameState:", gameState);

        // Update header player name
        if (headerPlayerNameDynamic) headerPlayerNameDynamic.textContent = gameState.player_name || "N/A";

        // Update player stats panel
        if (statsPlayerName) statsPlayerName.textContent = gameState.player_name || "N/A";
        if (statsPlayerClass) statsPlayerClass.textContent = gameState.player_class || "N/A";
        if (statsPlayerLevel) statsPlayerLevel.textContent = gameState.player_level || "1"; // Default if not provided
        if (statsPlayerHp) statsPlayerHp.textContent = `${gameState.player_hp}/${gameState.player_max_hp}` || "N/A";

        // Update main content area
        if (locationDescription) locationDescription.textContent = gameState.location_description || "An unknown place...";

        // Update message log
        if (messageList) {
            messageList.innerHTML = ''; // Clear existing messages before adding new ones
            if (gameState.messages && Array.isArray(gameState.messages)) {
                gameState.messages.forEach(msg => addMessage(msg)); // Add messages from game state
            } else {
                addMessage("No messages received from server or message format is incorrect.");
            }
        }

        // Update visibility of 'Enter Town' button based on available_actions
        if (enterTownButton) {
            const canEnterTown = gameState.available_actions && gameState.available_actions.includes('enter town');
            enterTownButton.style.display = canEnterTown ? 'inline-block' : 'none';
        }
        if (openTownViewButton) {
            const hasTown = Boolean(gameState.current_town_id);
            openTownViewButton.style.display = hasTown ? 'inline-block' : 'none';
        }
        // Add logic for other contextual buttons here if needed

        // IMPORTANT: Check for town navigation trigger AFTER all other UI updates for the current page
        if (gameState.trigger_town_navigation && gameState.current_town_id) {
            console.log("Town navigation triggered by backend. Town ID:", gameState.current_town_id);
            // Add message before redirecting so user sees it briefly if possible
            addMessage("Navigating to " + gameState.current_town_id + "...");

            sessionStorage.setItem('currentTownId', gameState.current_town_id);

            // Short delay to allow the message to be rendered, then redirect.
            setTimeout(() => {
                window.location.href = '/town_view.html';
            }, 500); // 0.5 second delay
            // The trigger_town_navigation flag was part of the transient response from backend.
            // No client-side reset of the flag is needed as the page will reload/navigate away.
        }
    }

    // --- Fetch Game State Function ---
    /**
     * Fetches the initial game state from the backend and updates the UI.
     */
    async function fetchGameState() {
        addMessage("Loading game data..."); // Initial message while fetching
        try {
            const response = await fetch('/api/game/state');
            if (!response.ok) {
                // Try to get error details from response body if possible
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg += ` - ${errorData.error || ''} ${errorData.details || ''}`;
                } catch (e) { /* Ignore if response body isn't JSON */ }
                throw new Error(errorMsg);
            }
            const state = await response.json();
            updateUI(state);
            // Message indicating successful load is implicitly handled by updateUI repopulating messages
        } catch (error) {
            console.error("Error fetching game state:", error);
            addMessage(`Failed to load game state: ${error.message}. Please try refreshing the page.`);
        }
    }

    // --- Generic Action Handler ---
    /**
     * Sends a specified action to the backend and updates the UI with the response.
     * @param {string} actionName - The name of the action to perform.
     * @param {object} [params={}] - Optional parameters for the action.
     */
    async function performGameAction(actionName, params = {}) {
        console.log(`Performing action: ${actionName}`, params);
        // Optional: addMessage(`Sending action: ${actionName}...`); // Immediate client-side feedback

        try {
            const response = await fetch('/api/game/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: actionName, params: params }),
            });

            if (!response.ok) {
                let errorMsg = `Action '${actionName}' failed! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg += ` - ${errorData.error || ''} ${errorData.details || ''}`;
                } catch (e) { /* Ignore if response body isn't JSON */ }
                throw new Error(errorMsg);
            }
            const updatedGameState = await response.json();
            updateUI(updatedGameState);
        } catch (error) {
            console.error(`Error performing action ${actionName}:`, error);
            addMessage(`Error: ${error.message}`);
        }
    }

    // --- Specific Action Handler Functions ---
    // These now simply call the generic performGameAction function.
    function handleExplore() { performGameAction("explore"); }
    function handleLookAround() { performGameAction("look around"); }
    function handleViewInventory() { performGameAction("inventory"); }
    function handleViewSkills() { performGameAction("skills"); }
    function handleEnterTown() {
        // This function just sends the "enter town" action to the backend.
        // The backend will respond with a state that includes the navigation trigger if successful.
        // updateUI will then handle the actual redirection.
        console.log("Enter Town button clicked. Sending 'enter town' action to backend.");
        performGameAction("enter town");
    }
    function handleOpenTownView() {
        if (!gameState || !gameState.current_town_id) {
            console.warn("No town ID available for town view navigation.");
            return;
        }
        sessionStorage.setItem('currentTownId', gameState.current_town_id);
        window.location.href = '/town_view.html';
    }

    // --- Event Listeners ---
    // Ensure buttons exist before adding listeners, good practice though DOMContentLoaded should mean they are there.
    if (exploreButton) exploreButton.addEventListener('click', handleExplore);
    if (lookButton) lookButton.addEventListener('click', handleLookAround);
    if (inventoryButton) inventoryButton.addEventListener('click', handleViewInventory);
    if (skillsButton) skillsButton.addEventListener('click', handleViewSkills);
    if (enterTownButton) enterTownButton.addEventListener('click', handleEnterTown);
    if (openTownViewButton) openTownViewButton.addEventListener('click', handleOpenTownView);

    // --- Initialization Logic ---
    addMessage("main_game.js loaded successfully. Initializing...");
    fetchGameState(); // Fetch initial game state when the DOM is ready.

    console.log("Main game interface JS initialized. Attempting to fetch initial game state.");
});
