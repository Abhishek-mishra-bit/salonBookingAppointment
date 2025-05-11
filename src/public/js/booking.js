// booking.js

const baseUrl = window.location.origin;

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

// Elements
const serviceSelect = document.getElementById("serviceSelect");
const staffSelect = document.getElementById("staffSelect");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const bookingForm = document.getElementById("bookingForm");
const appointmentsTable = document.getElementById("appointmentsTable");
const loader = document.getElementById("loader");

const APPOINTMENTS_PER_PAGE = 5;
let currentPage = 1;
let totalAppointments = 0;
let allAppointments = [];

// Helper functions
function showLoader() {
    loader.style.display = "flex";
}

function hideLoader() {
    loader.style.display = "none";
}

function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// API Functions
async function fetchServices() {
    try {
        showLoader();
        const res = await axios.get('/api/services', {
            
        });
        serviceSelect.innerHTML = '<option value="">Select Service</option>';

        res.data.forEach(service => {
            const option = document.createElement("option");
            option.value = service.id;
            option.textContent = `${service.name} (₹${service.price})`;
            serviceSelect.appendChild(option);
        });
        hideLoader();
    } catch (err) {
        console.error("Error loading services", err);
        showNotification('Error loading services. Please try again.', 'danger');
        hideLoader();
    }
}

async function fetchStaff() {
    try {
        showLoader();
        const res = await axios.get('/api/staff', {
            
        });
        staffSelect.innerHTML = '<option value="">Select Staff</option>';
        res.data.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;

            let ratingDisplay = (staff.avgRating && staff.avgRating !== 'No ratings yet') ? `⭐ ${parseFloat(staff.avgRating).toFixed(1)}` : 'No ratings yet';
            option.textContent = `${staff.name} (${staff.specialization}) - ${ratingDisplay}`;
            staffSelect.appendChild(option);
        });
        hideLoader();
    } catch (err) {
        console.error("Error loading staff", err);
        showNotification('Error loading staff. Please try again.', 'danger');
        hideLoader();
    }
}

async function fetchUserBookings(page = 1) {
    try {
        showLoader();
        const res = await axios.get(`/api/booking/user?page=${page}&limit=${APPOINTMENTS_PER_PAGE}`, {
            withCredentials: true
        });
        
        // Handle the paginated response format
        const data = res.data;
        
        // Check if the response has the expected structure
        if (data.appointments && data.totalCount !== undefined) {
            allAppointments = data.appointments;
            totalAppointments = data.totalCount;
            currentPage = page;
            
            console.log("Appointments fetched:", {
                total: totalAppointments,
                current: allAppointments.length,
                page: currentPage
            });
        } else {
            // Fallback to old format if needed
            allAppointments = data;
            totalAppointments = data.length;
            currentPage = page;
        }
        
        renderAppointmentsTable();
        renderPaginationControls();
        
        hideLoader();
    } catch (err) {
        console.error('Fetching bookings failed:', err);
        showNotification('Failed to fetch bookings. Please try again.', 'danger');
        hideLoader();
        
        // Show empty state on error
        appointmentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    Error loading appointments
                </td>
            </tr>
        `;
    }
}

function renderAppointmentsTable() {
    appointmentsTable.innerHTML = '';

    if (!allAppointments || allAppointments.length === 0) {
        appointmentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-calendar-times fa-2x mb-2 text-muted"></i>
                    <p class="mb-0">No appointments found</p>
                </td>
            </tr>
        `;
        return;
    }

    allAppointments.forEach(booking => {
        const serviceName = booking.Service?.name || 'Service not specified';
        const staffName = booking.Staff?.name || 'Staff not assigned';
        const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString() : 'Not set';
        const formattedTime = booking.time || 'Not set';
        
        const row = document.createElement('tr');
        row.setAttribute('data-booking-id', booking.id); 
        row.innerHTML = `
            <td>${serviceName}</td>
            <td>${staffName}</td>
            <td>${formattedDate}<br><small class="text-muted">${formattedTime}</small></td>
            <td>
                <span class="badge ${getStatusBadgeClass(booking.status)}">
                    ${booking.status || 'pending'}
                </span>
            </td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-outline-primary action-btn" title="View" onclick="showBookingDetails('${booking.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${booking.status !== 'cancelled' ? `
                <button class="btn btn-sm btn-outline-danger action-btn" title="Cancel" onclick="cancelBooking('${booking.id}')">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </td>
        `;
        appointmentsTable.appendChild(row);
    });
}

function renderPaginationControls() {
    const totalPages = Math.ceil(totalAppointments / APPOINTMENTS_PER_PAGE);
    const paginationControls = document.getElementById('paginationControls');
    
    paginationControls.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>`;
    paginationControls.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        paginationControls.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>`;
    paginationControls.appendChild(nextLi);
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(totalAppointments / APPOINTMENTS_PER_PAGE)) return;
    fetchUserBookings(page);
}

// Add event listener for the view appointments button
document.getElementById('viewAppointmentsBtn')?.addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('appointmentsModal'));
    modal.show();
    fetchUserBookings();
});

// Helper function for status badges
function getStatusBadgeClass(status) {
    switch(status?.toLowerCase()) {
        case 'confirmed': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        case 'completed': return 'bg-primary';
        default: return 'bg-warning text-dark';
    }
}

// Booking Form Submit
// Booking Form Submit - Updated version
bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoader();

    try {
        const serviceId = serviceSelect.value;
        const staffId = staffSelect.value;
        const date = dateInput.value;
        const time = timeInput.value;

        if (!serviceId || !staffId || !date || !time) {
            showNotification('Please fill all fields', 'warning');
            hideLoader();
            return;
        }

        // Create booking first
        const bookingRes = await axios.post("/api/booking/create", {
            serviceId,
            staffId,
            date,
            time
        }, {
            
        });        

        // Then create payment order
        const paymentRes = await axios.post(`/api/payment/create-order`, { 
            bookingId: bookingRes.data.booking.id,
            amount: bookingRes.data.booking.amountPaid 
        },{
            
        });

        const options = {
            key: paymentRes.data.key_id, // Replace with your actual key
            amount: paymentRes.data.amount,
            currency: "INR",
            order_id: paymentRes.data.orderId,
            name: "Salon Booking",
            description: `Payment for ${serviceSelect.options[serviceSelect.selectedIndex].text}`,
            handler: async function (paymentRes) {
                try {
                    await axios.post("/api/payment/confirm-payment", {
                        razorpay_payment_id: paymentRes.razorpay_payment_id,
                        razorpay_order_id: paymentRes.razorpay_order_id,
                        razorpay_signature: paymentRes.razorpay_signature,
                        bookingId: bookingRes.data.booking.id 
                    },{
                        
                    });
                    
                    showNotification('Booking and payment successful!', 'success');
                    fetchUserBookings();
                } catch (error) {
                    console.error('Payment confirmation error:', error);
                    showNotification('Payment successful but booking update failed', 'warning');
                }
            },
            modal: {
                ondismiss: function() {
                    showNotification('Payment cancelled', 'warning');
                }
            },
            theme: {
                color: "#8a6d62" // Use your salon primary color
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.response?.data?.message || 'Booking failed. Please try again.', 'danger');
    } finally {
        hideLoader();
    }
});


// async function processPayment(bookingId, amount) {
//     try {
//         showLoader();

//         const transactionId = `TXN-${Date.now()}`;

//         const res = await axios.post("/api/payment/create-order", {
//             bookingId,
//             transactionId
//         }, {
//             
//         });

//         if (res.status === 200) {
//             const options = {
//                 key: res.data.key_id,
//                 amount: res.data.amount,
//                 currency: "INR",
//                 name: "Salon Booking",
//                 description: "Service Booking Payment",
//                 order_id: res.data.orderId,
//                 handler: async function (response) {
//                     await axios.post("/api/payment/confirm-payment", {
//                         bookingId: bookingId,  // ✅ Use passed parameter
//                         success: true,
//                         orderId: response.razorpay_order_id,
//                         payment_id: response.razorpay_payment_id
//                     }, {
//                         
//                     });

//                     showNotification('Payment successful!', 'success');
//                     fetchUserBookings();

//                     const modal = document.getElementById('paymentModal');
//                     if (modal) {
//                         const modalInstance = bootstrap.Modal.getInstance(modal);
//                         if (modalInstance) modalInstance.hide();
//                     }
//                 },
//                 modal: {
//                     ondismiss: function () {
//                         showNotification('Payment was cancelled', 'warning');
//                     }
//                 }
//             };

//             const razorpay = new Razorpay(options);
//             razorpay.open(); // ✅ Trigger Razorpay payment popup
//         } else {
//             showNotification('Payment failed', 'danger');
//         }
//     } catch (err) {
//         console.error('Payment error:', err);
//         showNotification('Payment failed', 'danger');
//     } finally {
//         hideLoader();
//     }
// }


// Show booking details in modal
function showBookingDetails(bookingId) {
    const bookingRow = document.querySelector(`tr[data-booking-id="${bookingId}"]`);
    if (!bookingRow) {
        console.error('Booking not found:', bookingId);
        return;
    }

    // Get data from the correct cells
    const serviceName = bookingRow.cells[0].textContent;
    const staffName = bookingRow.cells[1].textContent;
    const dateTime = bookingRow.cells[2].textContent;
    const status = bookingRow.cells[3].querySelector('.badge').textContent.trim();
    
    // Extract date and time from the combined cell
    const [date, time] = dateTime.split('\n');
    const cleanTime = time ? time.replace('<small class="text-muted">', '').replace('</small>', '').trim() : 'Not set';

    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="bookingDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Booking #${bookingId} Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6>Service:</h6>
                            <p>${serviceName}</p>
                        </div>
                        <div class="mb-3">
                            <h6>Staff:</h6>
                            <p>${staffName}</p>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <h6>Date:</h6>
                                <p>${date}</p>
                            </div>
                            <div class="col-6">
                                <h6>Time:</h6>
                                <p>${cleanTime}</p>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>Status:</h6>
                            <span class="badge ${getStatusBadgeClass(status)}">
                                ${status}
                            </span>
                        </div>
                    </div>
                    <div class="modal-footer">
                                    <a href="/api/reviews/submit/${bookingId}" class="btn nav-btn btn-warning">
                                            <i class="fas fa-concierge-bell"></i> Add review</a>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('bookingDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to DOM and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    fetchStaff();
});

// Appointment Actions
async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        showLoader();
        await axios.patch(`/api/booking/cancel/${id}`, null, {
            
        });
        
        hideLoader();
        showNotification('Booking cancelled successfully!', 'success');
        fetchUserBookings();
    } catch (err) {
        console.error('Failed to cancel booking', err);
        showNotification('Failed to cancel booking. Please try again.', 'danger');
        hideLoader();
    }
}

async function rescheduleBooking(id) {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newTime = prompt('Enter new time (HH:MM):');

    if (!newDate || !newTime) {
        showNotification('Please provide both date and time.', 'warning');
        return;
    }

    try {
        showLoader();
        await axios.patch(`/api/booking/reschedule/${id}`, {
            date: newDate,
            time: newTime
        }, {
            
        });
        
        hideLoader();
        showNotification('Booking rescheduled successfully!', 'success');
        fetchAppointments();
    } catch (err) {
        console.error('Failed to reschedule booking', err);
        showNotification('Failed to reschedule booking. Please try again.', 'danger');
        hideLoader();
    }
}


// Initialize pay now button
const payNowBtn = document.getElementById("payNowBtn");
let currentBookingId = null;

if (payNowBtn) {
  payNowBtn.addEventListener("click", async () => {
    try {
      if (!currentBookingId) {
        showNotification('No booking selected for payment', 'danger');
        return;
      }

      const res = await axios.post("/api/payment/create-order", {
        bookingId: currentBookingId
      }, {
        
      });

      const options = {
        key: res.data.key_id,
      amount: res.data.amount,
      currency: "INR",
      name: "Salon Booking",
      description: "Service Booking Payment",
      order_id: res.data.orderId,
      handler: async function (response) {
        await axios.post("/api/payment/confirm-payment", {
          bookingId: res.bookingId,
          success: true,
          orderId: res.razorpay_order_id,
          payment_id: res.razorpay_payment_id
        }, {
          
        });
        Swal.fire({
          title: 'Payment Successful!',
          text: 'Your appointment has been confirmed.',
          icon: 'success',
          confirmButtonColor: '#9aab89'
        });
        payNowBtn.style.display = "none";
      },
      theme: { color: "#0d6efd" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment initiation error", err);
    showError("Payment Error", "There was an error initiating payment. Please try again.");
  }
});
};
