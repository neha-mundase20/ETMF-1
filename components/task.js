export async function fetchAndDisplayTasks() {
  try {
    const jwt = localStorage.getItem("jwt");
    const studentId = localStorage.getItem("userId"); // Get student ID
    const userRole = localStorage.getItem("userRole"); // Get user role

    if (!jwt) {
      showModal("No authentication token found. Please log in.", () => {
        window.location.href = "index.html";
      });
      return;
    }

    // Fetch tasks from API
    const response = await fetch("https://etmf.somee.com/api/task/available", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        showModal("Session expired. Please log in again.", () => {
          window.location.href = "index.html";
        });
        return;
      }
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const tasks = await response.json();

    // Get the file list container
    const fileListContainer = document.querySelector(".file-list");
    fileListContainer.innerHTML = ""; // Clear existing content

    if (tasks && tasks.length > 0) {
      // Update stats
      document.querySelectorAll(".stat-card h3")[0].textContent = tasks.length;
      const completedTasks = tasks.filter(
        (task) => task.status === "completed"
      ).length;
      document.querySelectorAll(".stat-card h3")[1].textContent =
        completedTasks;
      document.querySelectorAll(".stat-card h3")[2].textContent =
        tasks.length - completedTasks;

      console.log("tasks , ", tasks);

      // Create task items
      tasks.forEach((task) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.dataset.taskId = task.id;
        fileItem.dataset.fileUrl = task.fileUrl;

        fileItem.innerHTML = `
            <div class="task-content" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="assets/folder.png" alt="Folder" style="width: 40px; height: 40px;">
                <div class="task-info">
                  <p class="task-name" style="margin-bottom: 10px; font-weight: bold;">${
                    task.name || "Untitled Task"
                  }</p>
                  <p class="task-description" style="margin: 5px 0 0; font-size: 14px; color: #666;">${
                    task.description || "No description available."
                  }</p>
                </div>
              </div>
              ${
                userRole === "student" && !task.assignedTo
                  ? `<button class="assign-btn" data-docid="${task.id}" style="margin-left: auto; padding:15px; width:100px">Assign</button>`
                  : ""
              }
            </div>
          `;

        // Add event listener for Assign button
        const assignBtn = fileItem.querySelector(".assign-btn");
        if (assignBtn) {
          assignBtn.addEventListener("click", async function () {
            await assignTask(studentId, task.id, assignBtn, fileItem);
          });
        }

        // Open document on click (except when clicking Assign button)
        fileItem.addEventListener("click", function (event) {
          if (!event.target.classList.contains("assign-btn")) {
            openDocument(task.id, task.fileUrl);
          }
        });

        fileListContainer.appendChild(fileItem);
      });
    } else {
      fileListContainer.innerHTML =
        '<p class="no-tasks">No tasks available.</p>';

      document.querySelectorAll(".stat-card h3").forEach((stat) => {
        stat.textContent = "0";
      });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    document.querySelector(".file-list").innerHTML =
      '<p class="error-message">Error loading tasks. Please try again later.</p>';
  }
}

// Function to assign task
async function assignTask(studentId, documentId, assignBtn, taskItem) {
  try {
    const jwt = localStorage.getItem("jwt");

    if (!jwt || !studentId) {
      showModal("Authentication error. Please log in again.");
      return;
    }

    const response = await fetch("https://etmf.somee.com/api/task/assign", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentid: studentId,
        documentid: documentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign task. Status: ${response.status}`);
    }

    // Show success modal instead of alert
    showModal("Task assigned successfully!");

    // Remove Assign button after assignment
    if (assignBtn) {
      assignBtn.remove();
    }

    // Append assigned task to the task section (if needed)
    document.querySelector(".file-list").appendChild(taskItem);
  } catch (error) {
    console.error("Error assigning task:", error);
    showModal("Failed to assign task. Please try again.");
  }
}

function openDocument(taskId, fileUrl) {
  // Store task details in sessionStorage
  console.log("Task ID: ", taskId);
  sessionStorage.setItem("selectedTaskId", taskId);
  sessionStorage.setItem("selectedFileUrl", fileUrl);

  // Navigate to document viewer
  window.location.href = "document_viewer.html";
}

// Function to show the custom modal
function showModal(message, callback = null) {
  // Check if the modal element exists
  let modal = document.getElementById("custom-modal");
  
  // If the modal doesn't exist, create it
  if (!modal) {
    // Create the modal elements
    modal = document.createElement("div");
    modal.id = "custom-modal";
    modal.className = "modal";
    modal.style.display = "flex"; // Use flex instead of block to center content
    
    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    
    // Create close button
    const closeButton = document.createElement("span");
    closeButton.className = "close-modal";
    closeButton.innerHTML = "&times;";
    closeButton.style.cssText = "position: absolute; right: 10px; top: 5px; font-size: 20px; cursor: pointer;";
    
    // Create message element
    const messageElement = document.createElement("p");
    messageElement.id = "modal-message";
    
    // Create OK button
    const okButton = document.createElement("button");
    okButton.id = "modal-ok";
    okButton.textContent = "OK";
    okButton.style.cssText = "margin-top: 15px; padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;";
    
    // Assemble the modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(messageElement);
    modalContent.appendChild(okButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  
  // Set the message
  document.getElementById("modal-message").textContent = message;
  
  // Show the modal
  modal.style.display = "flex";
  
  // Function to close modal
  function closeModal() {
    modal.style.display = "none";
    if (callback) callback();
  }
  
  // Event listeners for closing the modal
  document.querySelector(".close-modal").onclick = closeModal;
  document.getElementById("modal-ok").onclick = closeModal;
  
  // Close modal if user clicks outside content
  window.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };
}

// Add this CSS to your document or a separate CSS file
function addModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    }
    
    .modal-content {
      position: relative;
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  addModalStyles();
});