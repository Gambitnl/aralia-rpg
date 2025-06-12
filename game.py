from typing import Any, Dict, Optional
import json
import webbrowser # Added for opening web pages
from dataclasses import asdict, is_dataclass


def _get_attr(obj: Any, attr: str, default: Any = None) -> Any:
    """Helper to fetch attribute or dict key from character objects."""
    if isinstance(obj, dict):
        return obj.get(attr, default)
    return getattr(obj, attr, default)


def save_game(character: Any, filename: str = "saved_game.json") -> None:
    """Serialize the current character to a JSON file."""
    if character is None:
        print("No character to save.")
        return
    try:
        if is_dataclass(character):
            data = asdict(character)
        elif isinstance(character, dict):
            data = character
        else:
            data = character.__dict__  # type: ignore[attr-defined]
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Game saved to {filename}.")
    except Exception as e:  # broad catch to avoid crashing game menu
        print(f"Failed to save game: {e}")


def load_game(filename: str = "saved_game.json") -> Optional[Any]:
    """Load character data from a JSON file."""
    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
        try:
            from dnd_character_logic import CharacterState

            if isinstance(data, dict):
                character = CharacterState(**data)
            else:
                character = data
        except Exception:
            character = data
        print(f"Game loaded from {filename}.")
        return character
    except FileNotFoundError:
        print(f"Save file {filename} not found.")
    except Exception as e:
        print(f"Failed to load game: {e}")
    return None


def display_character(character: Any) -> None:
    """Print a summary of the current character."""
    if character is None:
        print("No character loaded.")
        return
    if isinstance(character, dict):
        for key, value in character.items():
            print(f"{key}: {value}")
    else:
        for field in getattr(character, "__dataclass_fields__", {}):
            print(f"{field}: {_get_attr(character, field)}")

def run_character_creator() -> Optional[Any]:
    """Launch the character creator and return the resulting character object."""
    print("\nLaunching Character Creator...")
    try:
        import main_character_creator
        character = main_character_creator.create_character()
        print("\nCharacter Creator finished.")
        return character
    except ImportError:
        print("Error: main_character_creator.py not found. Make sure it's in the same directory.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while trying to run character creator: {e}")
        return None

def game_loop(character_data: Any):
    name = _get_attr(character_data, 'name', 'Adventurer')
    char_class = _get_attr(character_data, 'class', _get_attr(character_data, 'class_name', 'mysterious entity'))
    print(f"\nWelcome to the game, {name}!")
    print(f"You are a {char_class}.")
    print("The adventure begins... (Game logic not implemented yet)")
    # Placeholder for actual game play
    while True:
        action = input("What do you do? (type 'exit' to return to menu): ").lower()
        if action == 'exit':
            break
        elif action == 'look':
            print("You look around. It's a world full of possibilities (and placeholders).")
        elif action == 'enter town':
            print("You approach the gates of a nearby settlement...")
            # For now, town_id is not explicitly passed to town_view.html via URL parameters
            # town_view.js currently uses a hardcoded 'test_town_id' for its API call.
            # This setup assumes app.py serves town_view.html at the root.
            town_url = "http://127.0.0.1:5001/town_view.html"
            try:
                if webbrowser.open(town_url):
                    print(f"The town view has been opened in your web browser at {town_url}")
                    print("Interact with it there. Type 'exit town' here when you are done.")
                else:
                    print(f"Attempted to open town view. Please manually open this URL in your browser: {town_url}")
            except Exception as e:
                print(f"Could not open web browser: {e}. Please manually open this URL: {town_url}")
        elif action == 'exit town':
            print("You have left the town and returned to your previous location.")
        else:
            print(f"You try to '{action}'. Nothing happens yet.")
    print("Returning to main menu...")


def main_menu():
    character: Optional[Any] = None  # Store the current character data

    while True:
        print("\n--- Main Game Menu ---")
        print("1. New Game (Create Character)")
        print("2. Load Game")
        print("3. Save Game")
        print("4. View Current Character")
        print("5. Continue Adventure")
        print("6. Quit")

        choice = input("Enter your choice: ")

        if choice == '1':
            created_character_data = run_character_creator()
            if created_character_data:
                character = created_character_data
                char_name = _get_attr(character, 'name', 'Unnamed Character')
                print(f"Character '{char_name}' is ready for an adventure.")
                # Optionally, ask if they want to start immediately
                if input("Start adventure now? (yes/no): ").lower() == 'yes':
                    game_loop(character)
            else:
                print("Character creation was not completed or was cancelled.")
        elif choice == '2':
            loaded = load_game()
            if loaded is not None:
                character = loaded
        elif choice == '3':
            if character:
                save_game(character)
            else:
                print("No character loaded to save.")
        elif choice == '4':
            display_character(character)
        elif choice == '5':
            if character:
                game_loop(character)
            else:
                print("No character loaded.")
        elif choice == '6':
            print("Exiting game. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main_menu()
