// --- Basic Setup: Theme and Settings Panel Toggle ---
// Theme toggle based on original file's method
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  document.body.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
}

const toggleButton = document.getElementById('settings-toggle-button');
const settingsPanel = document.getElementById('settings-panel');
toggleButton.addEventListener('click', () => {
  const isHidden = settingsPanel.style.display === "none";
  settingsPanel.style.display = isHidden ? "block" : "none";
  toggleButton.textContent = isHidden ? "Hide Settings" : "Show Settings";
  toggleButton.setAttribute('aria-expanded', isHidden);
});

// --- DOM Elements ---
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

// --- App State ---
let reactions = [];
let compounds = [];
let currentProblem = null;

// --- Data Fetching and Initialization ---
fetch("reactions.json")
  .then(res => res.json())
  .then(reactionsData => {
    reactions = reactionsData;
    // Extract all unique compounds from the reactions data to create a master list
    const uniqueCompoundsMap = new Map();
    reactions.flatMap(r => [...r.reactants, ...r.products]).forEach(c => {
        if (c && c.smiles && !uniqueCompoundsMap.has(c.smiles)) {
            uniqueCompoundsMap.set(c.smiles, c);
        }
    });
    compounds = Array.from(uniqueCompoundsMap.values());
    populateFunctionalGroupCheckboxes();
  }).catch(error => {
      console.error("Failed to load reactions.json:", error);
      problemContent.innerHTML = `<span style="color:red;">Error: Could not load reaction data. Please check the console.</span>`;
  });

// --- UI and Settings Functions ---

function populateFunctionalGroupCheckboxes() {
  const allGroups = new Set(reactions.flatMap(r => r.functional_groups || []));
  const sortedGroups = Array.from(allGroups).sort();
  // Use original HTML structure for checkboxes
  fgCheckboxesDiv.innerHTML = sortedGroups.map(group =>
    `<label><input type="checkbox" name="functional-group" value="${group}" checked /> ${group.replace(/-/g, " ")}</label>`
  ).join("\n");
}

selectAllBtn.addEventListener('click', () => {
  fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
});

deselectAllBtn.addEventListener('click', () => {
  fgCheckboxesDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
});

function validateStepRange() {
  const min = parseInt(minStepsInput.value, 10);
  const max = parseInt(maxStepsInput.value, 10);
  if (min > max) {
    stepRangeError.textContent = "Min steps cannot be greater than max.";
    stepRangeError.style.display = 'block';
    return false;
  }
  stepRangeError.style.display = 'none';
  return true;
}
minStepsInput.addEventListener('input', validateStepRange);
maxStepsInput.addEventListener('input', validateStepRange);

function getSelectedFunctionalGroups() {
  return Array.from(fgCheckboxesDiv.querySelectorAll('input:checked')).map(cb => cb.value);
}

// --- Core Problem Generation Logic ---

/**
 * Backtracks from a given end product to find a synthesis path of a specific length.
 * @param {object} endProduct - The target compound object.
 * @param {number} steps - The desired number of steps in the synthesis.
 * @param {Array} allowedReactions - The pool of reactions to use.
 * @returns {object|null} A problem object or null if no path is found.
 */
function backtrackToFindPath(endProduct, steps, allowedReactions) {
    let path = [];
    let currentCompoundSMILES = endProduct.smiles;
    let givenStartingMaterials = [];

    for (let i = 0; i < steps; i++) {
        const precursorReactions = allowedReactions.filter(r =>
            r.products.some(p => p.smiles === currentCompoundSMILES)
        );

        if (precursorReactions.length === 0) return null; // Dead end

        const reaction = precursorReactions[Math.floor(Math.random() * precursorReactions.length)];
        const reactants = reaction.reactants;
        const currentCompoundObject = compounds.find(c => c.smiles === currentCompoundSMILES);

        path.unshift({ reaction, from: reactants, to: currentCompoundObject });

        if (reactants.length > 1) {
            const backtrackReactant = reactants[Math.floor(Math.random() * reactants.length)];
            currentCompoundSMILES = backtrackReactant.smiles;
            reactants.forEach(r => {
                if (r.smiles !== backtrackReactant.smiles) {
                    givenStartingMaterials.push(r);
                }
            });
        } else {
            currentCompoundSMILES = reactants[0].smiles;
        }
    }

    const mainStartingMaterial = compounds.find(c => c.smiles === currentCompoundSMILES);
    // Ensure mainStartingMaterial is not null before proceeding
    if (!mainStartingMaterial) return null;
    
    const finalStartingMaterials = [mainStartingMaterial, ...givenStartingMaterials];
    
    const convergentStep = path.find(step => step.from.length > 1);
    const keyIntermediate = (convergentStep && convergentStep.to.smiles !== endProduct.smiles) ? convergentStep.to : null;

    return {
        startingMaterials: finalStartingMaterials,
        targetProduct: endProduct,
        keyIntermediate,
        path
    };
}

newProblemButton.addEventListener('click', () => {
    const selectedFGs = getSelectedFunctionalGroups();
    if (selectedFGs.length === 0) {
        problemContent.innerHTML = `<p style="color:red;">Please select at least one functional group.</p>`;
        return;
    }
    if (!validateStepRange()) return;

    const minSteps = parseInt(minStepsInput.value, 10);
    const maxSteps = parseInt(maxStepsInput.value, 10);

    const allowedReactions = reactions.filter(r =>
        r.functional_groups.some(fg => selectedFGs.includes(fg))
    );
    const productSmiles = new Set(allowedReactions.flatMap(r => r.products.map(p => p.smiles)));
    const productPool = compounds.filter(c => productSmiles.has(c.smiles));

    if (productPool.length < 1 || allowedReactions.length === 0) {
        problemContent.innerHTML = `<p style="color:red;">Not enough data for the selected functional groups. Please select more.</p>`;
        return;
    }

    let problem = null;
    let maxTries = 100;
    let shuffledProducts = [...productPool].sort(() => 0.5 - Math.random());

    for (let i = 0; i < maxTries; i++) {
        const targetProduct = shuffledProducts[i % shuffledProducts.length];
        const pathLength = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
        
        const potentialProblem = backtrackToFindPath(targetProduct, pathLength, allowedReactions);
        
        if (potentialProblem) {
            const startSmiles = new Set(potentialProblem.startingMaterials.map(s => s.smiles));
            if (!startSmiles.has(potentialProblem.targetProduct.smiles)) {
                problem = potentialProblem;
                break;
            }
        }
    }
    
    if (problem) {
        currentProblem = problem;
        renderProblem(problem);
        showSolutionButton.style.display = "inline-block";
        solutionDisplay.style.display = "none";
    } else {
        problemContent.innerHTML = `<p style="color:red; font-weight: bold;">Failed to generate a synthesis path.</p><p style="font-size: 0.9em;">Please try again, select more functional groups, or adjust the step range.</p>`;
        showSolutionButton.style.display = "none";
        solutionDisplay.style.display = "none";
    }
});

// --- Rendering Functions ---

function renderProblem(problem) {
  const { startingMaterials, targetProduct, keyIntermediate } = problem;

  const startingMaterialsHtml = startingMaterials.map(start => `
    <div style="text-align:center;">
      <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(start.smiles)}/image" 
           alt="${start.iupac_name}" style="max-width:96px;display:block;margin:auto;background:white;border-radius:8px;padding:4px; border: 1px solid #ddd;">
      <div style="font-size:0.9em; margin-top: 0.5rem;">${start.iupac_name}</div>
    </div>
  `).join('<div style="font-size:2.5rem;align-self:center;margin:0 0.5rem;">+</div>');

  const keyIntermediateHtml = keyIntermediate ? `
    <div style="margin-top:1.5rem;text-align:center;border-top:1px solid #ddd;padding-top:1rem;">
      <strong>Key Intermediate to Form:</strong>
      <p style="font-size:0.9em;">${keyIntermediate.iupac_name}</p>
      <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(keyIntermediate.smiles)}/image" 
           alt="${keyIntermediate.iupac_name}" style="max-width:80px;display:block;margin:0.5rem auto 0;background:white;border-radius:8px;padding:4px; border: 1px solid #ddd;">
    </div>
  ` : '';

  problemContent.innerHTML = `
    <div style="text-align:center;margin-bottom:1rem;">
        <h3>Starting Material(s)</h3>
    </div>
    <div style="display:flex;justify-content:center;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
      ${startingMaterialsHtml}
    </div>
    <div style="font-size:3rem;text-align:center;margin:1rem 0;color:#4a5568;">&#x2193;</div>
    <div style="text-align:center;">
        <h3>Final Product</h3>
        <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(targetProduct.smiles)}/image"
             alt="${targetProduct.iupac_name}" style="max-width:96px;display:block;margin:0.5rem auto 0;background:white;border-radius:8px;padding:4px; border: 1px solid #ddd;">
        <div style="font-size:0.9em; margin-top: 0.5rem;">${targetProduct.iupac_name}</div>
    </div>
    ${keyIntermediateHtml}
  `;
}

showSolutionButton.addEventListener('click', () => {
  if (!currentProblem) return;
  renderSolution(currentProblem.path);
  solutionDisplay.style.display = "block";
});

function renderSolution(path) {
  if (!path || path.length === 0) {
    solutionContent.innerHTML = `<span style="color:red;">No solution path found.</span>`;
    return;
  }
  solutionContent.innerHTML = path.map((step, idx) => {
    const { reaction, from, to } = step;
    
    const fromHtml = from.map(r => `
        <div style="text-align: center;">
            <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(r.smiles)}/image" 
                 alt="${r.iupac_name}" style="max-width: 80px; background: white; border-radius: 8px; padding: 4px; border: 1px solid #ddd;">
            <p style="font-size: 0.8em; margin-top: 0.25rem;">${r.iupac_name}</p>
        </div>
    `).join('<div style="font-size: 2rem; align-self: center; margin: 0 0.5rem;">+</div>');

    return `
      <div style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;">Step ${idx + 1}: <span style="font-weight: normal;">${reaction.reaction_name}</span></h4>
        <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1rem;">
          
          <!-- Reactants -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${fromHtml}
          </div>
          
          <!-- Arrow and Reagents -->
          <div style="text-align: center; margin: 0 1rem;">
            <div style="font-family: monospace; font-size: 0.9em; margin-bottom: 0.25rem; padding: 0.25rem 0.5rem; background-color: #f7fafc; border-radius: 4px;">${reaction.reagents}</div>
            <div style="font-size: 2.5rem; color: #4299e1;">&#x2192;</div>
          </div>
          
          <!-- Product -->
          <div style="text-align: center;">
            <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(to.smiles)}/image" 
                 alt="${to.iupac_name}" style="max-width: 80px; background: white; border-radius: 8px; padding: 4px; border: 1px solid #ddd;">
            <p style="font-size: 0.8em; margin-top: 0.25rem;">${to.iupac_name}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}
