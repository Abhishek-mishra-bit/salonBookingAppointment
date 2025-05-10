const APPOINTMENTS_PER_PAGE = 5;

// Shared helper functions with theme-appropriate badge classes
function getStatusBadgeClass(status) {
  switch (status) {
    case 'confirmed': return 'bg-success'; // Using our sage green
    case 'pending': return 'bg-warning text-dark'; // Using our dusty rose
    case 'cancelled': return 'bg-danger'; // Standard red for cancellation
    case 'completed': return 'bg-info'; // Using our soft blue
    default: return 'bg-secondary';
  }
}

// The main function to fetch user appointments
async function fetchUserAppointments(page = 1) {
    try {
      const tableBody = document.getElementById('appointmentsTable');
      const paginationControls = document.getElementById('paginationControls');
      
      // Show loading state
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      `;
      
      // Make sure to include pagination parameters in the API call
      const res = await axios.get(`/api/booking/user?page=${page}&limit=${APPOINTMENTS_PER_PAGE}`);
      
      
      // Handle different API response structures
      const appointments = res.data.data || res.data.rows || res.data.appointments || res.data;
      const totalCount = res.data.total || res.data.count || res.data.totalCount || (appointments ? appointments.length : 0);
      
      if (!appointments || appointments.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-5">
              No appointments found.
            </td>
          </tr>
        `;
        if (paginationControls) paginationControls.innerHTML = '';
        return;
      }
      
      renderAppointmentsTable(appointments);
      
      // Only show pagination if there are multiple pages
      if (paginationControls && totalCount > APPOINTMENTS_PER_PAGE) {
        const totalPages = Math.ceil(totalCount / APPOINTMENTS_PER_PAGE);
        renderPaginationControls(page, totalPages);
      } else if (paginationControls) {
        paginationControls.innerHTML = '';
      }
      
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const tableBody = document.getElementById('appointmentsTable');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-5 text-danger">
              Error loading appointments. Please try again.
            </td>
          </tr>
        `;
      }
    }
  }
// Render appointments in table with theme styling
function renderAppointmentsTable(appointments) {
  const tableBody = document.getElementById('appointmentsTable');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  appointments.forEach(appt => {
    const row = document.createElement('tr');
    row.className = 'align-middle';
    row.style.borderBottom = '1px solid var(--salon-secondary)';
    row.innerHTML = `
      <td class="py-3">
        <div class="fw-bold" style="color: var(--salon-dark);">${appt.Service?.name || '-'}</div>
        ${appt.Service?.description ? `<small class="text-muted">${appt.Service.description}</small>` : ''}
      </td>
      <td class="py-3">
        <div style="color: var(--salon-dark);">
          <i class="fas fa-user-tie me-2" style="color: var(--salon-primary);"></i>
          ${appt.Staff?.name || '-'}
        </div>
      </td>
      <td class="py-3">
        <div style="color: var(--salon-dark);">
          <i class="far fa-calendar me-2" style="color: var(--salon-primary);"></i>
          ${new Date(appt.date).toLocaleDateString()}
        </div>
        <div>
          <i class="far fa-clock me-2" style="color: var(--salon-primary);"></i>
          ${appt.time}
        </div>
      </td>
      <td class="py-3">
        <span class="badge rounded-pill ${getStatusBadgeClass(appt.status)} px-3 py-2">
          ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
        </span>
      </td>
      <td class="py-3 text-end">
        ${appt.status === 'confirmed' ? `
          <button class="btn btn-sm btn-danger me-2" onclick="cancelBooking(${appt.id})" style="border-radius: 20px;">
            <i class="fas fa-times-circle me-1"></i>Cancel
          </button>
          <button class="btn btn-sm btn-warning" onclick="rescheduleBooking(${appt.id})" style="border-radius: 20px;">
            <i class="fas fa-calendar-alt me-1"></i>Reschedule
          </button>
        ` : `
          <span class="text-muted">No actions available</span>
        `}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Render pagination with theme styling
function renderPaginationControls(currentPage, totalPages) {
    const pagination = document.getElementById('paginationControls');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    // Create pagination container
    const paginationContainer = document.createElement('ul');
    paginationContainer.className = 'pagination justify-content-center';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" 
         aria-label="Previous" style="border-color: var(--salon-secondary);">
        <span aria-hidden="true">&laquo;</span>
      </a>
    `;
    paginationContainer.appendChild(prevLi);
    
    // Calculate visible page range
    let startPage, endPage;
    if (totalPages <= 5) {
      // Show all pages if total pages is less than 5
      startPage = 1;
      endPage = totalPages;
    } else {
      // Calculate start and end pages to show
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
    
    // First page and ellipsis if needed
    if (startPage > 1) {
      const firstLi = document.createElement('li');
      firstLi.className = 'page-item';
      firstLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(1); return false;" 
           style="border-color: var(--salon-secondary);">1</a>
      `;
      paginationContainer.appendChild(firstLi);
      
      if (startPage > 2) {
        const ellipsisLi = document.createElement('li');
        ellipsisLi.className = 'page-item disabled';
        ellipsisLi.innerHTML = `
          <span class="page-link" style="border-color: var(--salon-secondary);">...</span>
        `;
        paginationContainer.appendChild(ellipsisLi);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${i}); return false;"
           style="${i === currentPage ? 
             'background-color: var(--salon-primary); border-color: var(--salon-primary);' : 
             'border-color: var(--salon-secondary); color: var(--salon-dark);'}">
          ${i}
        </a>
      `;
      paginationContainer.appendChild(pageLi);
    }
    
    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsisLi = document.createElement('li');
        ellipsisLi.className = 'page-item disabled';
        ellipsisLi.innerHTML = `
          <span class="page-link" style="border-color: var(--salon-secondary);">...</span>
        `;
        paginationContainer.appendChild(ellipsisLi);
      }
      
      const lastLi = document.createElement('li');
      lastLi.className = 'page-item';
      lastLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;"
           style="border-color: var(--salon-secondary);">${totalPages}</a>
      `;
      paginationContainer.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;"
         aria-label="Next" style="border-color: var(--salon-secondary);">
        <span aria-hidden="true">&raquo;</span>
      </a>
    `;
    paginationContainer.appendChild(nextLi);
    
    pagination.appendChild(paginationContainer);
  }

// Change page function should work with the updated pagination
function changePage(page) {
    // Ensure page is within valid range
    if (page < 1) page = 1;
    
    // Get the total pages from the pagination controls if needed
    const paginationItems = document.querySelectorAll('.page-item');
    let totalPages = 1;
    if (paginationItems.length > 0) {
      const lastPageItem = paginationItems[paginationItems.length - 2]; // Second to last is usually last page
      if (lastPageItem) {
        const lastPageLink = lastPageItem.querySelector('a');
        if (lastPageLink) {
          totalPages = parseInt(lastPageLink.textContent) || 1;
        }
      }
    }
    
    if (page > totalPages) page = totalPages;
    
    fetchUserAppointments(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

// Appointment actions with confirmation modals
async function cancelBooking(id) {
  const { value: confirmCancel } = await Swal.fire({
    title: 'Confirm Cancellation',
    html: `
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: var(--salon-accent);"></i>
        <p>Are you sure you want to cancel this appointment?</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'var(--salon-accent)',
    cancelButtonColor: 'var(--salon-secondary)',
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it',
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'btn btn-danger px-4 py-2',
      cancelButton: 'btn btn-outline-secondary px-4 py-2'
    }
  });
  
  if (!confirmCancel) return;
  
  try {
    const res = await axios.post(`/api/booking/${id}/cancel`);
    
    await Swal.fire({
      title: 'Cancelled!',
      text: 'Your appointment has been cancelled.',
      icon: 'success',
      confirmButtonColor: 'var(--salon-primary)',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'btn btn-primary px-4 py-2'
      }
    });
    
    // Refresh appointments list
    fetchUserAppointments();
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    
    await Swal.fire({
      title: 'Error',
      text: err.response?.data?.message || 'Failed to cancel appointment. Please try again.',
      icon: 'error',
      confirmButtonColor: 'var(--salon-accent)',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'btn btn-danger px-4 py-2'
      }
    });
  }
}

async function rescheduleBooking(id) {
  // This would typically open a modal or redirect to a rescheduling page
  // For now, we'll show a themed alert
  const { value: newDate } = await Swal.fire({
    title: 'Reschedule Appointment',
    html: `
      <div class="text-center">
        <i class="fas fa-calendar-alt fa-3x mb-3" style="color: var(--salon-primary);"></i>
        <p>Please select a new date and time for your appointment.</p>
        <input type="datetime-local" id="rescheduleDate" class="form-control mt-3" style="border-color: var(--salon-secondary);">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: 'var(--salon-primary)',
    cancelButtonColor: 'var(--salon-secondary)',
    confirmButtonText: 'Reschedule',
    cancelButtonText: 'Cancel',
    preConfirm: () => {
      return document.getElementById('rescheduleDate').value;
    },
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'btn btn-primary px-4 py-2',
      cancelButton: 'btn btn-outline-secondary px-4 py-2'
    }
  });
  
  if (newDate) {
    try {
      // Here you would send the new date to your API
      // await axios.post(`/api/booking/${id}/reschedule`, { newDate });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Your appointment has been rescheduled.',
        icon: 'success',
        confirmButtonColor: 'var(--salon-primary)',
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'btn btn-primary px-4 py-2'
        }
      });
      
      // Refresh appointments list
      fetchUserAppointments();
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to reschedule appointment. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--salon-accent)',
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'btn btn-danger px-4 py-2'
        }
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  fetchUserAppointments();
});