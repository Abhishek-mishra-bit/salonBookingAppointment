// booking.js

const baseUrl = window.location.origin;
const token = localStorage.getItem("token");

// Elements
const serviceSelect = document.getElementById("serviceSelect");
const staffSelect = document.getElementById("staffSelect");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const bookingForm = document.getElementById("bookingForm");
const appointmentsTable = document.getElementById("appointmentsTable");
const loader = document.getElementById("loader");

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
            headers: { Authorization: token }
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
            headers: { Authorization: token }
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

async function fetchUserBookings() {
    try {
        showLoader();
        const res = await axios.get('/api/booking/user', {
            headers: { Authorization: token }
        });
        const bookings = res.data;
        console.log("bookkeing is :", bookings);

        appointmentsTable.innerHTML = '';

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.setAttribute('data-booking-id', booking.id); 
                        row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.Service.name}</td>
                <td>${booking.Staff.name}</td>
                <td>${booking.status}</td>
                <td>${booking.paymentStatus}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="showBookingDetails(${booking.id})">
                        Details
                    </button>
                </td>
                <td>
                    ${booking.status === 'confirmed' ? `<button class="btn btn-warning btn-sm" onclick="rescheduleBooking(${booking.id})">Reschedule</button>` : ''}
                    ${booking.status !== 'cancelled' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${booking.id})">Cancel</button>` : ''}
                </td>
            `;
            appointmentsTable.appendChild(row);
        });

        hideLoader();
    } catch (err) {
        console.error('Fetching bookings failed:', err);
        showNotification('Failed to fetch bookings', 'danger');
        hideLoader();
    }
}

// Booking Form Submit
bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const proceedToPayment = confirm("Do you want to proceed with payment?");
        if (!proceedToPayment) {
            alert("Booking cancelled because payment is required.");
            return;
        }

        const serviceId = serviceSelect.value;
        const staffId = staffSelect.value;
        const date = dateInput.value;
        const time = timeInput.value;

        const { data } = await axios.post("/api/payment/create-order", { serviceId });

        const options = {
            key: "RAZORPAY_KEY", // Replace with your Razorpay public key
            amount: data.amount,
            currency: "INR",
            order_id: data.orderId,
            handler: async function (response) {
                try {
                    await axios.post("/api/payment/confirm-payment", {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingDetails: { serviceId, staffId, date, time }
                    });
                    alert("Booking successful!");
                    location.reload();
                } catch (error) {
                    console.error('Payment confirmation error:', error);
                    alert('Payment was successful but booking confirmation failed.');
                }
            },
            prefill: { name: "Customer Name" }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error in booking process:', error);
        alert('An error occurred. Please try again.');
    }
});


async function processPayment(bookingId, amount) {
    try {
        showLoader();

        const transactionId = `TXN-${Date.now()}`;

        const res = await axios.post("/api/payment/create-order", {
            bookingId,
            transactionId
        }, {
            headers: { Authorization: token }
        });

        if (res.status === 200) {
            const options = {
                key: res.data.key_id,
                amount: res.data.amount,
                currency: "INR",
                name: "Salon Booking",
                description: "Service Booking Payment",
                order_id: res.data.orderId,
                handler: async function (response) {
                    await axios.post("/api/payment/confirm-payment", {
                        bookingId: bookingId,  // ✅ Use passed parameter
                        success: true,
                        orderId: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id
                    }, {
                        headers: { Authorization: token }
                    });

                    showNotification('Payment successful!', 'success');
                    fetchUserBookings();

                    const modal = document.getElementById('paymentModal');
                    if (modal) {
                        const modalInstance = bootstrap.Modal.getInstance(modal);
                        if (modalInstance) modalInstance.hide();
                    }
                },
                modal: {
                    ondismiss: function () {
                        showNotification('Payment was cancelled', 'warning');
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open(); // ✅ Trigger Razorpay payment popup
        } else {
            showNotification('Payment failed', 'danger');
        }
    } catch (err) {
        console.error('Payment error:', err);
        showNotification('Payment failed', 'danger');
    } finally {
        hideLoader();
    }
}


// Show booking details in modal
function showBookingDetails(bookingId) {
        
    const bookingRow = document.querySelector(`tr[data-booking-id="${bookingId}"]`);
    if (!bookingRow) {
        console.error('Booking not found:', bookingId);
        return;
    }

    // Get booking details from data attributes or cells
    const bookingDetails = {
        id: bookingId,
        service: bookingRow.cells[0].textContent,
        staff: bookingRow.cells[1].textContent,
        date: bookingRow.cells[2].textContent,
        time: bookingRow.cells[3].textContent,
        status: bookingRow.cells[4].textContent,
        paymentStatus: bookingRow.cells[5].textContent
    };

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
                            <p>${bookingDetails.service}</p>
                        </div>
                        <div class="mb-3">
                            <h6>Staff:</h6>
                            <p>${bookingDetails.staff}</p>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <h6>Date:</h6>
                                <p>${bookingDetails.date}</p>
                            </div>
                            <div class="col-6">
                                <h6>Time:</h6>
                                <p>${bookingDetails.time}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <h6>Status:</h6>
                                <span class="badge bg-${bookingDetails.status === 'confirmed' ? 'success' : 'warning'}">
                                    ${bookingDetails.status}
                                </span>
                            </div>
                            <div class="col-6">
                                <h6>Payment:</h6>
                                <span class="badge bg-${bookingDetails.paymentStatus === 'paid' ? 'success' : 'danger'}">
                                    ${bookingDetails.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${bookingDetails.paymentStatus !== 'paid' ? 
                            `<button type="button" class="btn btn-primary" onclick="processPayment('${bookingId}')">
                                Pay Now
                            </button>` : ''
                        }
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
    fetchUserBookings();
});

// Appointment Actions
async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        showLoader();
        await axios.patch(`/api/bookings/cancel/${id}`, null, {
            headers: { Authorization: token }
        });
        
        hideLoader();
        showNotification('Booking cancelled successfully!', 'success');
        fetchAppointments();
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
        await axios.patch(`/api/bookings/reschedule/${id}`, {
            date: newDate,
            time: newTime
        }, {
            headers: { Authorization: token }
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
        headers: { Authorization: token }
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
          headers: { Authorization: token }
        });
        alert("✅ Payment successful!");
        payNowBtn.style.display = "none";
      },
      theme: { color: "#0d6efd" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment initiation error", err);
    alert("Error initiating payment");
  }
});
};
