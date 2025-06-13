// town_view.js - Basic structure

document.addEventListener('DOMContentLoaded', () => {
    console.log("Town View JS loaded.");

    const townMapContainer = document.getElementById('town-map-container');
    const townInfoPanel = document.getElementById('town-info');
    const errorPanel = document.getElementById('town-error');
    const backButton = document.getElementById('back-to-game');

    const defaultEnvironment = 'plains';
    const urlParams = new URLSearchParams(window.location.search);
    let selectedEnvironment = urlParams.get('env') || sessionStorage.getItem('currentEnvironment') || defaultEnvironment;
    const API_BASE = window.location.origin + '/api';

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
            return null;
        }
        try {
            const response = await fetch(`${API_BASE}/town/${townId}/map?env=${environment}`);
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
            return null;
        }
    }

    /**
     * Renders the town data in the DOM.
     * @param {object} townData - The town data object.
     */
    function renderTown(townData) {
        if (!townData) {
            console.error("renderTown called with no townData.");
            if (townInfoPanel) {
                const message = errorPanel ? errorPanel.textContent || 'No town data to display.' : 'No town data to display.';
                townInfoPanel.innerHTML = `<p>${message}</p>`;
            }
            return;
        }
        console.log("Rendering town:", townData.name);

        if (townMapContainer) {
            townMapContainer.classList.forEach(cls => {
                if (cls.startsWith('town-border-')) townMapContainer.classList.remove(cls);
            });
            townMapContainer.classList.add(`town-border-${townData.environment_type}`);

            townMapContainer.innerHTML = '';
            const h2 = document.createElement('h2');
            h2.textContent = `Welcome to ${townData.name} (${townData.environment_type})`;
            townMapContainer.appendChild(h2);
            if (townData.description) {
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
            townInfoPanel.textContent = `Details about ${townData.name} will appear here.`;
        }
    }

    /**
     * Placeholder for handling building clicks.
     * @param {object} building - The building object that was clicked.
     */
   function handleBuildingClick(building) {
       console.log("Clicked on building:", building.name);
       if (townInfoPanel) {
            townInfoPanel.innerHTML = '';
            const h3 = document.createElement('h3');
            h3.textContent = building.name;
            const typeP = document.createElement('p');
            typeP.textContent = `Type: ${building.type}`;
            const posP = document.createElement('p');
            posP.textContent = `Position: X:${building.position.x}, Y:${building.position.y}`;
            townInfoPanel.appendChild(h3);
            townInfoPanel.appendChild(typeP);
            townInfoPanel.appendChild(posP);
        }
    }

    const params = urlParams;
    const storedId = sessionStorage.getItem('currentTownId') || localStorage.getItem('currentTownId');
    let effectiveTownId = params.get('town') || storedId;
    if (!effectiveTownId) {
        if (errorPanel) {
            errorPanel.textContent = 'No town specified';
            errorPanel.style.color = 'red';
        }
        return;
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
        backButton.addEventListener('click', async () => {
            let hadError = false;
            try {
                const resp = await fetch(`${API_BASE}/game/leave_town`, { method: 'POST' });
                if (!resp.ok) {
                    hadError = true;
                    const msg = `leave_town request failed ${resp.status}`;
                    console.error(msg);
                }
            } catch (e) {
                hadError = true;
                console.error('Failed to notify server about leaving town:', e);
            } finally {
                if (hadError && errorPanel) {
                    errorPanel.textContent = 'Failed to notify server about leaving town.';
                    errorPanel.style.color = 'red';
                }
                window.location.href = 'main_game.html';
            }
        });
    }

    window.__townView = { fetchTownData, renderTown, handleBuildingClick };
});
