// DEBUG VERSION - Shows detailed validation info

// Utility function to set icon and border color
function setstatus(input, iconId, isValid) {
  const icon = document.getElementById(iconId);
  if (icon) {
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
  } else {
    console.log(`Icon not found: ${iconId}`);
  }
}

// Field-specific validation with detailed logging
function validateField(id, conditionFn, fieldName) {
  console.log(`Validating ${fieldName} (${id})`);
  const input = document.getElementById(id);
  if (!input) {
    console.error(`Input field not found: ${id}`);
    return false;
  }
  
  const value = input.value.trim();
  console.log(`${fieldName} value: "${value}"`);
  
  const iconId = `${id}-icon`;
  const isValid = conditionFn(value);
  console.log(`${fieldName} validation result: ${isValid}`);
  
  setstatus(input, iconId, isValid);
  return isValid;
}

// Simple validation rules
function setupLiveValidation() {
  console.log('Setting up live validation...');
  
  // Check if all elements exist
  const elements = [
    'location', 'category', 'date', 'description', 'name', 'contact'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element not found: ${id}`);
    } else {
      console.log(`✓ Found element: ${id}`);
    }
  });

  // Set up event listeners with error handling
  try {
    document.getElementById("location").addEventListener("blur", function () {
      validateField("location", v => v.length > 0, "Location");
    });

    document.getElementById("category").addEventListener("change", function () {
      validateField("category", v => v !== "" && v !== "Select Issue", "Category");
    });

    document.getElementById("date").addEventListener("blur", function () {
      validateField("date", v => /^\d{2}-\d{2}-\d{4}$/.test(v), "Date");
    });

    document.getElementById("description").addEventListener("blur", function () {
      validateField("description", v => v.length >= 10, "Description");
    });

    document.getElementById("name").addEventListener("blur", function () {
      validateField("name", v => v.length > 0, "Name");
    });

    document.getElementById("contact").addEventListener("blur", function () {
      validateField("contact", v => /^\d{10}$/.test(v), "Contact");
    });
    
    console.log('✓ All event listeners set up successfully');
  } catch (error) {
    console.error('Error setting up validation:', error);
  }
}

// Submit handler with detailed debugging
function validateForm() {
  console.log('🚀 Form submission started');
  
  // Test each validation individually
  const validations = [
    validateField("location", v => v.length > 0, "Location"),
    validateField("category", v => v !== "" && v !== "Select Issue", "Category"),
    validateField("date", v => /^\d{2}-\d{2}-\d{4}$/.test(v), "Date"),
    validateField("description", v => v.length >= 10, "Description"),
    validateField("name", v => v.length > 0, "Name"),
    validateField("contact", v => /^\d{10}$/.test(v), "Contact")
  ];
  
  console.log('Validation results:', validations);
  
  const allValid = validations.every(Boolean);
  console.log('All validations passed:', allValid);

  if (allValid) {
    // Gather form data with debugging
    const data = {
      category: document.getElementById("category").value,
      summary: document.getElementById("description").value,
      status: "Pending",
      date: document.getElementById("date").value,
      location: document.getElementById("location").value,
      time: document.getElementById("time") ? document.getElementById("time").value : "",
      staff: document.getElementById("staff") ? document.getElementById("staff").value : "",
      name: document.getElementById("name").value,
      contact: document.getElementById("contact").value
    };

    console.log('📤 Submitting data:', data);

    // Show a confirmation before submitting
    if (confirm("Ready to submit maintenance request?")) {
      
      fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      .then(res => {
        console.log('📥 Response received. status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        console.log('📊 Response data:', result);
        if (result.success) {
          alert(`✅ Maintenance submitted successfully!\n\nFeedback ID: ${result.feedbackId || result.id}\nMongoDB ID: ${result.id}`);
          // Don't redirect for debugging
          // window.location.href = "/home";
        } else {
          alert("❌ Server error: " + (result.message || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('🚨 Network/server error:', err);
        alert("🚨 Network/server error: " + err.message);
      });
    }
  } else {
    // Show which fields failed
    const fieldNames = ["Location", "Category", "Date", "Description", "Name", "Contact"];
    const failedFields = [];
    validations.forEach((isValid, index) => {
      if (!isValid) {
        failedFields.push(fieldNames[index]);
      }
    });
    
    alert("❌ Please fix these fields: " + failedFields.join(", "));
  }

  return false; // Always prevent form submission
}

// Initialize when page loads
window.onload = function() {
  console.log('🔄 Page loaded, initializing...');
  setupLiveValidation();
  console.log('✅ Debug mode ready');
};
