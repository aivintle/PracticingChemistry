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

// Event listeners for generating and checking problems
newProblemButton.addEventListener("click", () => {
  // Generate a new problem
  currentProblem = problems[Math.floor(Math.random() * problems.length)];
  
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
