// Show OTP Section and Attach Listeners
function setupOtpListeners() {
    const inputs = document.querySelectorAll(".otp-box");

    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            let value = e.target.value;
            e.target.value = value.replace(/[^0-9]/g, '').slice(0, 1); // Allow only one digit

            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus(); // Move to next input
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !e.target.value && index > 0) {
                inputs[index - 1].focus(); // Move to previous box on Backspace
            }
        });
    });

    if (inputs.length > 0) {
        setTimeout(() => inputs[0].focus(), 50); // Focus on first input
    }
}

// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.textContent = '👁️‍🗨️';
            } else {
                passwordField.type = 'password';
                this.textContent = '👁️';
            }
        });
    });
    
    // Set up role selection highlighting
    const roleOptions = document.querySelectorAll('.role-option input[type="radio"]');
    roleOptions.forEach(option => {
        option.addEventListener('change', function() {
            roleOptions.forEach(opt => {
                const label = opt.nextElementSibling;
                if (opt.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            });
        });
    });
});

// Check if the user is already registered
document.getElementById("checkUser").addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
        alert("Please enter both name and email.");
        return;
    }

    try {
        console.time("OTP Request Time");

        const response = await fetch("https://etmf.somee.com/api/auth/generate-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        console.timeEnd("OTP Request Time");
        const data = await response.json();

        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (response.status === 400 && data.message === "Email already registered.") {
            const jwt = localStorage.getItem("jwt"); // Get stored token
            console.log("Stored JWT Token:", jwt);
            alert("Email is already registered. Redirecting to login...");
            document.getElementById("step1").style.display = "none";
            document.getElementById("loginSection").style.display = "block";
            return;
        }

        if (data.success || (data.message && data.message.includes("OTP already sent"))) {
            // Show OTP section below the inputs instead of hiding initial form
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("checkUser").style.display = "none"; // Hide the Next button
            setupOtpListeners();

            setTimeout(() => {
                alert("OTP has been sent to your email.");
            }, 100);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Something went wrong! Please try again.");
    }
});

// Verify OTP
document.getElementById("verifyOtp").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const otp = Array.from(document.querySelectorAll(".otp-box"))
        .map(input => input.value)
        .join("");

    console.log("🔹 Email:", email);
    console.log("🔹 Entered OTP:", otp);

    if (otp.length !== 6) {  // Using 6 digits OTP
        alert("Please enter a 6-digit OTP.");
        return;
    }

    try {
        const response = await fetch("https://etmf.somee.com/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        console.log("🔹 API Response:", data);

        if (response.ok && data.token) {
            alert("✅ OTP verified successfully!");
            localStorage.setItem("jwt", data.token);
    
            // Populate registration form with existing data
            document.getElementById("regName").value = document.getElementById("name").value;
            document.getElementById("regEmail").value = email;
            
            // Hide the entire step1 section (which now includes OTP)
            document.getElementById("step1").style.display = "none";
            document.getElementById("registrationSection").style.display = "block";
        } else {
            alert(data.message || "Invalid OTP. Please try again.");
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong while verifying OTP.");
    }
});

// Register User
document.getElementById("registerUser").addEventListener("click", async () => {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    
    // Get selected role
    const roleInput = document.querySelector('input[name="role"]:checked');
    const role = roleInput ? roleInput.value : 'student';
    
    const jwt = localStorage.getItem("jwt");
    console.log("JWT Token:", jwt);

    if (!name || !email || !password) {
        alert("Please fill in all required fields.");
        return;
    }
    
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("https://etmf.somee.com/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwt ? `Bearer ${jwt}` : ""
            },
            body: JSON.stringify({ name, email, password, role })
        });

        // Handle 401 Unauthorized separately
        if (response.status === 401) {
            alert("Unauthorized! Please log in again.");
            //localStorage.removeItem("jwt"); // Clear invalid token
            return;
        }

        // Prevent JSON parsing errors
        const data = response.headers.get("content-length") > 0 ? await response.json() : {};

        if (response.ok) {
            alert("🎉 Registration Successful! Please log in.");
            document.getElementById("registrationSection").style.display = "none";
            document.getElementById("loginSection").style.display = "block";
        } else {
            alert("Error: " + (data.message || "Unknown error occurred."));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Something went wrong during registration.");
    }
});

// Login User
document.getElementById("loginUser").addEventListener("click", async () => {
    const emailField = document.getElementById("loginEmail");
    const passwordField = document.getElementById("loginPassword");

    if (!emailField || !passwordField) {
        alert("Login fields not found. Please check your HTML.");
        return;
    }

    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("https://etmf.somee.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.message === "Login successful" && data.user) {
            alert("✅ Login Successful!");

            // Store user details in localStorage
            localStorage.setItem("jwt", data.token);  // Store JWT token
            localStorage.setItem("userId", data.user.id);  // Store user ID
            localStorage.setItem("userRole", data.user.role);  // Store user role

            console.log("🔹 Stored User ID:", data.user.id);
            console.log("🔹 Stored User Role:", data.user.role);

            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Something went wrong during login.");
    }
});
