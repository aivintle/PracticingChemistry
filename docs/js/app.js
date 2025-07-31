// 1. Load JSON databases
const COMPOUNDS_URL = 'data/compounds.json';
const REACTIONS_URL = 'data/reactions.json';

let compounds = [], reactions = [];

// 2. Fetch both JSON files
Promise.all([
  fetch(COMPOUNDS_URL).then(r => r.json()),
  fetch(REACTIONS_URL).then(r => r.json())
]).then(([c, r]) => {
  compounds = c;
  reactions = r;
  initSettingsPanel();
});

// 3. Build checkboxes based on detected functionalGroups
function initSettingsPanel() {
  const groups = new Set(compounds.flatMap(c => c.functionalGroups));
  const container = document.getElementById('group-options');
  groups.forEach(g => {
    const id = `chk-${g}`;
    container.innerHTML += `
      <label><input type="checkbox" id="${id}" value="${g}" checked> ${g}</label><br>`;
  });
}

// 4. Generate problem on button click
document.getElementById('generate').addEventListener('click', () => {
  const selected = Array.from(document.querySelectorAll('#group-options input:checked'))
                        .map(el => el.value);

  // Filter reactions to match selected groups
  const pool = reactions.filter(r =>
    r.functionalGroups.some(fg => selected.includes(fg))
  );

  const reaction = pool[Math.floor(Math.random() * pool.length)];
  displayProblem(reaction);
});

// 5. Display start and target; reveal steps on demand
function displayProblem(rxn) {
  document.getElementById('start-material').textContent =
    'Starting Material: ' + rxn.reactants.join(' + ');
  document.getElementById('target-molecule').textContent =
    'Target Molecule: ' + rxn.products.join(' + ');
  document.getElementById('answer').hidden = true;
  const stepsList = document.getElementById('steps');
  stepsList.innerHTML = '';
  rxn.reactants.forEach((reactant, i) => {
    const step = `${reactant} --[ ${rxn.reagents.join(', ')} ]→ ${rxn.products[i] || ''}`;
    stepsList.innerHTML += `<li>${step}</li>`;
  });
}

// 6. Hook up “Show Answer”
document.getElementById('show-answer').addEventListener('click', () => {
  document.getElementById('answer').hidden = false;
});