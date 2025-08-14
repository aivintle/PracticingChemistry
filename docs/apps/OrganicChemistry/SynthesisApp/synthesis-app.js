// --- Basic Setup: Theme and Settings Panel Toggle ---
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
});

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
      problemContent.innerHTML = `<span class="text-red-500">Error: Could not load reaction data. Please check the console.</span>`;
  });

// --- UI and Settings Functions ---

function populateFunctionalGroupCheckboxes() {
  const allGroups = new Set(reactions.flatMap(r => r.functional_groups || []));
  const sortedGroups = Array.from(allGroups).sort();
  fgCheckboxesDiv.innerHTML = sortedGroups.map(group => `
    <label class="flex items-center space-x-2 cursor-pointer">
      <input type="checkbox" name="functional-group" value="${group}" checked class="h-4 w-4 rounded" />
      <span class="capitalize">${group.replace(/-/g, " ")}</span>
    </label>
  `).join("\n");
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
        problemContent.innerHTML = `<p class="text-red-500">Please select at least one functional group.</p>`;
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
        problemContent.innerHTML = `<p class="text-red-500">Not enough data for the selected functional groups. Please select more.</p>`;
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
        problemContent.innerHTML = `<p class="text-red-500 font-semibold">Failed to generate a synthesis path.</p><p class="text-sm">Please try again, select more functional groups, or adjust the step range.</p>`;
        showSolutionButton.style.display = "none";
        solutionDisplay.style.display = "none";
    }
});

// --- Rendering Functions ---

function renderProblem(problem) {
  const { startingMaterials, targetProduct, keyIntermediate } = problem;

  const startingMaterialsHtml = startingMaterials.map(start => `
    <div class="text-center">
      <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(start.smiles)}/image" 
           alt="${start.iupac_name}" class="chem-img h-24 w-24 object-contain mx-auto mb-2">
      <div class="text-sm font-medium">${start.iupac_name}</div>
    </div>
  `).join('<div class="text-4xl font-light self-center mx-2">+</div>');

  const keyIntermediateHtml = keyIntermediate ? `
    <div class="mt-6 text-center border-t pt-4">
      <strong class="text-md font-semibold">Key Intermediate to Form:</strong>
      <p class="text-sm">${keyIntermediate.iupac_name}</p>
      <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(keyIntermediate.smiles)}/image" 
           alt="${keyIntermediate.iupac_name}" class="chem-img h-20 w-20 object-contain mx-auto mt-2">
    </div>
  ` : '';

  problemContent.innerHTML = `
    <div class="text-center mb-4">
        <h3 class="font-semibold">Starting Material(s)</h3>
    </div>
    <div class="flex justify-center items-start flex-wrap gap-2">
      ${startingMaterialsHtml}
    </div>
    <div class="text-5xl text-center my-4 font-thin text-blue-500 dark:text-blue-400">&#x2193;</div>
    <div class="text-center">
        <h3 class="font-semibold">Final Product</h3>
        <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(targetProduct.smiles)}/image"
             alt="${targetProduct.iupac_name}" class="chem-img h-24 w-24 object-contain mx-auto mt-2 mb-2">
        <div class="text-sm font-medium">${targetProduct.iupac_name}</div>
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
    solutionContent.innerHTML = `<p class="text-red-500">No solution path found.</p>`;
    return;
  }
  solutionContent.innerHTML = path.map((step, idx) => {
    const { reaction, from, to } = step;
    const fromHtml = from.map(r => `
        <div class="text-center">
            <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(r.smiles)}/image" 
                 alt="${r.iupac_name}" class="chem-img h-20 w-20 object-contain mx-auto">
            <p class="text-xs mt-1">${r.iupac_name}</p>
        </div>
    `).join('<div class="text-2xl self-center mx-2">+</div>');

    return `
      <div class="border-b pb-4 mb-4 dark:border-gray-600">
        <h4 class="text-lg font-semibold mb-2">Step ${idx + 1}: <span class="font-normal">${reaction.reaction_name}</span></h4>
        <div class="flex items-center justify-center flex-wrap gap-4">
          <div class="flex items-center gap-2">${fromHtml}</div>
          <div class="flex flex-col items-center">
            <div class="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">${reaction.reagents}</div>
            <div class="text-3xl font-thin text-blue-500 dark:text-blue-400 my-1">&#x2192;</div>
          </div>
          <div class="text-center">
            <img src="https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(to.smiles)}/image" 
                 alt="${to.iupac_name}" class="chem-img h-20 w-20 object-contain mx-auto">
            <p class="text-xs mt-1">${to.iupac_name}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}
