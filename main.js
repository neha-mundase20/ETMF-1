const { app, BrowserWindow, ipcMain } = require("electron"); // add ipcmain

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + "/preload.js",
      contextIsolation: true, // Ensure it's true for security reasons
      nodeIntegration: false, // change web preferences
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // added ipcMain for api

  ipcMain.on("open-student-report", (event, studentData) => {
    const reportWindow = new BrowserWindow({
      width: 500,
      height: 400,
      title: `Report - ${studentData.studentName}`,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    reportWindow.loadFile("./report/report.html");

    reportWindow.webContents.once("did-finish-load", () => {
      reportWindow.webContents.send("student-data", studentData);
    });
  });

  // till here
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
