// Global variables
let currentStep = 1;
let otpTimer;
let otpTimeLeft = 300; // 5 minutes
let userAccount = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
    setupFormSubmission();
});

// Show specific step
function showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(s => s.classList.remove('active'));
    
    // Show current step
    const activeStep = document.querySelector(`.step[data-step="${step}"], #otp-step, #password-step`);
    if (activeStep) {
        activeStep.classList.add('active');
    }
    
    currentStep = step;
}

// Setup form submission
function setupFormSubmission() {
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleAccountVerification);
    }
}

// Handle account verification (Step 1)
async function handleAccountVerification(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    
    // Basic validation
    if (!username || !email || !mobile) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validateMobile(mobile)) {
        showMessage('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    try {
        // Verify account details with backend
        const response = await fetch('/api/verify-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, mobile })
        });
        
        const result = await response.json();
        
        if (result.success) {
            userAccount = { username, email, mobile };
            
            // Direct to password reset step
            showStep(2);
            showMessage('Account verified successfully! Please set your new password.', 'success');
        } else {
            showMessage(result.message || 'Account verification failed', 'error');
        }
        
    } catch (error) {
        console.error('Error verifying account:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    }
}

// Send OTP for forgot password
async function sendForgotOTP(email) {
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, type: 'forgot-password' })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
}

// Verify OTP (Step 2)
async function verifyForgotOTP() {
    const otpValue = document.getElementById('otp').value.trim();
    
    if (!validateOTP()) {
        showOTPMessage('Please enter a valid 6-digit OTP', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: userAccount.email, 
                otp: otpValue 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showOTPMessage('OTP verified successfully!', 'success');
            clearInterval(otpTimer);
            
            setTimeout(() => {
                showStep(3);
            }, 1500);
        } else {
            showOTPMessage(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showOTPMessage('Something went wrong. Please try again.', 'error');
    }
}

// Resend OTP
async function resendForgotOTP() {
    try {
        const result = await sendForgotOTP(userAccount.email);
        
        if (result.success) {
            showOTPMessage('New OTP sent to your email address', 'success');
            startOTPTimer();
            
            // Clear OTP field
            document.getElementById('otp').value = '';
            document.getElementById('icon-otp').innerHTML = '';
            document.getElementById('icon-otp').className = 'icon';
        } else {
            showOTPMessage(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error resending OTP:', error);
        showOTPMessage('Failed to resend OTP', 'error');
    }
}

// Reset Password (Step 3)
async function resetPassword() {
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    if (!validateNewPassword() || !checkNewPasswordConfirmation()) {
        showPasswordMessage('Please ensure your password meets all requirements and matches the confirmation', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userAccount.username,
                email: userAccount.email,
                newPassword: newPassword
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showPasswordMessage('Password reset successful! Redirecting to login...', 'success');
            
            setTimeout(() => {
                window.location.href = '/loginpage';
            }, 2000);
        } else {
            showPasswordMessage(result.message || 'Failed to reset password', 'error');
        }
        
    } catch (error) {
        console.error('Error resetting password:', error);
        showPasswordMessage('Something went wrong. Please try again.', 'error');
    }
}

// Validation Functions
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function validateMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

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

function validateNewPassword() {
    const passwordField = document.getElementById('new-password');
    const icon = document.getElementById('icon-new-password');
    const val = passwordField.value;
    
    // Update password requirements indicators
    document.getElementById("new-lower").className = /[a-z]/.test(val) ? "valid" : "invalid";
    document.getElementById("new-upper").className = /[A-Z]/.test(val) ? "valid" : "invalid";
    document.getElementById("new-number").className = /\d/.test(val) ? "valid" : "invalid";
    document.getElementById("new-special").className = /[\W_]/.test(val) ? "valid" : "invalid";
    document.getElementById("new-length").className = val.length >= 6 ? "valid" : "invalid";

    const isValid = /[a-z]/.test(val) &&
                    /[A-Z]/.test(val) &&
                    /\d/.test(val) &&
                    /[\W_]/.test(val) &&
                    val.length >= 6;

    icon.innerHTML = isValid ? "✔" : "✖";
    icon.className = "icon " + (isValid ? "valid" : "invalid");
    
    return isValid;
}

function checkNewPasswordConfirmation() {
    const password = document.getElementById('new-password').value.trim();
    const confirm = document.getElementById('confirm-password').value.trim();
    const icon = document.getElementById('icon-confirm-password');
    
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

// Timer Functions
function startOTPTimer() {
    otpTimeLeft = 300; // 5 minutes
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

// Message Functions
function showMessage(message, type) {
    // Create or update message element in the current step
    let messageElement = document.querySelector('.step.active .message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'message';
        const activeStep = document.querySelector('.step.active');
        activeStep.appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
}

function showOTPMessage(message, type) {
    const messageElement = document.getElementById('otp-message');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 5000);
}

function showPasswordMessage(message, type) {
    let messageElement = document.querySelector('#password-step .message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'message';
        document.getElementById('password-step').appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    
    // Clear message after 5 seconds if it's not success
    if (type !== 'success') {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 5000);
    }
}
