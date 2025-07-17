// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message) {
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  const toast = new bootstrap.Toast(document.getElementById("toast"));
  toast.show();
}

function updateXP(stat, xp) {
  const xpKey = `${stat}XP`;
  const levelKey = `${stat}Level`;

  stats[xpKey] += xp;

  const newLevel = Math.floor(stats[xpKey] / 100) + 1;
  stats[levelKey] = newLevel;

  updateUI();
  saveToLocalStorage();
  showXPGain(`+${xp} XP to ${capitalize(stat)}!`);
}

function updateUI() {
  ["strength", "wisdom", "discipline", "vitality", "social"].forEach(stat => {
    const xp = stats[`${stat}XP`];
    const level = stats[`${stat}Level`];
    const bar = document.getElementById(`${stat}Bar`);
    const percentage = (xp % 100);
    document.getElementById(`${stat}XP`).textContent = xp;
    document.getElementById(`${stat}Level`).textContent = level;
    bar.style.width = `${percentage}%`;
    bar.textContent = `${xp % 100} XP`;
  });
}

function showXPGain(message) {
  const xpGain = document.getElementById("xpGain");
  xpGain.textContent = message;
  xpGain.style.opacity = 1;
  xpGain.style.top = "50%";

  setTimeout(() => {
    xpGain.style.opacity = 0;
  }, 1000);
}

function logTask(name, stat, xp, notes) {
  const history = document.getElementById("taskHistory");
  const entry = document.createElement("div");
  entry.classList.add("mb-1");
  entry.innerHTML = `<strong>${name}</strong> → +${xp} XP to ${capitalize(stat)} ${notes ? `<br><small class="text-muted">📝 ${notes}</small>` : ""}`;
  history.prepend(entry);

  document.getElementById("currentTask").innerHTML = entry.innerHTML;
}

// Save/load stats to localStorage
function saveToLocalStorage() {
  localStorage.setItem("lifeQuestStats", JSON.stringify(stats));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("lifeQuestStats");
  if (saved) Object.assign(stats, JSON.parse(saved));
}

// Dark Mode
document.getElementById("themeToggle").addEventListener("change", e => {
  document.body.classList.toggle("bg-dark", e.target.checked);
  document.body.classList.toggle("text-white", e.target.checked);
});

// Task form logic
const taskSelect = document.getElementById("taskSelect");
const customTaskContainer = document.getElementById("customTaskContainer");
const customTaskName = document.getElementById("customTaskName");
const xpInput = document.getElementById("xpInput");

taskSelect.addEventListener("change", () => {
  const selected = taskSelect.value;
  const option = taskSelect.options[taskSelect.selectedIndex];
  if (selected === "Other") {
    customTaskContainer.style.display = "block";
    xpInput.readOnly = false;
    xpInput.value = "";
  } else {
    customTaskContainer.style.display = "none";
    xpInput.readOnly = true;
    xpInput.value = option.dataset.xp;
  }
});

// Global stats
const stats = {
  strengthXP: 0, strengthLevel: 1,
  wisdomXP: 0, wisdomLevel: 1,
  disciplineXP: 0, disciplineLevel: 1,
  vitalityXP: 0, vitalityLevel: 1,
  socialXP: 0, socialLevel: 1,
};

// Load on start
loadFromLocalStorage();
updateUI();

// Form Submission
document.getElementById("addTaskForm").addEventListener("submit", e => {
  e.preventDefault();

  let taskName = taskSelect.value === "Other" ? customTaskName.value.trim() : taskSelect.options[taskSelect.selectedIndex].text;
  const xp = parseInt(xpInput.value);
  const stat = document.getElementById("statSelect").value;

  if (!taskName) {
    showToast("Please enter a custom task name.");
    return;
  }

  if (isNaN(xp) || xp <= 0 || xp % 5 !== 0) {
    showToast("XP amount must be a positive number divisible by 5.");
    return;
  }

  updateXP(stat, xp);
  logTask(taskName, stat, xp);

  // Reset
  document.getElementById("addTaskForm").reset();
  customTaskContainer.style.display = "none";
  xpInput.value = "";
  saveToLocalStorage();

  const modal = bootstrap.Modal.getInstance(document.getElementById("addTaskModal"));
  modal.hide();
  showToast("✅ Task added successfully!");
});

// Button to open modal
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
  modal.show();
});
