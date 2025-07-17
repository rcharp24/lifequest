// src/main.js

// Auto-reload on file changes during development
try {
  require('electron-reload')(__dirname, {
    ignored: /node_modules|[\/\\]\./
  });
} catch (_) {
  console.log('electron-reload not available');
}

// Import required modules from Electron and Node
const { app, BrowserWindow } = require("electron");
const path = require("path");

// Declare a variable to hold our app window
let mainWindow;

// This function creates the actual desktop window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,             // Width of the window
    height: 1100,            // Height of the window
    webPreferences: {
      nodeIntegration: true,  // Let us use Node.js in the frontend
      contextIsolation: false
    }
  });

  // Load the HTML file for the UI
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Optional: Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// When Electron is ready, run our createWindow function
app.whenReady().then(createWindow);

// Handle MacOS behavior where the app stays active with no windows
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});