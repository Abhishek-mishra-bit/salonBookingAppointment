const serviceForm = document.getElementById("serviceForm");
const servicesTable = document.querySelector("#servicesTable tbody");
const token = localStorage.getItem("token");

window.addEventListener('load', () => {
    document.getElementById('loader').style.display = 'none';
  });

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";
  
    // Hide after 3 seconds
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }
  

async function fetchServices() {
  try {
    const res = await axios.get("/api/services", {
      headers: { Authorization: token }});
    const services = res.data;
    servicesTable.innerHTML = "";

    services.forEach(service => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${service.name}</td>
        <td>₹${service.price}</td>
        <td>${service.duration} min</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editService(${service.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">Delete</button>
        </td>
      `;

      servicesTable.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load services");
  }
}

serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("serviceId").value;
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const duration = parseInt(document.getElementById("duration").value);

  const serviceData = { name, description, price, duration };
  console.log("Service data:", serviceData);

  try {
    if (id) {
      // Update service
      const updateResponse = await axios.patch(`/api/services/${id}`, serviceData, {
        headers: { Authorization: token }
      });
      console.log("Service update response:", updateResponse.data);
      showToast("✏️ Service updated successfully!");
    } else {
      // Create new service
      const createResponse = await axios.post("/api/services", serviceData, {
        headers: { Authorization: token }
      });
      console.log("Service create response:", createResponse.data);
      showToast("✅ Service added successfully!");
    }

    serviceForm.reset();
    document.getElementById("serviceId").value = "";
    fetchServices();

  } catch (err) {
    console.error("Service creation error:", err.response?.data || err.message);
    showToast("❌ Failed to save service: " + (err.response?.data?.message || "Please try again"));
  }
});

async function editService(id) {
  try {
    const res = await axios.get("/api/services", {
        headers: { Authorization: token }
      });
    const service = res.data.find(s => s.id === id);

    document.getElementById("serviceId").value = service.id;
    document.getElementById("name").value = service.name;
    document.getElementById("description").value = service.description;
    document.getElementById("price").value = service.price;
    document.getElementById("duration").value = service.duration;

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    console.error(err);
    alert("Failed to load service details");
  }
}

async function deleteService(id) {
  if (!confirm("Are you sure you want to delete this service?")) return;

  try {
    await axios.delete(`/api/services/${id}`, {
      headers: { Authorization: token }
    });
    showToast("Service deleted successfully!");
    fetchServices();
  } catch (err) {
    console.error(err);
    alert("Failed to delete service");
  }
}

fetchServices(); // Load services on page load
