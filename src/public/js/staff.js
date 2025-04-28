
const loader = document.getElementById("loader");
const staffForm = document.getElementById("staffForm");
const staffTable = document.getElementById("staffTable").querySelector("tbody");

document.addEventListener("DOMContentLoaded", () => {
  fetchAllStaff();
});

// 🌟 Fetch and display all staff
async function fetchAllStaff() {
    const token = localStorage.getItem("token")
  loader.style.display = "flex";
  try {
    const res = await axios.get(`/api/staff`);
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
    alert("Failed to load staff!");
  }
  loader.style.display = "none";
}

// 🌟 Handle form submit (Add or Update)
staffForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const staffId = document.getElementById("staffId").value;
  const name = document.getElementById("name").value.trim();
  const specialization = document.getElementById("specialization").value.trim();
  const available = document.getElementById("available").value.trim().toLowerCase() === "true";

  const staffData = { name, specialization, available };

  try {
    loader.style.display = "flex";

    if (staffId) {
      // Update
      await axios.put(`/api/staff/${staffId}`, staffData);
      alert("✅ Staff updated successfully!");
    } else {
      // Create
      await axios.post(`/api/staff`, staffData);
      alert("✅ Staff added successfully!");
    }

    staffForm.reset();
    document.getElementById("staffId").value = "";
    fetchAllStaff();

  } catch (err) {
    console.error("Error saving staff:", err);
    alert("Error saving staff. Check console!");
  }

  loader.style.display = "none";
});

// 🌟 Populate form to edit staff
async function editStaff(id) {
  try {
    const res = await axios.get(`${apiUrl}/${id}`);
    const staff = res.data;

    document.getElementById("staffId").value = staff.id;
    document.getElementById("name").value = staff.name;
    document.getElementById("specialization").value = staff.specialization;
    document.getElementById("available").value = staff.available ? "true" : "false";
  } catch (err) {
    console.error("Error loading staff:", err);
    alert("Failed to load staff info!");
  }
}

// 🌟 Delete staff
async function deleteStaff(id) {
  if (!confirm("Are you sure you want to delete this staff?")) return;

  try {
    loader.style.display = "flex";
    await axios.delete(`/api/staff/${id}`);
    alert("🗑️ Staff deleted successfully!");
    fetchAllStaff();
  } catch (err) {
    console.error("Error deleting staff:", err);
    alert("Failed to delete staff!");
  }
  loader.style.display = "none";
}
