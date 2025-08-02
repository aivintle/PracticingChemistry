// Path to the compound and reactions data
const DATA_PATH = "../NomenclatureApp/data.json";
const REACTIONS_PATH = "reactions.json";

// DOM elements
const fgCheckboxesDiv = document.getElementById("functional-group-checkboxes");
const newProblemButton = document.getElementById("new-problem-button");
const showSolutionButton = document.getElementById("show-solution-button");
const problemContent = document.getElementById("problem-content");
const solutionDisplay = document.getElementById("solution-display");
const solutionContent = document.getElementById("solution-content");
const selectAllBtn = document.getElementById("select-all-fg-btn");
const deselectAllBtn = document.getElementById("deselect-all-fg-btn");
const minStepsInput = document.getElementById("min-steps");
const maxStepsInput = document.getElementById("max-steps");
const stepRangeError = document.getElementById("step-range-error");

// App state
let compounds = [];
let reactions = [];
let selectedFunctionalGroups = [];
let currentProblem = null; // {start: compound, end: compound, path: [steps]}

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

// Select/Deselect All Functional Group Checkboxes
selectAllBtn.addEventListener('click', function() {
  fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
});
deselectAllBtn.addEventListener('click', function() {
  fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
});

// Validate min/max steps
function validateStepRange() {
  let min = parseInt(minStepsInput.value, 10);
  let max = parseInt(maxStepsInput.value, 10);

  if (isNaN(min) || min < 1) min = 1;
  if (min > 15) min = 15;
  if (isNaN(max) || max < 1) max = 1;
  if (max > 15) max = 15;
  if (min > max) min = max;
  minStepsInput.value = min;
  maxStepsInput.value = max;

  if (min > max) {
    stepRangeError.style.display = '';
    stepRangeError.textContent = "Min steps must be <= max steps.";
    return false;
  } else {
    stepRangeError.style.display = 'none';
    stepRangeError.textContent = "";
    return true;
  }
}
minStepsInput.addEventListener('input', validateStepRange);
maxStepsInput.addEventListener('input', validateStepRange);

// Get the functional groups selected by the user
function getSelectedFunctionalGroups() {
  return Array.from(fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

// Generate a new synthesis problem
newProblemButton.addEventListener('click', () => {
  selectedFunctionalGroups = getSelectedFunctionalGroups();
  if (selectedFunctionalGroups.length === 0) {
    problemContent.innerHTML = `<span style="color:red;">Please select at least one functional group.</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }
  if (!validateStepRange()) {
    problemContent.innerHTML = `<span style="color:red;">Please enter a valid step range (min ≤ max, both 1-15).</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }
  // Get min/max steps from settings
  const minSteps = parseInt(minStepsInput.value, 10);
  const maxSteps = parseInt(maxStepsInput.value, 10);

  // Filter compounds according to selected functional groups (for possible end products)
  const allowedCompounds = compounds.filter(c =>
    c.functional_groups.some(fg => selectedFunctionalGroups.includes(fg))
  );

  // Filter reactions that only use allowed functional groups
  const allowedReactions = reactions.filter(r =>
    r.functional_groups.some(fg => selectedFunctionalGroups.includes(fg))
  );

  if (allowedCompounds.length < 2 || allowedReactions.length === 0) {
    problemContent.innerHTML = `<span style="color:red;">Not enough data for selected functional groups. Please select more.</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }

  // Choose a random starting material from allowedCompounds
  let start = allowedCompounds[Math.floor(Math.random() * allowedCompounds.length)];

  // Try to build a random path of reactions without cycles, with path length between minSteps and maxSteps
  let maxTries = 40;
  let found = false;
  let path = [];
  let product = null;

  for (let tries = 0; tries < maxTries && !found; tries++) {
    let curr = start;
    let currPath = [];
    let visited = new Set([curr.smiles]);
    let steps = 0;
    let possible = true;

    // Pick a random path length in the allowed range (inclusive)
    let pathLen = (maxSteps === minSteps) ? minSteps 
                  : minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));

    while (steps < pathLen) {
      // Find possible next reactions for this compound
      const nextReactions = allowedReactions.filter(r =>
        r.reactants.length === 1 &&
        r.reactants[0].smiles === curr.smiles &&
        r.products.length === 1 &&
        !visited.has(r.products[0].smiles)
      );
      if (nextReactions.length === 0) {
        possible = false;
        break;
      }
      // Randomly pick a next reaction
      const reaction = nextReactions[Math.floor(Math.random() * nextReactions.length)];
      const next = allowedCompounds.find(c => c.smiles === reaction.products[0].smiles);
      if (!next) {
        possible = false;
        break;
      }
      currPath.push({ reaction, from: curr, to: next });
      visited.add(next.smiles);
      curr = next;
      steps++;
    }
    // Only accept non-circular, proper paths, and ending material different than starting
    if (possible && currPath.length >= minSteps && curr.smiles !== start.smiles) {
      path = currPath;
      product = curr;
      found = true;
      break;
    }
  }

  if (!found || !product) {
    problemContent.innerHTML = `<span style="color:red;">Failed to generate a synthesis path. Please try again or select more functional groups, or a different step range.</span>`;
    showSolutionButton.style.display = "none";
    solutionDisplay.style.display = "none";
    return;
  }

  currentProblem = { start, end: product, path };
  renderProblem(start, product);
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
  renderSolution(currentProblem.path);
  solutionDisplay.style.display = "block";
});

// Render the solution path
function renderSolution(path) {
  if (!path || !Array.isArray(path) || path.length === 0) {
    solutionContent.innerHTML = `<span style="color:red;">No solution path found.</span>`;
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

// Hide solution on new problem
newProblemButton.addEventListener('click', () => {
  solutionDisplay.style.display = "none";
});