# D&D Character Creator: System Setup Overview

This document outlines the architecture of the Dungeons & Dragons character creator, detailing how its main Python components are structured and how they interact to bring a character to life.

## 1. Core Game Data: `dnd_data_structures.py`

The `dnd_data_structures.py` file serves as the foundational module for defining and managing all core game data within the Dungeons & Dragons character creator. Its primary purpose is to establish the schema for various game entities and provide a centralized mechanism for loading and accessing this data.

The file leverages Python's `@dataclass` decorator to create simple yet structured representations for key game elements:

*   `AbilityScoreInfo`: Defines the rules and limits for ability scores, such as the maximum value an ability score can have and the point-buy cost for different score levels.
*   `FeatData`: Represents a single feat, encapsulating its name, description, prerequisites (if any), and the effects it grants to a character.
*   `BackgroundData`: Stores information about character backgrounds, including the background's name, the skill proficiencies it grants, any tool proficiencies or languages, and starting equipment.
*   `SubclassData`: Defines the specific features and modifications a subclass provides to its parent class, including its name, a description of its unique aspects, and any additional abilities or proficiencies gained at different levels.
*   `ClassData`: Represents a character class (e.g., Fighter, Wizard). It holds the class name, hit die type, saving throw proficiencies, armor and weapon proficiencies, skill choices, and a list of its available subclasses (`SubclassData`).
*   `SpeciesData`: Contains details for character species (e.g., Elf, Dwarf). This includes the species name, ability score increases, size, speed, and any special traits or features inherent to that species.

At the heart of data management is the `DataManagementModule` class. This class is responsible for the comprehensive loading of all game data. It initializes and populates collections of `FeatData`, `ClassData`, `SpeciesData`, `BackgroundData`, and `AbilityScoreInfo`. It then provides various getter methods (e.g., `get_class(name)`, `get_all_species()`, `get_feat(name)`, `get_background(name)`) that allow other parts of the character creator to easily retrieve specific pieces of game data or lists of available options.

A key characteristic of this module is that the actual game data – the specific details for each class like "Fighter" or "Wizard", each species like "Human" or "Dragonborn", every feat, and all background options – is currently hardcoded directly within the `DataManagementModule`'s private loading methods (e.g., `_load_classes()`, `_load_species()`, `_load_feats()`, `_load_backgrounds()`). This means that to add new game elements or modify existing ones, this Python file itself needs to be edited.

## 2. Character State and Game Logic: `dnd_character_logic.py`

The `dnd_character_logic.py` file is central to the Dungeons & Dragons character creator, focusing on defining the character's evolving state and implementing the core game rules and logic. It acts as the bridge between the raw game data and the character being built.

A key component of this file is the `CharacterState` dataclass. This dataclass serves as a comprehensive container for all aspects of the character's current build. It dynamically stores the user's selections and derived statistics, including:

*   Chosen species (`SpeciesData`)
*   Selected class (`ClassData`) and subclass (`SubclassData`)
*   Chosen background (`BackgroundData`)
*   Base ability scores (before any modifications)
*   Skill, saving throw, weapon, and armor proficiencies
*   Selected feats (`list[FeatData]`)
*   Calculated Hit Points (HP)
*   Calculated Armor Class (AC)
*   Other character-specific details like alignment, languages, and equipment (though some of these might be placeholders or less developed).

The other critical part of this file is the `RulesEngine` class. This class is responsible for implementing the game's mechanics, performing calculations, and validating character choices against D&D rules. Its primary functions include:

*   **Calculating Ability Score Modifiers:** Determining the modifier (e.g., +1, -2) for each ability score based on its value.
*   **Validating Ability Score Assignments:** Ensuring that player-assigned ability scores adhere to game rules, particularly for systems like point buy (e.g., checking total points spent, individual score limits).
*   **Calculating Final Ability Scores:** Computing the final ability scores by incorporating base scores and potentially other modifiers. Currently, this includes applying racial bonuses, although the system might evolve to include other sources of modification (e.g., from feats or class features) more explicitly.
*   It is designed to be extensible for **other rule-based calculations or validations** as the character creator's complexity grows, such as verifying feat prerequisites or class restrictions.

The `RulesEngine` typically operates by taking a `CharacterState` object as input for its methods. It also relies on the game data provided by the `DataManagementModule`. While not always explicitly passed into every method, the `RulesEngine` is initialized with a `DataManagementModule` instance, allowing it to access the necessary data (e.g., species' racial bonuses, class features) to perform its calculations and validations accurately. For instance, when calculating final ability scores, it would use the base scores from `CharacterState` and the racial bonuses from the `SpeciesData` (obtained via `DataManagementModule`) associated with the character's chosen species.

## 3. Interactive Character Creation: `main_character_creator.py`

The `main_character_creator.py` file serves as the primary interactive script that drives the Dungeons & Dragons character creation process. It orchestrates the user's journey from starting with a blank slate to having a character with defined core attributes.

The central function, `create_character()`, meticulously guides the user through a sequence of steps:

1.  **Initialization**: It begins by setting up the necessary components:
    *   An instance of `DataManagementModule` is created to load and provide access to all predefined game data (species, classes, etc.).
    *   A `CharacterState` object is initialized to hold all the character's information as it's being built.
    *   A `RulesEngine` is instantiated, armed with the `DataManagementModule`, to handle game logic and validation.

2.  **Species Selection**: The user is prompted to choose a species for their character.
3.  **Class Selection**: Following species selection, the user selects a class.
4.  **Ability Score Assignment**: The script then moves to assigning ability scores. The primary method implemented is `assign_stats_point_buy`, which allows users to allocate points to their character's abilities according to D&D's point buy rules.
5.  **Subclass Selection**: If the chosen class has subclasses available at 1st level (or the relevant starting level being implemented), the `select_subclass` function is called to allow the user to pick a specialization. This step is conditional based on the class features.

Throughout this process, `main_character_creator.py` demonstrates clear interaction with the other architectural layers:

*   It heavily relies on `DataManagementModule` to fetch and display options to the user, such as retrieving a list of available species, classes, or details about them.
*   As the user makes choices, the `CharacterState` object is progressively updated to reflect these selections (e.g., storing the chosen species, class, and assigned ability scores).
*   The `RulesEngine` is utilized for crucial tasks like validating the legality of point buy ability score distributions and for calculating and displaying final ability scores along with their modifiers.

In the deprecated CLI version, interaction was handled via helper functions
such as `display_options()` and `get_user_choice()` that read from the
terminal.  These functions remain in history but are no longer invoked.

A notable feature for development and testing is the try-except block around the import of the core logic modules (`DataManagementModule`, `CharacterState`, `RulesEngine`). If these primary modules are not found (e.g., during early UI development or for isolated testing of the main script's flow), it attempts to load dummy versions (`DummyDataManagementModule`, `DummyCharacterState`, `DummyRulesEngine`). This fallback mechanism allows the main script to run and test the user interaction flow even without the full backend logic being present or functional.

Upon completion of all steps, the script typically concludes by printing a summary of the created character, showcasing the choices made and key calculated statistics.

Finally, the script uses the standard Python `main()` function and the `if __name__ == "__main__":` block to define the entry point for execution, ensuring that `create_character()` is called when the script is run directly.

## 4. System Architecture Summary: How It All Works Together

The Dungeons & Dragons character creator is built upon these three core Python files, which collaborate in a modular fashion to manage data, logic, and user interaction:

*   **`dnd_data_structures.py` (`DataManagementModule`)**: Lays the groundwork by defining and providing all fundamental game data (classes, species, rules like point-buy costs). It acts as the central repository of "static" game information.

*   **`dnd_character_logic.py` (`CharacterState` & `RulesEngine`)**: Focuses on the dynamic aspects. `CharacterState` holds the evolving character build, while `RulesEngine` applies game mechanics, using data from `DataManagementModule` and `CharacterState` for calculations and validation.

*   **`main_character_creator.py`**: Originally handled an interactive console
    workflow. It now exposes a lightweight `create_character()` helper that
    returns a basic `CharacterState` without prompting the user.

**Flow of Information & Modularity:**

The system is designed with a clear flow of information:

1.  `DataManagementModule` provides the raw game data.
2.  `main_character_creator.py` uses this data to present options to the user.
3.  User choices are captured by `main_character_creator.py` and stored in `CharacterState`.
4.  `RulesEngine` then uses both the raw data from `DataManagementModule` and the current `CharacterState` to apply logic, validate, and calculate results. These results are often displayed back to the user via `main_character_creator.py`.

This separation of concerns—data definition, character state/rules logic, and user interaction/process orchestration—makes the system modular. Each component has a distinct responsibility. The earlier console interface in `main_character_creator.py` has already been removed, so future replacements (such as a GUI) can build directly on the underlying logic and data structures without major restructuring.
