// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select DOM elements
  const taskSelect = document.getElementById("taskSelect");
  const xpInput = document.getElementById("xpInput");
  const customTaskContainer = document.getElementById("customTaskContainer");
  const customTaskName = document.getElementById("customTaskName");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const addTaskModal = new bootstrap.Modal(document.getElementById("addTaskModal"));
  const addTaskForm = document.getElementById("addTaskForm");
  const taskList = document.getElementById("taskList");
  const currentTask = document.getElementById("currentTask");
  const taskHistory = document.getElementById("taskHistory");
  const toastEl = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toast = new bootstrap.Toast(toastEl);
  const xpGain = document.getElementById("xpGain");
  const themeToggle = document.getElementById("themeToggle");
  const streakDisplay = document.getElementById("streakDisplay");

  const noteSection = document.getElementById("noteSection");
  const taskNote = document.getElementById("taskNote");

  const stats = ["strength", "wisdom", "discipline", "vitality", "social"];

  // Application state
  const state = {
    stats: Object.fromEntries(stats.map(stat => [stat, { xp: 0, level: 1 }])),
    streak: 0,
    lastCompletedDate: null
  };

  // Load theme preference
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("bg-dark", "text-white");
    themeToggle.checked = true;
  }

  // Load saved state if available
  const savedState = JSON.parse(localStorage.getItem("lifeQuestState"));
  if (savedState) Object.assign(state, savedState);
  updateStatsDisplay();
  updateStreakDisplay();

  // Theme toggle listener
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-white");
    localStorage.setItem("darkMode", themeToggle.checked);
  });

  // Handle task selection to show XP or custom name
  taskSelect.addEventListener("change", () => {
    const selectedOption = taskSelect.selectedOptions[0];
    const isOther = selectedOption.value === "Other";
    customTaskContainer.style.display = isOther ? "block" : "none";
    xpInput.value = selectedOption.dataset.xp || "";
  });

  // Handle add task button click
  addTaskBtn.addEventListener("click", () => {
    taskSelect.selectedIndex = 0;
    xpInput.value = taskSelect.selectedOptions[0].dataset.xp;
    customTaskContainer.style.display = "none";
    addTaskModal.show();
  });

  // Handle form submission for adding a task
  addTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedOption = taskSelect.selectedOptions[0];
    const taskName = selectedOption.value === "Other" ? customTaskName.value : selectedOption.value;
    const stat = document.getElementById("statSelect").value;
    const xp = parseInt(xpInput.value);

    if (!taskName || !stat || isNaN(xp)) return;

    addTaskToList(taskName, stat, xp);
    awardXP(stat, xp);
    showToast("Task added successfully!");
    updateStreak();
    addTaskModal.hide();
  });

  // Adds a new task to the task list
  function addTaskToList(task, stat, xp) {
    const item = document.createElement("button");
    item.className = "list-group-item list-group-item-action";
    item.textContent = `${task} (+${xp} XP to ${stat})`;
    item.addEventListener("click", () => {
      currentTask.textContent = `✅ ${task}`;
      noteSection.style.display = 'block'; // show note section
      taskNote.value = ""; // clear any previous note
      item.remove();
    });
    taskList.appendChild(item);
  }

  // Completes the current task and saves it with a note
  function completeCurrentTask() {
    const note = taskNote.value;
    const taskName = currentTask.textContent;

    const completedTask = {
      name: taskName,
      note: note,
      date: new Date().toLocaleString()
    };

    addToHistory(completedTask);
    clearCurrentTask();
  }

  // Clears the current task display and note field
  function clearCurrentTask() {
    currentTask.textContent = "";
    taskNote.value = "";
    noteSection.style.display = 'none';
  }

  // Adds a completed task to the history view
  function addToHistory(task) {
    const history = document.getElementById('taskHistory');

    const taskCard = document.createElement('div');
    taskCard.classList.add('card', 'mb-2');

    taskCard.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${task.name}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${task.date}</h6>
        ${task.note ? `<p class="card-text"><strong>Note:</strong> ${task.note}</p>` : ''}
      </div>
    `;

    history.prepend(taskCard); // add most recent first
  }

  // Toggle to view task history
  document.getElementById('viewHistoryBtn').addEventListener('click', () => {
    document.getElementById('taskHistory').style.display = 'block';
    document.getElementById('calendarView').style.display = 'none';
  });

  // Toggle to view calendar
  document.getElementById('viewCalendarBtn').addEventListener('click', () => {
    document.getElementById('taskHistory').style.display = 'none';
    document.getElementById('calendarView').style.display = 'block';
  });

  // Awards XP and levels up if necessary
  function awardXP(stat, xp) {
    const data = state.stats[stat];
    data.xp += xp;
    const xpNeeded = data.level * 100;
    if (data.xp >= xpNeeded) {
      data.xp -= xpNeeded;
      data.level++;
      confetti(); // optional celebration effect
    }
    animateXPGain(`+${xp} XP`);
    updateStatsDisplay();
    saveState();
  }

  // Updates the progress bars and levels
  function updateStatsDisplay() {
    stats.forEach(stat => {
      const { xp, level } = state.stats[stat];
      const percent = Math.floor((xp / (level * 100)) * 100);
      document.getElementById(`${stat}Level`).textContent = level;
      document.getElementById(`${stat}XP`).textContent = xp;
      const bar = document.getElementById(`${stat}Bar`);
      bar.style.width = `${percent}%`;
      bar.textContent = `${xp} XP`;
    });
  }

  // Updates the user's daily streak
  function updateStreak() {
    const today = new Date().toDateString();
    const last = state.lastCompletedDate;
    if (last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (last === yesterday.toDateString()) state.streak++;
      else state.streak = 1;
      state.lastCompletedDate = today;
    }
    updateStreakDisplay();
    saveState();
  }

  // Displays current streak visually
  function updateStreakDisplay() {
    streakDisplay.textContent = `🔥 Streak: ${state.streak} day${state.streak !== 1 ? "s" : ""}`;
  }

  // Animates XP gain text
  function animateXPGain(text) {
    xpGain.textContent = text;
    xpGain.classList.add("show");
    setTimeout(() => xpGain.classList.remove("show"), 1000);
  }

  // Displays toast message for feedback
  function showToast(message) {
    toastMessage.textContent = message;
    toast.show();
  }

  // Saves app state to localStorage
  function saveState() {
    localStorage.setItem("lifeQuestState", JSON.stringify(state));
  }

  // Expose complete function globally if needed (e.g. from button onclick)
  window.completeCurrentTask = completeCurrentTask;
});
