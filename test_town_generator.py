import unittest
from town_generator import Town, Building, Road, generate_town_layout

class TestTownGenerator(unittest.TestCase):
    """
    Test suite for the town_generator module.
    """

    def test_generate_town_layout_basic(self):
        """
        Tests the basic functionality of generate_town_layout with default 'forest' environment.
        It verifies the town's name, environment, structure, and hardcoded elements.
        """
        town_name = "Testville"
        environment = "forest"
        town = generate_town_layout(town_name=town_name, environment=environment)

        # Test basic town properties
        self.assertIsInstance(town, Town, "Generated object should be an instance of Town.")
        self.assertEqual(town.name, town_name, f"Town name should be '{town_name}'.")
        self.assertEqual(town.environment_type, environment, f"Town environment should be '{environment}'.")

        # Test structure of buildings and roads lists
        self.assertIsInstance(town.buildings, list, "Town buildings should be a list.")
        self.assertIsInstance(town.roads, list, "Town roads should be a list.")

        # Test specific hardcoded buildings (based on current implementation)
        self.assertTrue(len(town.buildings) >= 2, "Should have at least two hardcoded buildings.")

        # Check the first hardcoded building (Tavern)
        building1 = town.buildings[0]
        self.assertIsInstance(building1, Building, "First building should be an instance of Building.")
        self.assertEqual(building1.name, "The Prancing Pony", "First building's name is incorrect.")
        self.assertEqual(building1.type, "tavern", "First building's type is incorrect.")
        self.assertEqual(building1.position, (0,0), "First building's position is incorrect.")

        # Check the second hardcoded building (Market)
        building2 = town.buildings[1]
        self.assertIsInstance(building2, Building, "Second building should be an instance of Building.")
        self.assertEqual(building2.name, "Town Market", "Second building's name is incorrect.")
        self.assertEqual(building2.type, "market", "Second building's type is incorrect.")
        self.assertEqual(building2.position, (5,5), "Second building's position is incorrect.")

        # Test specific hardcoded road
        self.assertTrue(len(town.roads) >= 1, "Should have at least one hardcoded road.")
        road1 = town.roads[0]
        self.assertIsInstance(road1, Road, "First road should be an instance of Road.")
        self.assertEqual(road1.points, [(0, 1), (1, 1), (2, 1), (3, 1), (4, 1), (5, 1)], "First road's points are incorrect.")

    def test_generate_town_layout_different_environment(self):
        """
        Tests if generate_town_layout correctly uses a different environment type ('plains').
        This primarily checks if the environment parameter is passed through and set on the Town object.
        """
        town_name = "DustyGulch"
        environment = "plains"
        town = generate_town_layout(town_name=town_name, environment=environment)

        # Test basic town properties with the new environment
        self.assertIsInstance(town, Town, "Generated object should be an instance of Town for 'plains' environment.")
        self.assertEqual(town.name, town_name, f"Town name should be '{town_name}' for 'plains' environment.")
        self.assertEqual(town.environment_type, environment, f"Town environment should be '{environment}'.")

        # Also check that buildings and roads are still generated (even if they are the same hardcoded ones)
        self.assertIsInstance(town.buildings, list, "Town buildings should be a list for 'plains' environment.")
        self.assertTrue(len(town.buildings) > 0, "Town should have buildings even in 'plains' environment.")
        self.assertIsInstance(town.roads, list, "Town roads should be a list for 'plains' environment.")
        self.assertTrue(len(town.roads) > 0, "Town should have roads even in 'plains' environment.")

if __name__ == '__main__':
    unittest.main()
