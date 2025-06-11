The Dungeons & Dragons character creator is built upon three core Python files that work together in a modular fashion to manage data, logic, and user interaction:

1.  **`dnd_data_structures.py`**: This file lays the groundwork by defining and providing access to all fundamental game data. The `DataManagementModule` within it is responsible for loading and serving information about character classes, species, feats, backgrounds, and essential game rules like ability score point-buy costs. It acts as the central repository of "static" game information.

2.  **`dnd_character_logic.py`**: This file focuses on the dynamic aspects of a character and the application of game rules.
    *   The `CharacterState` dataclass holds the character's current build as selections are made by the user (e.g., chosen species, class, ability scores).
    *   The `RulesEngine` class enforces game mechanics. It takes data from `DataManagementModule` (e.g., racial bonuses from a species) and the current `CharacterState` (e.g., base ability scores) to perform calculations (like final ability scores and modifiers) and validate user choices against D&D rules.

3.  **`main_character_creator.py`**: This file is the interactive engine that drives the character creation experience. It orchestrates the overall process:
    *   It fetches displayable options (like lists of available species or classes) from the `DataManagementModule`.
    *   It guides the user through sequential choices via a console interface.
    *   As the user makes selections, it updates the `CharacterState` object.
    *   It employs the `RulesEngine` to validate these choices (e.g., ensuring point-buy ability scores are legal) and to calculate derived statistics for display.

**Flow of Information & Modularity:**

The system is designed with a clear flow of information:

*   `DataManagementModule` provides the raw data.
*   `main_character_creator.py` uses this data to present options to the user.
*   User choices are captured by `main_character_creator.py` and stored in `CharacterState`.
*   `RulesEngine` then uses both the raw data from `DataManagementModule` and the current `CharacterState` to apply logic, validate, and calculate results, which are then often displayed back to the user via `main_character_creator.py`.

This separation of concerns—data definition, character state/rules logic, and user interaction/process orchestration—makes the system modular. Each component has a distinct responsibility, allowing for easier understanding, maintenance, and potential future expansion. For instance, the user interface in `main_character_creator.py` could be swapped out (e.g., for a GUI) with minimal changes to the underlying data and rules logic components. Similarly, new classes, species, or rules could be added to `dnd_data_structures.py` and `dnd_character_logic.py` without necessarily overhauling the user interaction flow.
