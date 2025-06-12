// town_view.js - Basic structure

document.addEventListener('DOMContentLoaded', () => {
    console.log("Town View JS loaded.");

    const townMapContainer = document.getElementById('town-map-container');
    const townInfoPanel = document.getElementById('town-info');
    const errorPanel = document.getElementById('town-error');
    const backButton = document.getElementById('back-to-game');

    const defaultEnvironment = 'plains';
    let selectedEnvironment = sessionStorage.getItem('currentEnvironment') || defaultEnvironment;

    if (!townMapContainer) {
        console.error("Town View: #town-map-container not found.");
        if (errorPanel) {
            errorPanel.textContent = "Town map container missing; cannot display town view.";
            errorPanel.style.color = 'red';
        }
        return;
    }
    if (!townInfoPanel) {
        console.warn("Town View: #town-info panel not found.");
        if (errorPanel) {
            const p = document.createElement('p');
            p.textContent = 'Town info panel missing.';
            p.style.color = 'orange';
            errorPanel.appendChild(p);
        }
    }

    /**
     * Fetches town data from API or returns sample data.
     * @param {string} townId - The ID of the town to fetch.
     */
    async function fetchTownData(townId, environment = 'plains') {
        console.log(`Fetching data for town: ${townId} in ${environment}...`);
        if (!townId) {
            console.error("fetchTownData called without a townId.");
            townId = "default_error_town"; // Fallback to prevent API call with undefined
        }
        try {
            const response = await fetch(`/api/town/${townId}/map?env=${environment}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for town ${townId}`);
            }
            const data = await response.json();
            console.log("Fetched town data:", data);
            sessionStorage.setItem('currentEnvironment', data.environment_type);
            selectedEnvironment = data.environment_type;
            return data;
        } catch (error) {
            console.error("Failed to fetch real town data:", error);
            if (errorPanel) {
                errorPanel.textContent = `Failed to load town data: ${error.message}`;
                errorPanel.style.color = 'red';
            }
            console.log(`Using hardcoded sample town data for townId: ${townId} instead.`);
            return {
                name: townId === "default_error_town" ? "ErrorTown" : `Sample Town (${townId})`,
                environment_type: environment,
                buildings: [
                    { name: "The Empty Mug Tavern", type: "tavern", position: { x: 10, y: 10 } },
                    { name: "Closed Shop", type: "shop", position: { x: 50, y: 80 } }
                ],
                roads: [],
                description: "This is a sample town description. The actual town data could not be loaded."
            };
        }
    }

    /**
     * Renders the town data in the DOM.
     * @param {object} townData - The town data object.
     */
    function renderTown(townData) {
        if (!townData) {
            console.error("renderTown called with no townData.");
            if (townInfoPanel) townInfoPanel.innerHTML = "<p>No town data to display.</p>";
            return;
        }
        console.log("Rendering town:", townData.name);

        if (townMapContainer) {
            ['forest','plains','mountain'].forEach(env => townMapContainer.classList.remove(`town-border-${env}`));
            townMapContainer.classList.add(`town-border-${townData.environment_type}`);

            townMapContainer.innerHTML = `<h2>Welcome to ${townData.name} (${townData.environment_type})</h2>`;
            if(townData.description) {
                const descP = document.createElement('p');
                descP.textContent = townData.description;
                townMapContainer.appendChild(descP);
            }
            const buildingList = document.createElement('ul');
            townData.buildings.forEach(b => {
                const li = document.createElement('li');
                li.textContent = `${b.name} (${b.type}) at X:${b.position.x}, Y:${b.position.y}`;
                li.addEventListener('click', () => handleBuildingClick(b));
                buildingList.appendChild(li);
            });
            townMapContainer.appendChild(buildingList);
        }
        if (townInfoPanel) {
            townInfoPanel.innerHTML = `<p>Details about ${townData.name} will appear here.</p>`;
        }
    }

    /**
     * Placeholder for handling building clicks.
     * @param {object} building - The building object that was clicked.
     */
    function handleBuildingClick(building) {
        console.log("Clicked on building:", building.name);
        if (townInfoPanel) {
            townInfoPanel.innerHTML = `<h3>${building.name}</h3><p>Type: ${building.type}</p><p>Position: X:${building.position.x}, Y:${building.position.y}</p>`;
        }
    }

    const params = new URLSearchParams(window.location.search);
    let effectiveTownId = params.get('town') || 'test_town_id';
    if (!params.get('town')) {
        console.warn(`Town View: No town ID in URL. Using fallback: ${effectiveTownId}.`);
        if (townInfoPanel) {
            const p = document.createElement('p');
            p.style.color = 'orange';
            p.textContent = `INFO: No specific town ID was passed. Displaying data for default town ('${effectiveTownId}').`;
            townInfoPanel.prepend(p);
        }
    }

    // Fetch and render town data
    fetchTownData(effectiveTownId, selectedEnvironment).then(townData => {
        renderTown(townData);
    }).catch(error => {
        console.error("Error in town_view.js initialization:", error);
        if (errorPanel) {
            errorPanel.textContent = `Could not load town: ${error.message}`;
            errorPanel.style.color = 'red';
        }
    });

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'main_game.html';
        });
    }

    window.__townView = { fetchTownData, renderTown, handleBuildingClick };
});
