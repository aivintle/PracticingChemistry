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

  // Set aria-pressed for accessibility (only for toggles)
  if (id === 'image-name-toggle') {
    switchElement.setAttribute('aria-pressed', switchElement.classList.contains('active') ? 'true' : 'false');
    updateImageNameToggleLabel();
  }
  if (id === 'common-iupac-toggle') {
    switchElement.setAttribute('aria-pressed', switchElement.classList.contains('active') ? 'true' : 'false');
    updateCommonIupacToggleLabel();
  }
}

// Keyboard accessibility and click for image-name-toggle
const imageNameToggle = document.getElementById('image-name-toggle');
imageNameToggle.addEventListener('click', function() {
  toggleSwitch('image-name-toggle');
});
imageNameToggle.addEventListener('keydown', function(e) {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    toggleSwitch('image-name-toggle');
  }
});

// Keyboard accessibility and click for common-iupac-toggle
const commonIupacToggle = document.getElementById('common-iupac-toggle');
commonIupacToggle.addEventListener('click', function() {
  toggleSwitch('common-iupac-toggle');
});
commonIupacToggle.addEventListener('keydown', function(e) {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    toggleSwitch('common-iupac-toggle');
  }
});

// Helper: Get checked functional groups (now matches the new group names)
function getCheckedFunctionalGroups() {
  return Array.from(document.querySelectorAll('input[type="checkbox"][name="functional-group"]:checked'))
    .map(cb => cb.value);
}

// Helper: Check if molecule matches allowed functional groups
function moleculeHasAllowedFunctionalGroup(molecule, allowedGroups) {
  return molecule.functional_groups.some(grp => allowedGroups.includes(grp));
}

// Helper: Check carbon count in SMILES
function carbonCount(smiles) {
  return (smiles.match(/C(?![a-z])/g) || []).length;
}

// Helper: Get validated carbon range from settings
function getCarbonRange() {
  let min = parseInt(document.getElementById("min-carbons").value, 10);
  let max = parseInt(document.getElementById("max-carbons").value, 10);

  if (isNaN(min) || min < 1) min = 1;
  if (min > 11) min = 11;
  if (isNaN(max) || max < 2) max = 2;
  if (max > 12) max = 12;
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

// Helper: Get the current "name" mode: "iupac" or "common"
function getNameMode() {
  const toggle = document.getElementById('common-iupac-toggle');
  return toggle.classList.contains('active') ? "iupac" : "common";
}

// Helper: Update the label next to the image/name toggle
function updateImageNameToggleLabel() {
  const label = document.getElementById('image-name-toggle-label');
  if (!label) return;
  const mode = getImageNameToggleMode();
  label.textContent = (mode === "name") ? "Molecule Name" : "Molecule Image";
}

// Helper: Update the label next to the common/iupac toggle
function updateCommonIupacToggleLabel() {
  const label = document.getElementById('common-iupac-toggle-label');
  if (!label) return;
  const mode = getNameMode();
  label.textContent = (mode === "iupac") ? "IUPAC Name" : "Common Name";
}

// Ensure labels are correct on page load
window.addEventListener('DOMContentLoaded', () => {
  updateImageNameToggleLabel();
  updateCommonIupacToggleLabel();
});

newProblemButton.addEventListener("click", () => {
  const allowedFunctionalGroups = getCheckedFunctionalGroups();
  const [minCarbons, maxCarbons] = getCarbonRange();

  const filteredProblems = problems.filter(molecule => {
    if (!moleculeHasAllowedFunctionalGroup(molecule, allowedFunctionalGroups)) return false;
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

  currentProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
  problemShowMode = getImageNameToggleMode();

  const nameMode = getNameMode();
  let moleculeName = (nameMode === "iupac")
    ? currentProblem.iupac_name
    : (currentProblem.common_name || currentProblem.iupac_name);

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
  answerDisplay.style.display = "block";
  problemDisplay.style.display = "block";
  newProblemButton.style.display = "inline";
  checkProblemButton.style.display = "none";
});