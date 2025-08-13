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
                add_molecule_node( reactant_name, reactant["smiles"], reactant_group)
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

    # --- HTML INJECTION FOR TOGGLE ---

    # 1. Define the HTML for the toggle switch, now checked by default.
    toggle_html = '''
    <div style="position: absolute; top: 20px; right: 20px; background-color: #ffffff; padding: 10px; border: 1px solid #ddd; border-radius: 8px; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <label for="hideMultiReactantToggle" style="font-family: sans-serif; font-size: 14px; color: #333; cursor: pointer;">
            <input type="checkbox" id="hideMultiReactantToggle" style="vertical-align: middle;" checked>
            Hide multi-reactant reactions
        </label>
    </div>
    '''

    # 2. Define the JavaScript to control the toggle's functionality.
    toggle_js = f'''
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {{
            const toggle = document.getElementById('hideMultiReactantToggle');
            if (!toggle || typeof nodes === 'undefined' || typeof edges === 'undefined') {{
                console.error("Pyvis network data or toggle not found.");
                return;
            }}

            const intermediateNodeColor = '{color_map['reaction_intermediate']}';
            let allElementsToToggle = {{ nodeIds: [], edgeIds: [] }};

            // Function to find all nodes/edges that should be hidden/shown by the toggle.
            function findToggleableElements() {{
                // 1. Find the magenta intermediate nodes that represent multi-reactant reactions.
                const intermediateNodes = nodes.get({{
                    filter: item => item.color === intermediateNodeColor
                }});
                const intermediateNodeIds = intermediateNodes.map(node => node.id);

                if (intermediateNodeIds.length === 0) {{
                    return {{ nodeIds: [], edgeIds: [] }};
                }}

                // 2. Find all edges connected to these intermediate nodes.
                const directlyConnectedEdges = edges.get({{
                    filter: edge => intermediateNodeIds.includes(edge.from) || intermediateNodeIds.includes(edge.to)
                }});
                const directlyConnectedEdgeIds = new Set(directlyConnectedEdges.map(edge => edge.id));

                // 3. Find the neighboring reactants/products of the multi-reactant pathways.
                const neighborNodeIds = new Set();
                directlyConnectedEdges.forEach(edge => {{
                    // Add the node to the set if it's not an intermediate node itself.
                    if (!intermediateNodeIds.includes(edge.from)) {{
                        neighborNodeIds.add(edge.from);
                    }}
                    if (!intermediateNodeIds.includes(edge.to)) {{
                        neighborNodeIds.add(edge.to);
                    }}
                }});

                // 4. From the neighbors, identify which ones will become isolated if we hide the pathway.
                const isolatedNodeIds = [];
                neighborNodeIds.forEach(nodeId => {{
                    // Get all edges connected to this neighbor in the entire graph.
                    const allNeighborEdges = edges.get({{
                        filter: edge => edge.from === nodeId || edge.to === nodeId
                    }});
                    
                    // A node is isolated if it has no "visible" edges. A visible edge is one
                    // whose ID is NOT in the set of edges we are about to hide.
                    const hasVisibleEdge = allNeighborEdges.some(edge => !directlyConnectedEdgeIds.has(edge.id));
                    
                    if (!hasVisibleEdge) {{
                        isolatedNodeIds.push(nodeId);
                    }}
                }});

                // 5. Compile the final list of all elements to toggle.
                const finalNodeIds = [...intermediateNodeIds, ...isolatedNodeIds];
                const finalEdgeIds = [...directlyConnectedEdgeIds];

                return {{ nodeIds: finalNodeIds, edgeIds: finalEdgeIds }};
            }}

            // Pre-calculate the elements to be toggled once on page load.
            allElementsToToggle = findToggleableElements();

            // This function applies the hiding/showing based on the checkbox state.
            function updateVisibility() {{
                const shouldHide = toggle.checked;
                
                if (allElementsToToggle.nodeIds.length > 0) {{
                    const nodeUpdates = allElementsToToggle.nodeIds.map(id => ({{ id, hidden: shouldHide }}));
                    nodes.update(nodeUpdates);
                }}
                
                if (allElementsToToggle.edgeIds.length > 0) {{
                    const edgeUpdates = allElementsToToggle.edgeIds.map(id => ({{ id, hidden: shouldHide }}));
                    edges.update(edgeUpdates);
                }}
            }}

            // Add the event listener for future clicks.
            toggle.addEventListener('change', updateVisibility);

            // Trigger the function once on load to set the initial hidden state.
            updateVisibility();
        }});
    </script>
    '''

    # 3. Generate the HTML, inject the new elements, save, and open.
    output_filename = "reaction_network_updated.html"
    try:
        # Use write_html to generate the file without automatically opening it.
        net.write_html(output_filename, notebook=True)

        # Read the generated file content.
        with open(output_filename, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # Inject the toggle's HTML right after the <body> tag.
        body_tag_index = html_content.find('<body>') + len('<body>')
        modified_html = html_content[:body_tag_index] + toggle_html + html_content[body_tag_index:]

        # Inject the controlling JavaScript right before the </body> tag.
        modified_html = modified_html.replace('</body>', toggle_js + '</body>')

        # Write the modified content back to the file.
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(modified_html)

        print(f"Successfully generated and modified '{output_filename}' with a visibility toggle.")
        webbrowser.open('file://' + os.path.realpath(output_filename))
    except Exception as e:
        print(f"An error occurred during HTML generation or modification: {e}")

else:
    print("No reaction data to process. Exiting.")