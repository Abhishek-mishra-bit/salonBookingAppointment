const token = localStorage.getItem('token');
const bookingsTable = document.getElementById('adminBookingsTable');
const bookingsPagination = document.getElementById('adminBookingsPagination');

// Global variable to track current page
let currentBookingsPage = 1;
let bookingsPerPage = 10;
let filterStatus = 'all';

async function loadAdminBookings(page = 1, status = 'all') {
  try {
    // Update tracking variables
    currentBookingsPage = page;
    filterStatus = status;
    
    // Show loading
    bookingsTable.innerHTML = '<tr><td colspan="7" class="text-center">Loading bookings...</td></tr>';
    
    // Make API request with pagination parameters
    const res = await axios.get(`/api/admin/bookings?page=${page}&limit=${bookingsPerPage}&status=${status}`, {
      headers: { Authorization: token }
    });
    
    // Extract data from response
    const data = res.data;
    const bookings = data.bookings || [];
    
    bookingsTable.innerHTML = '';

    if (bookings.length === 0) {
      bookingsTable.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>';
      if (bookingsPagination) bookingsPagination.innerHTML = '';
      return;
    }

    // Render each booking row
    bookings.forEach(booking => {
      const tr = document.createElement('tr');
      
      // Add status color class
      if (booking.status === 'confirmed') {
        tr.classList.add('table-success');
      } else if (booking.status === 'pending') {
        tr.classList.add('table-warning');
      } else if (booking.status === 'cancelled') {
        tr.classList.add('table-danger');
      }
      
      tr.innerHTML = ` 
        <td>${booking.Service.name}</td>
        <td>${booking.Staff.name}</td>
        <td>${booking.User.name}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.time}</td>
        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
        <td>
          ${booking.status !== 'cancelled' ? `
            <button class="btn btn-sm btn-danger me-2" onclick="cancelBooking(${booking.id})">
              <i class="fas fa-times-circle"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="rescheduleBooking(${booking.id})">
              <i class="fas fa-calendar-alt"></i>
            </button>
          ` : '<em>-</em>'}
        </td>
      `;
      bookingsTable.appendChild(tr);
    });
    
    // Create pagination if container exists
    if (bookingsPagination) {
      generateBookingsPagination(data.currentPage, data.totalPages);
    }
  } catch (err) {
    console.error('Error fetching bookings', err);
    bookingsTable.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading bookings</td></tr>';
    if (bookingsPagination) bookingsPagination.innerHTML = '';
  }
}

// Format date for better display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get appropriate badge class based on status
function getStatusBadgeClass(status) {
  switch(status) {
    case 'confirmed': return 'bg-success';
    case 'pending': return 'bg-warning text-dark';
    case 'cancelled': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

// Generate pagination controls
function generateBookingsPagination(currentPage, totalPages) {
  if (!bookingsPagination) return;
  
  bookingsPagination.innerHTML = '';
  
  // Only show pagination if more than one page
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
      loadAdminBookings(currentPage - 1, filterStatus);
    });
  }
  prevLi.appendChild(prevLink);
  bookingsPagination.appendChild(prevLi);
  
  // Page buttons (up to 5 pages with current in middle)
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
      loadAdminBookings(i, filterStatus);
    });
    pageLi.appendChild(pageLink);
    bookingsPagination.appendChild(pageLi);
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
      loadAdminBookings(currentPage + 1, filterStatus);
    });
  }
  nextLi.appendChild(nextLink);
  bookingsPagination.appendChild(nextLi);
}
// Cancel Booking
async function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    // showLoader();
    await axios.delete(`/api/booking/cancel/${id}`, {
      headers: { Authorization: token },
    });

    alert("❌ Appointment cancelled successfully!");
    loadAdminBookings();
  } catch (err) {
    console.error("Failed to cancel", err);
    alert(err.response?.data?.message || "Failed to cancel appointment");
  } finally {
    // hideLoader();
  }
}

let currentBookingId = null;

// Open reschedule modal
async function rescheduleBooking(id) {
  currentBookingId = id;
  document.getElementById('rescheduleModal').style.display = 'flex';
}

// Close modal
function closeRescheduleModal() {
  document.getElementById('rescheduleModal').style.display = 'none';
}

// Submit reschedule
async function submitReschedule() {
  const newDate = document.getElementById('rescheduleDateInput').value;
  const newTime = document.getElementById('rescheduleTimeInput').value;

  if (!newDate || !newTime) {
    alert("Please select both date and time.");
    return;
  }

  try {
    await axios.patch(
      `/api/booking/reschedule/${currentBookingId}`,
      { date: newDate, time: newTime },
      { headers: { Authorization: token } }
    );

    alert("✅ Appointment rescheduled successfully!");
    loadAdminBookings();
    closeRescheduleModal();
  } catch (err) {
    console.error("Failed to reschedule", err);
    alert(err.response?.data?.message || "Failed to reschedule appointment");
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  loadAdminBookings();
   // Close modal when clicking outside
   document.getElementById('rescheduleModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('rescheduleModal')) {
      closeRescheduleModal();
    }
  });
})

