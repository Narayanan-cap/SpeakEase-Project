function validateField(id, regex) {
  const field = document.getElementById(id);
  const icon = document.getElementById("icon-" + id);
  
  if (id === 'password') {
    const val = field.value;
    document.getElementById("lower").className = /[a-z]/.test(val) ? "valid" : "invalid";
    document.getElementById("upper").className = /[A-Z]/.test(val) ? "valid" : "invalid";
    document.getElementById("number").className = /\d/.test(val) ? "valid" : "invalid";
    document.getElementById("special").className = /[\W_]/.test(val) ? "valid" : "invalid";
    document.getElementById("length").className = val.length >= 6 ? "valid" : "invalid";

    const isValid = /[a-z]/.test(val) && /[A-Z]/.test(val) && /\d/.test(val) && /[\W_]/.test(val) && val.length >= 6;
    icon.innerHTML = isValid ? "✔" : "✖";
    icon.className = "icon " + (isValid ? "valid" : "invalid");
    return isValid;
  }

  if (regex.test(field.value.trim())) {
    icon.innerHTML = "✔";
    icon.className = "icon valid";
    return true;
  } else {
    icon.innerHTML = "✖";
    icon.className = "icon invalid";
    return false;
  }
}

function checkConfirmPassword() {
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirmpassword").value.trim();
  const icon = document.getElementById("icon-confirmpassword");
  if (password !== "" && confirm === password) {
    icon.innerHTML = "✔";
    icon.className = "icon valid";
    return true;
  } else {
    icon.innerHTML = "✖";
    icon.className = "icon invalid";
    return false;
  }
}

let otpTimer;
let otpTimeLeft = 300;
let isOTPVerified = false;
let userDataForRegistration = null;

function validateOTP() {
  const otpField = document.getElementById('otp');
  const icon = document.getElementById('icon-otp');
  const otp = otpField.value.trim();
  
  if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
    icon.innerHTML = "✔";
    icon.className = "icon valid";
    return true;
  } else {
    icon.innerHTML = "✖";
    icon.className = "icon invalid";
    return false;
  }
}

async function sendOTP(email) {
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'registration' })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Failed to send OTP' };
  }
}

async function verifyOTP() {
  const otpValue = document.getElementById('otp').value.trim();
  const email = userDataForRegistration.email;
  
  if (!validateOTP()) {
    showOTPMessage('Please enter a valid 6-digit OTP', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: otpValue })
    });
    
    const result = await response.json();
    
    if (result.success) {
      isOTPVerified = true;
      showOTPMessage('OTP verified successfully!', 'success');
      clearInterval(otpTimer);
      setTimeout(() => completeRegistration(), 1000);
    } else {
      showOTPMessage(result.message, 'error');
    }
  } catch (error) {
    showOTPMessage('Something went wrong. Please try again.', 'error');
  }
}

async function resendOTP() {
  const email = userDataForRegistration.email;
  try {
    const result = await sendOTP(email);
    if (result.success) {
      showOTPMessage('New OTP sent to your email address', 'success');
      startOTPTimer();
    } else {
      showOTPMessage(result.message, 'error');
    }
  } catch (error) {
    showOTPMessage('Failed to resend OTP', 'error');
  }
}

function startOTPTimer() {
  otpTimeLeft = 300;
  const timerElement = document.getElementById('otp-timer');
  
  otpTimer = setInterval(() => {
    const minutes = Math.floor(otpTimeLeft / 60);
    const seconds = otpTimeLeft % 60;
    timerElement.textContent = `OTP expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (otpTimeLeft <= 0) {
      clearInterval(otpTimer);
      timerElement.textContent = 'OTP expired. Please resend.';
    }
    otpTimeLeft--;
  }, 1000);
}

function showOTPMessage(message, type) {
  const messageElement = document.getElementById('otp-message');
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
  setTimeout(() => {
    messageElement.textContent = '';
    messageElement.className = 'message';
  }, 5000);
}

async function completeRegistration() {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDataForRegistration)
    });
    
    const data = await response.json();
    if (data.success) {
      alert("Registration successful! You can now login.");
      window.location.href = "/loginpage";
    } else {
      alert(data.message || "Registration failed.");
    }
  } catch (error) {
    alert("Something went wrong.");
  }
}

document.getElementById("regForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const validations = [
    validateField('fname', /^[A-Za-z]+$/),
    validateField('lname', /^[A-Za-z]+$/),
    validateField('email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    validateField('phone', /^\d{10}$/),
    validateField('username', /^[a-zA-Z0-9]{8,30}$/),
    validateField('password', /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/),
    checkConfirmPassword()
  ];

  if (!validations.every(v => v)) {
    alert("Please correct the highlighted fields before submitting.");
    return false;
  }

  const fullName = document.getElementById('fname').value + " " + document.getElementById('lname').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  userDataForRegistration = { fullName, email, phone, username, password };

  if (!isOTPVerified) {
    const result = await sendOTP(email);
    if (result.success) {
      document.getElementById('otp-section').style.display = 'block';
      document.getElementById('register-btn').style.display = 'none';
      showOTPMessage('OTP sent to your email address', 'success');
      startOTPTimer();
    } else {
      alert(result.message || 'Failed to send OTP');
    }
    return;
  }
});
