// Utility function to set icon and border color
function setstatus(input, iconId, isValid) {
  const icon = document.getElementById(iconId);
  if (isValid) {
    input.classList.add("valid");
    input.classList.remove("invalid");
    icon.textContent = "✔";
    icon.className = "feedback-icon green";
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    icon.textContent = "✖";
    icon.className = "feedback-icon red";
  }
}

// Field-specific validation
function validateField(id, conditionFn) {
  const input = document.getElementById(id);
  const iconId = `${id}-icon`;
  const isValid = conditionFn(input.value.trim());
  setstatus(input, iconId, isValid);
  return isValid;
}

// Validation rules per field
function setupLiveValidation() {
  document.getElementById("location").addEventListener("blur", function () {
    validateField("location", v => /^[A-Za-z0-9\s,.-]+$/.test(v) && v !== "");
  });

  document.getElementById("category").addEventListener("change", function () {
    validateField("category", v => v !== "" && v !== "Select Issue");
  });

  document.getElementById("date").addEventListener("blur", function () {
    validateField("date", v => /^\d{2}-\d{2}-\d{4}$/.test(v));
  });

  document.getElementById("description").addEventListener("blur", function () {
    validateField("description", v => v.length >= 10); // At least 10 characters
  });

  document.getElementById("name").addEventListener("blur", function () {
    validateField("name", v => /^[A-Za-z\s]+$/.test(v));
  });

  document.getElementById("contact").addEventListener("blur", function () {
    validateField("contact", v => /^\d{10}$/.test(v));
  });
}

// Submit handler
function validateForm() {
  const validations = [
    validateField("location", v => /^[A-Za-z0-9\s,.-]+$/.test(v) && v !== ""),
    validateField("category", v => v !== "" && v !== "Select Issue"),
    validateField("date", v => /^\d{2}-\d{2}-\d{4}$/.test(v)),
    validateField("description", v => v.length >= 10), // At least 10 characters
    validateField("name", v => /^[A-Za-z\s]+$/.test(v)),
    validateField("contact", v => /^\d{10}$/.test(v))
  ];

  if (validations.every(Boolean)) {
    // Gather form data
    const data = {
      category: document.getElementById("category").value,
      summary: document.getElementById("description").value,
      status: "Pending",
      date: document.getElementById("date") ? document.getElementById("date").value : "",
      location: document.getElementById("location") ? document.getElementById("location").value : "",
      time: document.getElementById("time") ? document.getElementById("time").value : "",
      staff: document.getElementById("staff") ? document.getElementById("staff").value : "",
      name: document.getElementById("name") ? document.getElementById("name").value : "",
      contact: document.getElementById("contact") ? document.getElementById("contact").value : ""
    };

    console.log('Submitting maintenance data:', data);

    fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(result => {
      console.log('Response data:', result);
      if (result.success) {
        alert(`Maintenance submitted successfully!\n\nYour Feedback ID: ${result.feedbackId || result.id}`);
        window.location.href = "/home";
      } else {
        alert("Server error: " + result.message);
      }
    })
    .catch(err => {
      console.error('Network error:', err);
      alert("Network/server error");
    });
  } else {
    alert("Please fix all validation errors before submitting.");
  }

  return false; // prevent actual form submission
}

// Call live validation setup after DOM loads
window.onload = setupLiveValidation;