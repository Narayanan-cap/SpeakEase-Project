// Common Authentication Utility
class AuthManager {
  constructor() {
    this.isLoggedIn = this.getLoginStatus();
    this.username = this.getUsername();
  }

  // Check login status from localStorage
  getLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // Get username from localStorage
  getUsername() {
    return localStorage.getItem('username') || '';
  }

  // Login user
  login(username) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('loginTime', new Date().getTime().toString());
    this.isLoggedIn = true;
    this.username = username;
    this.updateNavigation();
  }

  // Logout user
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    this.isLoggedIn = false;
    this.username = '';
    this.updateNavigation();
    
    // Show logout message and redirect to home
    this.showMessage('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/home';
    }, 1500);
  }

  // Update navigation bar based on login status
  updateNavigation() {
    const loginLinks = document.querySelectorAll('a[href="/loginpage"]');
    
    loginLinks.forEach(link => {
      if (this.isLoggedIn) {
        link.textContent = 'Log Out';
        link.href = '#';
        link.onclick = (e) => {
          e.preventDefault();
          this.logout();
        };
      } else {
        link.textContent = 'Log In';
        link.href = '/loginpage';
        link.onclick = null;
      }
    });
  }

  // Initialize authentication on page load
  init() {
    // Update navigation immediately
    this.updateNavigation();
    
    // Check if login session is expired (24 hours)
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - parseInt(loginTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        this.logout();
      }
    }
  }

  // Show message utility
  showMessage(message, type = 'info') {
    // Create or update message element
    let messageDiv = document.getElementById('authMessage');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'authMessage';
      messageDiv.className = 'auth-message';
      document.body.appendChild(messageDiv);
    }

    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto hide after 3 seconds
    setTimeout(() => {
      if (messageDiv) {
        messageDiv.style.display = 'none';
      }
    }, 3000);
  }
}

// Global auth manager instance
const authManager = new AuthManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  authManager.init();
});

// CSS for auth messages (inject into head)
const authCSS = `
.auth-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  z-index: 1000;
  display: none;
  max-width: 300px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auth-message.success {
  background-color: #4caf50;
}

.auth-message.error {
  background-color: #f44336;
}

.auth-message.info {
  background-color: #2196f3;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = authCSS;
document.head.appendChild(style);
