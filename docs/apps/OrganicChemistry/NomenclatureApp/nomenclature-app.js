const newProblemButton = document.getElementById("new-problem-button");
const checkProblemButton = document.getElementById("check-problem-button");
const problemDisplay = document.getElementById("problem-display");
const answerDisplay = document.getElementById("answer-display");
const problemContent = document.getElementById("problem-content");
const answerContent = document.getElementById("answer-content");

let problems = [];
let currentProblem = null;

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
    if (switchElement.classList.contains('active')) {
      console.log('Images mode selected');
      // Logic for images mode
    } else {
      console.log('Names mode selected');
      // Logic for names mode
    }
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

newProblemButton.addEventListener("click", () => {
  // Restrict problem selection to only currently selected functional groups and carbon number range
  const allowedFunctionalGroups = getCheckedFunctionalGroups();
  const minCarbons = parseInt(document.getElementById("min-carbons").value, 10) || 1;
  const maxCarbons = parseInt(document.getElementById("max-carbons").value, 10) || 12;

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
  
  const smilesImageUrl = `https://cactus.nci.nih.gov/chemical/structure/${currentProblem.smiles}/image`;
  
  problemContent.innerHTML = `
    <img src="${smilesImageUrl}" 
         alt="SMILES code: ${currentProblem.smiles}" 
         style="max-width: 100%; height: auto;" 
         onerror="this.onerror=null; this.src='fallback-image.png';">
  `;

  problemDisplay.style.display = "block";
  answerDisplay.style.display = "none";
  newProblemButton.style.display = "none";
  checkProblemButton.style.display = "inline";
});

checkProblemButton.addEventListener("click", () => {
  // Show the answer
  answerContent.textContent = `IUPAC Name: ${currentProblem.iupac_name}, Common Name: ${currentProblem.common_name || "N/A"}`;
  
  problemDisplay.style.display = "block";
  answerDisplay.style.display = "block";
  newProblemButton.style.display = "inline";
  checkProblemButton.style.display = "none";
});
