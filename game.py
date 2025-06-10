import subprocess
import sys
from typing import Dict, Optional # Added for type hinting

def run_character_creator() -> Optional[Dict[str, str]]:
    """
    Runs the main_character_creator.py script as a separate process.
    This ensures that it runs in its own environment, which can be simpler
    for now than trying to directly import and call its main() if it has
    complex internal state or print handling not designed for library use.
    """
    print("\nLaunching Character Creator...")
    try:
        # Ensure python executable is correctly referenced, especially in diverse environments
        python_executable = sys.executable
        # Using check=True will raise CalledProcessError if the script exits with a non-zero code.
        # capture_output=False and text=False (or not setting them) allows the subprocess
        # to inherit the parent's stdout/stderr, so its print statements appear directly.
        process = subprocess.run([python_executable, "main_character_creator.py"], check=True)

        print("\nCharacter Creator finished.")
        # Here, you would typically load the character data created (e.g., from a file).
        # For now, we'll just simulate that a character was made and return a placeholder.
        # This placeholder would eventually be replaced by actual character data loading.
        return {"name": "New Character", "status": "Created - Data needs to be loaded", "class": "Unknown"} # Placeholder
    except FileNotFoundError:
        print("Error: main_character_creator.py not found. Make sure it's in the same directory.")
        return None
    except subprocess.CalledProcessError as e:
        print(f"Error running character creator script (it might have exited with an error): {e}")
        # The stdout/stderr from the script would have already been printed to the console.
        return None
    except Exception as e:
        print(f"An unexpected error occurred while trying to run character creator: {e}")
        return None

def game_loop(character_data: Dict[str, str]):
    print(f"\nWelcome to the game, {character_data.get('name', 'Adventurer')}!")
    print(f"You are a {character_data.get('class', 'mysterious entity')}.") # Example of using more data
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
    character: Optional[Dict[str, str]] = None # Store the current character data

    while True:
        print("\n--- Main Game Menu ---")
        print("1. New Game (Create Character)")
        print("2. Load Game (Not Implemented)")
        if character:
            print(f"3. Continue Adventure as {character.get('name', 'Current Character')}")
        print("4. Quit")

        choice = input("Enter your choice: ")

        if choice == '1':
            created_character_data = run_character_creator()
            if created_character_data:
                character = created_character_data
                print(f"Character '{character['name']}' is ready for an adventure.")
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
