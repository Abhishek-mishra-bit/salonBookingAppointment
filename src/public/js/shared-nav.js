// shared-nav.js - Role-based dynamic navigation

document.addEventListener('DOMContentLoaded', async function() {
    // Get the navigation container
    const navContainer = document.querySelector('#navbarNav .ms-lg-auto, .navbar-collapse .ms-lg-auto');
    if (!navContainer) return;
    
    try {
      // Fetch user profile to get role
      const res = await axios.get('/api/dashboard/auth/profile', {
        withCredentials: true
      });
      
      const userRole = res.data.role;
      const userName = res.data.name;
      
      // Update user name in the page if element exists
      const userNameElement = document.getElementById('customerName') || 
                              document.getElementById('staffName') || 
                              document.getElementById('adminName') || 
                              document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = userName;
      }
      
      // Clear existing navigation
      navContainer.innerHTML = '';
      
      // Add navigation items based on role
      if (userRole === 'customer') {
        // Customer navigation
        navContainer.innerHTML = `
          <a href="/api/dashboard/page" class="btn nav-btn btn-primary">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a href="/api/booking/page" class="btn nav-btn btn-success">
            <i class="fas fa-calendar-plus me-2"></i>Book Appointment
          </a>
          <a href="#" class="btn nav-btn btn-warning" id="viewAppointmentsNavBtn">
            <i class="fas fa-calendar-check me-2"></i>My Appointments
          </a>
          <a href="/api/reviews/submit" class="btn nav-btn btn-info">
            <i class="fas fa-star me-2"></i>Review Staff
          </a>
          <button class="btn nav-btn btn-outline-danger" id="logoutBtn" onclick="logout()">
            <i class="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        `;
        
        // Add event listener for appointments button if we're not on the dashboard
        const appointmentsBtn = document.getElementById('viewAppointmentsNavBtn');
        if (appointmentsBtn) {
          if (window.location.href.includes('dashboard')) {
            // On dashboard, open the modal
            appointmentsBtn.addEventListener('click', function(e) {
              e.preventDefault();
              const modal = new bootstrap.Modal(document.getElementById('appointmentsModal'));
              modal.show();
              if (typeof fetchUserAppointments === 'function') {
                fetchUserAppointments();
              }
            });
          } else {
            // On other pages, redirect to dashboard
            appointmentsBtn.addEventListener('click', function(e) {
              e.preventDefault();
              window.location.href = '/api/dashboard/page';
            });
          }
        }
        
      } else if (userRole === 'admin') {
        // Determine the current page to highlight active button
        const currentPath = window.location.pathname;
        const isDashboardPage = currentPath.includes('/admin/page');
        const isServicesPage = currentPath.includes('/services/page');
        const isStaffPage = currentPath.includes('/staff/page');
        const isBookingsPage = currentPath.includes('/admin/appointments');
        
        // Admin navigation with active button indication
        navContainer.innerHTML = `
          <a href="/api/admin/page" id="adminDashboardBtn" class="btn nav-btn ${isDashboardPage ? 'btn-primary active' : 'btn-outline-primary'}">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a href="/api/services/page" class="btn nav-btn ${isServicesPage ? 'btn-info active' : 'btn-outline-info'}">
            <i class="fas fa-concierge-bell me-2"></i>Services
          </a>
          <a href="/api/staff/page" class="btn nav-btn ${isStaffPage ? 'btn-warning active' : 'btn-outline-warning'}">
            <i class="fas fa-user-tie me-2"></i>Staff
          </a>
          <a href="/api/admin/appointments" class="btn nav-btn ${isBookingsPage ? 'btn-success active' : 'btn-outline-success'}">
            <i class="fas fa-calendar-check me-2"></i>Bookings
          </a>
          <button class="btn nav-btn btn-outline-danger" id="logoutBtn" onclick="logout()">
            <i class="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        `;
        
        // Add a direct click handler to dashboard button
        setTimeout(() => {
          const adminDashboardBtn = document.getElementById('adminDashboardBtn');
          if (adminDashboardBtn) {
            adminDashboardBtn.addEventListener('click', function(e) {
              e.preventDefault();
              console.log('Dashboard button clicked - redirecting to /api/admin/page');
              window.location.href = '/api/admin/page';
            });
          }
        }, 100); // Small delay to ensure DOM is ready
      } else if (userRole === 'staff') {
        // Staff navigation
        navContainer.innerHTML = `
          <a href="/api/staff/dashboard" class="btn nav-btn btn-primary">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a href="/api/staff/schedule" class="btn nav-btn btn-accent">
            <i class="fas fa-calendar-alt me-2"></i>My Schedule
          </a>
          <a href="/api/staff/profile" class="btn nav-btn btn-info">
            <i class="fas fa-user me-2"></i>My Profile
          </a>
          <button class="btn nav-btn btn-outline-danger" id="logoutBtn" onclick="logout()">
            <i class="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        `;
      }
      
      // If no logoutBtn was set in the nav (or we're on a page with different structure)
      // find any logout button and attach the logout function
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn && !logoutBtn.getAttribute('onclick')) {
        logoutBtn.addEventListener('click', logout);
      }
      
    } catch (err) {
      console.error('Error fetching user profile for navigation:', err);
      // Default to minimal navigation if error
      navContainer.innerHTML = `
        <a href="/api/dashboard/page" class="btn nav-btn btn-primary">
          <i class="fas fa-tachometer-alt me-2"></i>Dashboard
        </a>
        <button class="btn nav-btn btn-outline-danger" id="logoutBtn" onclick="logout()">
          <i class="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      `;
    }
  });
  
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