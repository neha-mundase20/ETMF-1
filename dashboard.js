import { fetchAndDisplayTasks } from "./components/task.js";
import { loadStudentListSection } from "./components/student-list.js";
import { fetchQueueData } from "./components/queue.js";
import { showAdminSection } from "./components/admin-panel.js";
import { showSOPSection } from "./components/SOP.js";
import { showQueueSection } from "./components/queue.js";
document.addEventListener("DOMContentLoaded", function () {
  // Get all navigation items
  const userRole = localStorage.getItem("userRole");
  console.log(userRole);

  const userName = localStorage.getItem("userName");
  if (userName) {
    document.getElementById("user-name").textContent = userName;
    document.querySelector(".userName").textContent = userName;
  }

  // Get the admin button element
  const adminButton = document.getElementById("admin-button");
  const queueButton = document.getElementById("queue-button");
  const studentList = document.getElementById("studentList");
  // Show admin button only if the user role is 'admin'
  if (userRole === "admin") {
    adminButton.style.display = "block";
    studentList.style.display = "block";
    queueButton.style.display = "none";
  }

  if (userRole === "student") {
    queueButton.style.display = "block";
    studentList.style.display = "none";
  }

  const navItems = document.querySelectorAll(".nav li");

  // Initialize task section by default
  showTaskSection();
  fetchAndDisplayTasks();

  // Add click event listeners to all navigation items
  navItems.forEach((item) => {
    item.addEventListener("click", async function () {
      // Remove active class from all items
      navItems.forEach((li) => li.classList.remove("active"));
      // Add active class to clicked item
      this.classList.add("active");

      // Get the section to display from data attribute
      const section = this.getAttribute("data-section");

      // Hide all sections first
      hideAllSections();

      // Show the appropriate section based on navigation
      switch (section) {
        case "task":
          showTaskSection();
          fetchAndDisplayTasks();
          break;
        case "sop":
          showSOPSection();
          break;
        case "students":
          await loadStudentListSection();
          break;
        case "queue":
          showQueueSection();
          await fetchQueueData();
          break;
        case "admin":
          await showAdminSection();
          break;
        default:
          showTaskSection();
          break;
      }
    });
  });
});

// Helper function to hide all sections
function hideAllSections() {
  // Hide all relevant containers
  document.querySelector(".stats-container").style.display = "none";
  document.querySelector(".file-list").style.display = "none";

  // Hide queue container if it exists
  const queueContainer = document.getElementById("queue-container");
  if (queueContainer) queueContainer.style.display = "none";

  // Clear main content area where dynamic content might be placed
  const mainContent = document.querySelector(".main-content");

  // Remove any dynamically added sections but keep the permanent elements
  const permanentElements = [
    ".header",
    ".stats-container",
    ".file-list",
    "#queue-container",
  ];

  // Get all direct children of main-content
  const children = Array.from(mainContent.children);

  children.forEach((child) => {
    // Check if this is not a permanent element
    const isPermanent = permanentElements.some(
      (selector) => child.matches(selector) || child.querySelector(selector)
    );

    if (!isPermanent && !child.classList.contains("header")) {
      mainContent.removeChild(child);
    }
  });
}

// Show Task Section (My Task)
function showTaskSection() {
  document.querySelector(".stats-container").style.display = "flex";
  document.querySelector(".file-list").style.display = "grid";
}

// Show SOP Section

// Helper function to format dates

// Helper function to show notifications
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to document
  document.body.appendChild(notification);

  // Automatically remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
