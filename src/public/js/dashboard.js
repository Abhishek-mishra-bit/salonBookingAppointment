// dashboard.js
const baseUrl = window.location.origin;
let userData = null;

// Fetch customer data and initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Fetch user profile data
  axios.get('/api/dashboard/auth/profile', {
    withCredentials: true
  })
  .then(res => {
    userData = res.data;
    // Update name in welcome message
    const customerNameElement = document.getElementById('customerName');
    if (customerNameElement) {
      customerNameElement.textContent = userData.name;
    }
    
    // Initialize profile data
    initializeProfileData(userData);
    
    // Check for notifications
    checkNotifications();
  })
  .catch(err => {
    console.error('Error fetching profile:', err);
  });
});

function logout() {
axios.post("/api/auth/logout", {}, { withCredentials: true })
  .then(() => {
    window.location.href = "/api/auth/login";
  })
  .catch(err => {
    console.error("Logout failed", err);
  });
}


document.addEventListener('DOMContentLoaded', function() {
  // Event handler for appointment buttons
  const navBtn = document.getElementById('viewAppointmentsBtn');
  const cardBtn = document.getElementById('viewAppointmentsCardBtn');
  
  const showAppointments = function() {
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('appointmentsModal'));
    modal.show();
    
    // Use the shared function to fetch appointments
    fetchUserAppointments();
  };
  
  // Attach the same handler to both buttons
  if (navBtn) navBtn.addEventListener('click', showAppointments);
  if (cardBtn) cardBtn.addEventListener('click', showAppointments);
  
  // Initialize past appointments tab click handler
  const pastTabBtn = document.getElementById('past-tab');
  if (pastTabBtn) {
    pastTabBtn.addEventListener('click', function() {
      fetchPastAppointments();
    });
  }
  
  // Initialize profile form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      updateUserProfile();
    });
  }
});

// Initialize profile modal with user data
function initializeProfileData(user) {
  if (!user) return;
  
  const profileNameInput = document.getElementById('profileName');
  const profileEmailInput = document.getElementById('profileEmail');
  const profilePhoneInput = document.getElementById('profilePhone');
  
  if (profileNameInput) profileNameInput.value = user.name || '';
  if (profileEmailInput) profileEmailInput.value = user.email || '';
  if (profilePhoneInput) profilePhoneInput.value = user.phone || '';
}

// Update user profile
function updateUserProfile() {
  const profileName = document.getElementById('profileName').value;
  const profileEmail = document.getElementById('profileEmail').value;
  const profilePhone = document.getElementById('profilePhone').value;
  
  // Simple validation
  if (!profileName || !profileEmail) {
    alert('Name and email are required!');
    return;
  }
  
  // Send update request
  axios.put('/api/dashboard/profile/update', {
    name: profileName,
    email: profileEmail,
    phone: profilePhone
  }, { withCredentials: true })
  .then(res => {
    // Update local data
    userData = res.data;
    
    // Update UI
    document.getElementById('customerName').textContent = userData.name;
    
    // Close modal and show success message
    const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    profileModal.hide();
    
    // Show toast or alert
    alert('Profile updated successfully!');
  })
  .catch(err => {
    console.error('Error updating profile:', err);
    alert('Failed to update profile. Please try again.');
  });
}

// Fetch past appointments
function fetchPastAppointments() {
  const pastTableBody = document.getElementById('pastAppointmentsTable');
  if (!pastTableBody) return;
  
  // Clear existing content
  pastTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading past appointments...</td></tr>';
  
  // Fetch past appointments
  axios.get('/api/dashboard/appointments/past', {
    withCredentials: true
  })
  .then(res => {
    const appointments = res.data;
    
    if (appointments.length === 0) {
      pastTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No past appointments found.</td></tr>';
      return;
    }
    
    // Clear loading message
    pastTableBody.innerHTML = '';
    
    // Add appointments to table
    appointments.forEach(appointment => {
      const date = new Date(appointment.date);
      const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const hasReviewed = appointment.hasReview;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${appointment.Service.name}</td>
        <td>${appointment.Staff.name}</td>
        <td>${formattedDate}</td>
        <td><span class="badge bg-secondary">Completed</span></td>
        <td>
          ${hasReviewed 
            ? '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Reviewed</span>' 
            : `<a href="/api/reviews/submit?staff=${appointment.Staff.id}&appointment=${appointment.id}" class="btn btn-sm btn-warning"><i class="fas fa-star me-1"></i>Leave Review</a>`
          }
        </td>
      `;
      pastTableBody.appendChild(row);
    });
  })
  .catch(err => {
    console.error('Error fetching past appointments:', err);
    pastTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading appointments. Please try again.</td></tr>';
  });
}

// Check for notifications
function checkNotifications() {
  // This would normally connect to a notifications API endpoint
  // For now, let's simulate some notifications
  
  // Sample notifications - in a real app, these would come from the server
  const notifications = [
    { 
      id: 1, 
      type: 'appointment', 
      message: 'You have an appointment tomorrow at 2:00 PM', 
      date: new Date(new Date().setDate(new Date().getDate() + 1))
    },
    { 
      id: 2, 
      type: 'promotion', 
      message: 'Special discount on all hair services this weekend!', 
      date: new Date()
    }
  ];
  
  const badge = document.getElementById('notificationBadge');
  const list = document.getElementById('notificationList');
  
  if (badge && list && notifications.length > 0) {
    // Update badge count
    badge.textContent = notifications.length;
    
    // Clear notification list
    list.innerHTML = '';
    
    // Add notifications to dropdown
    notifications.forEach(notification => {
      const item = document.createElement('div');
      item.className = 'dropdown-item p-3 border-bottom';
      
      // Format date
      const formattedDate = notification.date.toLocaleDateString();
      
      // Icon based on notification type
      let icon = 'bell';
      if (notification.type === 'appointment') icon = 'calendar-check';
      if (notification.type === 'promotion') icon = 'tag';
      
      item.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="me-3">
            <i class="fas fa-${icon} text-primary"></i>
          </div>
          <div>
            <p class="mb-1">${notification.message}</p>
            <small class="text-muted">${formattedDate}</small>
          </div>
        </div>
      `;
      
      list.appendChild(item);
    });
  } else if (badge) {
    badge.textContent = '0';
  }
}
