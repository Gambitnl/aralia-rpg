# D&D 5e Race Data (SRD)

This directory contains JSON files with information about D&D 5th Edition races, focusing on content available under the System Reference Document (SRD).

## Source

Data was primarily scraped from the D&D 5th Edition SRD section on [roll20.net](https://roll20.net/compendium/dnd5e/).

## JSON File Structure

Each `.json` file in this directory representing an SRD race (e.g., `dragonborn.json`, `elf.json`, `half_elf.json`) generally follows the structure below:

*   `name`: (String) The name of the race (e.g., "Elf", "Dwarf").
*   `source`: (String) The source document from which the information was derived (e.g., "Free Basic Rules (2014)").
*   `description`: (String) A general introductory paragraph for the race.
*   `ability_score_increase`: (Object) Contains details about ability score modifications.
    *   `description`: (String) The textual description of the ASI (e.g., "Your Dexterity score increases by 2.").
    *   `abilities`: (Array of Objects) Lists fixed ability score increases.
        *   `name`: (String) The name of the ability (e.g., "Dexterity").
        *   `increase`: (Integer) The amount of the increase.
    *   `choose`: (Object, Optional) If the race allows choosing ASIs.
        *   `count`: (Integer) The number of abilities to choose.
        *   `from`: (Array of Strings) A list of abilities to choose from.
        *   `increase`: (Integer) The amount of the increase for chosen abilities.
*   `age`: (Object)
    *   `description`: (String) Textual description of the race's age and lifespan.
*   `alignment`: (Object)
    *   `description`: (String) Textual description of typical alignment tendencies.
*   `size`: (Object)
    *   `name`: (String) The size category (e.g., "Medium", "Small").
    *   `description`: (String) Textual description of height, weight, and general build.
*   `speed`: (Object)
    *   `base`: (Integer) The base walking speed in feet.
    *   `description`: (String) Textual description of speed, may include notes on armor.
*   `languages`: (Object) Describes language proficiencies.
    *   `static`: (Array of Strings) Languages all members of the race know.
    *   `choose`: (Object, Optional) If the race allows choosing additional languages.
        *   `count`: (Integer) The number of languages to choose.
        *   `from`: (String/Array of Strings) Description of where to choose from (e.g., "any standard language").
    *   `description`: (String) Full textual description of language proficiencies.
*   `traits`: (Array of Objects) Each object represents a racial trait.
    *   `name`: (String) The name of the trait (e.g., "Darkvision", "Fey Ancestry").
    *   `description`: (String) The textual description of the trait.
    *   `options_description`: (String, Optional) If the trait has complex options that were not fully parsed, this field might contain the original text.
    *   `options`: (Array of Objects, Optional) For traits with specific choices (e.g., Draconic Ancestry options for Dragonborn). Each option object will have its own relevant fields.
    *   `spells`: (Array of Objects, Optional) For traits granting spells (e.g., Tiefling's Infernal Legacy).
        *   `name`: (String) Spell name.
        *   `level_requirement`: (Integer) Character level to gain the spell.
        *   `type`: (String) e.g., "cantrip", "spell".
        *   `usage`: (String) e.g., "at will", "once per long rest".
        *   `spell_level_cast_at`: (Integer, Optional) If the spell is cast at a specific level.
        *   `spellcasting_ability`: (String) The ability score used for these spells.
*   `subraces`: (Array of Objects) Each object represents a subrace and generally follows a similar structure to the main race, detailing its unique name, description, ability score increases, and traits.

## Usage

This data is intended for use in applications such as D&D character builders, dynamic tooltips, or any system that needs structured information about player races.

## TODO Comments

Some fields, particularly within complex `traits` or `options_description`, may contain `// TODO:` comments. This indicates areas where the automated parsing was ambiguous or could not fully structure the data. These sections may require manual review, cross-referencing with official SRD sources, or more sophisticated parsing logic to be fully utilized.

## Expansion Race Data

This directory now also includes JSON files for various races and variants from D&D 5e expansion sourcebooks.

The primary source for this information is `dnd5e.wikidot.com`, and specific sourcebooks like 'Mordenkainen Presents: Monsters of the Multiverse' (MPMM), 'Eberron - Rising from the Last War' (ERLW), 'Volo's Guide to Monsters' (VGtM), and 'Elemental Evil Player's Companion' (EEPC) are noted within each file.

**File Structure for Expansion Races:** Each expansion race file (e.g., `aasimar.json`, `shifter.json`) contains a top-level `"name"` for the broad race concept and a `"variants"` array. Each object within the `"variants"` array represents a distinct published version of that race (e.g., its MPMM version, an Eberron-specific version, or an older version from a book like Volo's Guide).

Each variant object details its specific `"version_name"`, `"source"` (including a URL to the wikidot page), `"ability_score_increase"`, `"size"`, `"speed"`, `"creature_type"`, `"traits"`, and `"languages"`.

This structure allows for multiple official versions of a race to be represented and chosen from.

As this data is transcribed from a public wiki, always cross-reference with official source material if precise wording or mechanics are critical for your application.
