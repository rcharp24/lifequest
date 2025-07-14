// ===============================
// Stats Tracking Object
// ===============================
const stats = {
  strength: { xp: 0, level: 1 },
  wisdom: { xp: 0, level: 1 },
  discipline: { xp: 0, level: 1 },
  vitality: { xp: 0, level: 1 },
  social: { xp: 0, level: 1 }
};

// ===============================
// DOM References
// ===============================
const addTaskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
const addTaskForm = document.getElementById('addTaskForm');
const taskSelect = document.getElementById('taskSelect');
const statSelect = document.getElementById('statSelect');
const xpInput = document.getElementById('xpInput');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById("addTaskBtn");
const customTaskContainer = document.getElementById("customTaskContainer");
const customTaskName = document.getElementById("customTaskName");
const themeToggle = document.getElementById('themeToggle');
const xpGain = document.getElementById("xpGain");
const taskNotes = document.getElementById("taskNotes");
const taskHistory = document.getElementById("taskHistory");
let taskLog = JSON.parse(localStorage.getItem("taskLog") || "[]");
// ===============================
// Dark Mode Initialization
// ===============================
function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.checked = false;
  }
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

// Load saved dark mode preference
applyDarkMode(localStorage.getItem('darkMode') === 'true');

// Toggle dark mode
themeToggle.addEventListener('change', () => {
  applyDarkMode(themeToggle.checked);
});

// ===============================
// Add Task Button
// ===============================
addTaskBtn.addEventListener('click', () => {
  addTaskForm.reset();
  taskNotes.value = ""; // Clear notes
  customTaskContainer.style.display = "none";
  xpInput.setAttribute("readonly", true);
  addTaskModal.show();
});

// ===============================
// Handle Task Selection
// ===============================
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

// ===============================
// Submit Task Form
// ===============================
addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const stat = statSelect.value;
  const xp = parseInt(xpInput.value, 10);
  const notes = taskNotes.value.trim();

  const selectedOption = taskSelect.options[taskSelect.selectedIndex];
  const taskName = selectedOption.value === "Other"
    ? customTaskName.value.trim()
    : selectedOption.textContent;

  if (!taskName || !stat || isNaN(xp) || xp <= 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  if (xp % 5 !== 0) {
    alert("XP amount must be divisible by 5.");
    return;
  }

  // Add XP, update level and UI
  stats[stat].xp += xp;
  checkLevelUp(stat);
  updateUI();

  // Animate XP gain
  showXPGain(xp);

  // Add to task list UI
  const taskElement = document.createElement("div");
  taskElement.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
  
  // Store data for logging on delete
  taskElement.dataset.taskName = taskName;
  taskElement.dataset.stat = stat;
  taskElement.dataset.xp = xp;
  taskElement.dataset.notes = notes;
  
  taskElement.innerHTML = `
  <div>
    <strong>${taskName}</strong> → +${xp} XP to ${capitalize(stat)}
    ${notes ? `<br><small class="text-muted">📝 ${notes}</small>` : ""}
  </div>
  <button class="btn btn-sm btn-danger">🗑️</button>
`;


  // Delete task button
  taskElement.querySelector("button").addEventListener("click", () => {
    const { taskName, stat, xp, notes } = taskElement.dataset;
    logTask(taskName, stat, parseInt(xp), notes);
    taskElement.remove();
    saveToLocalStorage();
  });

  // Add to UI and save
  taskList.prepend(taskElement);
  saveToLocalStorage();
  logTask(taskName, stat, xp, notes);
  addTaskModal.hide();
});

// ===============================
// Update UI
// ===============================
function updateUI() {
  for (let stat in stats) {
    document.getElementById(`${stat}XP`).textContent = stats[stat].xp;
    document.getElementById(`${stat}Level`).textContent = stats[stat].level;

    const xpThisLevel = stats[stat].xp % 100;
    const bar = document.getElementById(`${stat}Bar`);
    bar.style.width = `${xpThisLevel}%`;
    bar.textContent = `${xpThisLevel} XP`;
  }
}

// ===============================
// Local Storage Functions
// ===============================
function saveToLocalStorage() {
  localStorage.setItem("stats", JSON.stringify(stats));

  const taskElements = taskList.querySelectorAll("div[data-task-name]");
  const tasks = Array.from(taskElements).map(task => ({
    name: task.dataset.taskName,
    stat: task.dataset.stat,
    xp: parseInt(task.dataset.xp),
    notes: task.dataset.notes
  }));

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
  const savedStats = JSON.parse(localStorage.getItem("stats"));
  if (savedStats) Object.assign(stats, savedStats);

  const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  if (savedTasks) {
    taskList.innerHTML = savedTasks;

    // Rebind delete buttons
    document.querySelectorAll("#taskList > div").forEach(taskElement => {
    const button = taskElement.querySelector("button");
    if (!button) return;

    button.addEventListener("click", () => {
      const { taskName, stat, xp, notes } = taskElement.dataset;
      logTask(taskName, stat, parseInt(xp), notes);
      taskElement.remove();
      saveToLocalStorage();
    });
  });

  }

  updateUI();
  renderHistory()
}

loadFromLocalStorage();

// ===============================
// Level Up Checker
// ===============================
function checkLevelUp(stat) {
  const xp = stats[stat].xp;
  const currentLevel = stats[stat].level;
  const newLevel = Math.floor(xp / 100) + 1;

  if (newLevel > currentLevel) {
    stats[stat].level = newLevel;
    alert(`🎉 ${capitalize(stat)} leveled up to ${newLevel}!`);

    // Animate progress bar glow
    const bar = document.getElementById(`${stat}Bar`);
    bar.style.animation = "progressGlow 1s ease-in-out";
    bar.addEventListener("animationend", () => {
      bar.style.animation = "";
    }, { once: true });
  }
}

// ===============================
// XP Gain Animation
// ===============================
function showXPGain(amount) {
  const xpElement = document.getElementById("xpGain");
  xpElement.textContent = `+${amount} XP`;
  xpElement.style.opacity = 1;

  // Restart animation
  xpElement.classList.remove("xp-gain");
  void xpElement.offsetWidth; // Reflow
  xpElement.classList.add("xp-gain");

  // Fade out after animation
  setTimeout(() => {
    xpElement.style.opacity = 0;
  }, 1000);
}

// ===============================
// Streak Tracker
// ===============================
function updateStreak() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("lastActionDate");
  let streak = parseInt(localStorage.getItem("streak") || "0");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    streak++;
  } else if (lastDate !== today) {
    streak = 1; // reset
  }

  localStorage.setItem("lastActionDate", today);
  localStorage.setItem("streak", streak.toString());

  const display = document.getElementById("streakDisplay");
  if (display) {
    display.textContent = `🔥 Streak: ${streak} days`;
  }
}

//Reminder System
function checkReminder() {
  const lastDate = localStorage.getItem("lastActionDate");
  const now = new Date();
  const last = new Date(lastDate);

  const hoursSinceLast = Math.floor((now - last) / (1000 * 60 * 60));
  if (isNaN(hoursSinceLast) || hoursSinceLast >= 24) {
    alert("⏰ It's been a while since your last task! Stay on track! 💪");
  }
}

checkReminder();


// Moving Completed Task to Task History
function logTask(name, stat, xp, notes) {
  const timestamp = new Date().toLocaleString();
  const entry = { name, stat, xp, notes, timestamp };

  taskLog.unshift(entry);
  if (taskLog.length > 50) taskLog.pop(); // Limit log size

  localStorage.setItem("taskLog", JSON.stringify(taskLog));
  renderHistory();
}

function renderHistory() {
  taskHistory.innerHTML = "";
  taskLog.forEach(({ name, stat, xp, notes, timestamp }) => {
    const div = document.createElement("div");
    div.classList.add("border", "p-2", "mb-2", "rounded", "bg-light", "text-dark");

    div.innerHTML = `
      <div><strong>${name}</strong> → +${xp} XP to ${capitalize(stat)}</div>
      ${notes ? `<div><small class="text-muted">📝 ${notes}</small></div>` : ""}
      <div><small class="text-muted">🕒 ${timestamp}</small></div>
    `;

    taskHistory.appendChild(div);
  });
}


// ===============================
// Utility: Capitalize
// ===============================
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
