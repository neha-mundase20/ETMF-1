// Function to initialize document viewer
async function initDocumentViewer() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("No authentication token found. Please log in.");
            window.location.href = "index.html";
            return;
        }

        // Get the stored file URL
        const fileUrl = sessionStorage.getItem("selectedFileUrl");

        if (!fileUrl) {
            document.querySelector('.document-content').innerHTML =
                '<p class="error-message">No document URL found. Please select a task from the dashboard.</p>';
            return;
        }

        console.log("Loading document from:", fileUrl);

        // Get the file extension
        const fileExtension = fileUrl.split('.').pop().toLowerCase();

        // Get the container where the document will be displayed
        const contentContainer = document.querySelector('.document-content');
        contentContainer.innerHTML = ''; // Clear previous content

        if (fileExtension === 'pdf') {
            // PDF file: Use PDF.js
            contentContainer.innerHTML = `<canvas id="pdf-canvas"></canvas>`;
            initPdf(fileUrl);
        } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'avif'].includes(fileExtension)) {
            // Image file: Display in an <img> tag
            contentContainer.innerHTML = `<img src="${fileUrl}" alt="Document Image" class="document-image" style="max-width: 100%; height: auto;">`;
        } else if (['txt', 'json', 'csv'].includes(fileExtension)) {
            // Text file: Fetch and display as plain text
            const response = await fetch(fileUrl);
            const text = await response.text();
            const escapedText = text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            
            // Set proper styling for text content
            contentContainer.innerHTML = `<pre class="document-text" style="margin-top: 0; padding-top: 0; overflow-y: auto; max-height: 100%;">${escapedText}</pre>`;
            contentContainer.scrollTop = 0;
        } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
            // Office files: Provide a Google Docs viewer or download link
            contentContainer.innerHTML = `
                <iframe src="https://docs.google.com/gview?url=${fileUrl}&embedded=true" 
                        class="document-frame" style="width:100%; height:600px; border: none;"></iframe>
                <p><a href="${fileUrl}" target="_blank" download>Download file</a></p>
            `;
        } else {
            // Unsupported format: Show a download link
            contentContainer.innerHTML = `
                <p>Unsupported file format. <a href="${fileUrl}" target="_blank" download>Download file</a></p>
            `;
        }
    } catch (error) {
        console.error("Error initializing document viewer:", error);
        document.querySelector('.document-content').innerHTML =
            '<p class="error-message">Error loading document. Please try again later.</p>';
    }
}


// Helper function to remove loading text
function removeLoadingText() {
    // If it's a standalone element with the text "Loading document..."
    const loadingElements = document.querySelectorAll('*');
    loadingElements.forEach(el => {
        if (el.textContent === 'Loading document...' && el.children.length === 0) {
            el.style.display = 'none'; // Or use el.remove() to completely remove it
        }
    });
}

// Load PDF using PDF.js
function initPdf(pdfUrl) {
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');

    // Ensure pdfjsLib is loaded
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded!');
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(function (pdf) {
        pdfDoc = pdf;
        document.getElementById('page-info').textContent = `Page 1 of ${pdfDoc.numPages}`;

        // Initial render of the first page
        renderPage(1);
        
        // Remove loading text after PDF loads
        removeLoadingText();
        
    }).catch(function (error) {
        console.error('Error loading PDF:', error);
        document.querySelector('.document-content').innerHTML =
            `<p class="error-message">Error loading PDF: ${error.message}</p>`;
    });
}

// Render a specific page in the PDF
function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(function (page) {
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Remove loading text after page renders
        renderTask.promise.then(function() {
            removeLoadingText();
        });
    });
}

// Navigation controls for PDF
document.getElementById('prev-page').addEventListener('click', function() {
    if (pdfDoc && currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
    }
});

document.getElementById('next-page').addEventListener('click', function() {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
    }
});

// Variable to track current page
let pdfDoc = null;
let currentPage = 1;

document.addEventListener("keydown", function (event) {
    const userRole = localStorage.getItem("userRole"); //'admin' or 'student'

    if (userRole !== "admin" && event.key === "PrintScreen") {
        event.preventDefault();
        alert("📸 Screenshots are disabled for students!");
    }
});


// Load comments when the document viewer is initialized
document.addEventListener('DOMContentLoaded', function() {
    initDocumentViewer();
});

// Function to show the custom modal
function showModal(message, callback = null) {
    const modal = document.getElementById("custom-modal");
    const messageBox = document.getElementById("modal-message");
    const closeButton = document.querySelector(".close-modal");
    const okButton = document.getElementById("modal-ok");

    // Set message text
    messageBox.textContent = message;
    modal.style.display = "block";

    // Function to close modal
    function closeModal() {
        modal.style.display = "none";
        if (callback) callback();
    }

    // Close modal on "X" or OK button click
    closeButton.onclick = closeModal;
    okButton.onclick = closeModal;

    // Close modal if user clicks outside content
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal(); 
        }
    };
}

