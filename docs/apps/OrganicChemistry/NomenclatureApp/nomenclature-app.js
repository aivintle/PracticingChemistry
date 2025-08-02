const newProblemButton = document.getElementById("new-problem-button");
const checkProblemButton = document.getElementById("check-problem-button");
const problemDisplay = document.getElementById("problem-display");
const answerDisplay = document.getElementById("answer-display");
const problemContent = document.getElementById("problem-content");
const answerContent = document.getElementById("answer-content");

let problems = [];
let currentProblem = null;
let problemShowMode = "image"; // "image" or "name"

// Fetch problems from JSON file
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    problems = data;
  });

// Toggle switch function
function toggleSwitch(id) {
  const switchElement = document.getElementById(id);
  switchElement.classList.toggle('active');

  // Example of handling the logic after toggle
  if (id === 'common-iupac-toggle') {
    if (switchElement.classList.contains('active')) {
      console.log('IUPAC Nomenclature selected');
      // Logic for IUPAC selection
    } else {
      console.log('Common Nomenclature selected');
      // Logic for Common selection
    }
  } else if (id === 'image-name-toggle') {
    updateImageNameToggleLabel();
  }
}

// Helper: Get checked functional groups
function getCheckedFunctionalGroups() {
  return Array.from(document.querySelectorAll('input[type="checkbox"][name="functional-group"]:checked'))
    .map(cb => cb.value);
}

// Helper: Check if molecule matches allowed functional groups
function moleculeHasAllowedFunctionalGroup(molecule, allowedGroups) {
  // Return true if molecule has any of the allowed groups
  return molecule.functional_groups.some(grp => allowedGroups.includes(grp));
}

// Helper: Check carbon count in SMILES
function carbonCount(smiles) {
  // Simple count of 'C' not followed by another uppercase letter (not in ring, etc.)
  // This is a naive implementation, but works for small molecules in this set.
  return (smiles.match(/C(?![a-z])/g) || []).length;
}

// Helper: Get validated carbon range from settings; will clamp values as in the HTML
function getCarbonRange() {
  let min = parseInt(document.getElementById("min-carbons").value, 10);
  let max = parseInt(document.getElementById("max-carbons").value, 10);

  // Clamp values to allowed ranges
  if (isNaN(min) || min < 1) min = 1;
  if (min > 11) min = 11;
  if (isNaN(max) || max < 2) max = 2;
  if (max > 12) max = 12;
  // Adjust min and max so min <= max
  if (min > max) min = max;
  if (min > 11) min = 11;
  if (max < 2) max = 2;

  return [min, max];
}

// Helper: Get the image/name toggle mode ("image" or "name")
function getImageNameToggleMode() {
  const toggle = document.getElementById('image-name-toggle');
  return toggle.classList.contains('active') ? "name" : "image";
}

// Helper: Update the label next to the image/name toggle
function updateImageNameToggleLabel() {
  const label = document.getElementById('image-name-toggle-label');
  if (!label) return;
  const mode = getImageNameToggleMode();
  label.textContent = (mode === "name") ? "Molecule Name" : "Molecule Image";
}

// Ensure label is correct on load
window.addEventListener('DOMContentLoaded', () => {
  updateImageNameToggleLabel();
});

newProblemButton.addEventListener("click", () => {
  // Restrict problem selection to only currently selected functional groups and carbon number range
  const allowedFunctionalGroups = getCheckedFunctionalGroups();
  const [minCarbons, maxCarbons] = getCarbonRange();

  // Filter problems by group and carbon count
  const filteredProblems = problems.filter(molecule => {
    // Must have at least one allowed functional group
    if (!moleculeHasAllowedFunctionalGroup(molecule, allowedFunctionalGroups)) return false;
    // Must be within carbon range
    const cCount = carbonCount(molecule.smiles);
    return cCount >= minCarbons && cCount <= maxCarbons;
  });

  if (filteredProblems.length === 0) {
    problemContent.innerHTML = `<span style="color:red;">No molecules found for the selected settings. Try expanding your functional groups or carbon range.</span>`;
    answerDisplay.style.display = "none";
    newProblemButton.style.display = "inline";
    checkProblemButton.style.display = "none";
    return;
  }

  // Pick a random problem from the filtered list
  currentProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
  
  // Decide problemShowMode ("image" or "name") for this problem based on toggle
  problemShowMode = getImageNameToggleMode();

  // Pick which name to use (IUPAC or common) for display
  const iupacActive = document.getElementById('common-iupac-toggle').classList.contains('active');
  let moleculeName = iupacActive ? currentProblem.iupac_name : (currentProblem.common_name || currentProblem.iupac_name);

  if (problemShowMode === "image") {
    // Show image as problem, name as answer
    const smilesImageUrl = `https://cactus.nci.nih.gov/chemical/structure/${currentProblem.smiles}/image`;
    problemContent.innerHTML = `
      <img src="${smilesImageUrl}" 
           alt="SMILES code: ${currentProblem.smiles}" 
           style="max-width: 100%; height: auto;" 
           onerror="this.onerror=null; this.src='fallback-image.png';">
    `;
    answerContent.textContent = moleculeName;
  } else {
    // Show name as problem, image as answer
    problemContent.textContent = moleculeName;
    const smilesImageUrl = `https://cactus.nci.nih.gov/chemical/structure/${currentProblem.smiles}/image`;
    answerContent.innerHTML = `
      <img src="${smilesImageUrl}" 
           alt="SMILES code: ${currentProblem.smiles}" 
           style="max-width: 100%; height: auto;" 
           onerror="this.onerror=null; this.src='fallback-image.png';">
    `;
  }

  problemDisplay.style.display = "block";
  answerDisplay.style.display = "none";
  newProblemButton.style.display = "none";
  checkProblemButton.style.display = "inline";
});

checkProblemButton.addEventListener("click", () => {
  // Show the answer
  answerDisplay.style.display = "block";
  problemDisplay.style.display = "block";
  newProblemButton.style.display = "inline";
  checkProblemButton.style.display = "none";
});