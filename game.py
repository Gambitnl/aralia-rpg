from typing import Any, Dict, Optional


def _get_attr(obj: Any, attr: str, default: Any = None) -> Any:
    """Helper to fetch attribute or dict key from character objects."""
    if isinstance(obj, dict):
        return obj.get(attr, default)
    return getattr(obj, attr, default)

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
        else:
            print(f"You try to '{action}'. Nothing happens yet.")
    print("Returning to main menu...")


def main_menu():
    character: Optional[Any] = None  # Store the current character data

    while True:
        print("\n--- Main Game Menu ---")
        print("1. New Game (Create Character)")
        print("2. Load Game (Not Implemented)")
        if character:
            char_name = _get_attr(character, 'name', 'Current Character')
            print(f"3. Continue Adventure as {char_name}")
        print("4. Quit")

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
            print("Load Game feature is not implemented yet.")
        elif choice == '3' and character:
            game_loop(character)
        elif choice == '4':
            print("Exiting game. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main_menu()
