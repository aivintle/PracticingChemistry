import json
import networkx as nx
from pyvis.network import Network
import webbrowser
import os

# --- DATA LOADING ---
# Get the absolute path to the directory where this script is located.
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to your JSON file.
file_path = os.path.join(script_dir, 'reactions.json')

# Load the JSON data for the chemical reactions.
try:
    with open(file_path, 'r') as f:
        reaction_data = json.load(f)
    print(f"Successfully loaded data from {file_path}")
except FileNotFoundError:
    print(f"Error: '{file_path}' not found. Please ensure it is in the same directory as the script.")
    reaction_data = []
except json.JSONDecodeError:
    print(f"Error: Could not decode '{file_path}'. Please ensure it is a valid JSON file.")
    reaction_data = []

# --- GRAPH SETUP ---
if reaction_data:
    # Create a directed graph.
    G = nx.DiGraph()

    # A dictionary to hold node attributes before adding them to the graph.
    node_attributes = {}

    # Expanded color map for different functional groups and intermediates.
    color_map = {
        "alcohol": "#1f77b4",
        "aldehyde": "#ff7f0e",
        "carboxylic-acid": "#2ca02c",
        "ketone": "#d62728",
        "alkene": "#9467bd",
        "halide": "#8c564b",
        "ester": "#e377c2",
        "alkyne": "#bcbd22",
        "alkane": "#aec7e8",
        "diol": "#ffbb78",
        "halohydrin": "#98df8a",
        "tosylate": "#ff9896",
        "acetylide": "#c5b0d5",
        "ylide": "#c49c94",
        "grignard-reagent": "#f7b6d2",
        "phosphine-oxide": "#dbdb8d",
        "beta-keto-ester": "#9edae5",
        "reaction_intermediate": "#ff00ff",  # Magenta for intermediate nodes
        "default": "#7f7f7f"  # Default color for unmapped groups
    }

    # Helper function to add a molecule node to the attributes dictionary.
    def add_molecule_node(name, smiles, group):
        """Adds or updates a node in the node_attributes dictionary."""
        if name not in node_attributes:
            node_attributes[name] = {
                "color": color_map.get(group, color_map["default"]),
                "title": f"SMILES: {smiles}"  # Hover text
            }

    # --- DATA PROCESSING ---
    # Iterate through each reaction to build the graph.
    for i, reaction in enumerate(reaction_data):
        # Basic validation to ensure necessary keys exist.
        if not all(k in reaction for k in ["reactants", "products", "reagents", "reaction_name", "functional_groups"]):
            print(f"Skipping malformed reaction entry: {reaction.get('reaction_name', 'N/A')}")
            continue

        reactants = reaction["reactants"]
        products = reaction["products"]
        functional_groups = reaction["functional_groups"]

        # Case 1: Multiple reactants. Create an intermediate node.
        if len(reactants) > 1:
            # Create a unique ID for the intermediate node.
            intermediate_node_id = f"reaction_{i}_{reaction['reaction_name']}"
            
            # Add the intermediate node to the graph.
            G.add_node(intermediate_node_id,
                       label=reaction['reaction_name'],
                       color=color_map['reaction_intermediate'],
                       size=20, # Make intermediate nodes slightly larger
                       title=f"Reagents: {reaction['reagents']}")

            # Connect each reactant to the intermediate node.
            for j, reactant in enumerate(reactants):
                reactant_name = reactant["iupac_name"]
                reactant_group = functional_groups[j] if j < len(functional_groups) else "default"
                add_molecule_node(reactant_name, reactant["smiles"], reactant_group)
                G.add_edge(reactant_name, intermediate_node_id)

            # Connect the intermediate node to each product.
            product_start_index = len(reactants)
            for k, product in enumerate(products):
                product_name = product["iupac_name"]
                product_group_index = product_start_index + k
                product_group = functional_groups[product_group_index] if product_group_index < len(functional_groups) else "default"
                add_molecule_node(product_name, product["smiles"], product_group)
                G.add_edge(intermediate_node_id, product_name)

        # Case 2: Single reactant.
        else:
            reactant = reactants[0]
            reactant_name = reactant["iupac_name"]
            reactant_group = functional_groups[0] if functional_groups else "default"
            add_molecule_node(reactant_name, reactant["smiles"], reactant_group)

            # Connect the single reactant to all its products.
            for j, product in enumerate(products):
                product_name = product["iupac_name"]
                product_group_index = 1 + j
                product_group = functional_groups[product_group_index] if product_group_index < len(functional_groups) else "default"
                add_molecule_node(product_name, product["smiles"], product_group)
                G.add_edge(reactant_name, product_name, label=reaction["reagents"], title=reaction["reaction_name"])

    # Apply the collected attributes to the graph nodes.
    nx.set_node_attributes(G, node_attributes)

    # --- VISUALIZATION ---
    # Create and configure the pyvis network.
    net = Network(height="800px", width="100%", bgcolor="#f8f9fa", font_color="#343a40", notebook=True, directed=True)
    net.from_nx(G)
    net.force_atlas_2based(gravity=-50, central_gravity=0.01, spring_length=200, spring_strength=0.08)

    # Generate and open the HTML file.
    output_filename = "reaction_network_updated.html"
    try:
        net.show(output_filename)
        print(f"Successfully generated '{output_filename}'")
        webbrowser.open('file://' + os.path.realpath(output_filename))
    except Exception as e:
        print(f"An error occurred during HTML generation: {e}")
else:
    print("No reaction data to process. Exiting.")
