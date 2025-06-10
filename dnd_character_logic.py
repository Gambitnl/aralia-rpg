from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple

# Attempt to import from dnd_data_structures. If this script is run directly for testing,
# this might fail, so handle it for potential local testing scenarios.
try:
    from dnd_data_structures import SpeciesData, ClassData, BackgroundData, FeatData, AbilityScoreInfo, DataManagementModule
except ImportError:
    # This is to allow for potential local testing if dnd_data_structures isn't in the Python path easily.
    # In a proper package structure, this wouldn't be strictly necessary.
    @dataclass
    class FeatData: name: str = ""; description: str = "" # Dummy for local test
    @dataclass
    class AbilityScoreInfo: point_buy_costs: Dict[int, int] = field(default_factory=dict); standard_array: List[int] = field(default_factory=list); max_points_to_spend: int = 27 # Dummy
    class DataManagementModule: # Dummy
        def get_ability_score_info(self) -> Optional[AbilityScoreInfo]:
            # Return a default AbilityScoreInfo for dummy case to allow some testing
            return AbilityScoreInfo(
                point_buy_costs={8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9},
                standard_array=[15,14,13,12,10,8],
                max_points_to_spend=27
            )

@dataclass
class CharacterState:
    name: str = "My Character"
    level: int = 1
    species_name: Optional[str] = None
    class_name: Optional[str] = None
    subclass_name: Optional[str] = None # Will be set later
    background_name: Optional[str] = None

    base_ability_scores: Dict[str, int] = field(default_factory=lambda: {
        "Strength": 8, "Dexterity": 8, "Constitution": 8,
        "Intelligence": 8, "Wisdom": 8, "Charisma": 8
    })

    skill_proficiencies: List[str] = field(default_factory=list)
    tool_proficiencies: List[str] = field(default_factory=list)
    armor_proficiencies: List[str] = field(default_factory=list)
    weapon_proficiencies: List[str] = field(default_factory=list)
    saving_throw_proficiencies: List[str] = field(default_factory=list)

    languages: List[str] = field(default_factory=list)
    feats: List[str] = field(default_factory=list) # Store feat names

    max_hp: int = 0
    current_hp: int = 0
    armor_class: int = 10
    initiative_bonus: int = 0
    proficiency_bonus: int = 2 # Starts at +2 for level 1

    def update_base_ability_score(self, ability: str, score: int):
        if ability in self.base_ability_scores:
            self.base_ability_scores[ability] = score
        else:
            raise ValueError(f"Invalid ability: {ability}")

class RulesEngine:
    def __init__(self, data_manager: DataManagementModule):
        self.data_manager = data_manager

    def calculate_ability_modifier(self, score: int) -> int:
        return (score - 10) // 2

    def validate_point_buy(self, base_scores: Dict[str, int]) -> Tuple[bool, str, int]:
        ability_score_info = self.data_manager.get_ability_score_info()
        if not ability_score_info:
            return False, "Ability score rules not loaded.", 0

        total_points_spent = 0
        for ability, score in base_scores.items():
            if not (8 <= score <= 15):
                return False, f"{ability} score {score} is outside the allowed range of 8-15 for point buy.", total_points_spent

            cost = ability_score_info.point_buy_costs.get(score)
            if cost is None:
                return False, f"Invalid score {score} for {ability} or cost not found.", total_points_spent
            total_points_spent += cost

        if total_points_spent > ability_score_info.max_points_to_spend:
            return False, f"Total points spent ({total_points_spent}) exceed maximum allowed ({ability_score_info.max_points_to_spend}).", total_points_spent

        return True, f"Valid point buy. Total points spent: {total_points_spent}/{ability_score_info.max_points_to_spend}.", total_points_spent

    def calculate_final_ability_scores(self, character_state: CharacterState) -> Dict[str, int]:
        final_scores = character_state.base_ability_scores.copy()
        # Placeholder for background/species ASI logic
        return final_scores

    def get_final_ability_scores_and_modifiers(self, character_state: CharacterState) -> Dict[str, Dict[str, int]]:
        final_scores = self.calculate_final_ability_scores(character_state)
        scores_and_modifiers = {}
        for ability, score in final_scores.items():
            scores_and_modifiers[ability] = {
                "score": score,
                "modifier": self.calculate_ability_modifier(score)
            }
        return scores_and_modifiers

# Example usage (commented out for subtask)
# if __name__ == "__main__":
#     try:
#         # This assumes dnd_data_structures.py is in the same directory or python path for local test
#         # For the subtask, it will be able to import it if it was created in a previous subtask in the same workspace
#         from dnd_data_structures import DataManagementModule as ActualDataManagementModule
#         data_manager = ActualDataManagementModule()
#     except ImportError:
#         print("Using dummy DataManagementModule for local test.")
#         data_manager = DataManagementModule() # Uses the dummy class defined above

#     char_state = CharacterState()
#     rules_engine = RulesEngine(data_manager)

#     test_scores_valid = {"Strength": 15, "Dexterity": 15, "Constitution": 15, "Intelligence": 8, "Wisdom": 8, "Charisma": 8}
#     is_valid, msg, points = rules_engine.validate_point_buy(test_scores_valid)
#     print(f"Point buy validation (valid set): {is_valid} - {msg} (Points: {points})")

#     test_scores_invalid_points = {"Strength": 15, "Dexterity": 15, "Constitution": 15, "Intelligence": 10, "Wisdom": 8, "Charisma": 8}
#     is_valid, msg, points = rules_engine.validate_point_buy(test_scores_invalid_points)
#     print(f"Point buy validation (too many points): {is_valid} - {msg} (Points: {points})")

#     char_state.base_ability_scores = test_scores_valid
#     final_scores_mods = rules_engine.get_final_ability_scores_and_modifiers(char_state)
#     print(f"Final scores and modifiers (sample): {final_scores_mods}")
