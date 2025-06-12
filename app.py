from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dataclasses import asdict, is_dataclass

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
        return Town() # Return a dummy Town object


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
    # Handle custom classes like Town, Building, Road if they are not dataclasses
    if hasattr(obj, '__dict__'): # Check if it's a custom class instance
        return custom_asdict(obj.__dict__) # Recursively process the instance's dictionary
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
def get_town_map(town_id):
    """
    Generates and returns town map data.
    """
    try:
        # For now, environment can be hardcoded or potentially passed as a query param later
        # Example: environment = request.args.get('environment', 'forest')
        environment = "forest" # Hardcoded for now

        town_object = generate_town_layout(town_name=town_id, environment=environment)

        # Convert the Town object (and its nested Building/Road objects) to a dictionary
        town_dict = custom_asdict(town_object)

        return jsonify(town_dict)

    except FileNotFoundError: # Example: if town_generator.py itself is missing (though caught by top import)
        app.logger.error(f"Error: town_generator.py not found when generating town {town_id}.")
        return jsonify({"error": "Town generation module not found"}), 500
    except Exception as e:
        app.logger.error(f"Error generating town map for {town_id}: {e}")
        return jsonify({"error": "Could not generate town map", "details": str(e)}), 500

# --- Static File Serving ---
@app.route('/town_view.html')
def serve_town_view_html():
    """Serves the main town view HTML page."""
    # Serves from the root directory where app.py is located
    return send_from_directory('.', 'town_view.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    """
    Serves other static files like CSS and JS from the root directory.
    This allows town_view.html to correctly load town_view.css and town_view.js.
    """
    # Serves from the root directory where app.py is located
    return send_from_directory('.', filename)


if __name__ == '__main__':
    # Before running, ensure dnd_data_structures.py can be loaded
    # This might involve setting PYTHONPATH or ensuring the script is run from the project root.
    # Example: PYTHONPATH=. python app.py
    print("Attempting to start Flask server...")
    print("Data Management Module loaded:", "Dummy" if isinstance(data_manager, DataManagementModule) and not hasattr(data_manager, '_load_classes') else "Real")
    # Ensure town_generator parts are loaded for the new endpoint
    print("Town Generator loaded:", "Dummy" if Town.__module__ == __name__ else "Real") # Basic check if dummy Town is used
    app.run(debug=True, port=5001)
