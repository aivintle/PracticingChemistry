import json
import networkx as nx
from pyvis.network import Network
import webbrowser
import os

# --- DATA LOADING ---
# Get the absolute path to the directory where this script is located.
# This makes the script portable.
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to your JSON file by joining the script's directory
# with the relative path to your file.
# Replace 'folder1', 'folder2' if they are different.
file_path = os.path.join(script_dir, 'reactions.json')

# Load the JSON data for the chemical reactions from the specified path.
try:
    with open(file_path, 'r') as f:
        reaction_data = json.load(f)
    print(f"Successfully loaded data from {file_path}")
except FileNotFoundError:
    print(f"Error: '{file_path}' not found.")
    print("Please check that the path and filename are correct.")
    reaction_data = [] # Set to empty list to avoid crashing
except json.JSONDecodeError:
    print(f"Error: Could not decode '{file_path}'. Please ensure it is a valid JSON file.")
    reaction_data = [] # Exit gracefully if JSON is invalid

# --- GRAPH SETUP ---
# Proceed only if data was loaded successfully.
if reaction_data:
    # Create a directed graph object since reactions have a direction.
    G = nx.DiGraph()

    # A dictionary to hold node attributes, especially for coloring.
    node_attributes = {}

    # A color map for different functional groups.
    color_map = {
        "alcohol": "#1f77b4",
        "aldehyde": "#ff7f0e",
        "carboxylic-acid": "#2ca02c",
        "ketone": "#d62728",
        "alkene": "#9467bd",
        "halide": "#8c564b",
        "default": "#7f7f7f" # A default color for unmapped groups
    }

    # --- DATA PROCESSING ---
    # Iterate through each reaction in the data to build the graph.
    for reaction in reaction_data:
        # Basic validation to ensure keys exist
        if not all(k in reaction for k in ["reactants", "products", "reagents", "reaction_name", "functional_groups"]):
            print(f"Skipping malformed reaction entry: {reaction.get('reaction_name', 'N/A')}")
            continue

        reactant_name = reaction["reactants"][0]["iupac_name"]
        product_name = reaction["products"][0]["iupac_name"]
        
        # Store attributes for the reactant node.
        if reactant_name not in node_attributes:
            node_attributes[reactant_name] = {
                "color": color_map.get(reaction["functional_groups"][0], color_map["default"]),
                "title": f"SMILES: {reaction['reactants'][0]['smiles']}" # Hover text
            }
            
        # Store attributes for the product node.
        if product_name not in node_attributes:
            node_attributes[product_name] = {
                "color": color_map.get(reaction["functional_groups"][1], color_map["default"]),
                "title": f"SMILES: {reaction['products'][0]['smiles']}" # Hover text
            }

        # Add an edge from reactant to product, with the reagent as the label.
        G.add_edge(reactant_name, product_name, label=reaction["reagents"], title=reaction["reaction_name"])

    # Apply the collected attributes to the graph nodes.
    nx.set_node_attributes(G, node_attributes)

    # --- VISUALIZATION ---
    # Create a pyvis network object.
    # Configure it for a better layout and directed arrows.
    net = Network(height="800px", width="100%", bgcolor="#f8f9fa", font_color="#343a40", notebook=True, directed=True)

    # Load the graph from networkx.
    net.from_nx(G)

    # Enable physics-based layout for a nice force-directed graph.
    net.force_atlas_2based(gravity=-50, central_gravity=0.01, spring_length=150, spring_strength=0.08)

    # Generate the HTML file.
    output_filename = "reaction_network.html"
    try:
        net.show(output_filename)
        print(f"Successfully generated '{output_filename}'")
        
        # Automatically open the file in the default web browser.
        webbrowser.open('file://' + os.path.realpath(output_filename))
        
    except Exception as e:
        print(f"An error occurred during HTML generation: {e}")
else:
    print("No reaction data to process. Exiting.")

