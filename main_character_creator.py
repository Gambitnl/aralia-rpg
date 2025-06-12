"""Simplified character creation helper.

The original console-based workflow has been removed. ``create_character`` now
returns a basic ``CharacterState`` using the first available species and class.
"""

from typing import Optional

from dnd_data_structures import DataManagementModule
from dnd_character_logic import CharacterState


def create_character() -> CharacterState:
    """Construct a very basic character without any interactive prompts."""
    data_manager = DataManagementModule()
    character = CharacterState()

    species_list = data_manager.get_all_species()
    if species_list:
        character.species_name = species_list[0].name

    class_list = data_manager.get_all_classes()
    if class_list:
        character.class_name = class_list[0].name

    return character


def main() -> Optional[CharacterState]:  # pragma: no cover - legacy entry point
    return create_character()


if __name__ == "__main__":  # pragma: no cover
    print("This script is no longer interactive.")
