document.addEventListener("DOMContentLoaded", function () {
  setupOtpListeners();
  setupPasswordToggle();
  setupRoleSelection();
});

document.getElementById("registerBtn")?.addEventListener("click", function () {
  document.getElementById("loginSection").style.display = "none"; // Hide Login
  document.getElementById("registrationSection").style.display = "block"; // Show Registration
  document.getElementById("OTP&PasswordSection").style.display = "block";
});

// document.getElementById("sendOtpBtn").addEventListener("click", function () {
//     // Make the OTP & Password Section visible
//     document.getElementById("OTP&PasswordSection").style.display = "block";
// });

function setupOtpListeners() {
  const inputs = document.querySelectorAll(".otp-box");

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
      e.target.value = value;
      if (value && index < inputs.length - 1) inputs[index + 1].focus();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (pastedData.length === 6) {
        inputs.forEach((inp, i) => (inp.value = pastedData[i] || ""));
        inputs[5].focus();
      }
    });
  });
}

function setupPasswordToggle() {
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const passwordField = this.previousElementSibling;
      passwordField.type =
        passwordField.type === "password" ? "text" : "password";
      this.textContent = passwordField.type === "password" ? "👁" : "👁‍🗨";
    });
  });
}

function setupRoleSelection() {
  document
    .querySelectorAll('.role-option input[type="radio"]')
    .forEach((option) => {
      option.addEventListener("change", function () {
        document
          .querySelectorAll(".role-option label")
          .forEach((label) => label.classList.remove("selected"));
        this.nextElementSibling.classList.add("selected");
      });
    });
}

// Check if user is already registered and request OTP
document.getElementById("sendOtpBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("regEmail").value.trim();
  if (!email) return showModal("Please enter an email.")

  try {
    const response = await fetch(
      "https://etmf.somee.com/api/auth/generate-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    if (data.message?.includes("OTP already sent") || data.success) {
      document.getElementById("otpSection").style.display = "block";
      //alert("OTP has been sent to your email.");
      showModal("OTP has been sent to your email.");
    } else if (response.status === 400) {
      //alert("Email is already registered. Redirecting to login...");
      showModal("Email is already registered. Redirecting to login...");
      document.getElementById("registrationSection").style.display = "none";
      document.getElementById("OTP&PasswordSection").style.display = "none";
      document.getElementById("loginSection").style.display = "block";
    } else {
      //alert(data.message || "Unexpected error.");
      showModal(data.message || "Unexpected error.");
    }
  } catch (error) {
    console.error("Error:", error);
    //alert("Something went wrong. Try again.");
    showModal("Something went wrong. Try again.");
  }
});

// Verify OTP
document.getElementById("verifyOtp")?.addEventListener("click", async () => {
  const email = document.getElementById("regEmail").value.trim();
  const otp = Array.from(document.querySelectorAll(".otp-box"))
    .map((input) => input.value)
    .join("");
  if (otp.length !== 6) return showModal("Please enter a 6-digit OTP.")

  try {
    const response = await fetch("https://etmf.somee.com/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem("jwt", data.token);
      //alert("OTP verified! Proceed to registration.");
      showModal("OTP verified! Proceed to registration.");
      document.getElementById("registrationSection").style.display = "block";
    } else {
      //alert(data.message || "Invalid OTP.");
      showModal(data.message || "Invalid OTP.");
    }
  } catch (error) {
    console.error(error);
    //alert("OTP verification failed.");
    showModal("OTP verification failed.");
  }
});

// Register User
document.getElementById("registerUser")?.addEventListener("click", async () => {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();
  const role =
    document.querySelector('input[name="role"]:checked')?.value || "student";
  const jwt = localStorage.getItem("jwt");

  if (!name || !email || !password) return showModal("Fill all required fields.");
  if (password !== confirmPassword) return showModal("Passwords do not match.");

  try {
    const response = await fetch("https://etmf.somee.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      }, // Corrected this line
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = response.ok ? await response.json() : {};
    if (response.ok) {
      //alert("Registration successful!");
      showModal("Registration successful!");
      document.getElementById("registrationSection").style.display = "none";
      document.getElementById("OTP&PasswordSection").style.display = "none";
      document.getElementById("loginSection").style.display = "block";
    } else {
      //alert(data.message || "Error occurred.");
      showModal(data.message || "Error occurred.");
    }
  } catch (error) {
    console.error("Error:", error);
    //alert("Registration failed.");
    showModal("Registration failed.");
  }
});

// Login User
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (!email || !password) return showModal("Enter email and password.");

  try {
    const response = await fetch("https://etmf.somee.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = response.ok ? await response.json() : {};
    if (data.message === "Login successful" && data.user) {
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);

      //alert("Login successful!");
      showModal("Login successful!");
      window.location.href = "dashboard.html";
    } else {
      //alert(data.message || "Login failed.");
      showModal(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Login Error:", error);
    //alert("Something went wrong.");
    showModal("Something went wrong.");
  }
});


function showModal(message) {
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("customModal").style.display = "block";
}

function closeModal() {
  document.getElementById("customModal").style.display = "none";
}