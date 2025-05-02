// // booking.js

// const token = localStorage.getItem('token');

// const serviceSelect = document.getElementById('serviceSelect');
// const staffSelect = document.getElementById('staffSelect');
// const bookingForm = document.getElementById('bookingForm');
// const loader = document.getElementById('loader');

// // Helper to show/hide loader
// function showLoader() {
//   loader.style.display = 'flex';
// }
// function hideLoader() {
//   loader.style.display = 'none';
// }

// // Fetch available services
// async function fetchServices() {
//   try {
//     const res = await axios.get('/api/services', {
//       headers: { Authorization: token }
//     });
//     const services = res.data;
//     console.log("services is :", services);

//     services.forEach(service => {
//       const option = document.createElement('option');
//       option.value = service.id;
//       option.textContent = `${service.name} (₹${service.price})`;
//       serviceSelect.appendChild(option);
//     });
//   } catch (err) {
//     console.error('Failed to load services', err);
//     alert('Error loading services');
//   }
// }

// // Fetch available staff
// async function fetchStaff() {
//   try {
//     const res = await axios.get('/api/staff', {
//       headers: { Authorization: token }
//     });
//     const staffMembers = res.data;
//     console.log("staff members:", staffMembers);

//     staffMembers.forEach(staff => {
//       const option = document.createElement('option');
//       option.value = staff.id;
//       option.textContent = `${staff.name} (${staff.specialization})`;
//       staffSelect.appendChild(option);
//     });
//   } catch (err) {
//     console.error('Failed to load staff', err);
//     alert('Error loading staff');
//   }
// }

// // Handle booking form submit
// bookingForm.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const serviceId = serviceSelect.value;
//   const staffId = staffSelect.value;
//   const date = document.getElementById('dateInput').value;
//   const time = document.getElementById('timeInput').value;

//   if (!serviceId || !staffId || !date || !time) {
//     return alert('Please fill all fields!');
//   }

//   try {
//     showLoader();
//     const res = await axios.post('/booking/create', {
//       serviceId,
//       staffId,
//       date,
//       time
//     }, {
//       headers: { Authorization: token }
//     });

//     hideLoader();
//     alert('✅ Appointment booked successfully!');
//     bookingForm.reset();
//   } catch (err) {
//     hideLoader();
//     console.error('Booking failed', err);
//     alert('❌ Failed to book appointment');
//   }
// });

// // Initialize page
// document.addEventListener('DOMContentLoaded', () => {
//   fetchServices();
//   fetchStaff();
// });

const baseUrl = window.location.origin;
const token = localStorage.getItem("token");
const payNowBtn = document.getElementById("payNowBtn");


// Elements
const serviceSelect = document.getElementById("serviceSelect");
const staffSelect = document.getElementById("staffSelect");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const bookingForm = document.getElementById("bookingForm");
const appointmentsTable = document.getElementById("appointmentsTable").querySelector("tbody");
const loader = document.getElementById("loader");

// Show Loader
function showLoader() {
  loader.style.display = "flex";
}

// Hide Loader
function hideLoader() {
  loader.style.display = "none";
}

// Fetch all services
async function fetchServices() {
  try {
    const res = await axios.get("/api/services", {
      headers: { Authorization: token },
    });
    serviceSelect.innerHTML = '<option value="">Select Service</option>';
    res.data.forEach(service => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = `${service.name} (₹${service.price})`;
      serviceSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading services", err);
    alert("Failed to load services");
  }
}

// Fetch all staff
async function fetchStaff() {
  try {
    const res = await axios.get("/api/staff", {
      headers: { Authorization: token },
    });
    staffSelect.innerHTML = '<option value="">Select Staff</option>';
    res.data.forEach(staff => {
      const option = document.createElement("option");
      option.value = staff.id;
      option.textContent = staff.name;
      staffSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading staff", err);
    alert("Failed to load staff");
  }
}

// Submit booking form
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const serviceId = serviceSelect.value;
  const staffId = staffSelect.value;
  const date = dateInput.value;
  const time = timeInput.value;

  if (!serviceId || !staffId || !date || !time) {
    alert("Please fill all fields.");
    return;
  }

  try {
    showLoader();
    const res = await axios.post("/api/booking/create", {
      serviceId,
      staffId,
      date,
      time,
    }, {
      headers: { Authorization: token },
    });

    alert("✅ Appointment booked successfully!");
    bookingForm.reset();
    loadAppointments();
  } catch (err) {
    console.error("Booking failed", err);
    alert(err.response?.data?.message || "Failed to book appointment");
  } finally {
    hideLoader();
  }
});

// Load existing appointments
async function loadAppointments() {
  try {
    showLoader();
    const res = await axios.get("/api/booking/all", {
      headers: { Authorization: token },
    });

    console.log("respose is:", res);

    appointmentsTable.innerHTML = "";

    if (res.data.length === 0) {
      appointmentsTable.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found</td></tr>';
      return;
    }

    res.data.forEach(appointment => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${appointment.Service.name}</td>
        <td>${appointment.Staff.name}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
        <td>
          <button class="btn btn-sm btn-danger me-2" onclick="cancelBooking('${appointment.id}')">Cancel</button>
          <button class="btn btn-sm btn-warning" onclick="rescheduleBooking('${appointment.id}')">Reschedule</button>
        </td>
      `;

      appointmentsTable.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading appointments", err);
    alert("Failed to load appointments");
  } finally {
    hideLoader();
  }
}

// Cancel Booking
async function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    showLoader();
    await axios.delete(`/api/booking/cancel/${id}`, {
      headers: { Authorization: token },
    });

    alert("❌ Appointment cancelled successfully!");
    loadAppointments();
  } catch (err) {
    console.error("Failed to cancel", err);
    alert(err.response?.data?.message || "Failed to cancel appointment");
  } finally {
    hideLoader();
  }
}

// Reschedule Booking
async function rescheduleBooking(id) {
  const newDate = prompt("Enter new date (YYYY-MM-DD):");
  const newTime = prompt("Enter new time (HH:MM):");

  if (!newDate || !newTime) {
    alert("New date and time are required.");
    return;
  }

  try {
    showLoader();
    await axios.patch(`/api/booking/reschedule/${id}`, {
      date: newDate,
      time: newTime,
    }, {
      headers: { Authorization: token },
    });

    alert("🔄 Appointment rescheduled successfully!");
    loadAppointments();
  } catch (err) {
    console.error("Failed to reschedule", err);
    alert(err.response?.data?.message || "Failed to reschedule appointment");
  } finally {
    hideLoader();
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  fetchServices();
  fetchStaff();
  loadAppointments();
});


payNowBtn.addEventListener("click", async () => {
  try {
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
        await axios.post("/api/payment/update-status", {
          bookingId: currentBookingId,
          success: true,
          orderId: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id
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
