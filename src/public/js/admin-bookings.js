const token = localStorage.getItem('token');
const bookingsTable = document.getElementById('adminBookingsTable');

async function loadAdminBookings() {
  try {
    const res = await axios.get('/api/admin/bookings', {
      headers: { Authorization: token }
    });

    bookingsTable.innerHTML = '';

    if (res.data.length === 0) {
      bookingsTable.innerHTML = '<tr><td colspan="6" class="text-center">No bookings found</td></tr>';
      return;
    }

    res.data.forEach(booking => {
      const tr = document.createElement('tr');
      tr.innerHTML = ` 
        <td>${booking.Service.name}</td>
        <td>${booking.Staff.name}</td>
        <td>${booking.User.name}</td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td>${booking.status}</td>
         <td>
          ${booking.status === 'confirmed' ? `
            <button class="btn btn-sm btn-danger me-2" onclick="cancelBooking(${booking.id})">Cancel</button>
            <button class="btn btn-sm btn-warning" onclick="rescheduleBooking(${booking.id})">Reschedule</button>
          ` : '<em>-</em>'}
        </td>
      `;
      bookingsTable.appendChild(tr);
    });

  } catch (err) {
    console.error('Error fetching bookings', err);
  }
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

