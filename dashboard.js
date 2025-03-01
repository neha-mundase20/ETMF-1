// Function to fetch and display tasks
async function fetchAndDisplayTasks() {
    try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("No authentication token found. Please log in.");
            window.location.href = "index.html"; // Redirect to login page
            return;
        }

        // Fetch tasks from API
        const response = await fetch("https://etmf.somee.com/api/task/available", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                window.location.href = "index.html";
                return;
            }
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const tasks = await response.json();
        console.log("Tasks fetched:", tasks);
        
        // Get the file list container
        const fileListContainer = document.querySelector('.file-list');
        fileListContainer.innerHTML = ''; // Clear existing content
        
        // Check if tasks exist
        if (tasks && tasks.length > 0) {
            // Update stats
            document.querySelectorAll('.stat-card h3')[0].textContent = tasks.length;
            
            // Count completed tasks
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            document.querySelectorAll('.stat-card h3')[1].textContent = completedTasks;
            document.querySelectorAll('.stat-card h3')[2].textContent = tasks.length - completedTasks;
            
            // Create task items
            tasks.forEach(task => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.taskId = task.id; // Store task ID
                fileItem.dataset.fileUrl = task.fileUrl; // Store file URL
                
                fileItem.innerHTML = `
                    <img src="assets\folder.png" alt="Folder">
                    <p>${task.name || 'Untitled Task'}</p>
                `;
                
                fileItem.addEventListener('click', function() {
                    openDocument(task.id, task.fileUrl);
                });
                
                fileListContainer.appendChild(fileItem);
            });
        } else {
            // No tasks found
            fileListContainer.innerHTML = '<p class="no-tasks">No tasks available.</p>';
            
            // Update stats to show zeros
            document.querySelectorAll('.stat-card h3').forEach(stat => {
                stat.textContent = '0';
            });
        }
        
        // Update welcome message with user's name if available
        if (tasks.user && tasks.user.name) {
            document.querySelector('.header h2').textContent = `Welcome, ${tasks.user.name}`;
        }
        
    } catch (error) {
        console.error("Error fetching tasks:", error);
        document.querySelector('.file-list').innerHTML = 
            '<p class="error-message">Error loading tasks. Please try again later.</p>';
    }
}

// Function to open a document in the document viewer
function openDocument(taskId, fileUrl) {
    // Store task details in sessionStorage
    console.log("Task ID: ",taskId);
    sessionStorage.setItem('selectedTaskId', taskId);
    sessionStorage.setItem('selectedFileUrl', fileUrl);
    
    // Navigate to document viewer
    window.location.href = 'document_viewer.html';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayTasks();
    
    // Toggle Active Class for Sidebar Items
    document.querySelectorAll('.nav li').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.nav li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
