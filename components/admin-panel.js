export async function showAdminSection() {
  const mainContent = document.querySelector(".main-content");
  let adminSection = document.getElementById("admin-section");

  if (!adminSection) {
    adminSection = document.createElement("div");
    adminSection.id = "admin-section";
    mainContent.appendChild(adminSection);
  }

  const jwt = localStorage.getItem("jwt");
  const adminId = localStorage.getItem("userId");

  try {
    const response = await fetch(
      `https://etmf.somee.com/api/user/users?adminId=${adminId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const admins = await response.json();

    // Generate table HTML dynamically with search bar
    let tableHTML = `
            <div class="admin-header">
                <h2>Admin Dashboard</h2>
            </div>
           
            <div id="admin-info">
            </div>
            
            <div class="search-container" style="margin-top: 20px; margin-bottom: 15px;">
                <input type="text" id="admin-search" placeholder="Search by name, email or role..." 
                       style="width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
            </div>
            
            <div class="admin-table" style="max-height: 1000px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px;">
                <table border="1" style="width: 100%; border-collapse: collapse;" id="admin-table">
                    <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 1;">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Active</th>
                        </tr>
                    </thead>
                    <tbody id="admin-table-body">
        `;

    admins.forEach((admin) => {
      const currentStatus = admin.isActive ? "true" : "false";
      const oppositeStatus = admin.isActive ? "false" : "true";
      tableHTML += `
            <tr>
              <td>${admin.id}</td>
              <td>${admin.name}</td>
              <td>${admin.email}</td>
              <td>${admin.role}</td>
              <td>${new Date(admin.createdAt).toLocaleString()}</td>
              <td>
                <select data-user-id="${admin.id}" class="status-select">
                  <option value="${currentStatus}" selected>${
        admin.isActive ? "✅ Active" : "❌ Inactive"
      }</option>
                  <option value="${oppositeStatus}">${
        admin.isActive ? "❌ Inactive" : "✅ Active"
      }</option>
                </select>
              </td>
            </tr>
          `;
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

    adminSection.innerHTML = tableHTML;

    // Store the admins data for search functionality
    adminSection.dataset.admins = JSON.stringify(admins);

    // Add event listeners after rendering
    const statusSelects = adminSection.querySelectorAll(".status-select");
    statusSelects.forEach((select) => {
      select.addEventListener("change", function () {
        const userId = this.getAttribute("data-user-id");
        const status = this.value;
        updateUserStatus(userId, status);
      });
    });

    // Add search functionality that triggers as you type
    const searchInput = document.getElementById("admin-search");

    // Use input event to filter in real-time as the user types
    searchInput.addEventListener("input", function () {
      filterAdmins(this.value.toLowerCase());
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    adminSection.innerHTML = `<p>Error loading admin data.</p>`;
  }
}

// Function to filter admins based on search term
function filterAdmins(searchTerm) {
  const adminSection = document.getElementById("admin-section");
  const tableBody = document.getElementById("admin-table-body");

  if (!adminSection || !tableBody) return;

  const admins = JSON.parse(adminSection.dataset.admins || "[]");

  // Clear the table body
  tableBody.innerHTML = "";

  // Filter admins based on search term
  const filteredAdmins = searchTerm
    ? admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchTerm) ||
          admin.email.toLowerCase().includes(searchTerm) ||
          admin.role.toLowerCase().includes(searchTerm)
      )
    : admins;

  // Rebuild the table with filtered results
  filteredAdmins.forEach((admin) => {
    const currentStatus = admin.isActive ? "true" : "false";
    const oppositeStatus = admin.isActive ? "false" : "true";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${admin.id}</td>
      <td>${admin.name}</td>
      <td>${admin.email}</td>
      <td>${admin.role}</td>
      <td>${new Date(admin.createdAt).toLocaleString()}</td>
      <td>
        <select data-user-id="${admin.id}" class="status-select">
          <option value="${currentStatus}" selected>${
      admin.isActive ? "✅ Active" : "❌ Inactive"
    }</option>
          <option value="${oppositeStatus}">${
      admin.isActive ? "❌ Inactive" : "✅ Active"
    }</option>
        </select>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Re-add event listeners to the newly created select elements
  const statusSelects = tableBody.querySelectorAll(".status-select");
  statusSelects.forEach((select) => {
    select.addEventListener("change", function () {
      const userId = this.getAttribute("data-user-id");
      const status = this.value;
      updateUserStatus(userId, status);
    });
  });

  // Display message if no results found
  if (filteredAdmins.length === 0) {
    const noResultsRow = document.createElement("tr");
    noResultsRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 20px; font-size: 16px;">No matching results found</td>
    `;
    tableBody.appendChild(noResultsRow);
  }
}

// Function to create and show the modal
function showModal(message) {
  // Check if modal already exists, if not, create it
  let modal = document.getElementById("custom-modal");
  
  if (!modal) {
      modal = document.createElement("div");
      modal.id = "custom-modal";
      modal.classList.add("modal");
      modal.style.display = "flex"; // Make it visible
      modal.style.position = "fixed";
      modal.style.zIndex = "1000";
      modal.style.left = "0";
      modal.style.top = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";

      // Modal Content
      const modalContent = document.createElement("div");
      modalContent.classList.add("modal-content");
      modalContent.style.background = "white";
      modalContent.style.padding = "20px";
      modalContent.style.borderRadius = "8px";
      modalContent.style.textAlign = "center";
      modalContent.style.minWidth = "300px";
      modalContent.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

      // Modal Message
      const modalMessage = document.createElement("p");
      modalMessage.id = "modal-message";
      modalMessage.textContent = message;

      // OK Button
      const closeButton = document.createElement("button");
      closeButton.id = "close-modal";
      closeButton.textContent = "OK";
      closeButton.style.padding = "10px 20px";
      closeButton.style.backgroundColor = "#007bff";
      closeButton.style.color = "white";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.cursor = "pointer";
      closeButton.style.fontWeight = "500";
      closeButton.style.marginTop = "10px";

      closeButton.addEventListener("click", () => {
          modal.style.display = "none";
      });

      // Append elements
      modalContent.appendChild(modalMessage);
      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
  } else {
      // If modal already exists, just update the message and show it
      document.getElementById("modal-message").textContent = message;
      modal.style.display = "flex";
  }
}

export async function updateUserStatus(userId, status) {
  const jwt = localStorage.getItem("jwt");
  const adminId = localStorage.getItem("userId");

  try {
      const response = await fetch(
          `https://etmf.somee.com/api/user/update-status/${userId}?adminId=${adminId}`,
          {
              method: "PUT",
              headers: {
                  Authorization: `Bearer ${jwt}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(status === "true"),
          }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      console.log("Status updated successfully");

      // Show success modal instead of alert
      showModal("User status updated successfully!");

      showAdminSection();
  } catch (error) {
      console.error("Error updating user status:", error);

      // Show error modal instead of alert
      showModal("Error updating user status. Please try again.");
  }
}
