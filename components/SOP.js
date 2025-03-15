function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function showSOPSection() {
  const mainContent = document.querySelector(".main-content");

  // Fetch user role from local storage
  const userRole = localStorage.getItem("userRole");

  // Create SOP section container if it doesn't exist
  let sopSection = document.getElementById("sop-section");
  if (!sopSection) {
    sopSection = document.createElement("div");
    sopSection.id = "sop-section";
    mainContent.appendChild(sopSection);
  }

  // Create the SOP container
  let sopContainer = document.createElement("div");
  sopContainer.className = "sop-container";

  // Set the innerHTML with conditional rendering for upload button
  sopContainer.innerHTML = `
    <div class="sop-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
      <h2 class="section-title">SOP Section</h2>
      <input type="text" class="search-bar" placeholder="🔍 Search" 
        style="flex-grow: 1; max-width: 400px; height: 40px; font-size: 16px; padding: 5px 10px;">
      ${
        userRole === "admin"
          ? '<input type="file" id="file-upload" style="display: none"><button class="upload-btn">Upload Document ⬆</button>'
          : ""
      }
    </div>
  
    <!-- Flex container for Table & Upload Section -->
    <div class="sop-content">
      <!-- Table -->
      <div class="sop-table-container">
        <table class="sop-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Created By</th>
              <th>Date and Time</th>
              <th>No Of Views</th>
            </tr>
          </thead>
          <tbody id="sop-table-body"></tbody>
        </table>
      </div>
  
      <!-- Upload & Description Section -->
      <div class="upload-section">
        <div id="upload-details-container" style="margin-top: 10px; display: none; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
          <p><strong>Selected Document:</strong> <span id="selected-file-name"></span></p>
          <label for="description">Enter Document Description:</label>
          <textarea id="description" rows="3"></textarea>
          <button id="final-upload-btn">Upload File</button>
        </div>
      </div>
    </div>
  `;

  // Clear the sopSection and append the new container
  sopSection.innerHTML = "";
  sopSection.appendChild(sopContainer);

  fetchAndDisplayDocuments();

  // Add search functionality
  const searchInput = document.querySelector(".search-bar");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      document.querySelectorAll("#sop-table-body tr").forEach((row) => {
        const documentName = row
          .querySelector("td:first-child")
          .textContent.toLowerCase();
        const documentType = row
          .querySelector("td:nth-child(2)")
          .textContent.toLowerCase();

        if (
          documentName.includes(searchTerm) ||
          documentType.includes(searchTerm)
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }

  // If user is not an admin, exit early
  if (userRole !== "admin") {
    return;
  }

  // Elements for upload functionality
  const uploadButton = document.querySelector(".upload-btn");
  const fileInput = document.getElementById("file-upload");
  const uploadDetailsContainer = document.getElementById(
    "upload-details-container"
  );
  const selectedFileName = document.getElementById("selected-file-name");
  const descriptionInput = document.getElementById("description");
  const finalUploadButton = document.getElementById("final-upload-btn");
  const tableBody = document.getElementById("sop-table-body");

  let selectedFile = null; // Variable to store selected file

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", function () {
      fileInput.click(); // Open file picker
    });

    fileInput.addEventListener("change", function (event) {
      selectedFile = event.target.files[0]; // Store selected file

      if (selectedFile) {
        selectedFileName.textContent = selectedFile.name;
        uploadDetailsContainer.style.display = "block"; // Show file name & description input
      }
    });

    finalUploadButton.addEventListener("click", async function () {
      if (!selectedFile) {
        alert("Please select a file first.");
        return;
      }

      const description = descriptionInput.value.trim();
      if (!description) {
        alert("Please provide a description for the document.");
        return;
      }

      const formData = new FormData();
      formData.append("name", selectedFile.name);
      formData.append("description", description); // Include the description
      formData.append("file", selectedFile);
      formData.append("createdby", localStorage.getItem("userId")); // Change based on user ID logic

      try {
        const response = await fetch(
          "https://etmf.somee.com/api/document/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Upload successful:", result);

        // Add the file entry to the table
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><span class="doc-icon blue">📄</span> ${selectedFile.name}</td>
            <td>Uploaded Document</td>
            <td>Created On: ${new Date().toLocaleString()}</td>
            <td><span class="view-icon">👁</span> 0</td>
          `;
        tableBody.appendChild(newRow);

        alert("File uploaded successfully!");
        fetchAndDisplayDocuments();

        // Reset everything after upload
        fileInput.value = "";
        descriptionInput.value = "";
        uploadDetailsContainer.style.display = "none";
        selectedFile = null;
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("File upload failed. Please try again.");
      }
    });
  }

  // Display the SOP section
  sopSection.style.display = "block";
}

async function fetchAndDisplayDocuments() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("No authentication token found. Please log in.");
      window.location.href = "index.html";
      return;
    }

    const response = await fetch("https://etmf.somee.com/api/document/index", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    const documents = await response.json();
    const tableBody = document.getElementById("sop-table-body");
    tableBody.innerHTML = "";

    if (documents.length > 0) {
      documents.forEach((doc) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><span class="doc-icon blue">📄</span> ${doc.name}</td>
            <td>${doc.createdBy || "N/A"}</td>
            <td>${new Date(doc.createdAt).toLocaleString()}</td>
            <td><span class="view-icon">👁</span> ${doc.views || 0}</td>
          `;
        row.addEventListener("click", () => window.open(doc.fileUrl, "_blank"));
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No documents available.</td></tr>`;
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}
