from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
import os
import requests
from dataclasses import asdict, is_dataclass
from math import floor # Added for HP calculation
from math import floor # Added for HP calculation

# Attempt to import DataManagementModule and RulesEngine
try:
    from dnd_data_structures import DataManagementModule, SpeciesData, ClassData, SubclassData, FeatData, BackgroundData
    from dnd_character_logic import RulesEngine
    # Import town generator classes and function
    from town_generator import Town, Building, Road, generate_town_layout
except ImportError:
    print("Error: Could not import DataManagementModule, RulesEngine, or town_generator modules.")
    print("Ensure dnd_data_structures.py and town_generator.py are in the same directory or accessible in PYTHONPATH.")
    # Provide dummy implementations if the main module can't be loaded,
    # so the Flask app can still run for basic route testing.

    # Dummy town generator classes if import fails
    class Town: pass
    class Building: pass
    class Road: pass
    def generate_town_layout(town_name, environment):
        print("Using dummy generate_town_layout")
        # Return a dictionary structure similar to what custom_asdict would produce from a Town object
        return {
            "name": town_name,
            "environment_type": environment,
            "buildings": [{"name": "Dummy Building", "type": "dummy", "position": {"x":0, "y":0}}],
            "roads": [{"name": "Dummy Road", "points": [{"x":0,"y":0}, {"x":1,"y":1}]}]
        }

    class DataManagementModule:
        def get_all_species(self):
            print("Using dummy get_all_species")
            return []
        def get_all_classes(self):
            print("Using dummy get_all_classes")
            return []
        def get_all_backgrounds(self): # Dummy method
            print("Using dummy get_all_backgrounds")
            return []
        def get_all_feats(self): # Dummy method
            print("Using dummy get_all_feats")
            return []
        def get_ability_score_info(self): # Dummy method for RulesEngine
            print("Using dummy get_ability_score_info")
            return { # Return some plausible default structure
                "max_total_points": 27,
                "costs": {8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9},
                "min_score": 8,
                "max_score": 15
            }


    class SpeciesData: pass # Dummy class
    class ClassData: pass   # Dummy class
    class SubclassData: pass # Dummy class
    class FeatData: pass # Dummy class
    class BackgroundData: pass # Dummy class

    class RulesEngine: # Dummy class
        def __init__(self, data_management_module):
            print("Using dummy RulesEngine")
            self.data_manager = data_management_module
            self.ability_score_info = self.data_manager.get_ability_score_info()


        def validate_point_buy(self, base_scores):
            print(f"Dummy validating scores: {base_scores}")
            # Simplified dummy validation
            points_spent = 0
            for score_val in base_scores.values():
                points_spent += self.ability_score_info['costs'].get(int(score_val), 99) # Default to high cost

            if points_spent <= self.ability_score_info['max_total_points']:
                return True, f"Valid scores. Points spent: {points_spent}", points_spent
            else:
                return False, f"Invalid scores. Points spent: {points_spent} (Max: {self.ability_score_info['max_total_points']})", points_spent


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = 'super_secret_key_for_dev_recovery' # Essential for Flask session management

# --- Game State Management ---
def initialize_player_state():
    """Returns the initial default state for a new player."""
    return {
        "player_name": "Player1", # This can be updated later, e.g., by character creation
        "player_class": "Adventurer",
        "player_hp": 100,
        "player_max_hp": 100,
        "player_level": 1,
        "current_location": "Mysterious Forest Clearing",
        "location_description": "A quiet clearing surrounded by ancient, whispering trees. Paths lead north and east.",
        "inventory": [], # List of item names or objects
        "available_actions": ["explore", "look around", "inventory", "enter town"], # Actions available at current location
        "current_town_id": "starting_town",
        "messages": ["Welcome to the adventure! (Recovered Session)"] # Log of messages for the player
    }

# Custom JSON encoder for dataclasses and other complex types if needed
def custom_asdict(obj):
    if isinstance(obj, list):
        return [custom_asdict(o) for o in obj]
    if isinstance(obj, dict):
        return {k: custom_asdict(v) for k, v in obj.items()}
    if is_dataclass(obj) and not isinstance(obj, type): # Check if it's an instance, not the class itself
        # Convert known complex dataclasses recursively
        if isinstance(obj, ClassData):
            # Handle list of SubclassData within ClassData
            data = asdict(obj)
            if 'subclasses' in data and isinstance(data['subclasses'], list):
                data['subclasses'] = [custom_asdict(s) for s in data['subclasses']]
            return data
        return asdict(obj)
    return obj


try:
    data_manager = DataManagementModule()
    rules_engine = RulesEngine(data_manager) # Initialize RulesEngine
except Exception as e:
    print(f"Error initializing DataManagementModule or RulesEngine: {e}")
    data_manager = DataManagementModule() # Fallback to dummy if instantiation fails
    rules_engine = RulesEngine(data_manager) # Fallback to dummy if instantiation fails


@app.route('/api/validate_scores', methods=['POST'])
def validate_scores():
    try:
        data = request.get_json()
        if not data or 'scores' not in data:
            return jsonify({"error": "Missing 'scores' in request body"}), 400

        scores = data['scores']
        # Ensure scores are integers, as they might come as strings from JS input
        parsed_scores = {ability: int(value) for ability, value in scores.items()}

        is_valid, message, points_spent = rules_engine.validate_point_buy(parsed_scores)
        return jsonify({'is_valid': is_valid, 'message': message, 'points_spent': points_spent})
    except ValueError:
         return jsonify({"error": "Invalid score value. Scores must be integers."}), 400
    except Exception as e:
        app.logger.error(f"Error in /api/validate_scores: {e}")
        return jsonify({"error": "Could not validate scores", "details": str(e)}), 500

@app.route('/api/species', methods=['GET'])
def get_species():
    try:
        species_list = data_manager.get_all_species()
        # species_dicts = [asdict(species) for species in species_list]
        species_dicts = [custom_asdict(s) for s in species_list]
        return jsonify(species_dicts)
    except Exception as e:
        app.logger.error(f"Error in /api/species: {e}")
        return jsonify({"error": "Could not load species data", "details": str(e)}), 500

@app.route('/api/classes', methods=['GET'])
def get_classes():
    try:
        classes_list = data_manager.get_all_classes()
        # Convert list of ClassData objects to list of dictionaries
        # classes_dicts = [asdict(cls) for cls in classes_list]
        classes_dicts = [custom_asdict(c) for c in classes_list]
        return jsonify(classes_dicts)
    except Exception as e:
        app.logger.error(f"Error in /api/classes: {e}")
        return jsonify({"error": "Could not load class data", "details": str(e)}), 500

@app.route('/api/backgrounds', methods=['GET'])
def get_backgrounds():
    try:
        background_list = data_manager.get_all_backgrounds()
        background_dicts = [custom_asdict(b) for b in background_list]
        return jsonify(background_dicts)
    except Exception as e:
        app.logger.error(f"Error in /api/backgrounds: {e}")
        return jsonify({"error": "Could not load background data", "details": str(e)}), 500

@app.route('/api/feats', methods=['GET'])
def get_feats():
    try:
        feat_list = data_manager.get_all_feats()
        feat_dicts = [custom_asdict(f) for f in feat_list]
        return jsonify(feat_dicts)
    except Exception as e:
        app.logger.error(f"Error in /api/feats: {e}")
        return jsonify({"error": "Could not load feat data", "details": str(e)}), 500

# --- Town Generation API ---
@app.route('/api/town/<town_id>/map', methods=['GET'])
def get_town_map_api(town_id): # Renamed to avoid conflict with any other get_town_map
    """
    Generates and returns town map data using town_generator.
    """
    try:
        # Allow environment to be selected via query string, defaulting to 'forest'
        environment = request.args.get('env', 'forest')

        # generate_town_layout should return a Town object or a dict if using dummy
        town_data_obj = generate_town_layout(town_name=town_id, environment=environment)

        # Convert the Town object (and its nested Building/Road objects) to a dictionary
        # If town_data_obj is already a dict (from dummy), custom_asdict should handle it.
        town_dict = custom_asdict(town_data_obj)

        return jsonify(town_dict)

    except Exception as e: # Catching a broader exception range
        app.logger.error(f"Error generating town map for {town_id}: {e}")
        # Fallback to a very basic JSON response in case of error with town generation
        return jsonify({
            "name": town_id,
            "environment_type": "error_environment",
            "error": str(e),
            "buildings": [],
            "roads": []
        }), 500

# --- Helper Functions ---
def calculate_hp(character_class_data, final_ability_scores):
    """
    Calculates HP for a level 1 character.
    Args:
        character_class_data (dict): Dictionary representing the character's class data.
        final_ability_scores (dict): Dictionary of the character's final ability scores.
    Returns:
        int: Calculated HP.
    """
    hit_die_value = character_class_data.get('hit_die', 6) # Default to d6 if not specified
    constitution_score = final_ability_scores.get('Constitution', 10) # Default to 10 if not specified
    constitution_modifier = floor((constitution_score - 10) / 2)
    return hit_die_value + constitution_modifier

# --- Main Game API Endpoints ---
@app.route('/api/game/initialize_with_character', methods=['POST'])
def initialize_game_with_character():
    """
    Initializes or re-initializes the game state in the session
    using character data received from the character creator.
    """
    character_data = request.json
    if not character_data:
        return jsonify({"success": False, "error": "No character data received"}), 400

    try:
        new_game_state = initialize_player_state() # Get a fresh default state

        # Update state with character data
        new_game_state['player_name'] = character_data.get('name', 'Adventurer')

        player_class_data = character_data.get('class_details', {})
        if not player_class_data and 'class' in character_data :
             player_class_data = character_data.get('class', {})

        new_game_state['player_class'] = player_class_data.get('name', 'Unknown Class')

        final_scores = character_data.get('final_ability_scores', {})

        calculated_hp = calculate_hp(player_class_data, final_scores)
        new_game_state['player_hp'] = calculated_hp
        new_game_state['player_max_hp'] = calculated_hp
        new_game_state['player_level'] = 1

        new_game_state['inventory'] = character_data.get('chosen_equipment_set', [])

        new_game_state['messages'] = [
            f"Welcome, {new_game_state['player_name']} the {new_game_state['player_class']}! Your adventure begins."
        ]

        session['game_state'] = new_game_state
        session.modified = True

        return jsonify({"success": True, "message": "Game state initialized with character.", "game_state": new_game_state})

    except Exception as e:
        app.logger.error(f"Error initializing game with character: {e}")
        return jsonify({"success": False, "error": "Failed to initialize game with character data", "details": str(e)}), 500


@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    """
    Retrieves the current player's game state from the session.
    Initializes the state if it's not already present.
    """
    if 'game_state' not in session:
        session['game_state'] = initialize_player_state()
        session.modified = True # Mark session as modified as we've added game_state
    return jsonify(session['game_state'])

@app.route('/api/game/action', methods=['POST'])
def handle_game_action():
    """
    Handles player actions and updates the game state stored in the session.
    """
    if 'game_state' not in session:
        # This should ideally not happen if client calls /api/game/state first,
        # but as a fallback, initialize the state.
        session['game_state'] = initialize_player_state()

    action_data = request.json
    if not action_data or 'action' not in action_data:
        return jsonify({"error": "Missing 'action' in request payload"}), 400

    action = action_data['action'].lower() # Normalize action to lowercase
    game_state = session['game_state']
    message = ""

    # Prepare response_data by copying the current game_state.
    # This allows adding transient flags to the response without persisting them in session.
    response_data = game_state.copy()
    # Ensure transient flags from previous calls are not accidentally carried over in a new response
    response_data.pop('trigger_town_navigation', None)


    # --- Action Processing Logic ---
    if action == "look around":
        description = game_state.get('location_description', "It's a bit murky here.")
        message = f"You look around. {description}"
    elif action == "explore":
        current_loc = game_state.get('current_location', 'the area')
        message = f"You explore deeper into the {current_loc}... You've discovered a path leading to a small settlement!"
        game_state['location_description'] = "You are at the outskirts of a small settlement. A well-worn path leads into it."
        if "enter town" not in game_state['available_actions']:
            game_state['available_actions'].append("enter town")
        response_data['available_actions'] = list(game_state['available_actions']) # Ensure it's a fresh copy for response
        response_data['location_description'] = game_state['location_description']
    elif action == "inventory":
        inventory_items = game_state.get('inventory', [])
        if not inventory_items:
            message = "Your inventory is empty."
        else:
            message = "You have: " + ", ".join(inventory_items) + "."
    elif action == "enter town":
        message = "You decide to head towards the nearby town..."
        game_state['current_town_id'] = "test_town" # Persistently store which town player is near/in
        response_data['current_town_id'] = game_state['current_town_id'] # Ensure response has it
        response_data['trigger_town_navigation'] = True # Add trigger only to the response
        # Note: available_actions might change once "in town", handled by subsequent state or specific town API
    elif action == "leave town":
        message = "You leave the town and return to the wilds."
        game_state.pop('current_town_id', None)
    else:
        message = f"Action '{action}' is not recognized or currently available."

    # --- Update Messages Log (in persistent session state) ---
    if 'messages' not in game_state:
        game_state['messages'] = []
    game_state['messages'].append(message)

    max_messages = 20
    if len(game_state['messages']) > max_messages:
        game_state['messages'] = game_state['messages'][-max_messages:]

    # Update the messages in response_data to match the (potentially truncated) list
    response_data['messages'] = game_state['messages']

    # Mark the session as modified because game_state (messages, current_town_id) was changed
    session.modified = True

    return jsonify(response_data) # Return the response_data, which includes the one-time trigger if set


@app.route('/api/game/leave_town', methods=['POST'])
def leave_town():
    if 'game_state' not in session:
        session['game_state'] = initialize_player_state()
    game_state = session['game_state']
    game_state.pop('current_town_id', None)
    session.modified = True
    return jsonify(game_state)

# --- Gemini API Proxy (for local development) ---
@app.route('/api/gemini', methods=['POST'])
def gemini_proxy():
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({'message': 'Prompt is required'}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        app.logger.warning('GEMINI_API_KEY not set')
        return jsonify({'message': 'API key not configured'}), 500

    api_url = (
        'https://generativelanguage.googleapis.com/v1beta/models/'
        f'gemini-2.0-flash:generateContent?key={api_key}'
    )
    payload = {
        'contents': [{'role': 'user', 'parts': [{'text': data['prompt']}]}]
    }

    try:
        resp = requests.post(api_url, json=payload)
        if not resp.ok:
            app.logger.error('Gemini API Error: %s', resp.text)
            return jsonify({'message': 'Error from Gemini API'}), resp.status_code

        gemini_result = resp.json()
        text = (
            gemini_result.get('candidates', [{}])[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', '')
        )
        return jsonify({'text': text})
    except Exception as e:
        app.logger.error('Error calling Gemini API: %s', e)
        return jsonify({'message': 'Internal server error'}), 500

# --- Static File Serving ---
# It's important that API routes are defined before the generic static file routes,
# to avoid '<path:filename>' accidentally catching API calls.

@app.route('/')
def serve_index():
    """Serves the main index.html page."""
    return send_from_directory('.', 'index.html')

@app.route('/game')
def serve_main_game_html():
    """Serves the main game interface HTML page."""
    # Assumes main_game.html is in the root directory alongside app.py
    return send_from_directory('.', 'main_game.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    """
    Serves other static files like CSS and JS from the root directory.
    This allows HTML pages to correctly load their associated assets.
    Example: main_game.html can load main_game.js and main_game.css
    """
    # Serves from the root directory where app.py is located
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # Before running, ensure dnd_data_structures.py can be loaded
    # This might involve setting PYTHONPATH or ensuring the script is run from the project root.
    # Example: PYTHONPATH=. python app.py
    print("Attempting to start Flask server...")
    print("Data Management Module loaded:", "Dummy" if isinstance(data_manager, DataManagementModule) and not hasattr(data_manager, '_load_classes') else "Real")
    # Check if Town class is the dummy one or the real one for logging
    town_module_origin = "town_generator" if 'Town' in globals() and hasattr(Town, '__module__') and Town.__module__ == 'town_generator' else "dummy"
    print(f"Town module loaded: {town_module_origin}")
    app.run(debug=True, port=5001)
