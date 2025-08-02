// Path to the compound and reactions data
const DATA_PATH = "../NomenclatureApp/data.json";
const REACTIONS_PATH = "reactions.json";

// DOM elements
const settingsPanel = document.getElementById("settings-panel");
const settingsToggleButton = document.getElementById("settings-toggle-button");
const fgCheckboxesDiv = document.getElementById("functional-group-checkboxes");
const newProblemButton = document.getElementById("new-problem-button");
const showSolutionButton = document.getElementById("show-solution-button");
const problemContent = document.getElementById("problem-content");
const solutionDisplay = document.getElementById("solution-display");
const solutionContent = document.getElementById("solution-content");

// App state
let compounds = [];
let reactions = [];
let selectedFunctionalGroups = [];
let currentProblem = null; // {start: compound, end: compound, path: [steps]}

// Collapsible settings panel logic
settingsToggleButton.addEventListener('click', () => {
  const isHidden = settingsPanel.style.display === "none";
  settingsPanel.style.display = isHidden ? "block" : "none";
  settingsToggleButton.textContent = isHidden ? "Hide Settings" : "Show Settings";
  settingsToggleButton.setAttribute('aria-expanded', isHidden ? "true" : "false");
});

// Fetch compounds and reactions data
Promise.all([
  fetch(DATA_PATH).then(res => res.json()),
  fetch(REACTIONS_PATH).then(res => res.json())
]).then(([compoundsData, reactionsData]) => {
  compounds = compoundsData;
  reactions = reactionsData;
  populateFunctionalGroupCheckboxes();
});

// Populate functional group checkboxes dynamically based on all functional groups in the database
function populateFunctionalGroupCheckboxes() {
  const allGroups = new Set();
  for (const cmpd of compounds) {
    if (Array.isArray(cmpd.functional_groups))
      cmpd.functional_groups.forEach(g => allGroups.add(g));
  }
  const sortedGroups = Array.from(allGroups).sort();
  fgCheckboxesDiv.innerHTML = sortedGroups.map(group =>
    `<label><input type="checkbox" name="functional-group" value="${group}" checked /> ${group.replace(/-/g, " ")}</label>`
  ).join("\n");
}

// Get the functional groups selected by the user
function getSelectedFunctionalGroups() {
  return Array.from(fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

// Generate a new synthesis problem
newProblemButton.addEventListener('click', () => {
  selectedFunctionalGroups = getSelectedFunctionalGroups();
  // Filter compounds according to selected functional groups
  const compoundsWithFG = compounds.filter(c =>
    c.functional_groups.some(fg => selectedFunctionalGroups.includes(fg))
  );

  if (compoundsWithFG.length < 2) {
    problemContent.innerHTML = `<span style="color:red;">Not enough compounds found for the selected functional groups. Please select more.</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }

  // Randomly select two different compounds
  let start, end;
  let tries = 0;
  do {
    start = compoundsWithFG[Math.floor(Math.random() * compoundsWithFG.length)];
    end = compoundsWithFG[Math.floor(Math.random() * compoundsWithFG.length)];
    tries++;
  } while (start.smiles === end.smiles && tries < 10);

  if (start.smiles === end.smiles) {
    problemContent.innerHTML = `<span style="color:red;">Failed to generate a problem. Please try again.</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }

  currentProblem = { start, end, path: null };
  renderProblem(start, end);
  showSolutionButton.style.display = "inline-block";
  solutionDisplay.style.display = "none";
});

// Render the synthesis problem
function renderProblem(start, end) {
  // Use cactus.nci.nih.gov to display structures
  problemContent.innerHTML = `
    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:1.5rem;">
      <div style="text-align:center;">
        <div><strong>Start:</strong></div>
        <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(start.smiles)}/image" 
             alt="${start.iupac_name}" style="max-width:96px;display:block;margin:auto;">
        <div>${start.iupac_name}${start.common_name ? " (" + start.common_name + ")" : ""}</div>
      </div>
      <div style="font-size:2.5rem;padding-top:2.5rem;">&#8594;</div>
      <div style="text-align:center;">
        <div><strong>Product:</strong></div>
        <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(end.smiles)}/image"
             alt="${end.iupac_name}" style="max-width:96px;display:block;margin:auto;">
        <div>${end.iupac_name}${end.common_name ? " (" + end.common_name + ")" : ""}</div>
      </div>
    </div>
    <div style="margin-top:1.5rem;font-size:1.05rem;color:#555;">
      <em>Can you propose a plausible sequence of reactions from the starting material to the product?</em>
    </div>
  `;
}

// Show solution button
showSolutionButton.addEventListener('click', () => {
  if (!currentProblem) return;
  // "Path finding": Check if there is a direct reaction. For now, just search one-step paths.
  const path = findSynthesisPath(currentProblem.start, currentProblem.end);
  currentProblem.path = path;
  renderSolution(path);
  solutionDisplay.style.display = "block";
});

// Simple path finding: direct or one-step
function findSynthesisPath(start, end) {
  // Direct (one-step)
  const direct = reactions.find(r =>
    r.reactants.length === 1 &&
    r.reactants[0].smiles === start.smiles &&
    r.products.length === 1 &&
    r.products[0].smiles === end.smiles
  );
  if (direct) {
    return [{ reaction: direct, from: start, to: end }];
  }
  // Try two-step: start -> intermediate -> end
  for (const r1 of reactions) {
    if (r1.reactants.length === 1 && r1.reactants[0].smiles === start.smiles) {
      const intermediate = r1.products[0];
      for (const r2 of reactions) {
        if (r2.reactants.length === 1 && r2.reactants[0].smiles === intermediate.smiles &&
            r2.products.length === 1 && r2.products[0].smiles === end.smiles) {
          return [
            { reaction: r1, from: start, to: intermediate },
            { reaction: r2, from: intermediate, to: end }
          ];
        }
      }
    }
  }
  // Not found
  return null;
}

// Render the solution path
function renderSolution(path) {
  if (!path) {
    solutionContent.innerHTML = `<span style="color:red;">No solution found using available reactions (one or two steps).</span>`;
    return;
  }
  const html = path.map((step, idx) => {
    const { reaction, from, to } = step;
    return `
      <div style="margin-bottom:1.2rem;">
        <div><strong>Step ${idx + 1}${reaction.reaction_name ? ": " + reaction.reaction_name : ""}</strong></div>
        <div style="display:flex;align-items:center;gap:1.2rem;margin:0.4em 0;">
          <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(from.smiles)}/image" 
               alt="${from.iupac_name}" style="max-width:64px;">
          <span style="font-size:2rem;">&#8594;</span>
          <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(to.smiles)}/image" 
               alt="${to.iupac_name}" style="max-width:64px;">
        </div>
        <div><strong>Reagents:</strong> ${reaction.reagents}</div>
        <div><strong>Functional Groups:</strong> ${reaction.functional_groups.join(", ")}</div>
      </div>
    `;
  }).join("");
  solutionContent.innerHTML = html;
}

// Accessibility: Hide solution on new problem
newProblemButton.addEventListener('click', () => {
  solutionDisplay.style.display = "none";
});