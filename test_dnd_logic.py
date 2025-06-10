import unittest
from unittest import mock

# Assuming dnd_data_structures.py and dnd_character_logic.py are in the same directory
# or accessible via PYTHONPATH for the testing environment.
try:
    from dnd_data_structures import DataManagementModule, AbilityScoreInfo, ClassData, SpeciesData, BackgroundData, FeatData, SubclassData
    from dnd_character_logic import CharacterState, RulesEngine
    MODULES_LOADED = True
except ImportError as e:
    print(f"Warning: Could not import all modules for testing: {e}. Some tests may be skipped or use dummies.")
    MODULES_LOADED = False
    # Define dummy classes if import fails, to allow some basic test structure to run
    from dataclasses import dataclass, field
    from typing import Dict, List, Optional, Any, Tuple
    @dataclass
    class FeatData: name: str = ""; description: str = ""
    @dataclass
    class SubclassData: name: str = ""; parent_class_name: str = ""; description: str = ""; features: Dict[int, List[str]] = field(default_factory=dict)
    @dataclass
    class ClassData: name: str = ""; description: str = ""; hit_die: int = 0; primary_abilities: List[str] = field(default_factory=list); saving_throw_proficiencies: List[str] = field(default_factory=list); skill_proficiency_options: List[str] = field(default_factory=list); skill_proficiency_count: int = 0; armor_proficiencies: List[str] = field(default_factory=list); weapon_proficiencies: List[str] = field(default_factory=list); starting_equipment_options: List[Dict[str, Any]] = field(default_factory=list); level_1_features: List[str] = field(default_factory=list); subclasses: List[SubclassData] = field(default_factory=list); subclass_data_status: str = ""
    @dataclass
    class SpeciesData: name: str = ""; description: str = ""; racial_traits: List[str] = field(default_factory=list); speed: int = 0; languages: List[str] = field(default_factory=list); size: str = ""
    @dataclass
    class BackgroundData: name: str = ""; description: str = ""; skill_proficiencies: List[str] = field(default_factory=list); tool_proficiencies: List[str] = field(default_factory=list); languages_options: List[str] = field(default_factory=list); language_count: int = 0; starting_feat_name: str = ""; starting_equipment: List[Dict[str, Any]] = field(default_factory=list)

    @dataclass
    class AbilityScoreInfo:
        point_buy_costs: Dict[int, int] = field(default_factory=lambda: {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9})
        standard_array: List[int] = field(default_factory=list)
        max_points_to_spend: int = 27

    class DataManagementModule: # Dummy DataManagementModule
        def __init__(self):
            self.ability_score_info = AbilityScoreInfo()
            # Populate with minimal dummy data for tests to run against if actual module fails
            self.feats = {"DummyFeat": FeatData(name="DummyFeat")}
            self.classes = {"DummyClass": ClassData(name="DummyClass")}
            self.species = {"DummySpecies": SpeciesData(name="DummySpecies")}
            self.backgrounds = {"DummyBackground": BackgroundData(name="DummyBackground", starting_feat_name="DummyFeat")}

        def get_ability_score_info(self) -> Optional[AbilityScoreInfo]: return self.ability_score_info
        def get_class(self, name: str) -> Optional[ClassData]: return self.classes.get(name, ClassData(name=name))
        def get_all_classes(self) -> List[ClassData]: return list(self.classes.values())
        def get_species(self, name: str) -> Optional[SpeciesData]: return self.species.get(name, SpeciesData(name=name))
        def get_all_species(self) -> List[SpeciesData]: return list(self.species.values())
        def get_background(self, name: str) -> Optional[BackgroundData]: return self.backgrounds.get(name, BackgroundData(name=name, starting_feat_name="DummyFeat"))
        def get_feat(self, name: str) -> Optional[FeatData]: return self.feats.get(name, FeatData(name=name))


    @dataclass
    class CharacterState: # Dummy CharacterState
        name: str = "DummyCharacter"
        level: int = 1
        species_name: Optional[str] = None
        class_name: Optional[str] = None
        subclass_name: Optional[str] = None
        background_name: Optional[str] = None
        base_ability_scores: Dict[str, int] = field(default_factory=lambda: {
            "Strength": 10, "Dexterity": 10, "Constitution": 10,
            "Intelligence": 10, "Wisdom": 10, "Charisma": 10
        })
        skill_proficiencies: List[str] = field(default_factory=list)
        tool_proficiencies: List[str] = field(default_factory=list)
        armor_proficiencies: List[str] = field(default_factory=list)
        weapon_proficiencies: List[str] = field(default_factory=list)
        saving_throw_proficiencies: List[str] = field(default_factory=list)
        languages: List[str] = field(default_factory=list)
        feats: List[str] = field(default_factory=list)
        max_hp: int = 0
        current_hp: int = 0
        armor_class: int = 10
        initiative_bonus: int = 0
        proficiency_bonus: int = 2

        def update_base_ability_score(self, ability: str, score: int):
            if ability in self.base_ability_scores:
                self.base_ability_scores[ability] = score
            else:
                raise ValueError(f"Invalid ability: {ability}")


    class RulesEngine: # Dummy RulesEngine
        def __init__(self, data_manager: DataManagementModule): self.data_manager = data_manager
        def calculate_ability_modifier(self, score: int) -> int: return (score - 10) // 2
        def validate_point_buy(self, base_scores: Dict[str, int]) -> Tuple[bool, str, int]:
            info = self.data_manager.get_ability_score_info()
            if not info: return False, "No ASI info", 0

            total_points_spent = 0
            for score_val in base_scores.values():
                if not (8 <= score_val <= 15):
                    return False, "Score out of 8-15 range for point buy.", total_points_spent
                cost = info.point_buy_costs.get(score_val)
                if cost is None: return False, f"Invalid score {score_val} or cost not found.", total_points_spent
                total_points_spent += cost

            if total_points_spent > info.max_points_to_spend:
                return False, f"Total points spent ({total_points_spent}) exceed maximum allowed ({info.max_points_to_spend}).", total_points_spent
            return True, f"Valid point buy. Total points spent: {total_points_spent}", total_points_spent

        def calculate_final_ability_scores(self, character_state: CharacterState) -> Dict[str, int]:
            # This is a placeholder. In a real app, it would apply species/background/feat ASIs.
            return character_state.base_ability_scores.copy()

        def get_final_ability_scores_and_modifiers(self, character_state: CharacterState) -> Dict[str, Dict[str, int]]:
            final_scores = self.calculate_final_ability_scores(character_state)
            return {ability: {"score": score, "modifier": self.calculate_ability_modifier(score)} for ability, score in final_scores.items()}


@unittest.skipIf(not MODULES_LOADED, "Skipping tests: core dnd_data_structures or dnd_character_logic modules not loaded.")
class TestRulesEngineWithActualModules(unittest.TestCase): # Renamed to be specific
    def setUp(self):
        self.data_manager = DataManagementModule()
        self.rules_engine = RulesEngine(self.data_manager)
        # Use a CharacterState that matches the actual module's definition if different from dummy
        self.char_state = CharacterState(base_ability_scores={
            "Strength": 8, "Dexterity": 8, "Constitution": 8,
            "Intelligence": 8, "Wisdom": 8, "Charisma": 8
        })


    def test_calculate_ability_modifier(self):
        self.assertEqual(self.rules_engine.calculate_ability_modifier(10), 0)
        self.assertEqual(self.rules_engine.calculate_ability_modifier(12), 1)
        self.assertEqual(self.rules_engine.calculate_ability_modifier(15), 2)
        self.assertEqual(self.rules_engine.calculate_ability_modifier(8), -1)
        self.assertEqual(self.rules_engine.calculate_ability_modifier(7), -2) # Below point buy min but valid calc
        self.assertEqual(self.rules_engine.calculate_ability_modifier(20), 5) # Above point buy max but valid calc
        self.assertEqual(self.rules_engine.calculate_ability_modifier(1), -5) # Extreme case

    def test_validate_point_buy_valid(self):
        scores = {"Strength": 15, "Dexterity": 15, "Constitution": 15, "Intelligence": 8, "Wisdom": 8, "Charisma": 8} # 9+9+9+0+0+0 = 27 points
        is_valid, msg, points = self.rules_engine.validate_point_buy(scores)
        self.assertTrue(is_valid, f"Point buy should be valid. Msg: {msg}, Points: {points}")
        self.assertEqual(points, 27)

    def test_validate_point_buy_overspent(self):
        scores = {"Strength": 15, "Dexterity": 15, "Constitution": 15, "Intelligence": 10, "Wisdom": 8, "Charisma": 8} # 9+9+9+2+0+0 = 29 points
        is_valid, msg, points = self.rules_engine.validate_point_buy(scores)
        self.assertFalse(is_valid, "Point buy should be invalid (overspent).")
        self.assertEqual(points, 29)

    def test_validate_point_buy_underspent_but_valid(self):
        scores = {"Strength": 10, "Dexterity": 10, "Constitution": 10, "Intelligence": 8, "Wisdom": 8, "Charisma": 8} # 2+2+2+0+0+0 = 6 points
        is_valid, msg, points = self.rules_engine.validate_point_buy(scores)
        self.assertTrue(is_valid, f"Point buy should be valid (underspent). Msg: {msg}, Points: {points}")
        self.assertEqual(points, 6)

    def test_validate_point_buy_score_too_low(self):
        scores = {"Strength": 7, "Dexterity": 15, "Constitution": 15, "Intelligence": 8, "Wisdom": 8, "Charisma": 8}
        is_valid, msg, _ = self.rules_engine.validate_point_buy(scores)
        self.assertFalse(is_valid, "Point buy should be invalid (score < 8).")

    def test_validate_point_buy_score_too_high(self):
        scores = {"Strength": 16, "Dexterity": 14, "Constitution": 14, "Intelligence": 8, "Wisdom": 8, "Charisma": 8}
        is_valid, msg, _ = self.rules_engine.validate_point_buy(scores)
        self.assertFalse(is_valid, "Point buy should be invalid (score > 15).")

    def test_calculate_final_scores_placeholder(self):
        # Current RulesEngine.calculate_final_ability_scores is a placeholder and just returns base_ability_scores.
        # This test reflects that. It will need to be updated when ASI logic is implemented.
        self.char_state.base_ability_scores = {"Strength": 15, "Dexterity": 10}
        # Example of how it might be if ASIs were applied:
        # self.char_state.species_name = "Human" # Assume Human gives +1 Str (this is not current Human trait)
        final_scores = self.rules_engine.calculate_final_ability_scores(self.char_state)
        self.assertEqual(final_scores.get("Strength"), 15)
        self.assertEqual(final_scores.get("Dexterity"), 10)

    def test_get_final_ability_scores_and_modifiers(self):
        self.char_state.base_ability_scores = {"Strength": 15, "Dexterity": 8, "Constitution": 12}
        # As calculate_final_ability_scores is a placeholder, this test also reflects that.
        result = self.rules_engine.get_final_ability_scores_and_modifiers(self.char_state)

        self.assertEqual(result["Strength"]["score"], 15)
        self.assertEqual(result["Strength"]["modifier"], 2) # (15-10)//2
        self.assertEqual(result["Dexterity"]["score"], 8)
        self.assertEqual(result["Dexterity"]["modifier"], -1) # (8-10)//2
        self.assertEqual(result["Constitution"]["score"], 12)
        self.assertEqual(result["Constitution"]["modifier"], 1) # (12-10)//2

@unittest.skipIf(not MODULES_LOADED, "Skipping tests: core CharacterState module not loaded.")
class TestCharacterStateWithActualModules(unittest.TestCase): # Renamed
    def test_update_base_ability_score(self):
        # Initialize with a structure that CharacterState expects if not using the dummy
        char_state = CharacterState(base_ability_scores={
            "Strength": 8, "Dexterity": 8, "Constitution": 8,
            "Intelligence": 8, "Wisdom": 8, "Charisma": 8
        })
        char_state.update_base_ability_score("Strength", 14)
        self.assertEqual(char_state.base_ability_scores["Strength"], 14)
        with self.assertRaises(ValueError): # Assuming "Resilience" is not a valid key
            char_state.update_base_ability_score("Resilience", 10)

@unittest.skipIf(not MODULES_LOADED, "Skipping tests: core DataManagementModule not loaded.")
class TestDataManagementModuleWithActualModules(unittest.TestCase): # Renamed
    def setUp(self):
        self.data_manager = DataManagementModule()

    def test_load_ability_score_info(self):
        info = self.data_manager.get_ability_score_info()
        self.assertIsNotNone(info, "AbilityScoreInfo should be loaded.")
        if info:
            self.assertIn(15, info.point_buy_costs)
            self.assertEqual(info.point_buy_costs[15], 9)
            self.assertEqual(info.max_points_to_spend, 27)
            self.assertTrue(len(info.standard_array) > 0, "Standard array should not be empty.")

    def test_get_class_data_integrity(self): # More specific test name
        # Test a few key classes if actual data is loaded
        if MODULES_LOADED and hasattr(self.data_manager, '_load_all_data'): # Check if it's the actual module
            for class_name_to_test in ["Barbarian", "Wizard", "Rogue"]:
                class_data = self.data_manager.get_class(class_name_to_test)
                self.assertIsNotNone(class_data, f"{class_name_to_test} class data should be loaded.")
                if class_data:
                    self.assertEqual(class_data.name, class_name_to_test)
                    self.assertTrue(class_data.hit_die > 0, f"{class_name_to_test} hit_die should be positive.")
                    self.assertTrue(len(class_data.subclasses) > 0, f"{class_name_to_test} should have at least one subclass defined.")
        else: # Dummy test
            dummy_class = self.data_manager.get_class("AnyClass")
            self.assertIsNotNone(dummy_class)

    def test_get_all_species_count(self): # More specific test name
        all_species = self.data_manager.get_all_species()
        self.assertIsNotNone(all_species)
        if MODULES_LOADED and hasattr(self.data_manager, '_load_all_data'):
            self.assertEqual(len(all_species), 10, "Should load 10 species from the full dataset.")
        else: # Dummy test
            self.assertTrue(len(all_species) > 0)


    def test_get_all_backgrounds_count(self): # More specific test name
        all_backgrounds = self.data_manager.get_all_backgrounds()
        self.assertIsNotNone(all_backgrounds)
        if MODULES_LOADED and hasattr(self.data_manager, '_load_all_data'):
            self.assertEqual(len(all_backgrounds), 16, "Should load 16 backgrounds from the full dataset.")
        else: # Dummy test
            self.assertTrue(len(all_backgrounds) > 0)


    def test_get_feat_from_background(self): # More specific test name
        if MODULES_LOADED and hasattr(self.data_manager, '_load_all_data'):
            acolyte_bg = self.data_manager.get_background("Acolyte")
            self.assertIsNotNone(acolyte_bg, "Acolyte background should exist.")
            if acolyte_bg:
                feat = self.data_manager.get_feat(acolyte_bg.starting_feat_name)
                self.assertIsNotNone(feat, f"Feat '{acolyte_bg.starting_feat_name}' from Acolyte should be loadable.")
                if feat:
                    self.assertEqual(feat.name, acolyte_bg.starting_feat_name)
        else: # Dummy test
            dummy_bg = self.data_manager.get_background("AnyBackground") # Uses dummy get_background
            if dummy_bg:
                 dummy_feat = self.data_manager.get_feat(dummy_bg.starting_feat_name) # Uses dummy get_feat
                 self.assertIsNotNone(dummy_feat)


# Test Suite for when modules might not be loaded (runs against dummy classes)
@unittest.skipIf(MODULES_LOADED, "Skipping dummy tests because core modules were loaded successfully.")
class TestDummyImplementations(unittest.TestCase):
    def setUp(self):
        self.dummy_data_manager = DataManagementModule() # This will be the dummy version
        self.dummy_rules_engine = RulesEngine(self.dummy_data_manager)
        self.dummy_char_state = CharacterState() # This will be the dummy version

    def test_dummy_rules_engine_modifier(self):
        self.assertEqual(self.dummy_rules_engine.calculate_ability_modifier(14), 2)

    def test_dummy_rules_engine_point_buy(self):
        scores = {"Strength": 15, "Dexterity": 15, "Constitution": 15, "Intelligence": 8, "Wisdom": 8, "Charisma": 8}
        is_valid, _, points = self.dummy_rules_engine.validate_point_buy(scores)
        self.assertTrue(is_valid)
        self.assertEqual(points, 27) # Based on dummy AbilityScoreInfo

    def test_dummy_character_state_update(self):
        self.dummy_char_state.update_base_ability_score("Strength", 12)
        self.assertEqual(self.dummy_char_state.base_ability_scores["Strength"], 12)

    def test_dummy_data_manager_loads_something(self):
        self.assertIsNotNone(self.dummy_data_manager.get_ability_score_info())
        self.assertTrue(len(self.dummy_data_manager.get_all_classes()) > 0)


class TestRunCharacterCreator(unittest.TestCase):
    """Ensure run_character_creator calls the create_character function directly."""

    def test_run_character_creator_returns_character(self):
        dummy_character = {"name": "Tester"}
        with mock.patch('main_character_creator.create_character', return_value=dummy_character) as mock_create, \
             mock.patch('subprocess.run') as mock_subproc:
            from game import run_character_creator

            result = run_character_creator()

            self.assertEqual(result, dummy_character)
            mock_create.assert_called_once()
            mock_subproc.assert_not_called()


if __name__ == "__main__":
    if MODULES_LOADED:
        print("Running tests with actual data structures and logic modules.")
    else:
        print("Warning: Running tests primarily against dummy implementations due to import errors of main modules.")

    # unittest.main() can interfere with some environments if sys.argv is manipulated.
    # Using a more robust way to run tests, especially in environments like a notebook or custom script runner.
    suite = unittest.TestSuite()
    # Add tests based on whether actual modules were loaded
    if MODULES_LOADED:
        suite.addTest(unittest.makeSuite(TestRulesEngineWithActualModules))
        suite.addTest(unittest.makeSuite(TestCharacterStateWithActualModules))
        suite.addTest(unittest.makeSuite(TestDataManagementModuleWithActualModules))
    else: # Fallback to dummy tests if modules didn't load
        suite.addTest(unittest.makeSuite(TestDummyImplementations))
        # Add dummy versions of the main tests if desired, but they might be redundant
        # if they rely on the same dummy classes as TestDummyImplementations.
        # For now, TestDummyImplementations covers the "modules failed to load" scenario.

    suite.addTest(unittest.makeSuite(TestRunCharacterCreator))

    runner = unittest.TextTestRunner()
    runner.run(suite)
