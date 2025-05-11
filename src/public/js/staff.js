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

const loader = document.getElementById("loader");
const staffForm = document.getElementById("staffForm");
const staffTable = document.getElementById("staffTable").querySelector("tbody");
const token = localStorage.getItem('token');


document.addEventListener("DOMContentLoaded", () => {
  fetchAllStaff();
});

// 🌟 Fetch and display all staff
async function fetchAllStaff() {
    const token = localStorage.getItem("token")
  loader.style.display = "flex";
  try {
    const res = await axios.get(`/api/staff`, {
        headers: { Authorization: token }
      });
    const staffList = res.data;

    staffTable.innerHTML = "";

    staffList.forEach(staff => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${staff.name}</td>
        <td>${staff.specialization}</td>
        <td>${staff.available ? "✅" : "❌"}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="editStaff('${staff.id}')">Edit</button>
          <button class="btn btn-sm btn-danger ms-2" onclick="deleteStaff('${staff.id}')">Delete</button>
        </td>
      `;

      staffTable.appendChild(tr);
    });

  } catch (err) {
    console.error("Error fetching staff:", err);
    showError("Error", "Failed to load staff!");
  }
  loader.style.display = "none";
}

// 🌟 Handle form submit (Add or Update)
staffForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const staffId = document.getElementById("staffId").value;
  const name = document.getElementById("name").value.trim();
  const specialization = document.getElementById("specialization").value.trim();
  const email = document.getElementById("email").value.trim();
  const available = document.getElementById("available").value.trim().toLowerCase() === "true";

  const staffData = { name, specialization, email, available };
  const token = localStorage.getItem('token');
  try {
    loader.style.display = "flex";

    if (staffId) {
      // Update
      await axios.put(`/api/staff/${staffId}`, staffData, {
        headers: { Authorization: token }
      });
      showToast("Staff updated successfully!");
    } else {
      // Create
      await axios.post(`/api/staff`, staffData, {
        headers: { Authorization: token }
      });
      showToast("Staff added successfully!");
    }

    staffForm.reset();
    document.getElementById("staffId").value = "";
    fetchAllStaff();

  } catch (err) {
    console.error("Error saving staff:", err);
    showError("Error", "Failed to save staff information. Please try again.");
  }

  loader.style.display = "none";
});

// 🌟 Populate form to edit staff
async function editStaff(id) {
  try {
    const res = await axios.get(`${apiUrl}/${id}`, {
        headers: { Authorization: token }
      });
    const staff = res.data;

    document.getElementById("staffId").value = staff.id;
    document.getElementById("name").value = staff.name;
    document.getElementById("specialization").value = staff.specialization;
    document.getElementById("email").value = staff.email;
    document.getElementById("available").value = staff.available ? "true" : "false";
  } catch (err) {
    console.error("Error loading staff:", err);
    showError("Error", "Failed to load staff information. Please try again.");
  }
}

// 🌟 Delete staff
async function deleteStaff(id) {
  const confirmed = await confirmAction(
    'Delete Staff',
    'Are you sure you want to delete this staff member?',
    'warning'
  );
  
  if (!confirmed) return;

  try {
    loader.style.display = "flex";
    await axios.delete(`/api/staff/${id}`);
    showToast("Staff deleted successfully!");
    fetchAllStaff();
  } catch (err) {
    console.error("Error deleting staff:", err);
    showError("Error", "Failed to delete staff. Please try again.");
  }
  loader.style.display = "none";
}
