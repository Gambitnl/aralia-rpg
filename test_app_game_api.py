import unittest
import json
from math import floor

# Attempt to import app components.
# This structure assumes app.py can be imported and 'app' is the Flask instance.
# If app.py runs the app on import (if __name__ == "__main__": app.run()),
# that could be an issue for testing. It's better if app.run() is guarded.
# For now, we assume 'app' can be imported.
try:
    from app import app, initialize_player_state, calculate_hp
except ImportError as e:
    print(f"Error importing from app: {e}. Make sure app.py is structured for import.")
    # Provide dummy implementations if app components can't be loaded for some reason,
    # so the test file itself can be parsed. These tests would then fail.
    class MockApp:
        def test_client(self): return None
        testing = False
        secret_key = None
    app = MockApp()
    def initialize_player_state(): return {}
    def calculate_hp(cd, fs): return 0


class TestGameAPI(unittest.TestCase):
    """
    Test suite for the Game API endpoints in app.py.
    """

    def setUp(self):
        """Set up the test client and app configuration for each test."""
        app.testing = True
        self.client = app.test_client()
        # Setting a distinct secret key for tests is good practice.
        app.secret_key = 'test_secret_key_for_game_api'
        # Ensure a clean session for each test by clearing it,
        # or by ensuring tests don't rely on state from previous tests
        # unless explicitly designed to. For these sequence-named tests,
        # we'll allow session state to persist across them within a single run.
        # If tests were to be run in isolation, each would need full setup.
        with self.client:
            # Clearing session if needed:
            # with self.client.session_transaction() as sess:
            # sess.clear()
            pass


    def test_01_get_initial_game_state(self):
        """Test fetching the initial game state."""
        with self.client:
            response = self.client.get('/api/game/state')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))

            self.assertIn('player_name', data)
            self.assertEqual(data['player_name'], 'Player1') # From initialize_player_state
            self.assertIn('current_location', data)
            self.assertIn('messages', data)
            self.assertTrue(len(data['messages']) > 0)
            self.assertIn("Welcome to the adventure!", data['messages'][0])


    def test_02_initialize_with_character(self):
        """Test initializing the game state with character data."""
        sample_char_data = {
            "name": "TestChar",
            "class_details": {"name": "Warrior", "hit_die": 10},
            "final_ability_scores": {"Constitution": 14}, # Con modifier +2
            "chosen_equipment_set": ["sword", "shield"]
        }
        expected_hp = 10 + floor((14 - 10) / 2) # 10 (hit_die) + 2 (Con mod) = 12

        with self.client:
            response = self.client.post('/api/game/initialize_with_character', json=sample_char_data)
            self.assertEqual(response.status_code, 200)
            init_response_data = json.loads(response.data.decode('utf-8'))
            self.assertTrue(init_response_data.get('success'))

            # Check the game_state returned in the initialization response
            game_state = init_response_data.get('game_state', {})
            self.assertEqual(game_state.get('player_name'), "TestChar")
            self.assertEqual(game_state.get('player_class'), "Warrior")
            self.assertEqual(game_state.get('player_hp'), expected_hp)
            self.assertEqual(game_state.get('player_max_hp'), expected_hp)
            self.assertEqual(game_state.get('inventory'), ["sword", "shield"])
            self.assertIn("Welcome, TestChar the Warrior!", game_state['messages'][0])

            # Also verify by fetching state separately
            response_get = self.client.get('/api/game/state')
            self.assertEqual(response_get.status_code, 200)
            game_state_get = json.loads(response_get.data.decode('utf-8'))
            self.assertEqual(game_state_get.get('player_name'), "TestChar")
            self.assertEqual(game_state_get.get('player_hp'), expected_hp)


    def test_03_perform_action_look_around(self):
        """Test the 'look around' action."""
        with self.client:
            # Ensure game is initialized (either by previous test or explicitly here)
            self.client.get('/api/game/state') # Initializes if not already

            action_payload = {"action": "look around"}
            response = self.client.post('/api/game/action', json=action_payload)
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))

            self.assertIn('messages', data)
            self.assertTrue(len(data['messages']) > 0)
            # The default location description is "A quiet clearing..."
            self.assertIn("You look around. A quiet clearing surrounded by ancient, whispering trees.", data['messages'][-1])


    def test_04_perform_action_explore(self):
        """Test the 'explore' action."""
        with self.client:
            self.client.get('/api/game/state') # Initialize if needed

            action_payload = {"action": "explore"}
            response = self.client.post('/api/game/action', json=action_payload)
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))

            self.assertIn('messages', data)
            self.assertTrue(len(data['messages']) > 0)
            # Default location is "Mysterious Forest Clearing"
            self.assertIn(
                "You explore deeper into the Mysterious Forest Clearing... You've discovered a path leading to a small settlement!",
                data['messages'][-1]
            )

    def test_05_perform_action_inventory_empty(self):
        """Test the 'inventory' action when inventory is empty."""
        with self.client:
            # Initialize with default character, which has empty inventory initially
            # (unless initialize_with_character was called in a way that it persists for this test client session)
            # To be certain, let's use initialize_with_character with empty equipment.
            sample_char_data = {
                "name": "InvTestChar",
                "class_details": {"name": "Scout", "hit_die": 8},
                "final_ability_scores": {"Constitution": 12},
                "chosen_equipment_set": [] # Empty inventory
            }
            self.client.post('/api/game/initialize_with_character', json=sample_char_data)

            action_payload = {"action": "inventory"}
            response = self.client.post('/api/game/action', json=action_payload)
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))

            self.assertIn('messages', data)
            self.assertTrue(len(data['messages']) > 0)
            self.assertIn("Your inventory is empty.", data['messages'][-1])

    def test_06_perform_action_enter_town(self):
        """Test the 'enter town' action and navigation trigger."""
        with self.client:
            self.client.get('/api/game/state') # Initialize game state

            action_payload = {"action": "enter town"}
            response = self.client.post('/api/game/action', json=action_payload)
            self.assertEqual(response.status_code, 200)
            response_data = json.loads(response.data.decode('utf-8'))

            self.assertTrue(response_data.get('trigger_town_navigation'))
            self.assertEqual(response_data.get('current_town_id'), "test_town")
            self.assertIn("You decide to head towards the nearby town...", response_data['messages'][-1])

            # Verify the trigger is not in the persistent session state
            session_response = self.client.get('/api/game/state')
            self.assertEqual(session_response.status_code, 200)
            session_data = json.loads(session_response.data.decode('utf-8'))
            self.assertNotIn('trigger_town_navigation', session_data) # Key should be absent
            self.assertEqual(session_data.get('current_town_id'), "test_town") # current_town_id should persist


    def test_07_action_message_log_truncation(self):
        """Test that the message log is truncated to max_messages (e.g., 20)."""
        with self.client:
            self.client.get('/api/game/state') # Initialize game state

            action_payload = {"action": "explore"} # An action that generates a message
            num_actions = 25
            for _ in range(num_actions):
                self.client.post('/api/game/action', json=action_payload)

            response = self.client.get('/api/game/state')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))

            self.assertIn('messages', data)
            # The app.py has max_messages = 20
            self.assertEqual(len(data['messages']), 20)
            # The first message should be the (num_actions - 20 + 1)-th "explore" message,
            # as the initial welcome message would have been pushed out.
            # Or, if the welcome message is always preserved, adjust logic.
            # Current app.py logic does not preserve initial message if log overflows.


    def test_calculate_hp_helper(self):
        """Directly test the calculate_hp helper function."""
        # Test case 1: Positive modifier
        class_data_1 = {"name": "Fighter", "hit_die": 10}
        scores_1 = {"Constitution": 14} # Modifier +2
        self.assertEqual(calculate_hp(class_data_1, scores_1), 10 + 2)

        # Test case 2: Zero modifier
        class_data_2 = {"name": "Wizard", "hit_die": 6}
        scores_2 = {"Constitution": 10} # Modifier +0
        self.assertEqual(calculate_hp(class_data_2, scores_2), 6 + 0)

        # Test case 3: Negative modifier
        class_data_3 = {"name": "Sorcerer", "hit_die": 6}
        scores_3 = {"Constitution": 7}  # Modifier -2
        self.assertEqual(calculate_hp(class_data_3, scores_3), 6 - 2)

        # Test case 4: Missing hit_die in class_data (should default to 6)
        class_data_4 = {"name": "CustomClass"}
        scores_4 = {"Constitution": 12} # Modifier +1
        self.assertEqual(calculate_hp(class_data_4, scores_4), 6 + 1)

        # Test case 5: Missing Constitution in scores (should default to 10, mod 0)
        class_data_5 = {"name": "Barbarian", "hit_die": 12}
        scores_5 = {}
        self.assertEqual(calculate_hp(class_data_5, scores_5), 12 + 0)

    def test_08_get_town_map(self):
        """Test town map API returns JSON structure."""
        with self.client:
            response = self.client.get('/api/town/testville/map?env=plains')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data.decode('utf-8'))
            self.assertEqual(data.get('name'), 'testville')
            self.assertEqual(data.get('environment_type'), 'plains')
            self.assertIn('buildings', data)

if __name__ == '__main__':
    unittest.main()
