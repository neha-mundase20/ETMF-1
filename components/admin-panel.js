export async function showAdminSection() {
  const mainContent = document.querySelector(".main-content");
  let adminSection = document.getElementById("admin-section");

  if (!adminSection) {
    adminSection = document.createElement("div");
    adminSection.id = "admin-section";
    mainContent.appendChild(adminSection);
  }

  const jwt = localStorage.getItem("jwt");
  const adminId = localStorage.getItem("userId"); // Change this as needed
  console.log(adminId);
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

    // Generate table HTML dynamically
    let tableHTML = `
            <div class="admin-header">
                <h2>Admin Dashboard</h2>
            </div>
           
            <div id="admin-info">
            </div>
           <div class="admin-table" style="max-height: 1000px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px;">
          <table border="1" style="width: 100%; border-collapse: collapse;">
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
                    <tbody>
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
                <select onchange="updateUserStatus(${admin.id}, this.value)">
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

    // Add event listeners after rendering the buttons
  } catch (error) {
    console.error("Error fetching admin data:", error);
    adminSection.innerHTML = `<p>Error loading admin data.</p>`;
  }
}

// Function to update status
async function updateUserStatus(userId, status) {
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
  } catch (error) {
    console.error("Error updating user status:", error);
  }
}
