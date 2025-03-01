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
        initPdf(fileUrl); // Load the PDF in viewer

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

// Function to load comments
async function loadComments() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            console.error("No authentication token found.");
            return;
        }

        const documentId = sessionStorage.getItem("selectedTaskId");

        if (!documentId) {
            // Make sure we have the right structure
            ensureCommentSectionStructure();
            document.querySelector('.comments-container').innerHTML =
                '<p class="error-message">No document selected. Please select a task.</p>';
            return;
        }

        console.log("Fetching comments for document ID:", documentId);

        const response = await fetch(`https://etmf.somee.com/api/Comment/index?documentId=${documentId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const comments = await response.json();
        console.log("Comments received:", comments);

        // Ensure we have the proper structure before loading comments
        ensureCommentSectionStructure();
        
        const commentsContainer = document.querySelector('.comments-container');
        commentsContainer.innerHTML = ""; // Clear previous comments

        if (comments.length === 0) {
            commentsContainer.innerHTML = "<p>No comments found for this document.</p>";
            return;
        }

        comments.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `
                <div class="comment-author">Student ${comment.studentId}</div>
                <div class="comment-text">${comment.comment1}</div>
                <div class="comment-time">${new Date(comment.createdAt).toLocaleString()}</div>
            `;
            commentsContainer.appendChild(commentDiv);
        });

    } catch (error) {
        console.error("Error loading comments:", error);
        ensureCommentSectionStructure();
        document.querySelector('.comments-container').innerHTML =
            '<p class="error-message">Error loading comments. Please try again later.</p>';
    }
}

// Function to add a comment
// Function to add a comment
async function addComment() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("No authentication token found. Please log in.");
            return;
        }

        // const studentId = localStorage.getItem("userId"); // Get logged-in user ID
        // const documentId = sessionStorage.getItem("selectedTaskId");
        // const commentInput = document.querySelector(".comment-input");

        const studentId = 3; // Get logged-in user ID
        const documentId = 1;
        const commentInput = document.querySelector(".comment-input");



        console.log(studentId,documentId,commentInput);

        if (!documentId) {
            alert("No document selected. Please select a task.");
            return;
        }

        if (!commentInput.value.trim()) {
            alert("Comment cannot be empty!");
            return;
        }

        const commentText = commentInput.value.trim();

        const response = await fetch("https://etmf.somee.com/api/Comment/comment", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: studentId,
                documentId: documentId,
                comment1: commentText
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Comment added:", result);
        alert("✅ Comment added successfully!");

        // Clear input field after successful comment
        commentInput.value = "";

        // Reload comments to show the new one
        loadComments();

    } catch (error) {
        console.error("Error adding comment:", error);
        alert("❌ Failed to add comment. Please try again.");
    }
}

// Attach event listener to Send button
document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.querySelector(".send-button");
    if (sendButton) {
        sendButton.addEventListener("click", addComment);
    }
});


// Attach event listener to Send button
document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.querySelector(".send-button");
    if (sendButton) {
        sendButton.addEventListener("click", addComment);
    }
});


function ensureCommentSectionStructure() {
    const commentSection = document.querySelector('.comment-section');
    
    // If the structure isn't already in place, create it
    if (!document.querySelector('.comments-container')) {
        // Save any existing content to reuse
        const existingContent = commentSection.innerHTML;
        
        // Create the proper structure
        commentSection.innerHTML = `
            <div class="comment-header">
                <h3>Comments</h3>
            </div>
            <div class="comments-container"></div>
            <div class="comment-input-form">
                <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                <button class="send-button">Send</button>
            </div>
        `;
        
        // If there was existing content and no proper structure, 
        // it might have been error messages - place them in comments container
        if (existingContent && existingContent.includes('error-message')) {
            document.querySelector('.comments-container').innerHTML = existingContent;
        }
    }
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
    ensureCommentSectionStructure(); // Make sure structure is in place first
    loadComments(); // Then load comments
});