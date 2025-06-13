// Character Creator JavaScript
console.log("Character Creator JS loaded");

let characterInProgress = {
    name: "", // Added for character name
    race: null,
    class: null,
    subclass: null,
    background: null,
    background_feat: null,
    chosen_equipment_set: null,
    base_ability_scores: {},
    final_ability_scores: {},
    chosen_class_skills: [], // Added for class skill proficiencies
    chosen_cantrips: [],       // Added for cantrips
    chosen_level_1_spells: [], // Added for level 1 spells
    is_finalized: false,       // Added for finalize state
    // other character attributes
};

// --- Placeholder Spell Data & Limits ---
const PLACEHOLDER_CANTRIPS = [
    { name: "Placeholder Cantrip 1", description: "A generic cantrip." },
    { name: "Placeholder Cantrip 2", description: "Another generic cantrip." },
    { name: "Placeholder Cantrip 3", description: "Yet another." }
];
const PLACEHOLDER_LEVEL_1_SPELLS = [
    { name: "Placeholder L1 Spell A", description: "A generic L1 spell." },
    { name: "Placeholder L1 Spell B", description: "Another generic L1 spell." },
    { name: "Placeholder L1 Spell C", description: "Yet another L1 spell." }
];
const DEFAULT_CANTRIPS_TO_CHOOSE = 2;
const DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE = 2;

// Local race data used when not fetching from an API
const LOCAL_RACES = [
    {
        name: "Human",
        description: "Resourceful and adaptable, humans are found throughout the multiverse.",
        racial_traits: [
            "Resourceful (Extra Skill Prof)",
            "Skillful (Extra Tool Prof or Language)",
            "Versatile (Extra Feat at L1 - often assumed to be Tough or Skilled)"
        ],
        speed: 30,
        languages: ["Common", "Choose one extra"],
        size: "Medium"
    },
    {
        name: "Elf",
        description: "Graceful and perceptive, with a long lifespan and deep connection to magic or nature.",
        racial_traits: [
            "Darkvision",
            "Fey Ancestry (Adv. on saves vs. Charmed)",
            "Keen Senses (Prof. in Perception)",
            "Trance (Meditate 4 hrs for long rest benefit)"
        ],
        speed: 30,
        languages: ["Common", "Elvish"],
        size: "Medium"
    },
    {
        name: "Dwarf",
        description: "Resilient and steadfast, known for their craftsmanship and endurance.",
        racial_traits: [
            "Darkvision",
            "Dwarven Resilience (Adv. on saves vs. Poison, resistance to Poison dmg)",
            "Dwarven Toughness (+1 HP/level)",
            "Stonecunning (Bonus to History checks related to stonework)"
        ],
        speed: 25,
        languages: ["Common", "Dwarvish"],
        size: "Medium"
    },
    {
        name: "Halfling",
        description: "Optimistic and cheerful, known for their luck and ability to avoid danger.",
        racial_traits: [
            "Brave (Adv. on saves vs. Frightened)",
            "Halfling Nimbleness (Move through space of larger creature)",
            "Lucky (Reroll 1s on attack, ability, saving throws)"
        ],
        speed: 25,
        languages: ["Common", "Halfling"],
        size: "Small"
    },
    {
        name: "Dragonborn",
        description: "Proud and honorable, with draconic ancestry.",
        racial_traits: [
            "Draconic Ancestry (Choose dragon type for damage resistance and breath weapon)",
            "Breath Weapon (Action, damage type and save based on ancestry)",
            "Damage Resistance (Type based on ancestry)"
        ],
        speed: 30,
        languages: ["Common", "Draconic"],
        size: "Medium"
    },
    {
        name: "Gnome",
        description: "Curious and inventive, with a natural talent for illusion or engineering.",
        racial_traits: [
            "Darkvision",
            "Gnome Cunning (Adv. on Int, Wis, Cha saves vs. magic)"
        ],
        speed: 25,
        languages: ["Common", "Gnomish"],
        size: "Small"
    },
    {
        name: "Tiefling",
        description: "Descended from fiends, bearing physical marks of their infernal heritage.",
        racial_traits: [
            "Darkvision",
            "Hellish Resistance (Fire resistance)",
            "Infernal Legacy (Thaumaturgy cantrip, Hellish Rebuke at L3, Darkness at L5)"
        ],
        speed: 30,
        languages: ["Common", "Infernal"],
        size: "Medium"
    },
    {
        name: "Orc",
        description: "Strong and fierce, often finding their place through might and determination.",
        racial_traits: [
            "Darkvision",
            "Adrenaline Rush (Bonus action dash, temp HP)",
            "Powerful Build (Count as one size larger for carry capacity)"
        ],
        speed: 30,
        languages: ["Common", "Orc"],
        size: "Medium"
    },
    {
        name: "Ardling",
        description: "Celestial-touched beings with animalistic features and divine power.",
        racial_traits: [
            "Celestial Legacy (Choose one: Exalted, Idyllic, or Heavenly)",
            "Divine Wings (Flight at L5, limited use)",
            "Animalistic Head (Varies, e.g., eagle, lion, bear)"
        ],
        speed: 30,
        languages: ["Common", "Celestial"],
        size: "Medium"
    },
    {
        name: "Goliath",
        description: "Towering folk from mountainous regions, known for their strength and athleticism.",
        racial_traits: [
            "Giant Ancestry (Prof. Athletics)",
            "Little Giant (Adv. on Str saves and checks)",
            "Mountain Born (Cold resistance, acclimatized to high altitude)"
        ],
        speed: 30,
        languages: ["Common", "Giant"],
        size: "Medium"
    }
];

// Minimal local class data used instead of fetching from an API
const LOCAL_CLASSES = [
    {
        name: "Fighter",
        description: "A master of martial combat, skilled with a variety of weapons and armor.",
        hit_die: 10,
        saving_throw_proficiencies: ["Strength", "Constitution"],
        armor_proficiencies: ["Light armor", "Medium armor", "Heavy armor", "Shields"],
        weapon_proficiencies: ["Simple weapons", "Martial weapons"],
        skill_proficiency_options: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
        skill_proficiency_count: 2,
        starting_equipment_options: [
            {"Option A": ["Chain Mail", "Longsword", "Shield", "Dungeoneer's Pack"]},
            {"Option B": ["Leather Armor", "Rapier", "Longbow", "Explorer's Pack"]}
        ],
        subclasses: [
            { name: "Champion", description: "Focuses on raw physical power.", features: {"1": [{name: "Improved Critical", description: "Your weapon attacks score a critical hit on a roll of 19 or 20."}]}}
        ]
    },
    {
        name: "Wizard",
        description: "A scholarly magic-user capable of manipulating the structures of reality.",
        hit_die: 6,
        saving_throw_proficiencies: ["Intelligence", "Wisdom"],
        armor_proficiencies: [],
        weapon_proficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
        skill_proficiency_options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
        skill_proficiency_count: 2,
        starting_equipment_options: [
            {"Option A": ["Quarterstaff", "Component pouch", "Spellbook"]},
            {"Option B": ["Dagger", "Arcane focus", "Spellbook"]}
        ],
        subclasses: [
            { name: "School of Evocation", description: "Harness the elements for powerful spells.", features: {"1": []}}
        ]
    }
];

const API_BASE_URL = window.location.origin + '/api';
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

// --- Race Selection ---
async function displayRaces() {
    const raceSelect = document.getElementById('race-select');
    const raceDetailsContainer = document.getElementById('race-details');

    if (!raceSelect || !raceDetailsContainer) {
        console.error("Race selection HTML elements not found.");
        return;
    }

    try {
        const raceArray = LOCAL_RACES;

        raceSelect.innerHTML = '<option value="">-- Choose Race --</option>';
        raceDetailsContainer.innerHTML = '<p>Select a race to see its details.</p>';

        raceArray.forEach((race, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = race.name;
            raceSelect.appendChild(option);
        });

        raceSelect.onchange = () => {
            const idx = raceSelect.value;
            if (idx === '') return;
            selectRace(raceArray[idx]);
        };

    } catch (error) {
        console.error("Error loading races:", error);
        raceSelect.innerHTML = '<option>Could not load races</option>';
    }
}

function selectRace(raceData, selectedElement = null, container = null) {
    characterInProgress.race = raceData;
    console.log("Selected Race:", characterInProgress.race);
    // updateCharacterSummary(); // Will be called by applyRacialASIs
    applyRacialASIs();

    // Update details display
    const raceDetailsContainer = document.getElementById('race-details');
    if (raceDetailsContainer) {
        let detailsHtml = `<h3>${raceData.name}</h3>`;
        // Assuming 'description' and 'racial_traits' are fields in your race data.
        // Adjust if your data structure is different.
        if (raceData.description) {
            detailsHtml += `<p>${raceData.description}</p>`;
        }
        if (raceData.fixed_ability_bonuses && Object.keys(raceData.fixed_ability_bonuses).length > 0) {
            const bonuses = Object.entries(raceData.fixed_ability_bonuses)
                .map(([ability, bonus]) => `${ability} +${bonus}`)
                .join(', ');
            detailsHtml += `<p><strong>Ability Score Increase:</strong> ${bonuses}</p>`;
        }
        if (raceData.size) {
            detailsHtml += `<p><strong>Size:</strong> ${raceData.size}</p>`;
        }
        if (raceData.speed) {
            detailsHtml += `<p><strong>Speed:</strong> ${raceData.speed} ft.</p>`;
        }
        if (raceData.racial_traits && raceData.racial_traits.length > 0) {
            detailsHtml += `<h4>Traits:</h4><ul>`;
            raceData.racial_traits.forEach(trait => {
                detailsHtml += `<li>${trait}</li>`;
            });
            detailsHtml += `</ul>`;
        }
        // Add more fields as necessary, e.g., languages, proficiencies.
        // This depends on the exact structure of your race data.
        // For example, if racial_traits is a list of objects:
        // if (raceData.racial_traits && raceData.racial_traits.length > 0) {
        //     detailsHtml += `<p><strong>Racial Traits:</strong></p><ul>`;
        //     raceData.racial_traits.forEach(trait => {
        //         detailsHtml += `<li>${trait.name}: ${trait.description}</li>`;
        //     });
        //     detailsHtml += `</ul>`;
        // }
        raceDetailsContainer.innerHTML = detailsHtml;
    }

    // Update visual selection if buttons are used
    if (container && selectedElement) {
        const allItems = container.querySelectorAll('.selectable-item');
        allItems.forEach(item => item.classList.remove('selected'));
        selectedElement.classList.add('selected');
    }

    // For now, after selecting a race, show the class selection area
    // This is a simplified progression logic.
    const classSelectionArea = document.getElementById('class-selection-area');
    if (classSelectionArea) {
        classSelectionArea.style.display = 'block'; // Make it visible
    }
    // document.getElementById('race-selection-area').style.display = 'none'; // Optionally hide race section
    displayClasses(); // Load classes once a race is selected
}

// --- Class Skill Choice Visuals Update ---
function updateSkillChoiceVisuals() {
    const classData = characterInProgress.class;
    if (!classData || !classData.skill_proficiency_options || !classData.skill_proficiency_count) {
        // No skill choices for this class or data missing, so nothing to update visually in terms of limits.
        // Ensure all checkboxes are enabled if they exist from a previous selection for a different class.
        const skillCheckboxes = document.querySelectorAll('#class-skill-choices-container input[type="checkbox"]');
        skillCheckboxes.forEach(checkbox => checkbox.disabled = false);
        return;
    }

    const chosenCount = characterInProgress.chosen_class_skills.length;
    const limit = classData.skill_proficiency_count;
    const skillCheckboxes = document.querySelectorAll('#class-skill-choices-container input[type="checkbox"]');

    skillCheckboxes.forEach(checkbox => {
        if (chosenCount >= limit && !checkbox.checked) {
            checkbox.disabled = true;
        } else {
            checkbox.disabled = false;
        }
    });
}

// --- Spell Choice Visuals Update ---
function updateSpellChoiceVisuals(spellType, limit) {
    const listId = spellType === 'cantrips' ? 'cantrips-list' : 'level-1-spells-list';
    const chosenSpells = spellType === 'cantrips' ? characterInProgress.chosen_cantrips : characterInProgress.chosen_level_1_spells;

    const spellCheckboxes = document.querySelectorAll(`#${listId} input[type="checkbox"]`);
    const chosenCount = chosenSpells.length;

    spellCheckboxes.forEach(checkbox => {
        if (chosenCount >= limit && !checkbox.checked) {
            checkbox.disabled = true;
        } else {
            checkbox.disabled = false;
        }
    });
}

// --- Display Spell Options ---
function displaySpellOptions(classData) {
    const cantripsListContainer = document.getElementById('cantrips-list');
    const level1SpellsListContainer = document.getElementById('level-1-spells-list');

    if (!cantripsListContainer || !level1SpellsListContainer) {
        console.error("Spell list containers not found.");
        return;
    }

    cantripsListContainer.innerHTML = ''; // Clear previous cantrips
    level1SpellsListContainer.innerHTML = ''; // Clear previous L1 spells

    // TODO: Replace placeholder data with API call: GET /api/spells?class=${classData.name}&level=0 (for cantrips)
    // TODO: Replace hardcoded DEFAULT_CANTRIPS_TO_CHOOSE with actual data from classData (e.g., classData.cantrips_known)
    PLACEHOLDER_CANTRIPS.forEach(spell => {
        const checkboxId = `spell-cantrip-${spell.name.toLowerCase().replace(/\s+/g, '-')}`;
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('spell-choice');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = spell.name; // Store name, could store stringified object if needed
        checkbox.name = 'cantrip_choice';

        checkbox.addEventListener('change', (event) => {
            const currentSpellName = event.target.value;
            // Find the spell object from placeholder data (or future API data)
            const spellObject = PLACEHOLDER_CANTRIPS.find(s => s.name === currentSpellName);

            if (event.target.checked) {
                if (characterInProgress.chosen_cantrips.length < DEFAULT_CANTRIPS_TO_CHOOSE) {
                    characterInProgress.chosen_cantrips.push(spellObject);
                } else {
                    event.target.checked = false;
                    console.warn(`Cannot select more than ${DEFAULT_CANTRIPS_TO_CHOOSE} cantrips.`);
                }
            } else {
                characterInProgress.chosen_cantrips = characterInProgress.chosen_cantrips.filter(s => s.name !== currentSpellName);
            }
            updateSpellChoiceVisuals('cantrips', DEFAULT_CANTRIPS_TO_CHOOSE);
            updateCharacterSummary();
        });

        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = `${spell.name} (${spell.description})`; // Show description too

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        cantripsListContainer.appendChild(checkboxDiv);
    });

    // TODO: Replace placeholder data with API call: GET /api/spells?class=${classData.name}&level=1 (for L1 spells)
    // TODO: Replace hardcoded DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE with actual data from classData (e.g., classData.spells_known)
    PLACEHOLDER_LEVEL_1_SPELLS.forEach(spell => {
        const checkboxId = `spell-l1-${spell.name.toLowerCase().replace(/\s+/g, '-')}`;
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('spell-choice');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = spell.name;
        checkbox.name = 'level_1_spell_choice';

        checkbox.addEventListener('change', (event) => {
            const currentSpellName = event.target.value;
            const spellObject = PLACEHOLDER_LEVEL_1_SPELLS.find(s => s.name === currentSpellName);

            if (event.target.checked) {
                if (characterInProgress.chosen_level_1_spells.length < DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE) {
                    characterInProgress.chosen_level_1_spells.push(spellObject);
                } else {
                    event.target.checked = false;
                    console.warn(`Cannot select more than ${DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE} level 1 spells.`);
                }
            } else {
                characterInProgress.chosen_level_1_spells = characterInProgress.chosen_level_1_spells.filter(s => s.name !== currentSpellName);
            }
            updateSpellChoiceVisuals('level-1-spells', DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE);
            updateCharacterSummary();
        });

        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = `${spell.name} (${spell.description})`;

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        level1SpellsListContainer.appendChild(checkboxDiv);
    });

    updateSpellChoiceVisuals('cantrips', DEFAULT_CANTRIPS_TO_CHOOSE);
    updateSpellChoiceVisuals('level-1-spells', DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE);
}

// --- Class Selection ---
async function displayClasses() {
    const classSelect = document.getElementById('class-select');
    const classDetailsContainer = document.getElementById('class-details');

    if (!classSelect || !classDetailsContainer) {
        console.error("Class selection HTML elements not found.");
        return;
    }

    try {
        const classArray = LOCAL_CLASSES;

        classSelect.innerHTML = '<option value="">-- Choose Class --</option>';
        classDetailsContainer.innerHTML = '<p>Select a class to see its details.</p>';

        classArray.forEach((cls, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });

        classSelect.onchange = () => {
            const idx = classSelect.value;
            if (idx === '') return;
            selectClass(classArray[idx]);
        };

    } catch (error) {
        console.error("Error loading classes:", error);
        classSelect.innerHTML = '<option>Could not load classes</option>';
    }
}

function selectClass(classData, selectedElement = null, container = null) {
    characterInProgress.class = classData;
    characterInProgress.subclass = null; // Reset subclass when class changes
    characterInProgress.chosen_class_skills = []; // Reset chosen class skills
    characterInProgress.chosen_cantrips = []; // Reset cantrips
    characterInProgress.chosen_level_1_spells = []; // Reset L1 spells
    console.log("Selected Class:", characterInProgress.class);

    const spellSelectionArea = document.getElementById('spell-selection-area');
    const cantripsListContainer = document.getElementById('cantrips-list');
    const level1SpellsListContainer = document.getElementById('level-1-spells-list');

    // Basic spellcaster check (e.g., by name or a flag in classData if available)
    // For now, let's assume Wizard and Sorcerer are spellcasters.
    // TODO: Replace with a more robust check, e.g., classData.spellcasting_ability or similar.
    const isSpellcaster = classData.name === "Wizard" || classData.name === "Sorcerer";

    if (isSpellcaster) {
        if (spellSelectionArea) spellSelectionArea.style.display = 'block';
        document.getElementById('cantrips-to-choose-count').textContent = DEFAULT_CANTRIPS_TO_CHOOSE;
        document.getElementById('level-1-spells-to-choose-count').textContent = DEFAULT_LEVEL_1_SPELLS_TO_CHOOSE;
        displaySpellOptions(classData);
    } else {
        if (spellSelectionArea) spellSelectionArea.style.display = 'none';
        if (cantripsListContainer) cantripsListContainer.innerHTML = ''; // Clear spell options
        if (level1SpellsListContainer) level1SpellsListContainer.innerHTML = '';
    }

    const classSkillChoicesContainer = document.getElementById('class-skill-choices-container');
    if (classSkillChoicesContainer) {
        classSkillChoicesContainer.innerHTML = ''; // Clear previous skill choices
    }

    const classDetailsContainer = document.getElementById('class-details');
    if (classDetailsContainer) {
        let detailsHtml = `<h3>${classData.name}</h3>`;
        if (classData.description) {
            detailsHtml += `<p>${classData.description}</p>`;
        }
        detailsHtml += `<p><strong>Hit Die:</strong> d${classData.hit_die}</p>`;

        if (classData.saving_throw_proficiencies && classData.saving_throw_proficiencies.length > 0) {
            detailsHtml += `<p><strong>Saving Throws:</strong> ${classData.saving_throw_proficiencies.join(', ')}</p>`;
        }
        if (classData.armor_proficiencies && classData.armor_proficiencies.length > 0) {
            detailsHtml += `<p><strong>Armor Proficiencies:</strong> ${classData.armor_proficiencies.join(', ')}</p>`;
        }
        if (classData.weapon_proficiencies && classData.weapon_proficiencies.length > 0) {
            detailsHtml += `<p><strong>Weapon Proficiencies:</strong> ${classData.weapon_proficiencies.join(', ')}</p>`;
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
        // Additional feature details could be shown here
        // The main details like description, hit die, etc., are set first.
        if (classDetailsContainer) classDetailsContainer.innerHTML = detailsHtml; // This line is correct and should be kept.


        // Now, specifically handle skill proficiency choices UI
        if (classData.skill_proficiency_options && classData.skill_proficiency_count > 0 && classSkillChoicesContainer) {
            const title = document.createElement('h4');
            title.textContent = `Choose ${classData.skill_proficiency_count} Skill Proficiencies:`;
            classSkillChoicesContainer.appendChild(title);

            classData.skill_proficiency_options.forEach(skillName => {
                const checkboxId = `skill-${skillName.toLowerCase().replace(/\s+/g, '-')}`;
                const checkboxDiv = document.createElement('div'); // Corrected variable name
                checkboxDiv.classList.add('skill-choice');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = checkboxId;
                checkbox.value = skillName;
                checkbox.name = 'class_skill_choice';

                checkbox.addEventListener('change', (event) => {
                    const currentSkill = event.target.value;
                    if (event.target.checked) {
                        if (characterInProgress.chosen_class_skills.length < classData.skill_proficiency_count) {
                            characterInProgress.chosen_class_skills.push(currentSkill);
                        } else {
                            // Limit reached, uncheck the box or prevent checking
                            event.target.checked = false;
                            // Optionally, provide user feedback (e.g., alert or message)
                            console.warn(`Cannot select more than ${classData.skill_proficiency_count} skills.`);
                        }
                    } else {
                        characterInProgress.chosen_class_skills = characterInProgress.chosen_class_skills.filter(s => s !== currentSkill);
                    }
                    updateSkillChoiceVisuals();
                    updateCharacterSummary();
                });

                const label = document.createElement('label');
                label.htmlFor = checkboxId;
                label.textContent = skillName;

                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                classSkillChoicesContainer.appendChild(checkboxDiv);
            });
            updateSkillChoiceVisuals(); // Initial call to set checkbox states
        }
    }
    // The redundant classDetailsContainer.innerHTML = detailsHtml was here and is now removed.

    if (container && selectedElement) {
        const allItems = container.querySelectorAll('.selectable-item');
        allItems.forEach(item => item.classList.remove('selected'));
        selectedElement.classList.add('selected');
    }

    // Handle subclasses
    const subclassSelectionArea = document.getElementById('subclass-selection-area');
    const subclassContainer = document.getElementById('subclass-list-container');
    const subclassDetailsContainer = document.getElementById('subclass-details');

    // Reset subclass state
    characterInProgress.subclass = null;
    if (subclassContainer) subclassContainer.innerHTML = '';
    if (subclassDetailsContainer) subclassDetailsContainer.innerHTML = '<p>Select a subclass to see its details, if applicable for your class at level 1.</p>';

    let level1Subclasses = [];
    if (classData.subclasses && classData.subclasses.length > 0) {
        classData.subclasses.forEach(subclass => {
            // Check if features exist and there's an entry for level '1' or 1
            if (subclass.features && (subclass.features['1'] || subclass.features[1])) {
                level1Subclasses.push(subclass);
            }
        });
    }

    const abilityScoreArea = document.getElementById('ability-score-area');

    if (level1Subclasses.length > 0) {
        if (subclassSelectionArea) subclassSelectionArea.style.display = 'block';
        displaySubclassOptions(level1Subclasses);
        if (abilityScoreArea) abilityScoreArea.style.display = 'none'; // Hide ability scores until subclass is chosen
    } else {
        if (subclassSelectionArea) subclassSelectionArea.style.display = 'none';
        if (abilityScoreArea) {
            abilityScoreArea.style.display = 'block';
        }
        initializeAbilityScores();
        displayAbilityScores();
        validateScoresOnBackend(); // This chain should eventually call updateCharacterSummary
    }

    // Make sure updateCharacterSummary is called after everything is processed for the class.
    // If not proceeding to ability scores immediately (because subclass is shown),
    // then updateCharacterSummary needs to be called here. Otherwise, it's called by ability score functions.
    if (level1Subclasses.length === 0) {
      // updateCharacterSummary is called within the ability score initialization path
    } else {
        updateCharacterSummary(); // Call if ability scores are deferred
    }

    // The old logic for specifically Sorcerer/Warlock hiding ability scores is now covered by the general level1Subclasses check.
    // The old logic for showing ability scores if NOT Sorc/Warlock is also covered.

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
    // Apply racial ASIs after base scores are first initialized and displayed
    applyRacialASIs();
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
    displayAbilityScores(); // Update all UI elements for base scores
    applyRacialASIs();      // Re-calculate final scores and update summary
    validateScoresOnBackend();
}

// --- Apply Racial ASIs ---
function applyRacialASIs() {
    // Initialize final_ability_scores as a deep copy of base_ability_scores or defaults
    if (Object.keys(characterInProgress.base_ability_scores).length > 0) {
        // Deep copy base scores to final scores
        characterInProgress.final_ability_scores = JSON.parse(JSON.stringify(characterInProgress.base_ability_scores));
    } else {
        // If base scores aren't set (e.g. race selected before point buy visited),
        // initialize final_ability_scores with default scores for each ability.
        characterInProgress.final_ability_scores = {};
        abilities.forEach(ability => {
            characterInProgress.final_ability_scores[ability] = defaultScore;
        });
    }

    if (characterInProgress.race && characterInProgress.race.fixed_ability_bonuses) {
        for (const abilityKey in characterInProgress.race.fixed_ability_bonuses) {
            // Ensure the abilityKey from bonuses matches the case used in final_ability_scores (e.g., "Strength")
            const bonusValue = characterInProgress.race.fixed_ability_bonuses[abilityKey];
            if (characterInProgress.final_ability_scores.hasOwnProperty(abilityKey)) {
                characterInProgress.final_ability_scores[abilityKey] += bonusValue;
            } else {
                // This might happen if ability names in fixed_ability_bonuses don't match "Strength", "Dexterity", etc.
                console.warn(`Ability "${abilityKey}" from racial bonus not found in character's final scores. Check data consistency.`);
            }
        }
    }
    console.log("Final ability scores after racial ASI:", characterInProgress.final_ability_scores);
    updateCharacterSummary(); // Update summary after ASIs are applied
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
    if (backgroundData.language_count && backgroundData.language_count > 0) {
        if (backgroundData.languages_options && backgroundData.languages_options.length > 0) {
            detailsHtml += `<p><strong>Languages:</strong> Choose ${backgroundData.language_count} from ${backgroundData.languages_options.join(', ')}</p>`;
        } else {
            detailsHtml += `<p><strong>Languages:</strong> Choose ${backgroundData.language_count}</p>`;
        }
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

    const finalizeSection = document.getElementById('finalize-section');
    if (finalizeSection) {
        finalizeSection.style.display = 'block';
    }
}


// --- Initialization ---
async function initializeCreator() {
    console.log("Initializing character creator...");
    await displayRaces(); // Wait for races to load first, or run in parallel

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
    // displayClasses(); // Called after race selection
    // initializeAbilityScores(); // Called after class/subclass selection
    // fetchAndDisplayBackgrounds(); // Called after ability scores are validated
    initializeNameInput(); // Added for character name
    updateCharacterSummary(); // Initial summary display

    const finalizeButton = document.getElementById('finalize-character-button');
    if (finalizeButton) {
        finalizeButton.addEventListener('click', handleFinalizeCharacter);
    } else {
        console.error("Finalize character button not found.");
    }
}

// --- Handle Finalize Character ---
async function handleFinalizeCharacter() { // Made async to use await for fetch
    const messageElement = document.getElementById('finalize-message');
    const finalizeButton = document.getElementById('finalize-character-button');

    messageElement.textContent = ''; // Clear previous messages
    messageElement.style.color = 'inherit'; // Reset color

    // Validation checks
    if (!characterInProgress.name) {
        messageElement.textContent = "Please enter a character name.";
        messageElement.style.color = 'orange';
        return;
    }
    if (!characterInProgress.race) {
        messageElement.textContent = "Please select a race.";
        messageElement.style.color = 'orange';
        return;
    }
    if (!characterInProgress.class) {
        messageElement.textContent = "Please select a class.";
        messageElement.style.color = 'orange';
        return;
    }

    const pointBuySummaryEl = document.getElementById('point-buy-summary');
    if (pointBuySummaryEl && pointBuySummaryEl.classList.contains('invalid')) {
        messageElement.textContent = "Please ensure ability scores are valid (Point Buy rules).";
        messageElement.style.color = 'orange';
        return;
    }
    // Add more validation as needed (e.g., skills, spells if limits are known and required)

    // Disable button before async operation
    if (finalizeButton) {
        finalizeButton.disabled = true;
    }
    messageElement.textContent = "Finalizing character and starting game...";
    messageElement.style.color = 'lightblue';


    // If all checks pass
    characterInProgress.is_finalized = true; // Mark as finalized
    // Ensure final ability scores are up-to-date before sending
    applyRacialASIs(); // This also calls updateCharacterSummary which might be redundant if we navigate away

    console.log("Character Data to be sent:", JSON.stringify(characterInProgress, null, 2));

    try {
        const response = await fetch('/api/game/initialize_with_character', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characterInProgress),
        });

        const result = await response.json(); // Try to parse JSON regardless of response.ok

        if (response.ok && result.success) {
            messageElement.textContent = "Character saved! Starting game...";
            messageElement.style.color = 'lightgreen';
            console.log("Game initialized successfully with character:", result.game_state);
            // Redirect to the main game page
            window.location.href = '/game';
        } else {
            // Handle backend error or validation failure
            const errorDetail = result.message || (result.error ? `${result.error} - ${result.details || ''}` : 'Unknown error from server.');
            messageElement.textContent = `Failed to initialize game: ${errorDetail}. Please try again.`;
            messageElement.style.color = 'red';
            console.error("Failed to initialize game with character:", result);
            if (finalizeButton) {
                finalizeButton.disabled = false; // Re-enable button on failure
            }
        }
    } catch (error) {
        // Handle network error or other fetch-related issues
        console.error("Error during fetch to initialize_with_character:", error);
        messageElement.textContent = "Error communicating with server. Please check your connection and try again.";
        messageElement.style.color = 'red';
        if (finalizeButton) {
            finalizeButton.disabled = false; // Re-enable button on failure
        }
    }
}

// --- Name Input ---
function initializeNameInput() {
    const nameInput = document.getElementById('character-name-input');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            characterInProgress.name = nameInput.value;
            updateCharacterSummary();
        });
    } else {
        console.error("Character name input element not found.");
    }
}

// --- Character Summary Panel ---
function updateCharacterSummary() {
    document.getElementById('summary-name').textContent = characterInProgress.name || '-'; // Added for character name
    document.getElementById('summary-race').textContent = characterInProgress.race ? characterInProgress.race.name : '-';
    document.getElementById('summary-class').textContent = characterInProgress.class ? characterInProgress.class.name : '-';
    document.getElementById('summary-subclass').textContent = characterInProgress.subclass ? characterInProgress.subclass.name : '-';
    document.getElementById('summary-background').textContent = characterInProgress.background ? characterInProgress.background.name : '-';
    document.getElementById('summary-background-feat').textContent = characterInProgress.background_feat ? characterInProgress.background_feat.name : '-';
    document.getElementById('summary-class-skills').textContent = characterInProgress.chosen_class_skills.length > 0 ? characterInProgress.chosen_class_skills.join(', ') : '-'; // Added for class skills
    document.getElementById('summary-equipment').textContent = characterInProgress.chosen_equipment_set ? characterInProgress.chosen_equipment_set.join(', ') : '-';
    document.getElementById('summary-cantrips').textContent = characterInProgress.chosen_cantrips.length > 0 ? characterInProgress.chosen_cantrips.map(s => s.name).join(', ') : '-';
    document.getElementById('summary-level-1-spells').textContent = characterInProgress.chosen_level_1_spells.length > 0 ? characterInProgress.chosen_level_1_spells.map(s => s.name).join(', ') : '-';

    // Display final ability scores in summary
    if (Object.keys(characterInProgress.final_ability_scores).length > 0) {
        abilities.forEach(ability => {
            const score = characterInProgress.final_ability_scores[ability]; // Already includes racial bonus
            const modifier = Math.floor((score - 10) / 2);
            const abilityAbbreviation = ability.substring(0, 3).toUpperCase(); // e.g., "STR"
            const summarySpan = document.getElementById(`summary-${abilityAbbreviation}`);
            if (summarySpan) {
                summarySpan.textContent = `${score} (${modifier >= 0 ? '+' : ''}${modifier})`;
            }
        });
    } else if (Object.keys(characterInProgress.base_ability_scores).length > 0) {
        // Fallback: if final_ability_scores is empty for some reason (e.g. before race selected), show base_ability_scores
        abilities.forEach(ability => {
            const score = characterInProgress.base_ability_scores[ability] || defaultScore;
            const modifier = Math.floor((score - 10) / 2);
            const abilityAbbreviation = ability.substring(0, 3).toUpperCase();
            const summarySpan = document.getElementById(`summary-${abilityAbbreviation}`);
            if (summarySpan) {
                summarySpan.textContent = `${score} (${modifier >= 0 ? '+' : ''}${modifier}) (base)`;
            }
        });
    } else {
        // If no scores are set at all yet
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

// --- Finish & Cancel Handlers for Standalone Creator ---
window.finishCharacterCreation = function() {
    handleFinalizeCharacter();
    const overlay = document.getElementById('character-creator-overlay');
    const host = overlay ? overlay.querySelector('div') : null;
    if (overlay) overlay.classList.add('hidden');
    if (host) host.innerHTML = '';
};

window.cancelCharacterCreation = function() {
    const overlay = document.getElementById('character-creator-overlay');
    const host = overlay ? overlay.querySelector('div') : null;
    if (overlay) overlay.classList.add('hidden');
    if (host) host.innerHTML = '';
    if (!overlay) {
        // Standalone page fallback
        window.location.reload();
    }
};

window.addEventListener('DOMContentLoaded', initializeCreator);
