from typing import List, Dict, Tuple, Any
from dataclasses import dataclass

@dataclass
class Building:
    """
    Represents a building within a town.

    Attributes:
        name (str): The unique name of the building.
        type (str): The category of the building (e.g., 'tavern', 'market', 'house').
        position (Dict[str, int]): The x, y coordinates of the building's center or entrance.
                                   Example: {"x": 50, "y": 50}
    """
    name: str
    type: str
    position: Dict[str, int]

@dataclass
class Road:
    """
    Represents a road or path within a town.

    Attributes:
        name (str): A descriptive name for the road (e.g., "Main Street", "Path to Docks").
        points (List[Dict[str, int]]): A list of dictionaries, each representing a point (x,y)
                                       along the path of the road. Roads are defined by
                                       connecting these points sequentially.
                                       Example: [{"x": 0, "y": 75}, {"x": 200, "y": 75}]
    """
    name: str
    points: List[Dict[str, int]]

@dataclass
class Town:
    """
    Represents an entire town, including its layout and environment.

    Attributes:
        name (str): The name of the town.
        environment_type (str): The type of environment the town is situated in
                                (e.g., 'forest', 'plains', 'mountains').
        buildings (List[Building]): A list of Building objects located within the town.
        roads (List[Road]): A list of Road objects that make up the town's infrastructure.
    """
    name: str
    environment_type: str
    buildings: List[Building]
    roads: List[Road]

def generate_town_layout(town_name: str, environment: str) -> Town:
    """
    Generates a basic, hardcoded town layout for testing and placeholder purposes.

    The actual town generation logic will be more complex in future iterations,
    potentially using procedural generation algorithms based on the environment
    and other factors.

    Args:
        town_name (str): The desired name for the town.
        environment (str): The type of environment for the town (e.g., 'forest', 'plains').
                           This parameter is used to set the town's environment_type.

    Returns:
        Town: A Town object populated with a predefined set of buildings and roads.
    """
    # Placeholder: Generate a very simple, hardcoded town
    if environment == "plains":
        tavern_name = "The Dusty Hoof"
    elif environment == "forest":
        tavern_name = "The Whispering Leaf"
    else:
        tavern_name = "The Traveler's Rest"

    buildings = [
        Building(name=tavern_name, type="tavern", position={"x": 50, "y": 50}),
        Building(name="Town Market", type="market", position={"x": 100, "y": 100}),
        Building(name="Old Well", type="landmark", position={"x": 75, "y": 75})
    ]
    roads = [
        Road(name="Main Street", points=[{"x": 0, "y": 75}, {"x": 200, "y": 75}]),
        Road(name="Market Path", points=[{"x": 100, "y": 75}, {"x": 100, "y": 100}])
    ]

    # The environment parameter directly influences the town's environment_type.
    return Town(name=town_name, environment_type=environment, buildings=buildings, roads=roads)

if __name__ == '__main__':
    # This block allows for direct execution of this file for quick testing.
    # Example: python town_generator.py
    example_town = generate_town_layout("Testville", "forest")
    print(f"Generated town: {example_town.name} in a {example_town.environment_type} environment.")
    for building in example_town.buildings:
        print(f"- Building: {building.name} ({building.type}) at {building.position}")
    for road in example_town.roads:
        print(f"- Road: {road.name} with points {road.points}")

    example_plains_town = generate_town_layout("Dustyplain", "plains")
    print(f"\nGenerated town: {example_plains_town.name} in a {example_plains_town.environment_type} environment.")
    for building in example_plains_town.buildings:
        print(f"- Building: {building.name} ({building.type}) at {building.position}")
    for road in example_plains_town.roads:
        print(f"- Road: {road.name} with points {road.points}")
