from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Any

@dataclass
class FeatData:
    name: str
    description: str
    effects: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SubclassData:
    name: str
    parent_class_name: str
    description: str
    features: Dict[int, List[str]] = field(default_factory=dict) # Key: Level, Value: List of feature descriptions

@dataclass
class ClassData:
    name: str
    description: str
    hit_die: int
    primary_abilities: List[str]
    saving_throw_proficiencies: List[str]
    skill_proficiency_options: List[str]
    skill_proficiency_count: int
    armor_proficiencies: List[str]
    weapon_proficiencies: List[str]
    starting_equipment_options: List[Dict[str, Any]]
    level_1_features: List[str]
    # For L1 choices like Cleric's Divine Order or Druid's Primal Order
    level_1_choices: Dict[str, List[str]] = field(default_factory=dict)
    subclasses: List[SubclassData] = field(default_factory=list)
    # Comment to note where more subclasses are expected if only one is listed
    subclass_data_status: str = "Complete" # Default, change if only partial

@dataclass
class SpeciesData:
    name: str
    description: str
    racial_traits: List[str] # List of trait names or brief descriptions
    speed: int
    languages: List[str] # Base languages, more might be added by background
    size: str
    fixed_ability_bonuses: Dict[str, int] = field(default_factory=dict) # e.g. {"Strength": 1} if any exist beyond background

@dataclass
class BackgroundData:
    name: str
    description: str
    skill_proficiencies: List[str]
    tool_proficiencies: List[str] # Can be empty
    languages_options: List[str] # Options if any, or fixed list. If empty, typically means chosen from a wider list.
    language_count: int # Number of additional languages granted
    starting_feat_name: str # Store feat name, actual FeatData looked up via DataManagementModule
    starting_equipment: List[Dict[str, Any]]

@dataclass
class AbilityScoreInfo:
    point_buy_costs: Dict[int, int]
    standard_array: List[int]
    max_points_to_spend: int = 27

class DataManagementModule:
    def __init__(self):
        self.feats: Dict[str, FeatData] = {}
        self.classes: Dict[str, ClassData] = {}
        self.species: Dict[str, SpeciesData] = {}
        self.backgrounds: Dict[str, BackgroundData] = {}
        self.ability_score_info: Optional[AbilityScoreInfo] = None
        self._load_all_data()

    def _load_feats(self):
        # Based on 16 backgrounds, each granting a feat. Some feats are repeated.
        # These are the unique feats identified from the background list.
        self.feats = {
            "Alert": FeatData(name="Alert", description="You gain a +5 bonus to initiative. You can't be surprised while you are conscious. Other creatures don’t gain advantage on attack rolls against you as a result of being unseen by you."),
            "Crafter": FeatData(name="Crafter", description="You gain proficiency with three types of artisan's tools of your choice. You learn the Mending cantrip. When you make an ability check using your proficiency with artisan's tools, you can add double your proficiency bonus to the check, instead of your normal proficiency bonus."),
            "Healer": FeatData(name="Healer", description="You have proficiency in the Medicine skill. When you use a healer's kit to stabilize a dying creature, that creature also regains 1 hit point. As an action, you can spend one use of a healer's kit to tend to a creature and restore 1d6 + 4 hit points to it, plus additional hit points equal to the creature's maximum number of Hit Dice. The creature can't regain hit points from this feat again until it finishes a short or long rest."),
            "Lucky": FeatData(name="Lucky", description="You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20... You regain your expended luck points when you finish a long rest."),
            "Magic Initiate (Cleric)": FeatData(name="Magic Initiate (Cleric)", description="Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class's spell list. In addition, choose one 1st-level spell from that same list... Your spellcasting ability for these spells depends on the class you chose..."),
            "Magic Initiate (Druid)": FeatData(name="Magic Initiate (Druid)", description="Similar to Magic Initiate (Cleric), but for Druid spells."),
            "Magic Initiate (Wizard)": FeatData(name="Magic Initiate (Wizard)", description="Similar to Magic Initiate (Cleric), but for Wizard spells."),
            "Musician": FeatData(name="Musician", description="You gain proficiency with three musical instruments of your choice. You learn the Friends cantrip. You can use a musical instrument as a spellcasting focus for any spell you cast that uses Charisma as its spellcasting ability."),
            "Savage Attacker": FeatData(name="Savage Attacker", description="Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon's damage dice and use either total."),
            "Skilled": FeatData(name="Skilled", description="You gain proficiency in any combination of three skills or tools of your choice."),
            "Tavern Brawler": FeatData(name="Tavern Brawler", description="Increase your Strength or Constitution score by 1, to a maximum of 20. You are proficient with improvised weapons. Your unarmed strike uses a d4 for damage..."),
            "Tough": FeatData(name="Tough", description="Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.")
        }

    def _load_all_data(self):
        self._load_feats()

        self.ability_score_info = AbilityScoreInfo(
            point_buy_costs={8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9},
            standard_array=[15, 14, 13, 12, 10, 8]
        )

        # --- SUBCLASSES (Sample - one per class for now, matching 2024 PHB expectations where known) ---
        # Note: Subclass features are simplified placeholders. Full details would be extensive.
        # Level for subclass feature choice: Barbarian (L3), Bard (L3), Cleric (L3), Druid (L3), Fighter (L3), Monk (L3), Paladin (L3)
        # Ranger (L3), Rogue (L3), Sorcerer (L1), Warlock (L1), Wizard (L2)

        sub_path_of_berserker = SubclassData(name="Path of the Berserker", parent_class_name="Barbarian", description="Channels rage into violent fury.", features={3: ["Frenzy", "Retaliation (Placeholder for 2024 features)"]})
        sub_college_of_lore = SubclassData(name="College of Lore", parent_class_name="Bard", description="Plumbs the depths of magical knowledge.", features={3: ["Bonus Proficiencies", "Cutting Words", "Magical Secrets (Placeholder for 2024 features)"]})
        sub_life_domain = SubclassData(name="Life Domain", parent_class_name="Cleric", description="Soothes the hurts of the world.", features={3: ["Disciple of Life", "Life Domain Spells", "Preserve Life (Channel Divinity)"]}) # Note: Clerics in 2024 choose subclass at L3.
        sub_circle_of_the_land = SubclassData(name="Circle of the Land", parent_class_name="Druid", description="Celebrates connection to the natural world.", features={3: ["Circle of the Land Spells", "Land's Aid (Channel Wild Shape)", "Natural Recovery (Placeholder for 2024 features)"]})
        sub_battle_master = SubclassData(name="Battle Master", parent_class_name="Fighter", description="A master of tactical combat and maneuvers.", features={3: ["Combat Superiority (Maneuvers)", "Student of War"]}) # Champion is another option, Battle Master is often popular.
        sub_warrior_of_shadow = SubclassData(name="Warrior of Shadow", parent_class_name="Monk", description="A stealthy monk using shadows and ki.", features={3: ["Shadow Arts", "Shadow Step (Placeholder for 2024 features)"]}) # Open Hand is another option.
        sub_oath_of_devotion = SubclassData(name="Oath of Devotion", parent_class_name="Paladin", description="Upholds ideals of justice and order.", features={3: ["Oath of Devotion Spells", "Sacred Weapon (Channel Divinity)", "Turn the Unholy (Channel Divinity)"]})
        sub_hunter = SubclassData(name="Hunter", parent_class_name="Ranger", description="Master of monster slaying.", features={3: ["Hunter's Prey (e.g., Colossus Slayer, Giant Killer, Horde Breaker)"]})
        sub_thief = SubclassData(name="Thief", parent_class_name="Rogue", description="Master of stealth and larceny.", features={3: ["Fast Hands", "Second-Story Work"]})
        sub_draconic_bloodline = SubclassData(name="Draconic Bloodline", parent_class_name="Sorcerer", description="Descended from dragons.", features={1: ["Dragon Ancestor", "Draconic Resilience"]})
        sub_the_great_old_one = SubclassData(name="The Great Old One", parent_class_name="Warlock", description="Pact with an elder entity.", features={1: ["Awakened Mind", "Entropic Ward (Placeholder for 2024 features)"]}) # Fiend is another option.
        sub_school_of_evocation = SubclassData(name="School of Evocation", parent_class_name="Wizard", description="Master of destructive magic.", features={2: ["Evocation Savant", "Sculpt Spells"]})

        # --- CLASSES ---
        self.classes = {
            "Barbarian": ClassData(name="Barbarian", description="A Fierce Warrior of Primal Rage.", hit_die=12, primary_abilities=["Strength"], saving_throw_proficiencies=["Strength", "Constitution"], skill_proficiency_options=["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Shields"], weapon_proficiencies=["Simple weapons", "Martial weapons"], starting_equipment_options=[{"option_set_A": ["Greataxe", "4 Handaxes", "Explorer’s Pack", "15 GP"]}, {"option_set_B": ["75 GP"]}], level_1_features=["Rage", "Unarmored Defense", "Weapon Mastery"], subclasses=[sub_path_of_berserker], subclass_data_status="Partial (More subclasses exist)"),
            "Bard": ClassData(name="Bard", description="An Inspiring Performer of Music, Dance, and Magic.", hit_die=8, primary_abilities=["Charisma"], saving_throw_proficiencies=["Dexterity", "Charisma"], skill_proficiency_options=["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], skill_proficiency_count=3, armor_proficiencies=["Light armor"], weapon_proficiencies=["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"], starting_equipment_options=[{"option_set_A": ["Leather Armor", "Dagger", "Musical Instrument (any)", "Entertainer’s Pack", "19 GP"]}, {"option_set_B": ["90 GP"]}], level_1_features=["Bardic Inspiration", "Spellcasting", "Weapon Mastery (Simple Weapons, Rapiers, Shortswords, Whips, Hand Crossbows)"], subclasses=[sub_college_of_lore], subclass_data_status="Partial (More subclasses exist)"),
            "Cleric": ClassData(name="Cleric", description="A Miraculous Priest of Divine Power.", hit_die=8, primary_abilities=["Wisdom"], saving_throw_proficiencies=["Wisdom", "Charisma"], skill_proficiency_options=["History", "Insight", "Medicine", "Persuasion", "Religion"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Shields"], weapon_proficiencies=["Simple weapons"], starting_equipment_options=[{"option_set_A": ["Chain Shirt", "Shield", "Mace", "Holy Symbol", "Priest’s Pack", "7 GP"]}, {"option_set_B": ["110 GP"]}], level_1_features=["Spellcasting", "Divine Order (Choose Martial or Magic at L1)"], level_1_choices={"Divine Order": ["Martial Order (Heavy Armor, Martial Weapons prof)", "Magic Order (Divine Spark feature)"]}, subclasses=[sub_life_domain], subclass_data_status="Partial (More subclasses exist, Divine Order choice details are simplified)"),
            "Druid": ClassData(name="Druid", description="A Nature Priest of Primal Power.", hit_die=8, primary_abilities=["Wisdom"], saving_throw_proficiencies=["Intelligence", "Wisdom"], skill_proficiency_options=["Animal Handling", "Arcana", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Shields (non-metal)"], weapon_proficiencies=["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"], starting_equipment_options=[{"option_set_A": ["Leather Armor", "Shield", "Scimitar", "Druidic Focus (Wooden Staff or Sprig of Mistletoe)", "Explorer’s Pack", "Herbalism Kit", "9 GP"]}, {"option_set_B": ["50 GP"]}], level_1_features=["Spellcasting", "Druidic", "Primal Order (Choose Scourge or Warden at L1)"], level_1_choices={"Primal Order": ["Primal Scourge (Wild Shape: Predatory Form)", "Primal Warden (Wild Shape: Resilient Form, +1 HP/level)"]}, subclasses=[sub_circle_of_the_land], subclass_data_status="Partial (More subclasses exist, Primal Order details simplified)"),
            "Fighter": ClassData(name="Fighter", description="A Master of All Arms and Armor.", hit_die=10, primary_abilities=["Strength", "Dexterity"], saving_throw_proficiencies=["Strength", "Constitution"], skill_proficiency_options=["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Heavy armor", "Shields"], weapon_proficiencies=["Simple weapons", "Martial weapons"], starting_equipment_options=[{"option_set_A": ["Chain Mail", "Greatsword (if Str 15+)", "Longsword and Shield", "8 Javelins", "Dungeoneer’s Pack", "4 GP"]}, {"option_set_B": ["Studded Leather Armor", "Rapier and Shield", "Longbow", "20 Arrows", "Quiver", "Dungeoneer’s Pack", "11 GP"]}, {"option_set_C": ["155 GP"]}], level_1_features=["Fighting Style", "Second Wind", "Weapon Mastery (choose 2)"], subclasses=[sub_battle_master], subclass_data_status="Partial (More subclasses exist)"),
            "Monk": ClassData(name="Monk", description="A Martial Artist of Supernatural Focus.", hit_die=8, primary_abilities=["Dexterity", "Wisdom"], saving_throw_proficiencies=["Strength", "Dexterity"], skill_proficiency_options=["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"], skill_proficiency_count=2, armor_proficiencies=[], weapon_proficiencies=["Simple weapons", "Shortswords", "Unarmed strikes are considered Monk weapons"], starting_equipment_options=[{"option_set_A": ["Shortsword", "10 Darts", "Explorer’s Pack", "11 GP"]}, {"option_set_B": ["50 GP"]}], level_1_features=["Martial Arts", "Unarmored Defense", "Weapon Mastery (Simple Weapons, Shortswords)"], subclasses=[sub_warrior_of_shadow], subclass_data_status="Partial (More subclasses exist, Hit Die set to d8 per task requirement)"),
            "Paladin": ClassData(name="Paladin", description="A Devout Warrior of Sacred Oaths.", hit_die=10, primary_abilities=["Strength", "Charisma"], saving_throw_proficiencies=["Wisdom", "Charisma"], skill_proficiency_options=["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Heavy armor", "Shields"], weapon_proficiencies=["Simple weapons", "Martial weapons"], starting_equipment_options=[{"option_set_A": ["Chain Mail", "Shield", "Longsword", "5 Javelins", "Holy Symbol", "Priest’s Pack", "9 GP"]}, {"option_set_B": ["150 GP"]}], level_1_features=["Lay on Hands", "Spellcasting", "Weapon Mastery (choose 1 from specific list)"], subclasses=[sub_oath_of_devotion], subclass_data_status="Partial (More subclasses exist)"),
            "Ranger": ClassData(name="Ranger", description="A Wandering Warrior Imbued with Primal Magic.", hit_die=10, primary_abilities=["Dexterity", "Wisdom"], saving_throw_proficiencies=["Strength", "Dexterity"], skill_proficiency_options=["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"], skill_proficiency_count=2, armor_proficiencies=["Light armor", "Medium armor", "Shields"], weapon_proficiencies=["Simple weapons", "Martial weapons"], starting_equipment_options=[{"option_set_A": ["Scale Mail", "Two Shortswords", "Explorer's Pack", "Longbow", "20 Arrows", "Quiver", "10 GP"]}, {"option_set_B": ["Leather Armor", "Two Simple Melee Weapons", "Dungeoneer's Pack", "Longbow", "20 Arrows", "Quiver", "10 GP"]}], level_1_features=["Expertise (choose 1 skill)", "Favored Enemy (choose creature type, gain advantage on Survival and one other skill)", "Spellcasting (New: L1 spellcasting for Ranger)", "Weapon Mastery (choose 1)"], subclasses=[sub_hunter], subclass_data_status="Partial (More subclasses exist, L1 features based on 2024 PHB)"),
            "Rogue": ClassData(name="Rogue", description="A Dexterous Expert in Stealth and Subterfuge.", hit_die=8, primary_abilities=["Dexterity"], saving_throw_proficiencies=["Dexterity", "Intelligence"], skill_proficiency_options=["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"], skill_proficiency_count=4, armor_proficiencies=["Light armor"], weapon_proficiencies=["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"], starting_equipment_options=[{"option_set_A": ["Rapier", "Shortbow", "20 Arrows", "Quiver", "Burglar's Pack", "Thieves' Tools"]}, {"option_set_B": ["Shortsword", "Shortbow", "20 Arrows", "Quiver", "Dungeoneer's Pack", "Thieves' Tools"]}, {"option_set_C": ["Two Daggers", "Thieves' Tools", "Explorer's Pack"]}], level_1_features=["Expertise (choose 2 skills)", "Sneak Attack", "Thieves' Cant", "Weapon Mastery (Finesse weapons, Simple ranged weapons)"], subclasses=[sub_thief], subclass_data_status="Partial (More subclasses exist)"),
            "Sorcerer": ClassData(name="Sorcerer", description="A Dazzling Mage Filled with Innate Magic.", hit_die=6, primary_abilities=["Charisma"], saving_throw_proficiencies=["Constitution", "Charisma"], skill_proficiency_options=["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"], skill_proficiency_count=2, armor_proficiencies=[], weapon_proficiencies=["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"], starting_equipment_options=[{"option_set_A": ["Light crossbow", "20 bolts", "Component pouch"]}, {"option_set_B": ["Any simple weapon", "Arcane focus (Crystal or Staff)"]}, {"option_set_C": ["Dungeoneer's Pack", "Two Daggers"]}], level_1_features=["Spellcasting", "Sorcerous Origin (Subclass chosen at L1)"], subclasses=[sub_draconic_bloodline], subclass_data_status="Partial (More subclasses exist)"),
            "Warlock": ClassData(name="Warlock", description="An Occultist Empowered by Otherworldly Pacts.", hit_die=8, primary_abilities=["Charisma"], saving_throw_proficiencies=["Wisdom", "Charisma"], skill_proficiency_options=["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"], skill_proficiency_count=2, armor_proficiencies=["Light armor"], weapon_proficiencies=["Simple weapons"], starting_equipment_options=[{"option_set_A": ["Light crossbow", "20 bolts", "Component pouch", "Leather Armor"]}, {"option_set_B": ["Any simple weapon", "Arcane focus (Rod or Wand)", "Leather Armor"]}, {"option_set_C": ["Scholar's Pack", "Leather Armor", "Any simple weapon", "Two Daggers"]}], level_1_features=["Otherworldly Patron (Subclass chosen at L1)", "Pact Magic"], subclasses=[sub_the_great_old_one], subclass_data_status="Partial (More subclasses exist)"),
            "Wizard": ClassData(name="Wizard", description="A Scholarly Magic-User of Arcane Power.", hit_die=6, primary_abilities=["Intelligence"], saving_throw_proficiencies=["Intelligence", "Wisdom"], skill_proficiency_options=["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"], skill_proficiency_count=2, armor_proficiencies=[], weapon_proficiencies=["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"], starting_equipment_options=[{"option_set_A": ["Quarterstaff", "Component pouch", "Spellbook"]}, {"option_set_B": ["Dagger", "Arcane focus (Orb or Wand)", "Spellbook"]}, {"option_set_C": ["Scholar's Pack", "Spellbook"]}], level_1_features=["Spellcasting", "Arcane Recovery", "Memorize Spells (New L1 feature)"], subclasses=[sub_school_of_evocation], subclass_data_status="Partial (More subclasses exist, Subclass chosen L2)")
        }

        # --- SPECIES (Based on 2024 PHB list, traits are simplified placeholders) ---
        self.species = {
            "Human": SpeciesData(name="Human", description="Resourceful and adaptable, humans are found throughout the multiverse.", racial_traits=["Resourceful (Extra Skill Prof)", "Skillful (Extra Tool Prof or Language)", "Versatile (Extra Feat at L1 - often assumed to be Tough or Skilled)"], speed=30, languages=["Common", "Choose one extra"], size="Medium"),
            "Elf": SpeciesData(name="Elf", description="Graceful and perceptive, with a long lifespan and deep connection to magic or nature.", racial_traits=["Darkvision", "Fey Ancestry (Adv. on saves vs. Charmed)", "Keen Senses (Prof. in Perception)", "Trance (Meditate 4 hrs for long rest benefit)"], speed=30, languages=["Common", "Elvish"], size="Medium"), # Specific subraces (Wood, High) would add more.
            "Dwarf": SpeciesData(name="Dwarf", description="Resilient and steadfast, known for their craftsmanship and endurance.", racial_traits=["Darkvision", "Dwarven Resilience (Adv. on saves vs. Poison, resistance to Poison dmg)", "Dwarven Toughness (+1 HP/level)", "Stonecunning (Bonus to History checks related to stonework)"], speed=25, languages=["Common", "Dwarvish"], size="Medium"), # Hill/Mountain would add more.
            "Halfling": SpeciesData(name="Halfling", description="Optimistic and cheerful, known for their luck and ability to avoid danger.", racial_traits=["Brave (Adv. on saves vs. Frightened)", "Halfling Nimbleness (Move through space of larger creature)", "Lucky (Reroll 1s on attack, ability, saving throws)"], speed=25, languages=["Common", "Halfling"], size="Small"), # Lightfoot/Stout would add more.
            "Dragonborn": SpeciesData(name="Dragonborn", description="Proud and honorable, with draconic ancestry.", racial_traits=["Draconic Ancestry (Choose dragon type for damage resistance and breath weapon)", "Breath Weapon (Action, damage type and save based on ancestry)", "Damage Resistance (Type based on ancestry)"], speed=30, languages=["Common", "Draconic"], size="Medium"),
            "Gnome": SpeciesData(name="Gnome", description="Curious and inventive, with a natural talent for illusion or engineering.", racial_traits=["Darkvision", "Gnome Cunning (Adv. on Int, Wis, Cha saves vs. magic)"], speed=25, languages=["Common", "Gnomish"], size="Small"), # Forest/Rock would add more.
            "Tiefling": SpeciesData(name="Tiefling", description="Descended from fiends, bearing physical marks of their infernal heritage.", racial_traits=["Darkvision", "Hellish Resistance (Fire resistance)", "Infernal Legacy (Thaumaturgy cantrip, Hellish Rebuke at L3, Darkness at L5)"], speed=30, languages=["Common", "Infernal"], size="Medium"), # Variant tieflings exist.
            "Orc": SpeciesData(name="Orc", description="Strong and fierce, often finding their place through might and determination.", racial_traits=["Darkvision", "Adrenaline Rush (Bonus action dash, temp HP)", "Powerful Build (Count as one size larger for carry capacity)"], speed=30, languages=["Common", "Orc"], size="Medium"),
            "Ardling": SpeciesData(name="Ardling", description="Celestial-touched beings with animalistic features and divine power.", racial_traits=["Celestial Legacy (Choose one: Exalted, Idyllic, or Heavenly)", "Divine Wings (Flight at L5, limited use)", "Animalistic Head (Varies, e.g., eagle, lion, bear)"], speed=30, languages=["Common", "Celestial"], size="Medium"),
            "Goliath": SpeciesData(name="Goliath", description="Towering folk from mountainous regions, known for their strength and athleticism.", racial_traits=["Giant Ancestry (Prof. Athletics)", "Little Giant (Adv. on Str saves and checks)", "Mountain Born (Cold resistance, acclimatized to high altitude)"], speed=30, languages=["Common", "Giant"], size="Medium")
        }

        # --- BACKGROUNDS (16 from 2024 PHB) ---
        self.backgrounds = {
            "Acolyte": BackgroundData(name="Acolyte", description="Service in a temple.", skill_proficiencies=["Insight", "Religion"], tool_proficiencies=[], languages_options=[], language_count=2, starting_feat_name="Magic Initiate (Cleric)", starting_equipment=[{"item": "Holy Symbol"}, {"item": "Prayer Book or Prayer Wheel"}, {"item": "5 sticks of incense"}, {"item": "Vestments"}, {"item": "Set of common clothes"}, {"item": "15 GP pouch"}]),
            "Artisan": BackgroundData(name="Artisan", description="Skilled in a craft.", skill_proficiencies=["Investigation", "Persuasion"], tool_proficiencies=["One type of artisan's tools"], languages_options=[], language_count=1, starting_feat_name="Crafter", starting_equipment=[{"item": "Set of artisan's tools (one of your choice)"}, {"item": "Letter of introduction from your guild"}, {"item": "Traveler's clothes"}, {"item": "15 GP pouch"}]),
            "Charlatan": BackgroundData(name="Charlatan", description="You have always had a way with people.", skill_proficiencies=["Deception", "Sleight of Hand"], tool_proficiencies=["Disguise kit", "Forgery kit"], languages_options=[], language_count=0, starting_feat_name="Skilled", starting_equipment=[{"item": "Set of fine clothes"}, {"item": "Disguise kit"}, {"item": "Tools of the con (e.g., weighted dice)"}, {"item": "15 GP pouch"}]),
            "Criminal": BackgroundData(name="Criminal", description="You have a history of breaking the law.", skill_proficiencies=["Deception", "Stealth"], tool_proficiencies=["One type of gaming set", "Thieves' tools"], languages_options=[], language_count=0, starting_feat_name="Alert", starting_equipment=[{"item": "Crowbar"}, {"item": "Set of dark common clothes including a hood"}, {"item": "15 GP pouch"}]),
            "Cultist": BackgroundData(name="Cultist", description="You are part of a secret society.", skill_proficiencies=["Arcana", "Religion"], tool_proficiencies=["Disguise kit"], languages_options=[], language_count=1, starting_feat_name="Magic Initiate (Wizard)", starting_equipment=[{"item": "Cultist robes"}, {"item": "Dagger"}, {"item": "Symbol of your cult"}, {"item": "10 GP pouch"}]), # Placeholder, this was one of the 16, replacing one from previous example
            "Entertainer": BackgroundData(name="Entertainer", description="You thrive in front of an audience.", skill_proficiencies=["Acrobatics", "Performance"], tool_proficiencies=["Disguise kit", "One type of musical instrument"], languages_options=[], language_count=0, starting_feat_name="Musician", starting_equipment=[{"item": "Musical instrument (one of your choice)"}, {"item": "Favor of an admirer"}, {"item": "Costume"}, {"item": "15 GP pouch"}]),
            "Farmer": BackgroundData(name="Farmer", description="You grew up on the land.", skill_proficiencies=["Animal Handling", "Nature"], tool_proficiencies=["Vehicles (land)"], languages_options=[], language_count=0, starting_feat_name="Tough", starting_equipment=[{"item": "Pitchfork (as Spear)"}, {"item": "Set of common clothes"}, {"item": "10 GP pouch"}]),
            "Gladiator": BackgroundData(name="Gladiator", description="You fought for sport.", skill_proficiencies=["Acrobatics", "Performance"], tool_proficiencies=[], languages_options=[], language_count=0, starting_feat_name="Savage Attacker", starting_equipment=[{"item": "Costume or distinctive weapon"}, {"item": "Favor of an admirer"}, {"item": "10 GP pouch"}]), # Placeholder, this was one of the 16
            "Guard": BackgroundData(name="Guard", description="You served as a guard.", skill_proficiencies=["Athletics", "Perception"], tool_proficiencies=[], languages_options=[], language_count=1, starting_feat_name="Alert", starting_equipment=[{"item": "Uniform"}, {"item": "Insignia of rank"}, {"item": "Horn"}, {"item": "Set of manacles"}, {"item": "10 GP pouch"}]),
            "Guide": BackgroundData(name="Guide", description="You know the wilds.", skill_proficiencies=["Stealth", "Survival"], tool_proficiencies=["Cartographer's tools or Navigator's tools"], languages_options=[], language_count=1, starting_feat_name="Magic Initiate (Druid)", starting_equipment=[{"item": "Staff"}, {"item": "Hunting trap"}, {"item": "Traveler's clothes"}, {"item": "10 GP pouch"}]),
            "Hermit": BackgroundData(name="Hermit", description="You lived in seclusion.", skill_proficiencies=["Medicine", "Religion"], tool_proficiencies=["Herbalism kit"], languages_options=[], language_count=1, starting_feat_name="Healer", starting_equipment=[{"item": "Scroll case with notes"}, {"item": "Winter blanket"}, {"item": "Common clothes"}, {"item": "Herbalism kit"}, {"item": "5 GP"}]),
            "Laborer": BackgroundData(name="Laborer", description="You are accustomed to hard work.", skill_proficiencies=["Athletics", "Endurance (Placeholder Skill, maybe Survival)"], tool_proficiencies=["Vehicles (land)"], languages_options=[], language_count=0, starting_feat_name="Tavern Brawler", starting_equipment=[{"item": "Shovel or Hammer"}, {"item": "Common clothes"}, {"item": "10 GP pouch"}]), # Placeholder, this was one of the 16
            "Merchant": BackgroundData(name="Merchant", description="You are an experienced trader.", skill_proficiencies=["Insight", "Persuasion"], tool_proficiencies=["Navigator's tools or one type of artisan's tools"], languages_options=[], language_count=1, starting_feat_name="Lucky", starting_equipment=[{"item": "Mule and cart (or equivalent value)"}, {"item": "Set of fine clothes"}, {"item": "25 GP pouch"}]),
            "Noble": BackgroundData(name="Noble", description="You come from a family of means.", skill_proficiencies=["History", "Persuasion"], tool_proficiencies=["One type of gaming set"], languages_options=[], language_count=1, starting_feat_name="Skilled", starting_equipment=[{"item": "Set of fine clothes"}, {"item": "Signet ring"}, {"item": "Scroll of pedigree"}, {"item": "25 GP pouch"}]),
            "Pilgrim": BackgroundData(name="Pilgrim", description="You are on a sacred journey.", skill_proficiencies=["Religion", "Survival"], tool_proficiencies=[], languages_options=[], language_count=1, starting_feat_name="Healer", starting_equipment=[{"item": "Holy symbol"}, {"item": "Traveler's clothes"}, {"item": "Staff"}, {"item": "10 GP pouch"}]), # Placeholder, this was one of the 16
            "Sage": BackgroundData(name="Sage", description="You spent years learning the lore of the multiverse.", skill_proficiencies=["Arcana", "History"], tool_proficiencies=[], languages_options=[], language_count=2, starting_feat_name="Magic Initiate (Wizard)", starting_equipment=[{"item": "Bottle of black ink"}, {"item": "Quill"}, {"item": "Small knife"}, {"item": "Letter from a dead colleague"}, {"item": "Common clothes"}, {"item": "10 GP pouch"}]),
            # Removed Sailor, Scribe, Soldier, Wayfarer to fit the 16 unique names from D&D Beyond list (Cultist, Gladiator, Laborer, Pilgrim added)
            # The original prompt listed 16 backgrounds, so I've adjusted to include a representative set of 16.
            # The exact list of 16 for 2024 PHB might vary slightly from this interpreted list.
        }


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

# Example usage (commented out for subtask)
# if __name__ == "__main__":
#     data_manager = DataManagementModule()
#     print(f"Loaded {len(data_manager.get_all_classes())} classes.")
#     for c in data_manager.get_all_classes():
#         print(f"  {c.name} (Subclass status: {c.subclass_data_status}) - Subclass chosen at L{ {1:1, 2:2, 3:3}.get(c.subclasses[0].features.keys[0] if c.subclasses and c.subclasses[0].features else 'N/A', 'N/A') if c.name not in ['Sorcerer', 'Warlock', 'Wizard'] else {'Sorcerer':1, 'Warlock':1, 'Wizard':2}.get(c.name, 'N/A') }")

#     print(f"Loaded {len(data_manager.get_all_species())} species.")
#     print(f"Loaded {len(data_manager.get_all_backgrounds())} backgrounds (target 16).")
#     fighter = data_manager.get_class("Fighter")
#     if fighter:
#         print(f"Fighter L1 features: {fighter.level_1_features}")
#         print(f"Fighter subclasses: {[sc.name for sc in fighter.subclasses]}")
#     human = data_manager.get_species("Human")
#     if human:
#         print(f"Human traits: {human.racial_traits}")
#     acolyte = data_manager.get_background("Acolyte")
#     if acolyte:
#         print(f"Acolyte feat: {acolyte.starting_feat_name}")
#         feat_info = data_manager.get_feat(acolyte.starting_feat_name)
#         if feat_info:
#             print(f"Acolyte feat description: {feat_info.description}")
