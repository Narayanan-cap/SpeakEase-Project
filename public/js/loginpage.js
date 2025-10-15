// Check if user is already logged in
if (authManager && authManager.isLoggedIn) {
  // Redirect to home if already logged in
  window.location.href = '/home';
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Basic validation
  if (!username || !password) {
    showMessage("Please enter both username and password", "error");
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // Use auth manager to handle login
        authManager.login(username);
        showMessage("Login successful!", "success");
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } else {
        showMessage("Incorrect username or password", "error");
        // Clear password field
        document.getElementById("password").value = "";
      }
    })
    .catch((err) => {
      console.error("❌ Network/server error:", err);
      showMessage("Something went wrong. Try again.", "error");
    });
});

// Helper function to show messages
function showMessage(message, type) {
  if (authManager) {
    authManager.showMessage(message, type);
  } else {
    // Fallback to alert
    alert(message);
  }
}
