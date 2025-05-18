
const token = localStorage.getItem('token');
const bookingsTable = document.getElementById('adminBookingsTable');
const bookingsPagination = document.getElementById('adminBookingsPagination');
const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleModal'));

// Global variables
let currentBookingsPage = 1;
let bookingsPerPage = 10;
let filterStatus = 'all';
let currentBookingId = null;

async function loadAdminBookings(page = 1, status = 'all') {
  try {
    // Update tracking variables
    currentBookingsPage = page;
    filterStatus = status;
    
    // Show loading
    bookingsTable.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>`;
    
    // Make API request
    const res = await axios.get(`/api/admin/bookings?page=${page}&limit=${bookingsPerPage}&status=${status}`, {
      headers: { Authorization: token }
    });
    
    const data = res.data;
    const bookings = data.bookings || [];
    
    bookingsTable.innerHTML = '';

    if (bookings.length === 0) {
      bookingsTable.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <i class="fas fa-calendar-times me-2"></i>No bookings found
          </td>
        </tr>`;
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
        <td>${booking.Service?.name || 'N/A'}</td>
        <td>${booking.Staff?.name || 'N/A'}</td>
        <td>${booking.User?.name || 'N/A'}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${formatTime(booking.time)}</td>
        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
        <td>
          ${booking.status !== 'cancelled' ? `
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})" title="Cancel">
                <i class="fas fa-times-circle"></i>
              </button>
              <button class="btn btn-sm btn-warning" onclick="openRescheduleModal(${booking.id})" title="Reschedule">
                <i class="fas fa-calendar-alt"></i>
              </button>
            </div>
          ` : '<em class="text-muted">No actions</em>'}
        </td>
      `;
      bookingsTable.appendChild(tr);
    });
    
    // Create pagination
    if (bookingsPagination) {
      generateBookingsPagination(data.currentPage, data.totalPages);
    }
  } catch (err) {
    console.error('Error fetching bookings', err);
    bookingsTable.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger py-4">
          <i class="fas fa-exclamation-circle me-2"></i>Error loading bookings
        </td>
      </tr>`;
    if (bookingsPagination) bookingsPagination.innerHTML = '';
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(timeString) {
  if (!timeString) return 'N/A';
  return timeString.substring(0, 5); // Just show HH:MM
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
  prevLink.innerHTML = '<i class="fas fa-chevron-left"></i>';
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
  nextLink.innerHTML = '<i class="fas fa-chevron-right"></i>';
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
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: "This will cancel the appointment. This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, cancel it!'
  });
  
  if (!isConfirmed) return;

  try {
    await axios.delete(`/api/booking/cancel/${id}`, {
      headers: { Authorization: token },
    });

    await Swal.fire(
      'Cancelled!',
      'The appointment has been cancelled.',
      'success'
    );
    
    loadAdminBookings(currentBookingsPage, filterStatus);
  } catch (err) {
    console.error("Failed to cancel", err);
    Swal.fire(
      'Error!',
      err.response?.data?.message || "Failed to cancel appointment",
      'error'
    );
  }
}

// Open reschedule modal
function openRescheduleModal(id) {
  currentBookingId = id;
  
  // Reset form
  document.getElementById('rescheduleDateInput').value = '';
  document.getElementById('rescheduleTimeInput').value = '';
  
  // Show modal
  rescheduleModal.show();
}

// Submit reschedule
async function submitReschedule() {
  const newDate = document.getElementById('rescheduleDateInput').value;
  const newTime = document.getElementById('rescheduleTimeInput').value;

  if (!newDate || !newTime) {
    Swal.fire(
      'Incomplete',
      'Please select both date and time.',
      'warning'
    );
    return;
  }

  try {
    await axios.patch(
      `/api/booking/reschedule/${currentBookingId}`,
      { date: newDate, time: newTime },
      { headers: { Authorization: token } }
    );

    await Swal.fire(
      'Success!',
      'Appointment rescheduled successfully!',
      'success'
    );
    
    loadAdminBookings(currentBookingsPage, filterStatus);
    rescheduleModal.hide();
  } catch (err) {
    console.error("Failed to reschedule", err);
    Swal.fire(
      'Error!',
      err.response?.data?.message || "Failed to reschedule appointment",
      'error'
    );
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadAdminBookings();
  
  // Set up reschedule button
  document.getElementById('submitRescheduleBtn').addEventListener('click', submitReschedule);
});
