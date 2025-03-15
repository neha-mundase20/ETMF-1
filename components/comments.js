async function loadComments() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            console.error("No authentication token found.");
            return;
        }

        const documentId = sessionStorage.getItem("selectedTaskId");
        const userId = localStorage.getItem("userId");

        if (!documentId) {
            // Make sure we have the right structure
            ensureCommentSectionStructure();
            document.querySelector('.comments-container').innerHTML =
                '<p class="error-message">No document selected. Please select a task.</p>';
            return;
        }

        console.log("Fetching comments for document ID:", documentId);

        const response = await fetch(`https://etmf.somee.com/api/Comment/index/${userId}/${documentId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            }
        });

        const responseData = await response.json();
        
        // Ensure we have the proper structure before loading comments
        ensureCommentSectionStructure();
        const commentsContainer = document.querySelector('.comments-container');
        commentsContainer.innerHTML = ""; // Clear previous comments

        // Check if response contains an error message
        if (!response.ok || responseData.message) {
            const errorMessage = responseData.message || `Error: ${response.status}`;
            commentsContainer.innerHTML = `<p class="error-message">${errorMessage}</p>`;
            return;
        }

        // Handle successful response with comments
        if (responseData.length === 0) {
            commentsContainer.innerHTML = "<p>No comments found for this document.</p>";
            return;
        }

        responseData.forEach(comment => {
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
            `<p class="error-message">${error.message}</p>`;
    }
}

// Function to add a comment
async function addComment() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("No authentication token found. Please log in.");
            return;
        }

        const userId = localStorage.getItem("userId"); // Get logged-in user ID
        const documentId = sessionStorage.getItem("selectedTaskId");
        // const commentInput = document.querySelector(".comment-input");

        const commentInput = document.querySelector(".comment-input");



        console.log(userId,documentId,commentInput);

        if (!documentId) {
            alert("No document selected. Please select a task.");
            return;
        }

        if (!commentInput.value.trim()) {
            //alert("Comment cannot be empty!");
            showModal("Comment cannot be empty!")
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
                studentId: userId,
                documentId: documentId,
                comment1: commentText
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Comment added:", result);
        //alert("✅ Comment added successfully!");
        showModal("✅ Comment added successfully!", () => {
            loadComments(); // Reload comments after modal closes
        });

        // Clear input field after successful comment
        commentInput.value = "";

        // Reload comments to show the new one
        loadComments();

    } catch (error) {
        console.error("Error adding comment:", error);
        //alert("❌ Failed to add comment. Please try again.");
        showModal("❌ Failed to add comment. Please try again.")
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

// Attach event listener to Send button
document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.querySelector(".send-button");
    if (sendButton) {
        sendButton.addEventListener("click", addComment);
    }
});

// Load comments when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    ensureCommentSectionStructure();
    loadComments();
});
