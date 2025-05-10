const baseUrl = window.location.origin;


document.addEventListener('DOMContentLoaded',  async () => {
  await axios.get("/api/dashboard/page", {
    
  });
});

async function loadProfile() {
  try {
    const res = await axios.get("/api/dashboard/auth/profile", {
      
    });

    const user = res.data;

    document.getElementById("userName").innerText = user.name;
    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userPhone").innerText = user.phone;
    document.getElementById("userRole").innerText = user.role;

      // Hide loader and show content
      document.getElementById('loader').style.display = 'none';
      document.querySelector('main').style.display = 'block';

  } catch (err) {
    console.error(err);
    alert("Session expired. Please login again.");
    window.location.href = "/api/auth/login";
  }
}

loadProfile();

document.addEventListener('DOMContentLoaded', function() {
  // Event handler for the "My Appointments" button
  const btn = document.getElementById('viewAppointmentsBtn');
  if (btn) {
    btn.addEventListener('click', async function() {
      // Show loader/spinner in modal
      const tableBody = document.getElementById('appointmentsTable');
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById('appointmentsModal'));
      modal.show();

      try {
        // Fetch appointments (adjust endpoint as per your backend)
        const res = await axios.get('/api/booking/user');
        const appointments = res.data.rows || res.data; // adapt if paginated

        if (appointments.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found.</td></tr>';
          return;
        }

        // Render rows
        tableBody.innerHTML = '';
        appointments.forEach(appt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${appt.Service?.name || '-'}</td>
            <td>${appt.Staff?.name || '-'}</td>
            <td>${appt.date} ${appt.time}</td>
            <td>${appt.status}</td>
            <td>
              ${appt.status === 'confirmed' ? `
                <button class="btn btn-sm btn-danger me-2" onclick="cancelBooking(${appt.id})">Cancel</button>
                <button class="btn btn-sm btn-warning" onclick="rescheduleBooking(${appt.id})">Reschedule</button>
              ` : '<em>-</em>'}
            </td>
          `;
          tableBody.appendChild(row);
        });
      } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load appointments.</td></tr>`;
      }
    });
  }
});