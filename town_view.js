// town_view.js - Basic structure

document.addEventListener('DOMContentLoaded', () => {
    console.log("Town View JS loaded.");

    const townMapContainer = document.getElementById('town-map-container');
    const townInfoPanel = document.getElementById('town-info');

    if (!townMapContainer) {
        console.error("Town View: #town-map-container not found.");
        // Potentially update a general error div if one exists on town_view.html
        return;
    }
    if (!townInfoPanel) {
        console.warn("Town View: #town-info panel not found.");
    }

    /**
     * Fetches town data from API or returns sample data.
     * @param {string} townId - The ID of the town to fetch.
     */
    async function fetchTownData(townId) {
        console.log(`Fetching data for town: ${townId}...`);
        if (!townId) {
            console.error("fetchTownData called without a townId.");
            townId = "default_error_town"; // Fallback to prevent API call with undefined
        }
        try {
            // This API endpoint /api/town/${townId}/map does not have its Python generator (town_generator.py)
            // in the current workspace due to the reset. So, this fetch will likely fail.
            const response = await fetch(`/api/town/${townId}/map`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for town ${townId}`);
            }
            const data = await response.json();
            console.log("Fetched town data:", data);
            return data;
        } catch (error) {
            console.error("Failed to fetch real town data:", error);
            console.log(`Using hardcoded sample town data for townId: ${townId} instead.`);
            // Return a more detailed sample object
            return {
                name: townId === "default_error_town" ? "ErrorTown" : `Sample Town (${townId})`,
                environment_type: "plains", // Default environment
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

    // --- SessionStorage Logic for Town ID (as per subtask instructions) ---
    const townIdFromSession = sessionStorage.getItem('currentTownId');
    let effectiveTownId = 'test_town_id'; // Fallback default

    if (townIdFromSession) {
        effectiveTownId = townIdFromSession;
        console.log(`Town View: Found townId in sessionStorage: ${effectiveTownId}`);
        // Clean up the sessionStorage item
        sessionStorage.removeItem('currentTownId');
        console.log("Town View: Removed currentTownId from sessionStorage.");
    } else {
        console.warn(`Town View: No currentTownId in sessionStorage. Using fallback: ${effectiveTownId}.`);
        if (townInfoPanel) {
            const p = document.createElement('p');
            p.style.color = "orange";
            p.textContent = `INFO: No specific town ID was passed. Displaying data for default town ('${effectiveTownId}').`;
            townInfoPanel.prepend(p);
        }
    }

    // Fetch and render town data
    fetchTownData(effectiveTownId).then(townData => {
        renderTown(townData);
    }).catch(error => {
        console.error("Error in town_view.js initialization:", error);
        if (townInfoPanel) {
             townInfoPanel.innerHTML = `<p style="color:red;">Could not load town: ${error.message}</p>`;
        } else if (townMapContainer) {
            townMapContainer.innerHTML = `<p style="color:red;">Could not load town: ${error.message}</p>`;
        }
    });
});
