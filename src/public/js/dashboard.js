// dashboard.js
const baseUrl = window.location.origin;


// Fetch customer name
document.addEventListener('DOMContentLoaded', function() {
   
  axios.get('/api/dashboard/auth/profile', {
    withCredentials: true
  })
  .then(res => {
    document.getElementById('customerName').textContent = res.data.name;
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


// In dashboard.js, update the event listener section
document.addEventListener('DOMContentLoaded', function() {
  // Event handler for both appointment buttons
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
});


