// Character Creator JavaScript
console.log("Character Creator JS loaded");

let characterInProgress = {
    species: null,
    class: null,
    subclass: null,
    background: null,
    background_feat: null,
    chosen_equipment_set: null,
    base_ability_scores: {},
    final_ability_scores: {},
    // other character attributes
};

const API_BASE_URL = "http://localhost:5001/api";
let allFeatsData = []; // To store all feats fetched once

// --- Ability Score Constants (Point Buy) ---
// These are based on D&D 5e standard point buy rules.
// Costs are for increasing a score from 8 to the key value.
const pointBuyCosts = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};
const maxPointsToSpend = 27;
const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
const defaultScore = 8;
const minScore = 8;
const maxScore = 15;

// --- Species Selection ---
async function fetchAndDisplaySpecies() {
    const speciesListContainer = document.getElementById('species-list-container');
    const speciesDetailsContainer = document.getElementById('species-details');

    if (!speciesListContainer || !speciesDetailsContainer) {
        console.error("Species selection HTML elements not found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/species`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const speciesArray = await response.json();

        speciesListContainer.innerHTML = ''; // Clear existing content
        speciesDetailsContainer.innerHTML = '<p>Select a species to see its details.</p>'; // Reset details

        speciesArray.forEach(species => {
            const speciesElement = document.createElement('button'); // Using button for better accessibility
            speciesElement.classList.add('selectable-item');
            speciesElement.textContent = species.name;
            speciesElement.dataset.speciesName = species.name; // Store name for easy access

            speciesElement.addEventListener('click', () => {
                // The full species data is passed directly from the closure
                selectSpecies(species, speciesElement, speciesListContainer);
            });
            speciesListContainer.appendChild(speciesElement);
        });

    } catch (error) {
        console.error("Error fetching species:", error);
        speciesListContainer.innerHTML = '<p class="error-message">Could not load species. Is the API server running?</p>';
    }
}

function selectSpecies(speciesData, selectedElement, container) {
    characterInProgress.species = speciesData;
    console.log("Selected Species:", characterInProgress.species);
    updateCharacterSummary();

    // Update details display
    const speciesDetailsContainer = document.getElementById('species-details');
    if (speciesDetailsContainer) {
        let detailsHtml = `<h3>${speciesData.name}</h3>`;
        // Assuming 'description' and 'racial_traits' are fields in your SpeciesData.
        // Adjust if your data structure is different.
        if (speciesData.description) {
            detailsHtml += `<p>${speciesData.description}</p>`;
        }
        if (speciesData.ability_score_increase) {
            detailsHtml += `<p><strong>Ability Score Increase:</strong> ${speciesData.ability_score_increase}</p>`;
        }
        if (speciesData.size) {
            detailsHtml += `<p><strong>Size:</strong> ${speciesData.size}</p>`;
        }
        if (speciesData.speed) {
            detailsHtml += `<p><strong>Speed:</strong> ${speciesData.speed} ft.</p>`;
        }
        if (speciesData.traits && speciesData.traits.length > 0) {
            detailsHtml += `<h4>Traits:</h4><ul>`;
            speciesData.traits.forEach(trait => {
                detailsHtml += `<li><strong>${trait.name}:</strong> ${trait.description}</li>`;
            });
            detailsHtml += `</ul>`;
        }
        // Add more fields as necessary, e.g., languages, proficiencies.
        // This depends on the exact structure of your SpeciesData.
        // For example, if racial_traits is a list of objects:
        // if (speciesData.racial_traits && speciesData.racial_traits.length > 0) {
        //     detailsHtml += `<p><strong>Racial Traits:</strong></p><ul>`;
        //     speciesData.racial_traits.forEach(trait => {
        //         detailsHtml += `<li>${trait.name}: ${trait.description}</li>`;
        //     });
        //     detailsHtml += `</ul>`;
        // }
        speciesDetailsContainer.innerHTML = detailsHtml;
    }

    // Update visual selection
    const allItems = container.querySelectorAll('.selectable-item');
    allItems.forEach(item => item.classList.remove('selected'));
    selectedElement.classList.add('selected');

    // For now, after selecting a species, show the class selection area
    // This is a simplified progression logic.
    const classSelectionArea = document.getElementById('class-selection-area');
    if (classSelectionArea) {
        classSelectionArea.style.display = 'block'; // Make it visible
    }
    // document.getElementById('species-selection-area').style.display = 'none'; // Optionally hide species section
    fetchAndDisplayClasses(); // Fetch classes once a species is selected
}

// --- Class Selection ---
async function fetchAndDisplayClasses() {
    const classListContainer = document.getElementById('class-list-container');
    const classDetailsContainer = document.getElementById('class-details');

    if (!classListContainer || !classDetailsContainer) {
        console.error("Class selection HTML elements not found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/classes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const classArray = await response.json();

        classListContainer.innerHTML = ''; // Clear existing content
        classDetailsContainer.innerHTML = '<p>Select a class to see its details.</p>'; // Reset details

        classArray.forEach(classData => {
            const classElement = document.createElement('button');
            classElement.classList.add('selectable-item');
            classElement.textContent = classData.name;
            classElement.dataset.className = classData.name;

            classElement.addEventListener('click', () => {
                selectClass(classData, classElement, classListContainer);
            });
            classListContainer.appendChild(classElement);
        });

    } catch (error) {
        console.error("Error fetching classes:", error);
        classListContainer.innerHTML = '<p class="error-message">Could not load classes. Is the API server running?</p>';
    }
}

function selectClass(classData, selectedElement, container) {
    characterInProgress.class = classData;
    characterInProgress.subclass = null; // Reset subclass when class changes
    console.log("Selected Class:", characterInProgress.class);
    updateCharacterSummary();

    const classDetailsContainer = document.getElementById('class-details');
    if (classDetailsContainer) {
        let detailsHtml = `<h3>${classData.name}</h3>`;
        if (classData.description) {
            detailsHtml += `<p>${classData.description}</p>`;
        }
        detailsHtml += `<p><strong>Hit Die:</strong> d${classData.hit_die}</p>`;

        if (classData.proficiencies && classData.proficiencies.length > 0) {
            detailsHtml += `<h4>Proficiencies:</h4><ul>`;
            classData.proficiencies.forEach(prof => {
                // Assuming prof is a string. If it's an object, adjust (e.g., prof.name)
                detailsHtml += `<li>${prof}</li>`;
            });
            detailsHtml += `</ul>`;
        }

        // Assuming level_1_features is a field. This might need to be more dynamic
        // if features are stored per level in a more complex structure.
        // For now, let's assume 'features' is a list of {name, description} objects at the class root for level 1.
        // Or, if you have a specific `level_1_features` key that is a list of strings or objects.
        // The current ClassData structure in dnd_data_structures.py has `subclasses` but not explicit `level_1_features`.
        // Let's assume `classData.features` is a list of features for now.
        // We'll need to adjust based on the actual data from your API.
        // For example, if features are directly on the class:
        // if (classData.features && classData.features.length > 0) {
        //     detailsHtml += `<h4>Features:</h4><ul>`;
        //     classData.features.forEach(feature => {
        //         detailsHtml += `<li><strong>${feature.name}:</strong> ${feature.description}</li>`;
        //     });
        //     detailsHtml += `</ul>`;
        // }

        // Placeholder for actual features - adjust based on your ClassData model
        // This part is highly dependent on how `ClassData` is structured in your Python backend.
        // For example, if you have a `get_features_at_level(1)` method or similar.
        // For now, we'll just list some common attributes.
        if (classData.saving_throws && classData.saving_throws.length > 0) {
            detailsHtml += `<p><strong>Saving Throws:</strong> ${classData.saving_throws.join(', ')}</p>`;
        }
        if (classData.skill_proficiencies_options && classData.skill_proficiencies_options.choose) {
             detailsHtml += `<p><strong>Skill Choices:</strong> Choose ${classData.skill_proficiencies_options.choose} from ${classData.skill_proficiencies_options.options.join(', ')}</p>`;
        }


        classDetailsContainer.innerHTML = detailsHtml;
    }

    const allItems = container.querySelectorAll('.selectable-item');
    allItems.forEach(item => item.classList.remove('selected'));
    selectedElement.classList.add('selected');

    // Handle subclasses
    const subclassSelectionArea = document.getElementById('subclass-selection-area');
    const subclassContainer = document.getElementById('subclass-list-container');
    const subclassDetailsContainer = document.getElementById('subclass-details');

    // Reset subclass state
    characterInProgress.subclass = null;
    if (subclassContainer) subclassContainer.innerHTML = '';
    if (subclassDetailsContainer) subclassDetailsContainer.innerHTML = '<p>Select a subclass to see its details, if applicable for your class at level 1.</p>';


    if ( (classData.name === "Sorcerer" || classData.name === "Warlock") &&
         classData.subclasses && classData.subclasses.length > 0) {
        if (subclassSelectionArea) subclassSelectionArea.style.display = 'block';
        displaySubclassOptions(classData.subclasses);
    } else {
        if (subclassSelectionArea) subclassSelectionArea.style.display = 'none';
        // If no subclass at level 1, or for other classes, proceed to ability scores
        // (or hide subclass area if it was previously shown for another class)
        const abilityScoreArea = document.getElementById('ability-score-area');
        if (abilityScoreArea) {
            abilityScoreArea.style.display = 'block';
        }
        initializeAbilityScores();
        displayAbilityScores();
        validateScoresOnBackend();
    }

    // If a class that *doesn't* get a subclass at level 1 is selected,
    // ensure the ability score section is shown immediately.
    // This logic is now partially handled above.
    if (classData.name !== "Sorcerer" && classData.name !== "Warlock") {
        const abilityScoreArea = document.getElementById('ability-score-area');
        if (abilityScoreArea) {
            abilityScoreArea.style.display = 'block';
        }
        initializeAbilityScores();
        displayAbilityScores();
        validateScoresOnBackend();
    } else {
        // For Sorcerer/Warlock, hide ability scores until subclass is (potentially) chosen
        // Or, let it be visible and subclass is an optional/additional step.
        // For this flow, let's assume subclass selection *then* ability scores for these specific classes.
        // So, if it's a Sorcerer/Warlock, the ability score section is shown *after* subclass logic.
        // The current structure shows ability scores if not Sorc/Warlock, or if Sorc/Warlock and they have no subclasses.
        // We need to ensure that if it *is* Sorc/Warlock and subclasses *are* displayed, ability scores wait.
        // The code above already does this: if Sorc/Warlock and subclasses exist, it calls displaySubclassOptions.
        // The progression to ability scores for these classes will happen in selectSubclass.
        if ( (classData.name === "Sorcerer" || classData.name === "Warlock") &&
             classData.subclasses && classData.subclasses.length > 0) {
            const abilityScoreArea = document.getElementById('ability-score-area');
            if (abilityScoreArea) {
                abilityScoreArea.style.display = 'none'; // Hide it until subclass is selected
            }
        }
    }

    // Old logic for showing ability scores - now more conditional
    // const abilityScoreArea = document.getElementById('ability-score-area');
    // if (abilityScoreArea) {
    //     abilityScoreArea.style.display = 'block';
    // }
    // initializeAbilityScores();
    // displayAbilityScores();
    // validateScoresOnBackend();
}

// --- Subclass Selection ---
function displaySubclassOptions(subclasses) {
    const subclassContainer = document.getElementById('subclass-list-container');
    const subclassDetailsContainer = document.getElementById('subclass-details');

    if (!subclassContainer || !subclassDetailsContainer) {
        console.error("Subclass HTML elements not found.");
        return;
    }
    subclassContainer.innerHTML = ''; // Clear previous options
    subclassDetailsContainer.innerHTML = '<p>Choose your subclass specialization.</p>';

    subclasses.forEach(subclass => {
        const subElement = document.createElement('button');
        subElement.classList.add('selectable-item');
        subElement.textContent = subclass.name;
        subElement.addEventListener('click', () => {
            selectSubclass(subclass, subElement, subclassContainer);
        });
        subclassContainer.appendChild(subElement);
    });
}

function selectSubclass(subclassData, selectedElement, container) {
    characterInProgress.subclass = subclassData;
    console.log("Selected Subclass:", characterInProgress.subclass);
    updateCharacterSummary();

    const subclassDetailsContainer = document.getElementById('subclass-details');
    if (subclassDetailsContainer) {
        let detailsHtml = `<h3>${subclassData.name}</h3>`;
        if (subclassData.description) {
            detailsHtml += `<p>${subclassData.description}</p>`;
        }

        // Display level 1 features if they exist
        // Assuming features is like: { "1": [ {name: "", description:""}, ... ], "3": [...] }
        if (subclassData.features && (subclassData.features['1'] || subclassData.features[1])) {
            const level1Features = subclassData.features['1'] || subclassData.features[1];
            if (level1Features.length > 0) {
                detailsHtml += `<h4>Level 1 Features:</h4><ul>`;
                level1Features.forEach(feature => {
                    detailsHtml += `<li><strong>${feature.name}:</strong> ${feature.description}</li>`;
                });
                detailsHtml += `</ul>`;
            }
        }
        subclassDetailsContainer.innerHTML = detailsHtml;
    }

    const allItems = container.querySelectorAll('.selectable-item');
    allItems.forEach(item => item.classList.remove('selected'));
    selectedElement.classList.add('selected');

    console.log("Subclass selected. Next step could be backgrounds or finalizing scores.");
    // Now show ability scores section
    const abilityScoreArea = document.getElementById('ability-score-area');
    if (abilityScoreArea) {
        abilityScoreArea.style.display = 'block';
    }
    initializeAbilityScores();
    displayAbilityScores();
    validateScoresOnBackend();
}

// --- Ability Score ---
function initializeAbilityScores() {
    abilities.forEach(ability => {
        characterInProgress.base_ability_scores[ability] = defaultScore;
    });

    const container = document.getElementById('ability-scores-container');
    if (!container) {
        console.error("Ability scores container not found!");
        return;
    }
    container.innerHTML = ''; // Clear previous content

    abilities.forEach(ability => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('ability-entry');

        const label = document.createElement('label');
        label.setAttribute('for', `${ability}-score`);
        label.textContent = `${ability}: `;
        entryDiv.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `${ability}-score`;
        input.min = minScore;
        input.max = maxScore;
        input.value = characterInProgress.base_ability_scores[ability];
        input.dataset.ability = ability;
        input.addEventListener('change', handleAbilityInputChange); // 'change' is often better than 'input' for number fields
        entryDiv.appendChild(input);

        const modifierSpan = document.createElement('span');
        modifierSpan.id = `${ability}-modifier`;
        modifierSpan.classList.add('ability-modifier');
        entryDiv.appendChild(modifierSpan);

        const costSpan = document.createElement('span');
        costSpan.id = `${ability}-cost`;
        costSpan.classList.add('ability-cost');
        entryDiv.appendChild(costSpan);

        container.appendChild(entryDiv);
    });
}

function handleAbilityInputChange(event) {
    const abilityName = event.target.dataset.ability;
    let value = parseInt(event.target.value, 10);

    // Clamp value between minScore and maxScore
    if (isNaN(value) || value < minScore) {
        value = minScore;
    } else if (value > maxScore) {
        value = maxScore;
    }
    event.target.value = value; // Update input field if value was clamped

    characterInProgress.base_ability_scores[abilityName] = value;
    displayAbilityScores(); // Update all UI elements for scores
    validateScoresOnBackend();
}

function displayAbilityScores() {
    let totalPointsSpent = 0;
    abilities.forEach(ability => {
        const score = characterInProgress.base_ability_scores[ability] || defaultScore;

        const inputEl = document.getElementById(`${ability}-score`);
        if (inputEl) inputEl.value = score;

        const modifier = Math.floor((score - 10) / 2);
        const modifierEl = document.getElementById(`${ability}-modifier`);
        if (modifierEl) modifierEl.textContent = ` (Mod: ${modifier >= 0 ? '+' : ''}${modifier})`;

        const cost = pointBuyCosts[score];
        const costEl = document.getElementById(`${ability}-cost`);
        if (costEl) costEl.textContent = ` (Cost: ${cost})`;

        totalPointsSpent += cost;
    });

    const summaryEl = document.getElementById('point-buy-summary');
    if (summaryEl) { // Temporarily update with frontend calculation until backend validation
        summaryEl.textContent = `Points Spent: ${totalPointsSpent} / ${maxPointsToSpend}`;
        if (totalPointsSpent > maxPointsToSpend) {
            summaryEl.classList.add('invalid');
            summaryEl.classList.remove('valid');
        } else {
            summaryEl.classList.remove('invalid');
            // 'valid' class might be added by backend validation response
        }
    }
    updateCharacterSummary(); // Update summary when ability scores change
}

async function validateScoresOnBackend() {
    const summaryEl = document.getElementById('point-buy-summary');
    try {
        const response = await fetch(`${API_BASE_URL}/validate_scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scores: characterInProgress.base_ability_scores }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.detail || response.statusText}`);
        }

        const result = await response.json();
        if (summaryEl) {
            summaryEl.textContent = result.message; // Display message from backend
            if (result.is_valid) {
                summaryEl.classList.remove('invalid');
                summaryEl.classList.add('valid');
                // Show background selection area if scores are valid
                const backgroundSelectionArea = document.getElementById('background-selection-area');
                if (backgroundSelectionArea) backgroundSelectionArea.style.display = 'block';
                fetchAndDisplayBackgrounds();
            } else {
                summaryEl.classList.remove('valid');
                summaryEl.classList.add('invalid');
                // Hide background selection area if scores are not valid
                const backgroundSelectionArea = document.getElementById('background-selection-area');
                if (backgroundSelectionArea) backgroundSelectionArea.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error validating scores on backend:', error);
        if (summaryEl) {
            summaryEl.textContent = `Error validating scores: ${error.message}. Please check console.`;
            summaryEl.classList.remove('valid');
            summaryEl.classList.add('invalid');
        }
        // Hide background selection area on error too
        const backgroundSelectionArea = document.getElementById('background-selection-area');
        if (backgroundSelectionArea) backgroundSelectionArea.style.display = 'none';
    }
}

// --- Background Selection ---
async function fetchAndDisplayBackgrounds() {
    const backgroundListContainer = document.getElementById('background-list-container');
    const backgroundDetailsContainer = document.getElementById('background-details');

    if (!backgroundListContainer || !backgroundDetailsContainer) {
        console.error("Background selection HTML elements not found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/backgrounds`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const backgroundArray = await response.json();

        backgroundListContainer.innerHTML = '';
        backgroundDetailsContainer.innerHTML = '<p>Select a background to see its details and associated feat.</p>';

        backgroundArray.forEach(bg => {
            const bgElement = document.createElement('button');
            bgElement.classList.add('selectable-item');
            bgElement.textContent = bg.name;
            bgElement.addEventListener('click', () => {
                selectBackground(bg, bgElement, backgroundListContainer);
            });
            backgroundListContainer.appendChild(bgElement);
        });
    } catch (error) {
        console.error("Error fetching backgrounds:", error);
        backgroundListContainer.innerHTML = '<p class="error-message">Could not load backgrounds.</p>';
    }
}

function selectBackground(backgroundData, selectedElement, container) {
    characterInProgress.background = backgroundData;
    characterInProgress.background_feat = null; // Reset previous feat
    console.log("Selected Background:", backgroundData);

    const detailsContainer = document.getElementById('background-details');
    let detailsHtml = `<h3>${backgroundData.name}</h3>`;
    if (backgroundData.description) {
        detailsHtml += `<p>${backgroundData.description}</p>`;
    }
    if (backgroundData.skill_proficiencies && backgroundData.skill_proficiencies.length > 0) {
        detailsHtml += `<p><strong>Skill Proficiencies:</strong> ${backgroundData.skill_proficiencies.join(', ')}</p>`;
    }
    if (backgroundData.tool_proficiencies && backgroundData.tool_proficiencies.length > 0) {
        detailsHtml += `<p><strong>Tool Proficiencies:</strong> ${backgroundData.tool_proficiencies.join(', ')}</p>`;
    }
    if (backgroundData.languages && backgroundData.languages.length > 0) {
        detailsHtml += `<p><strong>Languages:</strong> ${backgroundData.languages.join(', ')}</p>`;
    }

    if (backgroundData.starting_feat_name) {
        const foundFeat = allFeatsData.find(feat => feat.name === backgroundData.starting_feat_name);
        if (foundFeat) {
            characterInProgress.background_feat = foundFeat; // Set the feat in characterInProgress
            detailsHtml += `<div class="background-feat-details"><h4>Starting Feat: ${foundFeat.name}</h4>`;
            detailsHtml += `<p>${foundFeat.description}</p></div>`;
            console.log("Associated Feat:", foundFeat);
        } else {
            detailsHtml += `<p><em>Starting feat details (${backgroundData.starting_feat_name}) not found.</em></p>`;
            console.warn(`Feat named "${backgroundData.starting_feat_name}" not found in pre-loaded feats.`);
        }
    }
    detailsContainer.innerHTML = detailsHtml;

    const allItems = container.querySelectorAll('.selectable-item');
    allItems.forEach(item => item.classList.remove('selected'));
    selectedElement.classList.add('selected');

    updateCharacterSummary(); // Update summary after background and feat are processed

    console.log("Background selected. Next step: Final Review.");
    // Consider showing a "Final Review" button or section here.
    displayEquipmentOptions(); // Proceed to equipment selection
}

// --- Equipment Selection ---
function displayEquipmentOptions() {
    // Hide other sections if you want to focus user attention
    // e.g., document.getElementById('background-selection-area').style.display = 'none';

    const equipmentArea = document.getElementById('equipment-selection-area');
    if (equipmentArea) equipmentArea.style.display = 'block';

    const container = document.getElementById('equipment-options-container');
    if (!container) {
        console.error("Equipment options container not found.");
        return;
    }
    container.innerHTML = ''; // Clear previous options

    if (!characterInProgress.class || !characterInProgress.class.starting_equipment_options) {
        container.innerHTML = "<p>No specific starting equipment choices found for this class, or class not selected.</p>";
        return;
    }

    const options = characterInProgress.class.starting_equipment_options;
    if (options.length === 0) {
        container.innerHTML = "<p>No specific starting equipment choices found for this class.</p>";
        return;
    }

    options.forEach((optionSet, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('equipment-set-option');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'equipment_choice'; // Group radio buttons
        input.id = `equip_option_${index}`;
        input.value = index; // Store index to retrieve the chosen set

        input.onchange = () => selectEquipmentSet(index);

        const label = document.createElement('label');
        label.htmlFor = input.id;

        // The optionSet is like {"Option A": ["item1", "item2"]}
        // Or it could be simpler if the API guarantees a structure.
        // Assuming the structure from dnd_data_structures.py: list[dict[str, list[str]]]
        // where each dict has one key.
        const setName = Object.keys(optionSet)[0]; // e.g., "Option A"
        const items = optionSet[setName];          // e.g., ["item1", "item2"]

        let labelText = `<strong>${setName}:</strong><ul>`;
        items.forEach(item => {
            labelText += `<li>${item}</li>`;
        });
        labelText += `</ul>`;
        label.innerHTML = labelText;

        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        container.appendChild(optionDiv);
    });
}

function selectEquipmentSet(optionIndex) {
    console.log("Selected equipment option index:", optionIndex);
    const chosenSetWrapper = characterInProgress.class.starting_equipment_options[optionIndex];
    // chosenSetWrapper is like {"Option A": ["item1", "item2"]}
    // We want to store the array of items.
    if (chosenSetWrapper) {
        const itemsArray = Object.values(chosenSetWrapper)[0];
        characterInProgress.chosen_equipment_set = itemsArray;
        console.log("Chosen equipment set:", itemsArray);
    } else {
        characterInProgress.chosen_equipment_set = null;
        console.error("Could not find chosen equipment set for index:", optionIndex);
    }
    updateCharacterSummary();
    // Potentially show next section or a "Finish" button
    console.log("Equipment selected. Character creation nearing completion!");
}


// --- Initialization ---
async function initializeCreator() {
    console.log("Initializing character creator...");
    await fetchAndDisplaySpecies(); // Wait for species to load first, or run in parallel

    // Fetch all feats once and store them
    try {
        const response = await fetch(`${API_BASE_URL}/feats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allFeatsData = await response.json();
        console.log("All feats loaded:", allFeatsData);
    } catch (error) {
        console.error("Error fetching all feats:", error);
        // Handle error - perhaps disable background feat display or show a warning
    }

    // Other initializations if needed
    // fetchAndDisplayClasses(); // Called after species selection
    // initializeAbilityScores(); // Called after class/subclass selection
    // fetchAndDisplayBackgrounds(); // Called after ability scores are validated

    updateCharacterSummary(); // Initial summary display
}

// --- Character Summary Panel ---
function updateCharacterSummary() {
    document.getElementById('summary-species').textContent = characterInProgress.species ? characterInProgress.species.name : '-';
    document.getElementById('summary-class').textContent = characterInProgress.class ? characterInProgress.class.name : '-';
    document.getElementById('summary-subclass').textContent = characterInProgress.subclass ? characterInProgress.subclass.name : '-';
    document.getElementById('summary-background').textContent = characterInProgress.background ? characterInProgress.background.name : '-';
    document.getElementById('summary-background-feat').textContent = characterInProgress.background_feat ? characterInProgress.background_feat.name : '-';
    document.getElementById('summary-equipment').textContent = characterInProgress.chosen_equipment_set ? characterInProgress.chosen_equipment_set.join(', ') : '-';

    if (Object.keys(characterInProgress.base_ability_scores).length > 0) {
        abilities.forEach(ability => {
            const score = characterInProgress.base_ability_scores[ability] || defaultScore; // Use defaultScore if somehow not set
            const modifier = Math.floor((score - 10) / 2);
            const abilityAbbreviation = ability.substring(0, 3).toUpperCase();
            const summarySpan = document.getElementById(`summary-${abilityAbbreviation}`);
            if (summarySpan) {
                summarySpan.textContent = `${score} (${modifier >= 0 ? '+' : ''}${modifier})`;
            }
        });
    } else {
        // If base_ability_scores is empty, display '-' for all
        abilities.forEach(ability => {
            const abilityAbbreviation = ability.substring(0, 3).toUpperCase();
            const summarySpan = document.getElementById(`summary-${abilityAbbreviation}`);
            if (summarySpan) {
                summarySpan.textContent = '-';
            }
        });
    }
}

window.getCharacterData = function() {
    // Potentially add more logic here to finalize or validate characterInProgress before returning
    // For example, calculating final ability scores including racial bonuses, etc.
    // For now, just returns the current state.
    // It's important that characterInProgress is accurately updated by all selection functions.
    return characterInProgress;
};

window.addEventListener('DOMContentLoaded', initializeCreator);
