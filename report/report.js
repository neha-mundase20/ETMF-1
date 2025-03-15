const { ipcRenderer } = require("electron");

ipcRenderer.on("student-data", (event, studentData) => {
  document.getElementById("student-roll").textContent = studentData.studentId;
  document.getElementById("student-name").textContent = studentData.studentName;
  document.getElementById("student-totaltasks").textContent =
    studentData.totalTasks;
  document.getElementById("student-completed").textContent =
    studentData.completedTasks;
  document.getElementById("student-pending").textContent =
    studentData.pendingTasks;
  document.getElementById("student-inprocesstasks").textContent =
    studentData.inProcessTasks;

  const resultElement = document.getElementById("student-result");
  resultElement.textContent = studentData.failedTasks;

  if (studentData.failedTasks >= 2) {
    resultElement.classList.add("result-pass");
  } else {
    resultElement.classList.add("result-fail");
  }
});

// Close button functionality
document.getElementById("close-btn").addEventListener("click", () => {
  window.close();
});
