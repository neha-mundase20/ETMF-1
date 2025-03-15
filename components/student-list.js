// Function to load student list dynamically
export async function loadStudentListSection() {
  console.log("Loading student list...");

  const mainContent = document.querySelector(".main-content");

  // Create a container for student section if it doesn't exist
  let studentSection = document.getElementById("student-section");
  if (!studentSection) {
    studentSection = document.createElement("div");
    studentSection.id = "student-section";
    mainContent.appendChild(studentSection);
  }

  // Inject CSS styles dynamically
  const style = document.createElement("style");
  style.innerHTML = `
      .student-controls {
        margin-top: 10px;
        display: flex;
        justify-content: start;
      }
      #student-search {
        padding: 10px 5px;
        text-size:xl;
        width: 30%;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
    `;
  document.head.appendChild(style);

  // Show loading indicator
  studentSection.innerHTML =
    "<h2>Students List</h2><p>Loading student data...</p>";

  try {
    // Fetch student performance data
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      "https://etmf.somee.com/api/StudentPerformances/student-performance",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const students = await response.json();
    console.log("Students fetched:", students);

    // Update student section with table
    studentSection.innerHTML = `
              <h2>Students List</h2>
              <div class="student-controls">
                  <input type="text" id="student-search" placeholder="🔍 Search">
              </div>
              <div class="table-container">
                  <table>
                      <thead>
                          <tr>
                              <th>Roll No</th>
                              <th>Student Name</th>
                              <th>Total Tasks</th>
                              <th>Completed Tasks</th>
                              <th>Pending Tasks</th>
                              <th>Failed Tasks</th>
                              <th>Report</th>
                          </tr>
                      </thead>
                      <tbody id="studentTableBody"></tbody>
                  </table>
              </div>
          `;

    const studentTableBody = document.getElementById("studentTableBody");

    // Check if we have student data
    if (students && students.length > 0) {
      // Populate table with student data
      students.forEach((student) => {
        let row = `<tr>
                      <td>${student.studentId || "N/A"}</td>
                      <td>${student.studentName || "N/A"}</td>
                      <td>${student.totalTasks || 0}</td>
                      <td>${student.completedTasks || 0}</td>
                      <td>${student.pendingTasks || 0}</td>
                      <td>${student.failedTasks || 0}</td>
                      <td><button class="view-report-btn" data-student-id="${
                        student.studentId
                      }">View Report</button></td>
                  </tr>`;
        studentTableBody.innerHTML += row;
      });

      // Add event listeners to report buttons
      document.querySelectorAll(".view-report-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const studentId = parseInt(
            event.target.getAttribute("data-student-id")
          );
          const studentData = students.find((s) => s.studentId === studentId);

          if (studentData) {
            console.log("Sending student data:", studentData);
            window.api.openStudentReport(studentData);
          } else {
            console.error("Student data not found for ID:", studentId);
          }
        });
      });

      // Add search functionality
      const searchInput = document.getElementById("student-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const searchTerm = this.value.toLowerCase();
          document.querySelectorAll("#studentTableBody tr").forEach((row) => {
            const studentName = row.children[1].textContent.toLowerCase();
            const studentId = row.children[0].textContent.toLowerCase();
            if (
              studentName.includes(searchTerm) ||
              studentId.includes(searchTerm)
            ) {
              row.style.display = "";
            } else {
              row.style.display = "none";
            }
          });
        });
      }
    } else {
      studentTableBody.innerHTML =
        '<tr><td colspan="7">No student data available</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching student list:", error);
    studentSection.innerHTML =
      '<h2>Students List</h2><p class="error-message">Error loading student list. Please try again later.</p>';
  }
}
