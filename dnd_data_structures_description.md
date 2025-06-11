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
