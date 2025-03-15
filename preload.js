const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openStudentReport: (studentData) =>
    ipcRenderer.send("open-student-report", studentData),
});

// Add the preload.js
