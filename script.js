let units = [];
let army = [];
let totalPoints = 0;
let nations = new Set();

document.getElementById('csvFile').addEventListener('change', handleFileUpload);
document.getElementById('search').addEventListener('input', renderUnits);
document.getElementById('pointLimit').addEventListener('input', renderUnits);
document.getElementById('nationFilter').addEventListener('change', renderUnits);

function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    units = parseCSV(text);
    extractNations(units);
    renderNationOptions();
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

function extractNations(units) {
  nations = new Set(units.map(unit => unit.Nation?.trim()).filter(n => n));
}

function renderNationOptions() {
  const select = document.getElementById('nationFilter');
  select.innerHTML = `<option value="all">All Nations</option>`;
  nations.forEach(nation => {
    const option = document.createElement('option');
    option.value = nation;
    option.textContent = nation;
    select.appendChild(option);
  });
}

function renderUnits() {
  const search = document.getElementById('search').value.toLowerCase();
  const nation = document.getElementById('nationFilter').value;
  const container = document.getElementById('units');
  container.innerHTML = '';

  units
    .filter(unit =>
      unit.Name.toLowerCase().includes(search) &&
      (nation === 'all' || unit.Nation === nation)
    )
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
      <strong>${index + 1}. ${unit.Name}</strong> (${unit.Points} pts)<br>
      <em>Nation:</em> ${unit.Nation || 'N/A'}<br>
      <em>Move:</em> ${unit.Move || '-'}, <em>Aim:</em> ${unit.Aim || '-'}, <em>Shoot:</em> ${unit.Shoot || '-'}, <em>Speed:</em> ${unit.Speed || '-'}<br>
      <em>Armour — Front:</em> ${unit.Front || '-'}, <em>Side:</em> ${unit.Side || '-'}, <em>Rear:</em> ${unit.Rear || '-'}<br>
      <em>Special:</em> ${unit.Special || 'None'}<br>
      <button onclick="removeFromArmy(${index})">Remove</button>
    `;
    ul.appendChild(li);
  });
  document.getElementById('totalPoints').textContent = totalPoints;
}

function getPointLimit() {
  return parseInt(document.getElementById('pointLimit').value) || 0;
}
function saveArmy() {
  localStorage.setItem('savedArmy', JSON.stringify(army));
  alert("Army saved!");
}

function loadArmy() {
  const saved = localStorage.getItem('savedArmy');
  if (saved) {
    army = JSON.parse(saved);
    totalPoints = army.reduce((sum, unit) => sum + parseInt(unit.Points), 0);
    updateArmyList();
    renderUnits();
    alert("Army loaded!");
  } else {
    alert("No saved army found.");
  }
}

async function exportArmyPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Tank Club - Army List", 10, 10);

  let y = 20;
  army.forEach((unit, i) => {
    const name = `${i + 1}. ${unit.Name} (${unit.Points} pts)`;
    const nation = `Nation: ${unit.Nation || 'N/A'}`;
    const line1 = `Move: ${unit.Move || '-'}, Aim: ${unit.Aim || '-'}, Shoot: ${unit.Shoot || '-'}, Speed: ${unit.Speed || '-'}`;
    const line2 = `Armour — Front: ${unit.Front || '-'}, Side: ${unit.Side || '-'}, Rear: ${unit.Rear || '-'}`;
    const special = `Special: ${unit.Special || 'None'}`;

    const lines = [name, nation, line1, line2, special];
    doc.setFontSize(12);
    lines.forEach(line => {
      doc.text(line, 10, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    y += 4; // spacing between units
  });

  doc.setFontSize(14);
  doc.text(`Total Points: ${totalPoints}`, 10, y + 6);

  doc.save("army_list.pdf");
}

