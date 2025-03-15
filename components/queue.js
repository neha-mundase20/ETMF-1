function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function showQueueSection() {
  // Show the queue container
  const queueContainer = document.getElementById("queue-container");
  if (queueContainer) {
    queueContainer.style.display = "block";
    queueContainer.innerHTML = "<h2></h2><p>Loading queue data...</p>";
  } else {
    console.error("Error: queue-container not found in the DOM!");
  }

  // Fetch queue data immediately
  fetchQueueData();
}

// Function to Render Queue Data
function renderQueueList(tasks) {
  // First, inject the CSS
  if (!document.getElementById("queue-styles")) {
    const styleTag = document.createElement("style");
    styleTag.id = "queue-styles";
    styleTag.textContent = `    
        #queue-container {
          display: none;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
          max-width: 1200px; 
          margin: auto; 
          height: 650px;  /* Fix the container height */
          overflow-y: auto;  /* Add vertical scrolling */
        }  
        .queue-controls {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        
        #queue-search {
          flex: 1;
          max-width: 800px;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
          background-color: #f9f9f9;
        }
        
        #queue-search:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        #queue-search::placeholder {
          color: #888;
        }
        
        #status-filter {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 14px;
        }
        
        .queue-list {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 580px;  /* Limit the height of the list */
        }
        
        .task-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }

        .task-item:hover {
          background-color: #f5f5f5;
        }
        
        .task-details {
          flex: 1;
          margin: 0 15px;
        }
        
        .task-name {
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .task-date {
          font-size: 12px;
          color: #777;
          margin: 0;
        }
        
        .status-dropdown {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `;
    document.head.appendChild(styleTag);
  }

  const queueContainer = document.getElementById("queue-container");
  if (!queueContainer) return;

  if (!tasks || tasks.length === 0) {
    queueContainer.innerHTML = "<h2></h2><p>No tasks found in the queue.</p>";
    return;
  }

  // Create queue content
  let queueHTML = `
          <h2>Queue Tasks 1</h2>
          <div class="queue-controls">
              <input type="text" id="queue-search" placeholder="🔍 Search tasks">
              <select id="status-filter">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="inProcess">In Progress</option>
                  <option value="completed">Completed</option>
              </select>
          </div>
          <ul class="queue-list">
      `;

  tasks.forEach((task) => {
    queueHTML += `
              <li class="task-item" data-status="${task.status || "pending"}">
                  <img src="./assets/folder.png" alt="folder">
                  <div class="task-details">
                      <p class="task-name">${
                        task.documentName || "Unnamed Task"
                      }</p>
                      <p class="task-date">Added: ${formatDate(
                        task.dateAssigned || new Date()
                      )}</p>
                  </div>
                  <select class="status-dropdown" data-task-id="${
                    task.documentId
                  }">
                      <option value="pending" ${
                        task.status === "pending" ? "selected" : ""
                      }>Pending</option>
                      <option value="inProcess" ${
                        task.status === "in Process" ? "selected" : ""
                      }>In Progress</option>
                      <option value="completed" ${
                        task.status === "completed" ? "selected" : ""
                      }>Completed</option>
                  </select>
              </li>
          `;
  });

  queueHTML += `</ul>`;
  queueContainer.innerHTML = queueHTML;

  // Add event listeners to status dropdowns
  document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("change", async function () {
      const taskId = this.getAttribute("data-task-id");
      const newStatus = this.value;

      try {
        await updateTaskStatus(taskId, newStatus); // Call the async function

        // Update the UI only if the API call is successful
        this.closest(".task-item").dataset.status = newStatus;
        alert("Task status updated successfully!"); // Simple alert instead of showNotification
      } catch (error) {
        console.error("Error updating task status:", error);
        alert("Failed to update task status. Please try again.");
      }
    });
  });

  async function updateTaskStatus(taskId, newStatus) {
    try {
      const token = localStorage.getItem("jwt"); // Retrieve token here
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      console.log("taskid", taskId);

      const response = await fetch(
        `https://etmf.somee.com/api/task/update-status/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log(`Task ${taskId} status updated to ${newStatus}`);

      const taskIndex = tasks.findIndex((t) => t.documentId === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
      }

      alert(`Document status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update document status. Please try again.");
    }
  }

  // Add search functionality
  const searchInput = document.getElementById("queue-search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      document.querySelectorAll(".queue-list .task-item").forEach((item) => {
        const taskName = item
          .querySelector(".task-name")
          .textContent.toLowerCase();
        if (taskName.includes(searchTerm)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  // Add status filter functionality
  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      const filterValue = this.value;
      document.querySelectorAll(".queue-list .task-item").forEach((item) => {
        if (filterValue === "all" || item.dataset.status === filterValue) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
}

// Function to Fetch Queue Data
export async function fetchQueueData() {
  const queueContainer = document.getElementById("queue-container");
  if (!queueContainer) return;

  const token = localStorage.getItem("jwt");
  if (!token) {
    console.error("No token found, please login first");
    queueContainer.innerHTML =
      "<h2>s</h2><p>Authentication error. Please log in again.</p>";
    return;
  }

  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `https://etmf.somee.com/api/task/assigned/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tasks = await response.json();
    console.log("Queue Tasks:", tasks);
    renderQueueList(tasks);
  } catch (error) {
    console.error("Error fetching queue data:", error);
    queueContainer.innerHTML =
      "<h2>Queue Tasks</h2><p>Error loading queue data. Please try again later.</p>";
  }
}
