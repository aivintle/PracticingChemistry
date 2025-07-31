const newProblemButton = document.getElementById("new-problem-button");
const checkProblemButton = document.getElementById("check-problem-button");
const problemDisplay = document.getElementById("problem-display");
const answerDisplay = document.getElementById("answer-display");
const problemContent = document.getElementById("problem-content");
const answerContent = document.getElementById("answer-content");

let problems = [];
let currentProblem = null;

// Fetch problems from the JSON file
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    problems = data;
  });

newProblemButton.addEventListener("click", () => {
  // Generate a new problem
  currentProblem = problems[Math.floor(Math.random() * problems.length)];

  // Display the SMILES image
  const smilesImageUrl = `https://cactus.nci.nih.gov/chemical/structure/${currentProblem.smiles}/image`;
  problemContent.innerHTML = `<img src="${smilesImageUrl}" alt="SMILES Image" style="max-width: 100%; height: auto;">`;

  problemDisplay.style.display = "block";
  answerDisplay.style.display = "none";
  newProblemButton.style.display = "none";
  checkProblemButton.style.display = "inline";
});

checkProblemButton.addEventListener("click", () => {
  // Show the answer
  const { iupac_name, common_name } = currentProblem;
  answerContent.textContent = `IUPAC Name: ${iupac_name}, Common Name: ${common_name || "N/A"}`;

  problemDisplay.style.display = "block";
  answerDisplay.style.display = "block";
  newProblemButton.style.display = "inline";
  checkProblemButton.style.display = "none";
});
