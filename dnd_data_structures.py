from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Any

@dataclass
class FeatData:
    name: str
    description: str
    # Effects would be more complex in a full system, simplified for now
    effects: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SubclassData:
    name: str
    parent_class_name: str
    description: str
    # Features would be more complex, keyed by level
    features: Dict[int, List[str]] = field(default_factory=dict)

@dataclass
class ClassData:
    name: str
    description: str
    hit_die: int  # e.g., 8 for d8, 10 for d10
    primary_abilities: List[str]
    saving_throw_proficiencies: List[str]
    skill_proficiency_options: List[str]
    skill_proficiency_count: int
    armor_proficiencies: List[str]
    weapon_proficiencies: List[str]
    starting_equipment_options: List[Dict[str, Any]] # Each dict is an option set
    level_1_features: List[str]
    subclasses: List[SubclassData] = field(default_factory=list)
    # For L1 choices like Cleric's Divine Order or Druid's Primal Order
    level_1_choices: Dict[str, List[str]] = field(default_factory=dict)

@dataclass
class SpeciesData:
    name: str
    description: str
    # Simplified: actual traits would be more structured
    racial_traits: List[str]
    speed: int
    languages: List[str]
    size: str # e.g., "Medium", "Small"
    # For ability score increases, new PHB ties this to background primarily,
    # but species might have other fixed bonuses or choices not covered by background.
    # For now, we'll assume background handles the +2/+1 or +1/+1/+1.
    # Species might still grant specific +1s or unique abilities.
    fixed_ability_bonuses: Dict[str, int] = field(default_factory=dict)


@dataclass
class BackgroundData:
    name: str
    description: str
    skill_proficiencies: List[str]
    tool_proficiencies: List[str]
    languages_options: List[str] # Options if any, or fixed list
    language_count: int
    starting_feat: FeatData
    starting_equipment: List[Dict[str, Any]] # e.g. items and/or gold

@dataclass
class AbilityScoreInfo:
    point_buy_costs: Dict[int, int]
    standard_array: List[int]
    max_points_to_spend: int = 27

class DataManagementModule:
    def __init__(self):
        self.classes: Dict[str, ClassData] = {}
        self.species: Dict[str, SpeciesData] = {}
        self.backgrounds: Dict[str, BackgroundData] = {}
        self.feats: Dict[str, FeatData] = {}
        self.ability_score_info: Optional[AbilityScoreInfo] = None
        self._load_data()

    def _load_data(self):
        # --- ABILITY SCORE INFO ---
        self.ability_score_info = AbilityScoreInfo(
            point_buy_costs={
                8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
            },
            standard_array=[15, 14, 13, 12, 10, 8]
        )

        # --- FEATS (Sample) ---
        feat_alert = FeatData(name="Alert", description="You gain a +5 bonus to initiative. You can't be surprised while you are conscious. Other creatures don’t gain advantage on attack rolls against you as a result of being unseen by you.")
        feat_crafter = FeatData(name="Crafter", description="You gain proficiency with three types of artisan's tools of your choice. You learn the Mending cantrip. When you make an ability check using your proficiency with artisan's tools, you can add double your proficiency bonus to the check, instead of your normal proficiency bonus.")
        feat_healer = FeatData(name="Healer", description="You have proficiency in the Medicine skill. When you use a healer's kit to stabilize a dying creature, that creature also regains 1 hit point. As an action, you can spend one use of a healer's kit to tend to a creature and restore 1d6 + 4 hit points to it, plus additional hit points equal to the creature's maximum number of Hit Dice. The creature can't regain hit points from this feat again until it finishes a short or long rest.")
        feat_lucky = FeatData(name="Lucky", description="You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can choose to spend one of your luck points after you roll the die, but before the outcome is determined. You choose which of the d20s is used for the attack roll, ability check, or saving throw. You can also spend one luck point when an attack roll is made against you. Roll a d20, and then choose whether the attacker's roll uses their d20 or yours. If more than one creature spends a luck point to influence the outcome of a roll, the points cancel each other out; no additional dice are rolled. You regain your expended luck points when you finish a long rest.")
        feat_magic_initiate_cleric = FeatData(name="Magic Initiate (Cleric)", description="Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class's spell list. In addition, choose one 1st-level spell from that same list. You learn that spell and can cast it at its lowest level. Once you cast it, you must finish a long rest before you can cast it again using this feat. Your spellcasting ability for these spells depends on the class you chose: Charisma for bard, sorcerer, or warlock; Wisdom for cleric or druid; or Intelligence for wizard.")
        feat_magic_initiate_druid = FeatData(name="Magic Initiate (Druid)", description="Similar to Cleric, but for Druid spells.")
        feat_magic_initiate_wizard = FeatData(name="Magic Initiate (Wizard)", description="Similar to Cleric, but for Wizard spells.")
        feat_musician = FeatData(name="Musician", description="You gain proficiency with three musical instruments of your choice. You learn the Friends cantrip. You can use a musical instrument as a spellcasting focus for any spell you cast that uses Charisma as its spellcasting ability.")
        feat_savage_attacker = FeatData(name="Savage Attacker", description="Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon's damage dice and use either total.")
        feat_skilled = FeatData(name="Skilled", description="You gain proficiency in any combination of three skills or tools of your choice.")
        feat_tavern_brawler = FeatData(name="Tavern Brawler", description="Increase your Strength or Constitution score by 1, to a maximum of 20. You are proficient with improvised weapons. Your unarmed strike uses a d4 for damage. When you hit a creature with an unarmed strike or an improvised weapon on your turn, you can use a bonus action to attempt to grapple the target.")
        feat_tough = FeatData(name="Tough", description="Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.")

        self.feats = {
            feat.name: feat for feat in [
                feat_alert, feat_crafter, feat_healer, feat_lucky,
                feat_magic_initiate_cleric, feat_magic_initiate_druid, feat_magic_initiate_wizard,
                feat_musician, feat_savage_attacker, feat_skilled, feat_tavern_brawler, feat_tough
            ]
        }

        # --- SUBCLASSES (Sample - Barbarian) ---
        path_of_berserker = SubclassData(
            name="Path of the Berserker",
            parent_class_name="Barbarian",
            description="Channel Rage into Violent Fury.",
            features={
                3: ["Frenzy (If use Reckless Attack while Raging, deal extra damage on first Str-based hit = Rage Damage bonus d6s)"],
                6: ["Mindless Rage (Immunity to Charmed/Frightened while Raging)"],
                10: ["Retaliation (Reaction melee attack vs creature within 5ft that damages you)"],
                14: ["Intimidating Presence (Bonus Action, creatures in 30ft Wis save or Frightened for 1 min)"]
            }
        )
        # --- CLASSES (Sample - Barbarian) ---
        barbarian = ClassData(
            name="Barbarian",
            description="A Fierce Warrior of Primal Rage.",
            hit_die=12,
            primary_abilities=["Strength"],
            saving_throw_proficiencies=["Strength", "Constitution"],
            skill_proficiency_options=["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
            skill_proficiency_count=2,
            armor_proficiencies=["Light armor", "Medium armor", "Shields"],
            weapon_proficiencies=["Simple weapons", "Martial weapons"],
            starting_equipment_options=[
                {"option_set_A": ["Greataxe", "4 Handaxes", "Explorer’s Pack", "15 GP"]},
                {"option_set_B": ["75 GP"]}
            ],
            level_1_features=["Rage", "Unarmored Defense", "Weapon Mastery"],
            subclasses=[path_of_berserker]
        )
        self.classes[barbarian.name] = barbarian

        # --- SPECIES (Sample - Human) ---
        human = SpeciesData(
            name="Human",
            description="Found throughout the multiverse, humans are as varied as they are numerous.",
            racial_traits=["Resourceful", "Skillful", "Versatile"], # Placeholder for actual 2024 PHB traits
            speed=30,
            languages=["Common"], # Plus two from background in 2024 rules
            size="Medium"
        )
        self.species[human.name] = human

        # --- BACKGROUNDS (Sample - Acolyte) ---
        acolyte_bg = BackgroundData(
            name="Acolyte",
            description="You have spent your life in the service of a temple to a specific god or pantheon of gods.",
            skill_proficiencies=["Insight", "Religion"],
            tool_proficiencies=[], # 2024 PHB Acolyte gives Feat not tools directly
            languages_options=[], # Gets from general rule: Common + 2 chosen
            language_count=2, # In addition to Common
            starting_feat=self.feats["Magic Initiate (Cleric)"],
            starting_equipment=[{"items": ["Holy Symbol", "Prayer Book or Prayer Wheel", "5 sticks of incense", "Vestments", "Set of common clothes", "15 GP pouch"]}] # Example from older PHB, 2024 might differ slightly
        )
        self.backgrounds[acolyte_bg.name] = acolyte_bg

    def get_class(self, name: str) -> Optional[ClassData]:
        return self.classes.get(name)

    def get_all_classes(self) -> List[ClassData]:
        return list(self.classes.values())

    def get_species(self, name: str) -> Optional[SpeciesData]:
        return self.species.get(name)

    def get_all_species(self) -> List[SpeciesData]:
        return list(self.species.values())

    def get_background(self, name: str) -> Optional[BackgroundData]:
        return self.backgrounds.get(name)

    def get_all_backgrounds(self) -> List[BackgroundData]:
        return list(self.backgrounds.values())

    def get_feat(self, name: str) -> Optional[FeatData]:
        return self.feats.get(name)

    def get_ability_score_info(self) -> Optional[AbilityScoreInfo]:
        return self.ability_score_info

# Example usage (won't run in subtask, but for illustration)
# if __name__ == "__main__":
#     data_manager = DataManagementModule()
#     barbarian_info = data_manager.get_class("Barbarian")
#     if barbarian_info:
#         print(f"Loaded Class: {barbarian_info.name}")
#         print(f"  Hit Die: d{barbarian_info.hit_die}")
#         print(f"  Subclasses: {[sc.name for sc in barbarian_info.subclasses]}")

#     human_info = data_manager.get_species("Human")
#     if human_info:
#         print(f"Loaded Species: {human_info.name}")
#         print(f"  Speed: {human_info.speed}")

#     acolyte_info = data_manager.get_background("Acolyte")
#     if acolyte_info:
#         print(f"Loaded Background: {acolyte_info.name}")
#         print(f"  Starting Feat: {acolyte_info.starting_feat.name}")

#     point_buy_rules = data_manager.get_ability_score_info()
#     if point_buy_rules:
#         print(f"Point buy cost for 15: {point_buy_rules.point_buy_costs.get(15)}")
