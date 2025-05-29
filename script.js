let allUnits = [];
let filteredUnits = [];
let selectedUnits = [];
let totalPoints = 0;

const unitListElement = document.getElementById('unitList');
const selectedUnitsElement = document.getElementById('selectedUnits');
const totalPointsElement = document.getElementById('totalPoints');
const pointLimitInput = document.getElementById('pointLimit');
const nationFilterSelect = document.getElementById('nationFilter');

// Function to toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
}

// Function to parse CSV data
async function fetchAndParseCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        let unit = {};
        headers.forEach((header, i) => {
            // Convert numeric values to numbers
            if (['Points', 'Move', 'Aim', 'Shoot', 'Speed', 'Front', 'Side', 'Rear'].includes(header)) {
                unit[header] = parseFloat(values[i]) || 0; // Use parseFloat for potential decimals, default to 0
            } else {
                unit[header] = values[i];
            }
        });
        // Add a unique ID for each unit for easier tracking
        unit.ID = unit.Name.replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
        return unit;
    });
    return data;
}

// Function to render a single unit card for available units
function renderUnitCard(unit) {
    const li = document.createElement('li');
    li.className = 'p-4 border rounded shadow-md bg-gray-50 dark:bg-gray-700'; // Tailwind classes
    li.innerHTML = `
        <h3 class="text-lg font-bold">${unit.Name}</h3>
        <p><strong>Nation:</strong> ${unit.Nation}</p>
        <p><strong>Points:</strong> ${unit.Points} pts</p>
        <p><strong>Move:</strong> ${unit.Move}, <strong>Aim:</strong> ${unit.Aim}, <strong>Shoot:</strong> ${unit.Shoot}, <strong>Speed:</strong> ${unit.Speed}</p>
        <p><strong>Armour — Front:</strong> ${unit.Front}, <strong>Side:</strong> ${unit.Side}, <strong>Rear:</strong> ${unit.Rear}</p>
        <p><strong>Special:</strong> ${unit.Special}</p>
        <button onclick="addToArmy('${unit.ID}')" class="add-button mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">➕ Add</button>
    `;
    return li;
}

// Function to render a single unit card for selected units (in Your Army section)
function renderSelectedUnitCard(unit) {
    const li = document.createElement('li');
    li.className = 'p-4 border rounded shadow-md bg-gray-50 dark:bg-gray-700 flex justify-between items-center'; // Tailwind classes
    li.innerHTML = `
        <div>
            <h3 class="text-lg font-bold">${unit.Name}</h3>
            <p><strong>Points:</strong> ${unit.Points} pts</p>
        </div>
        <button onclick="removeFromArmy('${unit.ID}')" class="remove-button bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">➖ Remove</button>
    `;
    return li;
}

// Function to display units
function displayUnits(units, targetElement, renderer) {
    targetElement.innerHTML = ''; // Clear previous units
    units.forEach(unit => {
        targetElement.appendChild(renderer(unit));
    });
}

// Function to populate nation filter
function populateNationFilter() {
    const nations = [...new Set(allUnits.map(unit => unit.Nation))].sort(); // Get unique nations and sort them
    nationFilterSelect.innerHTML = '<option value="">All</option>'; // Reset
    nations.forEach(nation => {
        const option = document.createElement('option');
        option.value = nation;
        option.textContent = nation;
        nationFilterSelect.appendChild(option);
    });
}

// Function to apply filters
function applyFilters() {
    const pointLimit = parseInt(pointLimitInput.value) || 0;
    const selectedNation = nationFilterSelect.value;

    filteredUnits = allUnits.filter(unit => {
        const meetsPointLimit = unit.Points <= pointLimit;
        const meetsNation = selectedNation === '' || unit.Nation === selectedNation;
        return meetsPointLimit && meetsNation;
    });
    displayUnits(filteredUnits, unitListElement, renderUnitCard);
}

// Function to update total points
function updateTotals() {
    totalPoints = selectedUnits.reduce((sum, unit) => sum + unit.Points, 0);
    totalPointsElement.textContent = totalPoints;
    displayUnits(selectedUnits, selectedUnitsElement, renderSelectedUnitCard);
}

// Add unit to army
function addToArmy(unitID) {
    const unitToAdd = allUnits.find(unit => unit.ID === unitID);
    if (unitToAdd && (totalPoints + unitToAdd.Points) <= (parseInt(pointLimitInput.value) || 0)) {
        selectedUnits.push(unitToAdd);
        updateTotals();
    } else if (unitToAdd) {
        alert(`Adding ${unitToAdd.Name} would exceed the current point limit of ${pointLimitInput.value} pts.`);
    }
}

// Remove unit from army
function removeFromArmy(unitID) {
    const index = selectedUnits.findIndex(unit => unit.ID === unitID);
    if (index !== -1) {
        selectedUnits.splice(index, 1);
        updateTotals();
    }
}

// Save army to local storage
function saveArmy() {
    localStorage.setItem('tankClubArmy', JSON.stringify(selectedUnits));
    alert('Army saved successfully!');
}

// Load army from local storage
function loadArmy() {
    const savedArmy = localStorage.getItem('tankClubArmy');
    if (savedArmy) {
        selectedUnits = JSON.parse(savedArmy);
        updateTotals();
        alert('Army loaded successfully!');
    } else {
        alert('No saved army found.');
    }
}

// Download army as PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yOffset = 10;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    doc.setFontSize(20);
    doc.text('Tank Club Army List', 105, yOffset, null, null, 'center');
    yOffset += 15;

    doc.setFontSize(12);
    doc.text(`Total Points: ${totalPoints} pts`, 10, yOffset);
    yOffset += 10;

    if (selectedUnits.length === 0) {
        doc.text('No units in your army.', 10, yOffset);
    } else {
        selectedUnits.forEach((unit, index) => {
            if (yOffset + (lineHeight * 6) > pageHeight - margin) { // Check if new page is needed
                doc.addPage();
                yOffset = margin;
            }

            doc.setFontSize(14);
            doc.text(`${unit.Name} (${unit.Points} pts)`, 10, yOffset);
            yOffset += lineHeight;
            doc.setFontSize(10);
            doc.text(`Nation: ${unit.Nation}`, 15, yOffset);
            yOffset += lineHeight;
            doc.text(`Move: ${unit.Move}, Aim: ${unit.Aim}, Shoot: ${unit.Shoot}, Speed: ${unit.Speed}`, 15, yOffset);
            yOffset += lineHeight;
            doc.text(`Armour — Front: ${unit.Front}, Side: ${unit.Side}, Rear: ${unit.Rear}`, 15, yOffset);
            yOffset += lineHeight;
            doc.text(`Special: ${unit.Special}`, 15, yOffset);
            yOffset += lineHeight * 2; // Add some space between units
        });
    }

    doc.save('tank_club_army.pdf');
}

// Initialize the application
async function initApp() {
    try {
        allUnits = await fetchAndParseCSV('units.csv.csv');
        populateNationFilter();
        applyFilters(); // Initial display of units
        updateTotals(); // Initial update of total points (will be 0)
    } catch (error) {
        console.error('Error loading units:', error);
        unitListElement.innerHTML = '<p class="text-red-500">Error loading units. Please check console for details.</p>';
    }

    // Event listeners for filters
    pointLimitInput.addEventListener('input', applyFilters);
    nationFilterSelect.addEventListener('change', applyFilters);
}

// Check for dark mode preference on load
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
