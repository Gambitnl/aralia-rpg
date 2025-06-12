// Global DOM element references
let townMapContainer;
let townInfoPanel;

// Hardcoded sample town data (matches structure from town_generator.py)
const sampleTownData = {
    name: "Sampleville",
    environment_type: "forest", // Can be 'forest', 'plains', etc.
    buildings: [
        { name: "The Prancing Pony", type: "tavern", position: { x: 50, y: 100 } },
        { name: "Adventurer's Guild", type: "guild", position: { x: 150, y: 120 } },
        { name: "Blacksmith", type: "shop", position: { x: 70, y: 200 } },
        { name: "Herbalist Hut", type: "shop", position: { x: 200, y: 80 } },
        { name: "Town Hall", type: "civic", position: { x: 120, y: 50 } }
    ],
    roads: [
        { id: "road1", points: [{ x: 50, y: 110 }, { x: 150, y: 130 }] },
        { id: "road2", points: [{ x: 70, y: 210 }, { x: 120, y: 60 }] }
    ]
};

/**
 * Fetches town data from a placeholder API endpoint.
 * If the fetch fails, it returns a hardcoded sample town object for development.
 * @param {string} townId - The ID of the town to fetch.
 * @returns {Promise<object>} A promise that resolves to the town data.
 */
async function fetchTownData(townId) {
    console.log(`Fetching town data for: ${townId}`);
    try {
        // Placeholder URL - this endpoint doesn't exist yet.
        const response = await fetch(`/api/town/${townId}/map`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched town data:", data);
        return data;
    } catch (error) {
        console.error("Failed to fetch town data:", error);
        console.log("Using hardcoded sample town data instead.");
        return sampleTownData; // Return sample data on error
    }
}

/**
 * Renders the town map and its elements (buildings, roads) in the DOM.
 * @param {object} townData - The town data object.
 */
function renderTown(townData) {
    if (!townMapContainer || !townData) {
        console.error("Town map container or town data is not available.");
        return;
    }

    console.log("Rendering town:", townData.name);

    // Clear any existing content
    townMapContainer.innerHTML = '';

    // Display town name
    const townNameHeader = document.createElement('h2');
    townNameHeader.textContent = townData.name;
    townMapContainer.appendChild(townNameHeader);

    // Apply environment-specific border class
    townMapContainer.classList.remove('town-border-forest', 'town-border-plains'); // Remove any existing
    if (townData.environment_type === 'forest') {
        townMapContainer.classList.add('town-border-forest');
        console.log("Applied forest border.");
    } else if (townData.environment_type === 'plains') {
        townMapContainer.classList.add('town-border-plains');
        console.log("Applied plains border.");
    }
    // Add more environment conditions as needed

    // Render buildings
    townData.buildings.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building'; // For potential common styling
        buildingDiv.style.position = 'absolute'; // Position buildings on the map
        buildingDiv.style.left = `${building.position.x}px`;
        buildingDiv.style.top = `${building.position.y}px`;
        buildingDiv.style.border = '1px solid black';
        buildingDiv.style.padding = '5px';
        buildingDiv.style.backgroundColor = 'lightblue';
        buildingDiv.textContent = `${building.name} (${building.type})`;
        buildingDiv.title = `${building.name} - ${building.type}`; // Tooltip

        // Add click listener to show building info
        buildingDiv.addEventListener('click', () => handleBuildingClick(building));
        townMapContainer.appendChild(buildingDiv);
    });
    console.log(`Rendered ${townData.buildings.length} buildings.`);

    // Render roads (simple line representation for now)
    townData.roads.forEach(road => {
        // For simplicity, we'll just log roads for now.
        // Actual road rendering would involve SVG or Canvas.
        console.log(`Road (ID: ${road.id}) from (${road.points[0].x},${road.points[0].y}) to (${road.points[road.points.length-1].x},${road.points[road.points.length-1].y})`);
        const roadDiv = document.createElement('div');
        roadDiv.className = 'road';
        roadDiv.textContent = `Road: ${road.id}`;
        roadDiv.style.padding = '2px';
        roadDiv.style.backgroundColor = 'lightgray';
        roadDiv.style.marginTop = '5px'; // Basic separation
        // townMapContainer.appendChild(roadDiv); // Could append directly if not using absolute positioning for roads
    });
    console.log(`Processed ${townData.roads.length} roads.`);
}

/**
 * Handles clicks on building elements.
 * Displays information about the clicked building in the town info panel.
 * @param {object} building - The building object that was clicked.
 */
function handleBuildingClick(building) {
    if (!townInfoPanel) {
        console.error("Town info panel is not available.");
        return;
    }
    console.log("Building clicked:", building.name);

    townInfoPanel.innerHTML = `
        <h3>${building.name}</h3>
        <p><strong>Type:</strong> ${building.type}</p>
        <p><strong>Position:</strong> (X: ${building.position.x}, Y: ${building.position.y})</p>
        <!-- Add more building details here as needed -->
    `;
}

// Initialisation logic to run after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    // Get references to the main DOM elements
    townMapContainer = document.getElementById('town-map-container');
    townInfoPanel = document.getElementById('town-info');

    if (!townMapContainer) {
        console.error("#town-map-container not found in the DOM.");
        return;
    }
    if (!townInfoPanel) {
        console.error("#town-info not found in the DOM.");
        return;
    }

    console.log("townMapContainer and townInfoPanel successfully referenced.");

    // Fetch town data (using a test ID) and then render the town
    fetchTownData('test_town_id')
        .then(townData => {
            if (townData) {
                renderTown(townData);
            } else {
                console.error("No town data received to render.");
            }
        })
        .catch(error => {
            // This catch is for errors in the fetchTownData promise chain itself,
            // though fetchTownData is designed to return sample data on API failure.
            console.error("Error in initialisation sequence:", error);
            townInfoPanel.innerHTML = "<p>Could not load town data. Displaying sample.</p>";
            // Optionally render sample data here again if fetchTownData could somehow fail to return it
            // renderTown(sampleTownData);
        });
});
