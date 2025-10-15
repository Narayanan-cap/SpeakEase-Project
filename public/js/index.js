// Toast notification function

const express = require('express');
const app = express();

app.use(express.json());  // <-- needed for JSON
app.use(express.urlencoded({ extended: true }));
function showToast(message) {
  alert(message); // Simple fallback
}

//  Generic function to visually update field validation status
function setValidation(input, isValid, iconId) {
  const icon = document.getElementById(iconId);
  if (isValid) {
    input.classList.add('valid');       // Add green border or style
    input.classList.remove('invalid');  // Remove red border
    icon.textContent = "✔";             // Show green check
    icon.className = "feedback-icon green";
  } else {
    input.classList.add('invalid');     // Add red border or style
    input.classList.remove('valid');    // Remove green border
    icon.textContent = "✖";             // Show red cross
    icon.className = "feedback-icon red";
  }
}

// ✅ Function to validate a text input using a regex pattern
function validateField(inputId, regex, iconId) {
  const input = document.getElementById(inputId);
  const isValid = regex.test(input.value.trim());
  setValidation(input, isValid, iconId);
  return isValid;
}

//  Function to validate a <select> dropdown (not empty)
function validateSelect(selectId, iconId) {
  const select = document.getElementById(selectId);
  const isValid = select.value !== "";
  setValidation(select, isValid, iconId);
  return isValid;
}

//  Real-time input field listeners with validation on user typing/changing

document.getElementById("name").addEventListener("input", () =>
  validateField("name", /^[a-zA-Z0-9\s]{3,}$/, "name-icon") // Alphanumeric min 3 chars
);

document.getElementById("mobile").addEventListener("input", () =>
  validateField("mobile", /^[0-9]{10}$/, "mobile-icon") // 10-digit mobile only
);

document.getElementById("email").addEventListener("input", () =>
  validateField("email", /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "email-icon") // Valid email format
);

document.getElementById("description").addEventListener("input", () =>
  validateField("description", /[a-zA-Z]/, "description-icon") // At least one alphabet
);

document.getElementById("address").addEventListener("input", () =>
  validateField("address", /^[a-zA-Z0-9\s,.-]+$/, "address-icon") // Alphanumeric + punctuation
);

document.getElementById("type").addEventListener("change", () =>
  validateSelect("type", "type-icon")
);

document.getElementById("category").addEventListener("change", () =>
  validateSelect("category", "category-icon")
);

// ✅ Validate all fields on form submission
function validateForm() {
  const validType = validateSelect("type", "type-icon");
  const validCategory = validateSelect("category", "category-icon");
  const validName = validateField("name", /^[a-zA-Z0-9\s]{3,}$/, "name-icon");
  const validMobile = validateField("mobile", /^[0-9]{10}$/, "mobile-icon");
  const validEmail = validateField("email", /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "email-icon");
  const validDesc = validateField("description", /[a-zA-Z]/, "description-icon");
  const validAddress = validateField("address", /^[a-zA-Z0-9\s,.-]+$/, "address-icon");

  if (validType && validCategory && validName && validMobile && validEmail && validDesc && validAddress) {
    const data = {
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      name: document.getElementById("name").value,
      mobile: document.getElementById("mobile").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value
    };

    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        showToast(`✅ Feedback submitted successfully!\n\nYour Feedback ID: ${response.feedbackId || response.complaintId}`);
        setTimeout(() => window.location.href = "/status", 1500);
      } else {
        showToast("❌ Server error occurred.");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      showToast("❌ Could not submit feedback.");
    });

    return false;
  } else {
    showToast("❌ Please fill all fields correctly.");
    return false;
  }
}

