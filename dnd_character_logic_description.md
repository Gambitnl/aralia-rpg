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
