from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple

try:
    from dnd_data_structures import DataManagementModule, AbilityScoreInfo as ActualAbilityScoreInfo, ClassData as ActualClassData, SubclassData as ActualSubclassData, SpeciesData as ActualSpeciesData
    from dnd_character_logic import CharacterState, RulesEngine
except ImportError:
    print("Warning: Running with dummy modules for UI development. Full functionality may be limited.")
    @dataclass
    class FeatData: name: str = ""; description: str = ""
    @dataclass
    class ActualSubclassData: name: str = "DummySubclass"; parent_class_name: str = ""; description: str = ""
    @dataclass
    class ActualClassData:
        name: str = "DummyClass"
        subclasses: List[ActualSubclassData] = field(default_factory=lambda: [ActualSubclassData()])
    @dataclass
    class ActualSpeciesData: name: str = "DummySpecies" # Added for consistency
    @dataclass
    class ActualAbilityScoreInfo:
        point_buy_costs: Dict[int, int] = field(default_factory=lambda: {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9})
        standard_array: List[int] = field(default_factory=lambda: [15,14,13,12,10,8])
        max_points_to_spend: int = 27

    class DataManagementModule:
        def __init__(self):
            self.dummy_subclass_fighter = ActualSubclassData(name="Path of the Dummy Fighter", parent_class_name="Fighter_D", description="A brave dummy fighter path.")
            self.dummy_subclass_wizard = ActualSubclassData(name="School of Dummies", parent_class_name="Wizard_D", description="An arcane dummy school.")
            self.species_data = [ActualSpeciesData("Human_D"), ActualSpeciesData("Elf_D")]
            self.class_data = [
                ActualClassData(name="Fighter_D", subclasses=[self.dummy_subclass_fighter]),
                ActualClassData(name="Wizard_D", subclasses=[self.dummy_subclass_wizard])
            ]
            self.ability_score_info = ActualAbilityScoreInfo()
            print("Dummy DataManagementModule initialized for subclass selection.")
        def get_all_species(self): return self.species_data
        def get_all_classes(self): return self.class_data
        def get_class(self, name: str) -> Optional[ActualClassData]:
            for c_data in self.class_data: # Renamed c to c_data
                if c_data.name == name:
                    return c_data
            return None
        def get_ability_score_info(self) -> Optional[ActualAbilityScoreInfo]: return self.ability_score_info

    class CharacterState:
        def __init__(self):
            self.species_name = None
            self.class_name = None
            self.subclass_name = None
            self.base_ability_scores: Dict[str, int] = {
                "Strength": 8, "Dexterity": 8, "Constitution": 8,
                "Intelligence": 8, "Wisdom": 8, "Charisma": 8
            }
            print("Dummy CharacterState initialized for subclass selection.")
        def update_base_ability_score(self, ability: str, score: int):
            self.base_ability_scores[ability] = score

    class RulesEngine:
        def __init__(self, data_manager: DataManagementModule):
            self.data_manager = data_manager
            print("Dummy RulesEngine initialized for subclass selection.")
        def calculate_ability_modifier(self, score: int) -> int: return (score - 10) // 2
        def validate_point_buy(self, base_scores: Dict[str, int]) -> Tuple[bool, str, int]:
            ability_info = self.data_manager.get_ability_score_info()
            if not ability_info: return False, "No ability score info", 0
            spent = 0
            for ability, score_val in base_scores.items():
                if not (8 <= score_val <= 15): return False, f"{ability} score {score_val} out of 8-15 range", spent
                cost = ability_info.point_buy_costs.get(score_val)
                if cost is None: return False, f"Invalid score {score_val} for {ability} (no cost defined)", spent
                spent += cost
            if spent > ability_info.max_points_to_spend: return False, f"Points spent ({spent}) > max allowed ({ability_info.max_points_to_spend})", spent
            return True, f"Points spent: {spent}/{ability_info.max_points_to_spend}", spent
        def get_final_ability_scores_and_modifiers(self, character_state: CharacterState) -> Dict[str, Dict[str, int]]:
            res = {}
            for ability, score_val in character_state.base_ability_scores.items():
                res[ability] = {"score": score_val, "modifier": self.calculate_ability_modifier(score_val)}
            return res

def display_options(options: list, option_type: str) -> None:
    print(f"\n--- Choose a {option_type} ---")
    for i, option in enumerate(options):
        display_name = getattr(option, 'name', str(option))
        print(f"{i + 1}. {display_name}")

def get_user_choice(options: list, option_type_name: str = "choice") -> Any:
    if not options:
        print(f"No {option_type_name} options available.")
        return None
    while True:
        try:
            choice_num = int(input(f"Enter the number of your {option_type_name} (1-{len(options)}): ")) - 1
            if 0 <= choice_num < len(options):
                return options[choice_num]
            else:
                print("Invalid choice. Please enter a number from the list.")
        except ValueError:
            print("Invalid input. Please enter a number.")

def display_ability_scores(scores: Dict[str, int], engine: RulesEngine):
    print("\n--- Current Ability Scores ---")
    is_valid_scores, msg_scores, points_spent = engine.validate_point_buy(scores) # Renamed variables
    ability_score_info = engine.data_manager.get_ability_score_info()
    max_points = ability_score_info.max_points_to_spend if ability_score_info else "N/A"

    for ability, score_val in scores.items():
        modifier = engine.calculate_ability_modifier(score_val)
        cost = ability_score_info.point_buy_costs.get(score_val, "N/A") if ability_score_info else "N/A"
        print(f"{ability+':':<15} {score_val:<3} (Mod: {modifier:+} Cost: {cost})")
    # Use the direct message from validate_point_buy as it contains the points spent string
    print(f"{msg_scores}")


def assign_stats_point_buy(character_state: CharacterState, rules_engine: RulesEngine):
    print("\n--- Assign Ability Scores (Point Buy) ---")
    ability_score_info = rules_engine.data_manager.get_ability_score_info()
    if not ability_score_info:
        print("Error: Ability score point buy rules not found!")
        return

    print(f"You have {ability_score_info.max_points_to_spend} points to spend.")
    print("Scores must be between 8 and 15 before racial/background modifiers.")
    print("Costs: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9")
    abilities = list(character_state.base_ability_scores.keys())

    while True:
        display_ability_scores(character_state.base_ability_scores, rules_engine)
        print("\nOptions: [ability name] [new score] (e.g., 'Strength 14'), or 'done'")
        user_input_str = input("Set score or type 'done': ").strip().lower()

        if user_input_str == 'done':
            is_valid, msg, points_spent = rules_engine.validate_point_buy(character_state.base_ability_scores)
            if is_valid:
                 if points_spent < ability_score_info.max_points_to_spend and points_spent > 0 : # Spent some, but not all
                     confirm = input(f"You have spent {points_spent}/{ability_score_info.max_points_to_spend} points. Are you sure you want to proceed? (yes/no): ").lower()
                     if confirm == 'yes':
                         print(f"Finalizing scores. {msg}")
                         break
                 elif points_spent == 0: # All scores are 8
                     confirm_zero = input(f"All scores are 8 ({points_spent} points spent). Are you sure? (yes/no): ").lower()
                     if confirm_zero == 'yes':
                         print(f"Finalizing scores with all 8s. {msg}")
                         break
                 else: # Points spent == max_points_to_spend (or other valid states like exactly 0 if confirmed)
                     print(f"Finalizing scores. {msg}")
                     break
            else:
                print(f"Cannot finalize scores: {msg}. Please adjust.")
            continue # Continue loop if not breaking

        try:
            parts = user_input_str.split()
            if len(parts) != 2:
                raise ValueError("Invalid format. Use: [ability name] [new score]")

            ability_name_input = parts[0].capitalize()
            new_score_val = int(parts[1])

            if ability_name_input not in abilities:
                print(f"Invalid ability name: {parts[0]}. Choose from {', '.join(abilities)}.")
                continue

            if not (8 <= new_score_val <= 15):
                print(f"Score for {ability_name_input} must be between 8 and 15.")
                continue

            current_scores_copy = character_state.base_ability_scores.copy()
            current_scores_copy[ability_name_input] = new_score_val

            is_valid_temp, msg_temp, _ = rules_engine.validate_point_buy(current_scores_copy)
            if is_valid_temp:
                character_state.update_base_ability_score(ability_name_input, new_score_val)
            else:
                print(f"Adjustment for {ability_name_input} to {new_score_val} not made: {msg_temp}")

        except ValueError as e:
            print(f"Error: {e}. Please try again.")
        except Exception as e:
            print(f"An unexpected error occurred during stat assignment: {e}")

def select_subclass(character_state: CharacterState, data_manager: DataManagementModule):
    print("\n--- Select a Subclass ---")
    if not character_state.class_name:
        print("Error: Class not selected yet. Cannot select subclass.")
        return

    class_data = data_manager.get_class(character_state.class_name)

    # Check if class_data is None or if it lacks subclasses attribute or if the list is empty
    if not class_data or not hasattr(class_data, 'subclasses') or not class_data.subclasses:
        print(f"No subclasses are listed or available for {character_state.class_name} at this point based on current data.")
        # Note: Some classes choose subclasses at later levels (e.g., L3).
        # This UI presents what's in the ClassData.subclasses list.
        # If that list is empty, it means no subclass is chosen now or defined for L1.
        character_state.subclass_name = None # Ensure it's None if no choice is made/possible
        return

    available_subclasses = class_data.subclasses
    # Ensure available_subclasses is a list and not empty before proceeding
    if not isinstance(available_subclasses, list) or not available_subclasses:
        print(f"Subclass data for {character_state.class_name} is not in the expected format or is empty.")
        character_state.subclass_name = None
        return

    print(f"Available subclasses for {character_state.class_name}:")
    display_options(available_subclasses, "Subclass")

    chosen_subclass_data = get_user_choice(available_subclasses, "subclass")
    if chosen_subclass_data:
        character_state.subclass_name = chosen_subclass_data.name
        print(f"You chose subclass: {character_state.subclass_name}")
    else:
        # This case might occur if get_user_choice returns None (e.g., if modified to allow skipping)
        # or if the list was empty and it somehow passed initial checks.
        print(f"No subclass selected for {character_state.class_name}.")
        character_state.subclass_name = None


def create_character(print_summary: bool = True) -> CharacterState:
    """Interactively build and return a CharacterState."""
    print("Welcome to the D&D Character Creator!")

    data_manager = DataManagementModule()
    character_state = CharacterState()
    rules_engine = RulesEngine(data_manager)

    available_species = data_manager.get_all_species()
    if not available_species:  # Check if list is empty or None
        print("No species data found. Exiting.")
        return character_state
    display_options(available_species, "Species")
    chosen_species_data = get_user_choice(available_species, "species")
    if chosen_species_data:
        character_state.species_name = chosen_species_data.name
        print(f"You chose: {character_state.species_name}")
    else:
        print("No species selected. Exiting.")
        return character_state

    available_classes = data_manager.get_all_classes()
    if not available_classes:
        print("No class data found. Exiting.")
        return character_state
    display_options(available_classes, "Class")
    chosen_class_data = get_user_choice(available_classes, "class")
    if chosen_class_data:
        character_state.class_name = chosen_class_data.name
        print(f"You chose: {character_state.class_name}")
    else:
        print("No class selected. Exiting.")
        return character_state

    assign_stats_point_buy(character_state, rules_engine)

    if character_state.class_name:
        select_subclass(character_state, data_manager)

    if print_summary:
        print("\n--- Character Summary ---")
        print(f"Species: {character_state.species_name}")
        print(f"Class: {character_state.class_name}")
        if character_state.subclass_name:
            print(f"Subclass: {character_state.subclass_name}")
        else:
            print("Subclass: None (or chosen at a later level)")

        final_scores_with_modifiers = rules_engine.get_final_ability_scores_and_modifiers(character_state)
        print("\nFinal Ability Scores (Base):")
        for ability, data_val in final_scores_with_modifiers.items():
            print(f"  {ability+':':<15} {data_val['score']:<3} (Mod: {data_val['modifier']:+})")

        print("\nNote: Background selection and its impact on ability scores will be implemented next.")
        print("\nFurther steps: Feats, Equipment, Spells...")

    return character_state


def main() -> CharacterState:
    """Entry point when run as a script."""
    return create_character()

if __name__ == "__main__":
    main()
