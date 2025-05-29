let units = [];
let army = [];
let totalPoints = 0;

document.getElementById('csvFile').addEventListener('change', handleFileUpload);
document.getElementById('search').addEventListener('input', renderUnits);
document.getElementById('pointLimit').addEventListener('input', renderUnits);

function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    units = parseCSV(text);
    renderUnits();
  };
  reader.readAsText(file);
}

function parseCSV(data) {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function renderUnits() {
  const search = document.getElementById('search').value.toLowerCase();
  const container = document.getElementById('units');
  container.innerHTML = '';
  units
    .filter(unit => unit.Name.toLowerCase().includes(search))
    .forEach(unit => {
      const unitPoints = parseInt(unit.Points);
      const div = document.createElement('div');
      div.className = 'unit';
      const disabled = (totalPoints + unitPoints > getPointLimit()) ? 'disabled' : '';
      div.innerHTML = `
        <span>${unit.Name} (${unit.Points} pts)</span>
        <button ${disabled} onclick='addToArmy(${JSON.stringify(unit)})'>Add</button>
      `;
      container.appendChild(div);
    });
}

function addToArmy(unit) {
  const points = parseInt(unit.Points);
  if (totalPoints + points > getPointLimit()) {
    alert("Exceeds point limit!");
    return;
  }
  army.push(unit);
  totalPoints += points;
  updateArmyList();
  renderUnits();
}

function removeFromArmy(index) {
  const removed = army.splice(index, 1)[0];
  totalPoints -= parseInt(removed.Points);
  updateArmyList();
  renderUnits();
}

function updateArmyList() {
  const ul = document.getElementById('selectedUnits');
  ul.innerHTML = '';
  army.forEach((unit, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${unit.Name} (${unit.Points} pts)
      <button onclick="removeFromArmy(${index})">Remove</button>
    `;
    ul.appendChild(li);
  });
  document.getElementById('totalPoints').textContent = totalPoints;
}

function getPointLimit() {
  return parseInt(document.getElementById('pointLimit').value) || 0;
}
