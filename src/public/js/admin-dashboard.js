// admin-dashboard.js - Enhanced admin dashboard functionality
const baseUrl = window.location.origin;
let userData = null;

// SweetAlert2 helper functions
function showToast(title, icon = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'colored-toast'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  Toast.fire({
    icon: icon,
    title: title
  });
}

function showError(title, text = '') {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonColor: '#8a6d62',
    confirmButtonText: 'OK'
  });
}

async function confirmAction(title, text, icon = 'warning') {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: '#9aab89',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  });
  
  return result.isConfirmed;
}

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
  // Fetch user data
  fetchUserData();
  
  // Initialize dashboard components
  initializeAnalytics();
  initializeActivityList();
  initializeTodaySchedule();
  initializeUserManagement();
  
  // Set up profile form submission
  const adminProfileForm = document.getElementById('adminProfileForm');
  if (adminProfileForm) {
    adminProfileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      updateAdminProfile();
    });
  }
  
  // Set up notification handlers
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', function() {
      markAllNotificationsRead();
    });
  }
});

// Fetch user data
function fetchUserData() {
  axios.get('/api/dashboard/auth/profile', {
    withCredentials: true
  })
  .then(res => {
    userData = res.data;
    
    // Update admin name in welcome message
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
      adminNameElement.textContent = userData.name;
    }
    
    // Initialize profile data
    initializeProfileData(userData);
    
    // Check for admin notifications
    fetchAdminNotifications();
  })
  .catch(err => {
    console.error('Error fetching profile:', err);
    window.location.href = "/api/auth/login";
  });
}

// Initialize profile modal with user data
function initializeProfileData(user) {
  if (!user) return;
  
  const profileNameInput = document.getElementById('adminProfileName');
  const profileEmailInput = document.getElementById('adminProfileEmail');
  const profilePhoneInput = document.getElementById('adminProfilePhone');
  
  if (profileNameInput) profileNameInput.value = user.name || '';
  if (profileEmailInput) profileEmailInput.value = user.email || '';
  if (profilePhoneInput) profilePhoneInput.value = user.phone || '';
}

// Update admin profile
function updateAdminProfile() {
  const profileName = document.getElementById('adminProfileName').value;
  const profileEmail = document.getElementById('adminProfileEmail').value;
  const profilePhone = document.getElementById('adminProfilePhone').value;
  const profilePassword = document.getElementById('adminProfilePassword').value;
  
  // Simple validation
  if (!profileName || !profileEmail) {
    showError('Validation Error', 'Name and email are required!');
    return;
  }
  
  // Create request data
  const requestData = {
    name: profileName,
    email: profileEmail,
    phone: profilePhone
  };
  
  // Add password only if provided
  if (profilePassword) {
    requestData.password = profilePassword;
  }
  
  // Send update request
  axios.put('/api/dashboard/profile/update', requestData, { withCredentials: true })
  .then(res => {
    // Update local data
    userData = res.data;
    
    // Update UI
    document.getElementById('adminName').textContent = userData.name;
    
    // Close modal and show success message
    const profileModal = bootstrap.Modal.getInstance(document.getElementById('adminProfileModal'));
    profileModal.hide();
    
    // Show success toast
    showToast('Profile updated successfully!');
  })
  .catch(err => {
    console.error('Error updating profile:', err);
    showError('Error', 'Failed to update profile. Please try again.');
  });
}

// Initialize analytics dashboard
function initializeAnalytics() {
  // Fetch analytics data from server
  axios.get('/api/admin/analytics', {
    withCredentials: true
  })
  .then(res => {
    const data = res.data;
    
    // Update metrics
    document.getElementById('totalBookings').textContent = data.totalBookings || 0;
    document.getElementById('totalRevenue').textContent = '$' + (data.totalRevenue || 0).toFixed(2);
    document.getElementById('activeStaff').textContent = data.activeStaff || 0;
    document.getElementById('totalCustomers').textContent = data.totalCustomers || 0;
    
    // Update trends
    if (data.bookingsTrend > 0) {
      document.getElementById('bookingsTrend').innerHTML = `<i class="fas fa-arrow-up"></i> ${data.bookingsTrend}% from last week`;
    } else if (data.bookingsTrend < 0) {
      document.getElementById('bookingsTrend').innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(data.bookingsTrend)}% from last week`;
    }
    
    if (data.revenueTrend > 0) {
      document.getElementById('revenueTrend').innerHTML = `<i class="fas fa-arrow-up"></i> ${data.revenueTrend}% from last week`;
    } else if (data.revenueTrend < 0) {
      document.getElementById('revenueTrend').innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(data.revenueTrend)}% from last week`;
    }
    
    document.getElementById('newCustomers').textContent = data.newCustomers || 0;
  })
  .catch(err => {
    console.error('Error fetching analytics:', err);
    // Set default values on error
    document.getElementById('totalBookings').textContent = '0';
    document.getElementById('totalRevenue').textContent = '$0.00';
    document.getElementById('activeStaff').textContent = '0';
    document.getElementById('totalCustomers').textContent = '0';
    document.getElementById('newCustomers').textContent = '0';
  });
}

// Initialize activity list
function initializeActivityList() {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;
  
  // Set up filter handlers
  const filterLinks = document.querySelectorAll('[data-filter]');
  filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.getAttribute('data-filter');
      fetchActivity(filter);
    });
  });
  
  // Initial load with all activities
  fetchActivity('all');
}

// Global variable to track current activity page
let currentActivityPage = 1;

// Fetch activity data with pagination
function fetchActivity(filter = 'all', page = 1) {
  const activityList = document.getElementById('activityList');
  const activityPagination = document.getElementById('activityPagination');
  if (!activityList) return;
  
  // Update current page
  currentActivityPage = page;
  
  // Show loading
  activityList.innerHTML = '<li class="list-group-item text-center py-5">Loading activity...</li>';
  
  // Fetch activities from server with pagination
  axios.get(`/api/admin/activities?filter=${filter}&page=${page}&limit=8`, {
    withCredentials: true
  })
  .then(res => {
    const data = res.data;
    const activities = data.activities;
    
    if (activities.length === 0) {
      activityList.innerHTML = '<li class="list-group-item text-center py-5">No activities found</li>';
      if (activityPagination) activityPagination.innerHTML = '';
      return;
    }
    
    // Clear list
    activityList.innerHTML = '';
    
    // Add activities to the list
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      
      // Set icon based on activity type
      let icon = 'bell';
      let iconClass = 'text-secondary';
      
      if (activity.type === 'booking') {
        icon = 'calendar-check';
        iconClass = 'text-primary';
      } else if (activity.type === 'payment') {
        icon = 'credit-card';
        iconClass = 'text-success';
      } else if (activity.type === 'user') {
        icon = 'user';
        iconClass = 'text-info';
      }
      
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="me-3">
            <div class="p-2 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="fas fa-${icon} ${iconClass}"></i>
            </div>
          </div>
          <div class="flex-grow-1">
            <p class="mb-1">${activity.message}</p>
            <small class="text-muted">${formattedDate}</small>
          </div>
        </div>
      `;
      
      activityList.appendChild(li);
    });
    
    // Generate pagination
    if (activityPagination) {
      generateActivityPagination(data.currentPage, data.totalPages, filter);
    }
  })
  .catch(err => {
    console.error('Error fetching activities:', err);
    activityList.innerHTML = '<li class="list-group-item text-center py-5 text-danger">Error loading activities</li>';
    if (activityPagination) activityPagination.innerHTML = '';
  });
}

// Generate pagination controls for activity list
function generateActivityPagination(currentPage, totalPages, filter) {
  const paginationContainer = document.getElementById('activityPagination');
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = '';
  
  // Only show pagination if we have more than 1 page
  if (totalPages <= 1) return;
  
  // Previous button
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.href = '#';
  prevLink.innerHTML = '&laquo;';
  prevLink.setAttribute('aria-label', 'Previous');
  if (currentPage > 1) {
    prevLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchActivity(filter, currentPage - 1);
    });
  }
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);
  
  // Generate page buttons (up to 3 pages with current page in the middle due to limited space)
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, startPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = i;
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchActivity(filter, i);
    });
    pageLi.appendChild(pageLink);
    paginationContainer.appendChild(pageLi);
  }
  
  // Next button
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.href = '#';
  nextLink.innerHTML = '&raquo;';
  nextLink.setAttribute('aria-label', 'Next');
  if (currentPage < totalPages) {
    nextLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchActivity(filter, currentPage + 1);
    });
  }
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);
}

// Initialize today's schedule
function initializeTodaySchedule() {
  const scheduleList = document.getElementById('todaySchedule');
  if (!scheduleList) return;
  
  // Fetch today's appointments
  axios.get('/api/admin/today-schedule', {
    withCredentials: true
  })
  .then(res => {
    const appointments = res.data;
    
    if (appointments.length === 0) {
      scheduleList.innerHTML = '<li class="list-group-item text-center py-5">No appointments scheduled for today</li>';
      return;
    }
    
    // Clear list
    scheduleList.innerHTML = '';
    
    // Add appointments to the list
    appointments.forEach(appointment => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      
      let statusBadge = '';
      if (appointment.status === 'confirmed') {
        statusBadge = '<span class="badge bg-success">Confirmed</span>';
      } else if (appointment.status === 'cancelled') {
        statusBadge = '<span class="badge bg-danger">Cancelled</span>';
      } else if (appointment.status === 'completed') {
        statusBadge = '<span class="badge bg-secondary">Completed</span>';
      }
      
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="me-3">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <span class="fw-bold">${appointment.time}</span>
            </div>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">${appointment.Service.name}</h6>
              ${statusBadge}
            </div>
            <p class="mb-0">
              <small>Client: ${appointment.User.name}</small><br>
              <small>Staff: ${appointment.Staff.name}</small>
            </p>
          </div>
        </div>
      `;
      
      scheduleList.appendChild(li);
    });
  })
  .catch(err => {
    console.error('Error fetching today\'s schedule:', err);
    scheduleList.innerHTML = '<li class="list-group-item text-center py-5 text-danger">Error loading schedule</li>';
  });
}

// Initialize user management
function initializeUserManagement() {
  // Set up search input handler
  const searchInput = document.getElementById('userSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      fetchUsers(this.value, document.getElementById('userRoleFilter').value);
    });
  }
  
  // Set up role filter handler
  const roleFilter = document.getElementById('userRoleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', function() {
      fetchUsers(document.getElementById('userSearchInput').value, this.value);
    });
  }
  
  // Set up add user button
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      // TODO: Implement add user functionality
      Swal.fire({
        title: 'Coming Soon',
        text: 'Add user functionality will be implemented soon',
        icon: 'info',
        confirmButtonColor: '#8a6d62'
      });
    });
  }
  
  // Add event listener to modal show event to load users
  const usersModal = document.getElementById('usersModal');
  if (usersModal) {
    usersModal.addEventListener('shown.bs.modal', function() {
      fetchUsers();
    });
  }
}

// Global variable to track current page
let currentUserPage = 1;

// Fetch users for user management with pagination
function fetchUsers(search = '', role = '', page = 1) {
  const usersTableBody = document.getElementById('usersTableBody');
  const paginationContainer = document.getElementById('usersPagination');
  if (!usersTableBody) return;
  
  // Update current page
  currentUserPage = page;
  
  // Show loading
  usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';
  
  // Fetch users from server with pagination
  axios.get(`/api/admin/users?search=${search}&role=${role}&page=${page}&limit=10`, {
    withCredentials: true
  })
  .then(res => {
    const data = res.data;
    const users = data.users;
    
    if (users.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
      paginationContainer.innerHTML = ''; // Clear pagination if no results
      return;
    }
    
    // Clear table
    usersTableBody.innerHTML = '';
    
    // Add users to the table
    users.forEach(user => {
      const tr = document.createElement('tr');
      
      let roleBadge = '';
      if (user.role === 'admin') {
        roleBadge = '<span class="badge bg-danger">Admin</span>';
      } else if (user.role === 'staff') {
        roleBadge = '<span class="badge bg-warning text-dark">Staff</span>';
      } else {
        roleBadge = '<span class="badge bg-primary">Customer</span>';
      }
      
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.phone || 'N/A'}</td>
        <td>${roleBadge}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="editUser(${user.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      usersTableBody.appendChild(tr);
    });
    
    // Generate pagination
    generatePagination(data.currentPage, data.totalPages, search, role);
  })
  .catch(err => {
    console.error('Error fetching users:', err);
    usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading users</td></tr>';
    paginationContainer.innerHTML = ''; // Clear pagination on error
  });
}

// Generate pagination controls
function generatePagination(currentPage, totalPages, search, role) {
  const paginationContainer = document.getElementById('usersPagination');
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = '';
  
  // Only show pagination if we have more than 1 page
  if (totalPages <= 1) return;
  
  // Previous button
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.href = '#';
  prevLink.innerHTML = '&laquo;';
  prevLink.setAttribute('aria-label', 'Previous');
  if (currentPage > 1) {
    prevLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchUsers(search, role, currentPage - 1);
    });
  }
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);
  
  // Generate page buttons (up to 5 pages with current page in the middle)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = i;
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchUsers(search, role, i);
    });
    pageLi.appendChild(pageLink);
    paginationContainer.appendChild(pageLi);
  }
  
  // Next button
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.href = '#';
  nextLink.innerHTML = '&raquo;';
  nextLink.setAttribute('aria-label', 'Next');
  if (currentPage < totalPages) {
    nextLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchUsers(search, role, currentPage + 1);
    });
  }
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);
}

// Edit user function
function editUser(userId) {
  // TODO: Implement edit user functionality
  alert(`Edit user functionality for user ID ${userId} will be implemented soon`);
}

// Delete user function
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  axios.delete(`/api/admin/users/${userId}`, {
    withCredentials: true
  })
  .then(res => {
    alert('User deleted successfully');
    // Refresh user list
    fetchUsers(
      document.getElementById('userSearchInput').value,
      document.getElementById('userRoleFilter').value
    );
  })
  .catch(err => {
    console.error('Error deleting user:', err);
    alert('Failed to delete user. Please try again.');
  });
}

// Fetch admin notifications
function fetchAdminNotifications() {
  // Get badge and list elements
  const badge = document.getElementById('adminNotificationBadge');
  const list = document.getElementById('adminNotificationList');
  
  if (!badge || !list) return;
  
  // Fetch notifications from server
  axios.get('/api/admin/notifications', {
    withCredentials: true
  })
  .then(res => {
    const notifications = res.data;
    
    // Update badge count
    badge.textContent = notifications.filter(n => !n.read).length;
    
    if (notifications.length === 0) {
      list.innerHTML = '<div class="text-center p-3"><small>No notifications</small></div>';
      return;
    }
    
    // Clear list
    list.innerHTML = '';
    
    // Add notifications to list
    notifications.forEach(notification => {
      const date = new Date(notification.date);
      const formattedDate = date.toLocaleDateString();
      
      // Icon based on notification type
      let icon = 'bell';
      if (notification.type === 'booking') icon = 'calendar-check';
      if (notification.type === 'payment') icon = 'credit-card';
      if (notification.type === 'user') icon = 'user';
      if (notification.type === 'review') icon = 'star';
      
      const item = document.createElement('div');
      item.className = notification.read 
        ? 'dropdown-item p-3 border-bottom bg-light' 
        : 'dropdown-item p-3 border-bottom';
      
      item.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="me-3">
            <i class="fas fa-${icon} text-primary"></i>
          </div>
          <div class="flex-grow-1">
            <p class="mb-1">${notification.message}</p>
            <small class="text-muted">${formattedDate}</small>
          </div>
          <div>
            ${!notification.read ? 
              `<button class="btn btn-sm text-muted" onclick="markNotificationRead('${notification.id}')">
                <i class="fas fa-check"></i>
              </button>` : ''
            }
          </div>
        </div>
      `;
      
      list.appendChild(item);
    });
  })
  .catch(err => {
    console.error('Error fetching notifications:', err);
    list.innerHTML = '<div class="text-center p-3 text-danger"><small>Error loading notifications</small></div>';
  });
}

// Mark notification as read
function markNotificationRead(notificationId) {
  axios.put(`/api/admin/notifications/read/${notificationId}`, {}, {
    withCredentials: true
  })
  .then(res => {
    // Refresh notifications
    fetchAdminNotifications();
  })
  .catch(err => {
    console.error('Error marking notification as read:', err);
  });
}

// Mark all notifications as read
function markAllNotificationsRead() {
  axios.put('/api/admin/notifications/read-all', {}, {
    withCredentials: true
  })
  .then(res => {
    // Refresh notifications
    fetchAdminNotifications();
  })
  .catch(err => {
    console.error('Error marking all notifications as read:', err);
  });
}

// Standard logout function
function logout() {
  axios.post("/api/auth/logout", {}, { withCredentials: true })
    .then(() => {
      window.location.href = "/api/auth/login";
    })
    .catch(err => {
      console.error("Logout failed", err);
    });
}
