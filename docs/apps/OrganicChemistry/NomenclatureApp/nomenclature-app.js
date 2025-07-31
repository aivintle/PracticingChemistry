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

const footer = document.querySelector("footer");
footer.style.position = "relative";
footer.style.bottom = "0";
footer.style.zIndex = "10";
footer.style.backgroundColor = "#f8f9fa";
footer.style.padding = "10px";
footer.style.borderTop = "1px solid #ddd";
footer.style.boxShadow = "0 -2px 5px rgba(0, 0, 0, 0.1)";

// Add version number
const versionNumber = document.createElement("div");
versionNumber.id = "version-number";
versionNumber.textContent = `Version: ${new Date().toISOString()}`;
footer.appendChild(versionNumber);
