// Object to track user stats
const stats = {
  strength: { xp: 0, level: 1 },
  wisdom: { xp: 0, level: 1 },
  discipline: { xp: 0, level: 1 },
  vitality: { xp: 0, level: 1 },
  social: { xp: 0, level: 1 }
};

// DOM element references for buttons and task list
const addTaskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
const addTaskForm = document.getElementById('addTaskForm');
const taskSelect = document.getElementById('taskSelect')
const taskName = document.getElementById('taskName');
const statSelect = document.getElementById('statSelect');
const xpInput = document.getElementById('xpInput');
const taskList = document.getElementById('taskList'); // Make sure you have a <div id="taskList">
const addTaskBtn = document.getElementById("addTaskBtn");
const customTaskContainer = document.getElementById("customTaskContainer"); // Should be in HTML
const customTaskName = document.getElementById("customTaskName"); // Input for 'Other' tasks


// Open modal on button click
addTaskBtn.addEventListener('click', () => {
  addTaskForm.reset(); // Reset form
  customTaskContainer.style.display = "none"; // Hide custom input
  xpInput.setAttribute("readonly", true); // Default to readonly
  addTaskModal.show();
});

// Handle task selection change
// If "Other" is selected, show the custom input. Otherwise, set XP.
taskSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const selectedValue = selectedOption.value;

  if (selectedValue === "Other") {
    customTaskContainer.style.display = "block";
    xpInput.value = "";
    xpInput.removeAttribute("readonly");
  } else {
    customTaskContainer.style.display = "none";
    const xp = selectedOption.getAttribute("data-xp");
    xpInput.value = xp;
    xpInput.setAttribute("readonly", true);
  }
});

addTaskForm.addEventListener('submit', (e) => { 
  e.preventDefault(); // Prevent form from submitting normally

  const stat = statSelect.value;
  const xp = parseInt(xpInput.value, 10);

  // Determine task name
  const selectedOption = taskSelect.options[taskSelect.selectedIndex];
  const taskName = selectedOption.value === "Other"
    ? customTaskName.value.trim()
    : selectedOption.textContent;

  // Validation checks
  if (!taskName || !stat || isNaN(xp) || xp <= 0) {
    alert("Please fill in all fields correctly.");
    return;
  }
  // Make sure the input XP is divisible by 5
  if (xp % 5 !== 0) {
    alert("XP amount must be divisible by 5.");
    return;
  }


  // Update stats
  stats[stat].xp += xp;
  checkLevelUp(stat);
  updateUI();

  // Add the task to the visual task list
  const taskElement = document.createElement("div");
  taskElement.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
  
  taskElement.innerHTML = `
    <div><strong>${taskName}</strong> → +${xp} XP to ${capitalize(stat)}</div>
    <button class="btn btn-sm btn-danger">🗑️</button>
  `;
  // Delete task on click
  taskElement.querySelector("button").addEventListener("click", () => {
    taskElement.remove();
    saveToLocalStorage();
  });
  
  taskList.prepend(taskElement);

  // Hide modal after adding task
  saveToLocalStorage();
  addTaskModal.hide();
});

// Update all XP and level displays in the UI
function updateUI() {
  for (let stat in stats) {
    document.getElementById(`${stat}XP`).textContent = stats[stat].xp;
    document.getElementById(`${stat}Level`).textContent = stats[stat].level;
    const xpThisLevel = stats[stat].xp % 100;
    document.getElementById(`${stat}Bar`).style.width = `${xpThisLevel}%`;
    document.getElementById(`${stat}Bar`).textContent = `${xpThisLevel} XP`;

  }
}
// Save to local storage so the data isnt lost after closing the window
function saveToLocalStorage() {
  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("tasks", taskList.innerHTML);
}

function loadFromLocalStorage() {
  const savedStats = JSON.parse(localStorage.getItem("stats"));
  if (savedStats) {
    Object.assign(stats, savedStats);
    updateUI();
  }

  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    taskList.innerHTML = savedTasks;

    // Rebind delete buttons
    document.querySelectorAll("#taskList button").forEach(button => {
      button.addEventListener("click", () => {
        button.parentElement.remove();
        saveToLocalStorage();
      });
    });
  }
}

loadFromLocalStorage();


// Check if XP reached a new level and update it
function checkLevelUp(stat) {
  const xp = stats[stat].xp;
  const currentLevel = stats[stat].level;
  const newLevel = Math.floor(xp / 100) + 1;

  if (newLevel > currentLevel) {
    stats[stat].level = newLevel;
    alert(`🎉 ${capitalize(stat)} leveled up to ${newLevel}!`);
  }
}

// Capitalize first letter for display
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Initial UI update on load
loadFromLocalStorage();
updateUI();
