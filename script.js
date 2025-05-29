let units = [];
let army = [];
let totalPoints = 0;

window.addEventListener('DOMContentLoaded', () => {
  fetch('units.csv')
    .then(response => response.text())
    .then(csv => {
      units = parseCSV(csv);
      extractNations(units);
      renderNationOptions();
      renderUnits();
    });

  document.getElementById('pointLimit').addEventListener('input', renderUnits);
  document.getElementById('nationFilter').addEventListener('change', renderUnits);
});

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const unit = {};
    headers.forEach((h, i) => unit[h.trim()] = values[i]?.trim() || '');
    return unit;
  });
}

function extractNations(units) {
  const nationSet = new Set(units.map(u => u.Nation).filter(Boolean));
  const select = document.getElementById('nationFilter');
  nationSet.forEach(nation => {
    const option = document.createElement('option');
    option.value = nation;
    option.textContent = nation;
    select.appendChild(option);
  });
}

function renderNationOptions() {
  const select = document.getElementById('nationFilter');
  const value = select.value;
  select.innerHTML = '<option value="">All</option>';
  extractNations(units);
  select.value = value;
}

function renderUnits() {
  const ul = document.getElementById('unitList');
  const pointLimit = parseInt(document.getElementById('pointLimit').value) || Infinity;
  const nation = document.getElementById('nationFilter').value;

  ul.innerHTML = '';
  units.forEach(unit => {
    const unitPoints = parseInt(unit.Points || 0);
    if ((totalPoints + unitPoints) > pointLimit) return;
    if (nation && unit.Nation !== nation) return;

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${unit.Name}</strong> (${unit.Points} pts)<br>
      <em>Nation:</em> ${unit.Nation}<br>
      <em>Move:</em> ${unit.Move}, <em>Aim:</em> ${unit.Aim}, <em>Shoot:</em> ${unit.Shoot}, <em>Speed:</em> ${unit.Speed}<br>
      <em>Armour — Front:</em> ${unit.Front}, <em>Side:</em> ${unit.Side}, <em>Rear:</em> ${unit.Rear}<br>
      <em>Special:</em> ${unit.Special}<br>
      <button onclick='addToArmy(${JSON.stringify(unit)})'>Add</button>
    `;
    ul.appendChild(li);
  });
}

function addToArmy(unit) {
  const pointLimit = parseInt(document.getElementById('pointLimit').value) || Infinity;
  const unitPoints = parseInt(unit.Points || 0);
  if ((totalPoints + unitPoints) > pointLimit) return alert("Point limit exceeded.");
  army.push(unit);
  totalPoints += unitPoints;
  updateArmyList();
  renderUnits();
}

function removeFromArmy(index) {
  totalPoints -= parseInt(army[index].Points || 0);
  army.splice(index, 1);
  updateArmyList();
  renderUnits();
}

function updateArmyList() {
  const ul = document.getElementById('selectedUnits');
  ul.innerHTML = '';
  army.forEach((unit, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${index + 1}. ${unit.Name}</strong> (${unit.Points} pts)<br>
      <em>Nation:</em> ${unit.Nation}<br>
      <em>Move:</em> ${unit.Move}, <em>Aim:</em> ${unit.Aim}, <em>Shoot:</em> ${unit.Shoot}, <em>Speed:</em> ${unit.Speed}<br>
      <em>Armour — Front:</em> ${unit.Front}, <em>Side:</em> ${unit.Side}, <em>Rear:</em> ${unit.Rear}<br>
      <em>Special:</em> ${unit.Special}<br>
      <button onclick="removeFromArmy(${index})">Remove</button>
    `;
    ul.appendChild(li);
  });
  document.getElementById('totalPoints').textContent = totalPoints;
}

function saveArmy() {
  localStorage.setItem('savedArmy', JSON.stringify(army));
  alert("Army saved!");
}

function loadArmy() {
  const saved = localStorage.getItem('savedArmy');
  if (saved) {
    army = JSON.parse(saved);
    totalPoints = army.reduce((sum, unit) => sum + parseInt(unit.Points || 0), 0);
    updateArmyList();
    renderUnits();
    alert("Army loaded!");
  } else {
    alert("No saved army found.");
  }
}

function exportArmyPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Tank Club - Army List", 10, 10);

  let y = 20;
  army.forEach((unit, i) => {
    const name = `${i + 1}. ${unit.Name} (${unit.Points} pts)`;
    const nation = `Nation: ${unit.Nation || 'N/A'}`;
    const stats = `Move: ${unit.Move}, Aim: ${unit.Aim}, Shoot: ${unit.Shoot}, Speed: ${unit.Speed}`;
    const armour = `Armour — Front: ${unit.Front}, Side: ${unit.Side}, Rear: ${unit.Rear}`;
    const special = `Special: ${unit.Special || 'None'}`;

    [name, nation, stats, armour, special].forEach(line => {
      doc.setFontSize(12);
      doc.text(line, 10, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    y += 4;
  });

  doc.setFontSize(14);
  doc.text(`Total Points: ${totalPoints}`, 10, y + 6);
  doc.save("army_list.pdf");
}
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}

function renderUnitCard(unit) {
  return `
    <li class="p-4 border rounded shadow-md bg-gray-50 dark:bg-gray-700">
      <h3 class="text-lg font-bold">${unit.Name}</h3>
      <p><strong>Nation:</strong> ${unit.Nation}</p>
      <p><strong>Weapons:</strong> ${unit.Weapons}</p>
      <p><strong>Armor:</strong> ${unit.Armor}</p>
      <p><strong>Points:</strong> ${unit.Points}</p>
      <button onclick="addToArmy('${unit.ID}')" class="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">➕ Add</button>
    </li>`;
}
