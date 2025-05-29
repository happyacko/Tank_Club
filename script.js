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
