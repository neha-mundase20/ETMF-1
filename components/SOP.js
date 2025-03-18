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

  const searchInput = document.querySelector(".search-bar");
  if (searchInput) {
    function restoreFocus() {
      setTimeout(() => {
        if (document.activeElement !== searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }, 50); // Small delay ensures input remains active
    }
  
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      document.querySelectorAll("#sop-table-body tr").forEach((row) => {
        const documentName = row.querySelector("td:first-child").textContent.toLowerCase();
        const documentType = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
  
        if (documentName.includes(searchTerm) || documentType.includes(searchTerm)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  
    // Ensure input regains focus after window alert() or confirm()
    const originalAlert = window.alert;
    window.alert = function (message) {
      originalAlert(message);
      restoreFocus();
    };
  
    const originalConfirm = window.confirm;
    window.confirm = function (message) {
      const result = originalConfirm(message);
      restoreFocus();
      return result;
    };
  
    // Ensure search input regains focus when window refocuses
    window.addEventListener("focus", restoreFocus);
  }
  
  // If user is not an admin, exit early
  if (userRole !== "admin") {
    return;
  }
  
 // Create and insert modal CSS dynamically
 const modalCSS = `
 .modal {
   display: none;
   position: fixed;
   z-index: 1000;
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);
   width: 350px;
   background: white;
   padding: 25px;
   box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
   border-radius: 10px;
   text-align: center;
 }
 
 .modal-content {
   font-family: Arial, sans-serif;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
 }
 
 .modal h2 {
   margin-top: 0;
   color: #28a745;
   font-size: 22px;
   font-weight: bold;
 }
 
 .modal p {
   font-size: 16px;
   color: #333;
   margin: 15px 0;
 }
 
 #success-ok-btn {
   margin-top: 15px;
   padding: 10px 20px;
   border: none;
   background: #28a745;
   color: white;
   font-size: 16px;
   cursor: pointer;
   border-radius: 6px;
   transition: background 0.3s ease;
 }
 
 #success-ok-btn:hover {
   background: #218838;
 }
 
 /* Backdrop effect */
 .modal-backdrop {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.4);
   z-index: 999;
   display: none;
 }
 `;
 
 const styleSheet = document.createElement("style");
 styleSheet.textContent = modalCSS;
 document.head.appendChild(styleSheet);
 
 // Function to show the success modal
 function showSuccessModal(message) {
   let modal = document.getElementById("success-modal");
   let backdrop = document.getElementById("modal-backdrop");
 
   if (!modal) {
     // Create modal backdrop
     backdrop = document.createElement("div");
     backdrop.id = "modal-backdrop";
     backdrop.className = "modal-backdrop";
     document.body.appendChild(backdrop);
 
     // Create modal
     modal = document.createElement("div");
     modal.id = "success-modal";
     modal.className = "modal";
     modal.innerHTML = `
       <div class="modal-content">
         <h2>Success</h2>
         <p id="modal-message">${message}</p>
         <button id="success-ok-btn">OK</button>
       </div>
     `;
     document.body.appendChild(modal);
   } else {
     document.getElementById("modal-message").textContent = message;
   }
 
   // Show modal and backdrop
   modal.style.display = "flex";
   backdrop.style.display = "block";
 
   document.getElementById("success-ok-btn").addEventListener("click", () => {
     modal.style.display = "none";
     backdrop.style.display = "none";
   });
 }
 
 
 // Upload button logic
 const uploadButton = document.querySelector(".upload-btn");
 const fileInput = document.getElementById("file-upload");
 const descriptionInput = document.getElementById("description");
 const finalUploadButton = document.getElementById("final-upload-btn");
 const selectedFileName = document.getElementById("selected-file-name");
 const uploadDetailsContainer = document.getElementById("upload-details-container");
 
 let selectedFile = null;
 
 // Disable upload button initially
 finalUploadButton.disabled = true;
 
 if (uploadButton && fileInput) {
   uploadButton.addEventListener("click", () => fileInput.click());
 
   fileInput.addEventListener("change", (event) => {
     selectedFile = event.target.files[0];
     if (selectedFile) {
       selectedFileName.textContent = `📄 ${selectedFile.name}`;
       selectedFileName.style.color = "#28a745";
       uploadDetailsContainer.style.display = "block";
       finalUploadButton.disabled = false; // Enable upload button
     }
   });
 
   finalUploadButton.addEventListener("click", async () => {
     if (!selectedFile) {
       showErrorModal("Please select a file first.");
       return;
     }
 
     const description = descriptionInput.value.trim();
     if (!description) {
       showErrorModal("Please provide a description for the document.");
       return;
     }
 
     const jwt = localStorage.getItem("jwt");
     if (!jwt) {
       showErrorModal("Authentication required. Please log in.");
       window.location.href = "index.html";
       return;
     }
 
     const formData = new FormData();
     formData.append("name", selectedFile.name);
     formData.append("description", description);
     formData.append("file", selectedFile);
     formData.append("createdby", localStorage.getItem("userId"));
 
     // Show loading state
     finalUploadButton.textContent = "Uploading...";
     finalUploadButton.disabled = true;
 
     try {
       const response = await fetch("https://etmf.somee.com/api/document/upload", {
         method: "POST",
         headers: { Authorization: `Bearer ${jwt}` },
         body: formData,
       });
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
       }
 
       showSuccessModal("File uploaded successfully!");
 
       // Reset file input field correctly
       const newFileInput = fileInput.cloneNode(true);
       fileInput.replaceWith(newFileInput);
       newFileInput.addEventListener("change", fileInput.onchange);
 
       // Reset UI fields
       descriptionInput.value = "";
       uploadDetailsContainer.style.display = "none";
       selectedFile = null;
       selectedFileName.textContent = "";
       finalUploadButton.disabled = true;
 
       // Update document list without reloading
       fetchAndDisplayDocuments();
     } catch (error) {
       console.error("Error uploading file:", error);
       showErrorModal(`File upload failed. ${error.message}`);
     } finally {
       finalUploadButton.textContent = "Upload File";
       finalUploadButton.disabled = false;
     }
   });
 }
 
 // Function to show an error modal
 function showErrorModal(message) {
   showSuccessModal(message); // You can replace this with a red-styled error modal if needed
 }
 
 
 // Function to fetch and display documents in the SOP section
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
       headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
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
 
         // Highlight row on hover
         row.style.cursor = "pointer";
         row.addEventListener("mouseover", () => (row.style.backgroundColor = "#f0f0f0"));
         row.addEventListener("mouseout", () => (row.style.backgroundColor = "transparent"));
 
         // Open document preview modal on click
         row.addEventListener("click", () => openDocumentPreview(doc.filePath));
 
         tableBody.appendChild(row);
       });
     } else {
       tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No documents available.</td></tr>`;
     }
   } catch (error) {
     console.error("Error fetching documents:", error);
   }
 }
 
 // Function to open document preview modal centered
 function openDocumentPreview(filePath) {
   if (!filePath) {
     showModal("File path is missing!");
     return;
   }
 
   const fileUrl = `https://etmf.somee.com${filePath}`;
 
   // Create modal if not exists
   let modal = document.getElementById("document-modal");
   if (!modal) {
     modal = document.createElement("div");
     modal.id = "document-modal";
     modal.className = "modal";
     modal.style.display = "flex";
 
     const modalContent = document.createElement("div");
     modalContent.className = "modal-content";
 
     // Header with controls
     const modalHeader = document.createElement("div");
     modalHeader.className = "modal-header";
 
     // Close button
     const closeButton = document.createElement("span");
     closeButton.className = "close-modal";
     closeButton.innerHTML = "&times;";
     closeButton.style.cssText = "font-size: 20px; cursor: pointer;";
 
     // Fullscreen button
     const fullscreenButton = document.createElement("button");
     fullscreenButton.innerHTML = "⛶";
     fullscreenButton.className = "fullscreen-btn";
     fullscreenButton.style.cssText = "font-size: 18px; cursor: pointer; margin-left: 10px;";
 
     // Minimize button
     const minimizeButton = document.createElement("button");
     minimizeButton.innerHTML = "⤢";
     minimizeButton.className = "minimize-btn";
     minimizeButton.style.cssText = "font-size: 18px; cursor: pointer; margin-left: 10px;";
 
     // Document preview container
     const previewContainer = document.createElement("div");
     previewContainer.id = "document-preview";
     previewContainer.style.cssText =
       "width: 80vw; height: 50vh; overflow: auto; background: white; display: flex; align-items: center; justify-content: center;";
 
     // Append elements
     modalHeader.appendChild(closeButton);
     modalHeader.appendChild(fullscreenButton);
     modalHeader.appendChild(minimizeButton);
     modalContent.appendChild(modalHeader);
     modalContent.appendChild(previewContainer);
     modal.appendChild(modalContent);
     document.body.appendChild(modal);
   }
 
   // Center the modal
   modal.style.position = "fixed";
   modal.style.top = "50%";
   modal.style.left = "50%";
   modal.style.transform = "translate(-50%, -50%)";
   modal.style.width = "70vw"; 
   modal.style.height = "60vh";
   modal.style.borderRadius = "8px";
   modal.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
 
   // Get the preview container
   const previewContainer = document.getElementById("document-preview");
 
   // Determine file type and display accordingly
   if (filePath.endsWith(".pdf")) {
     previewContainer.innerHTML = `<iframe src="${fileUrl}" width="100%" height="100%" style="border:none;"></iframe>`;
   } else if (filePath.match(/\.(jpg|jpeg|png|gif)$/)) {
     previewContainer.innerHTML = `<img src="${fileUrl}" alt="Document Image" style="max-width:100%; max-height:100%;">`;
   } else if (filePath.endsWith(".txt")) {
     fetch(fileUrl)
       .then((response) => response.text())
       .then((text) => {
         previewContainer.innerHTML = `<pre style="text-align:left; white-space:pre-wrap;">${text}</pre>`;
       })
       .catch(() => (previewContainer.innerHTML = "<p>Error loading text file.</p>"));
   } else {
     previewContainer.innerHTML = "<p>File format not supported for preview.</p>";
   }
 
   // Show the modal
   modal.style.display = "flex";
 
   // Close modal functionality
   document.querySelector(".close-modal").onclick = () => (modal.style.display = "none");
 
   // Fullscreen functionality
   document.querySelector(".fullscreen-btn").onclick = () => {
     modal.style.width = "95vw";
     modal.style.height = "90vh";
     previewContainer.style.width = "90vw";
     previewContainer.style.height = "80vh";
   };
 
   // Minimize functionality
   document.querySelector(".minimize-btn").onclick = () => {
     modal.style.width = "70vw";
     modal.style.height = "60vh";
     previewContainer.style.width = "80vw";
     previewContainer.style.height = "50vh";
   };
 }
 
 // Initialize fetch function on page load
 document.addEventListener("DOMContentLoaded", function () {
   fetchAndDisplayDocuments();
 });
 
 }
