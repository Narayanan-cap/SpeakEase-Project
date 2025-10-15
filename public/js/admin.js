// Admin Panel JavaScript

let currentRecords = [];
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', function() {
  // Show login modal on page load
  showLoginModal();
  
  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Close modal
  document.querySelector('.close').addEventListener('click', hideLoginModal);
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Filters
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('typeFilter').addEventListener('change', applyFilters);
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
      // Don't allow closing modal by clicking outside if not logged in
      if (!isLoggedIn) {
        showMessage('Please login to access the admin panel', 'error');
      }
    }
  });
}

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
}

function hideLoginModal() {
  if (isLoggedIn) {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
  } else {
    showMessage('Please login to access the admin panel', 'error');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showMessage('Please enter both username and password', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(data.message, 'success');
      isLoggedIn = true;
      hideLoginModal();
      loadAdminRecords();
    } else {
      showMessage(data.message, 'error');
      // Clear password field
      document.getElementById('password').value = '';
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

function logout() {
  isLoggedIn = false;
  currentRecords = [];
  document.getElementById('loginForm').reset();
  showMessage('Logged out successfully', 'success');
  
  // Redirect to status page after a short delay
  setTimeout(() => {
    window.location.href = '/status';
  }, 1500);
}

async function loadAdminRecords() {
  try {
    const response = await fetch('/api/admin/records');
    const data = await response.json();
    
    if (data.success) {
      currentRecords = data.data;
      updateSummaryCards(data);
      displayRecords(currentRecords);
    } else {
      showMessage('Failed to load records', 'error');
    }
  } catch (error) {
    console.error('Error loading records:', error);
    showMessage('Failed to load records', 'error');
  }
}

function updateSummaryCards(data) {
  document.getElementById('totalRecords').textContent = data.totalCount || 0;
  document.getElementById('feedbackRecords').textContent = data.feedbackCount || 0;
  document.getElementById('maintenanceRecords').textContent = data.maintenanceCount || 0;
}

function displayRecords(records) {
  const tbody = document.getElementById('recordsTableBody');
  
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No records found</td></tr>';
    return;
  }
  
  tbody.innerHTML = records.map(record => {
    const statusClass = getstatusClass(record.status);
    const typeClass = record.type.toLowerCase();
    const createdDate = new Date(record.createdAt).toLocaleDateString();
    
    return `
      <tr>
        <td>${record.feedbackId || 'N/A'}</td>
        <td>${record.category || 'N/A'}</td>
        <td title="${record.summary}">${truncateText(record.summary, 50) || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${record.status}</span></td>
        <td><span class="type-badge ${typeClass}">${record.type}</span></td>
        <td>${createdDate}</td>
        <td>
          <select class="status-dropdown" data-id="${record.id}" data-type="${record.type}">
            <option value="Pending" ${record.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${record.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${record.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button class="update-btn" onclick="updatestatus('${record.id}', '${record.type}', this)">Update</button>
        </td>
      </tr>
    `;
  }).join('');
}

function getstatusClass(status) {
  switch(status?.toLowerCase()) {
    case 'pending': return 'pending';
    case 'in progress': return 'in-progress';
    case 'resolved': return 'resolved';
    default: return 'pending';
  }
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

async function updatestatus(id, type, buttonElement) {
  const dropdown = buttonElement.previousElementSibling;
  const newstatus = dropdown.value;
  
  // Disable button during update
  buttonElement.disabled = true;
  buttonElement.textContent = 'Updating...';
  
  try {
    const response = await fetch('/api/admin/update-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, type, status: newstatus })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('status updated successfully', 'success');
      // Update the record in currentRecords array
      const recordIndex = currentRecords.findIndex(r => r.id === id);
      if (recordIndex !== -1) {
        currentRecords[recordIndex].status = newstatus;
      }
      // Refresh display
      applyFilters();
    } else {
      showMessage(data.message || 'Failed to update status', 'error');
      // Revert dropdown
      const originalstatus = currentRecords.find(r => r.id === id)?.status || 'Pending';
      dropdown.value = originalstatus;
    }
  } catch (error) {
    console.error('Error updating status:', error);
    showMessage('Network error. Please try again.', 'error');
    // Revert dropdown
    const originalstatus = currentRecords.find(r => r.id === id)?.status || 'Pending';
    dropdown.value = originalstatus;
  } finally {
    // Re-enable button
    buttonElement.disabled = false;
    buttonElement.textContent = 'Update';
  }
}

function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  
  let filteredRecords = currentRecords;
  
  if (statusFilter) {
    filteredRecords = filteredRecords.filter(record => record.status === statusFilter);
  }
  
  if (typeFilter) {
    filteredRecords = filteredRecords.filter(record => record.type === typeFilter);
  }
  
  displayRecords(filteredRecords);
}

function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}
