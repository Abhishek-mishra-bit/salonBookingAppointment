  // Logout function
  function logout() {
    window.location.href = "/api/auth/login";
  }

  // Toast notification function
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    document.getElementById('toast').appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Loader functions
  function showLoader() {
    document.getElementById('loader').style.display = 'flex';
  }

  function hideLoader() {
    document.getElementById('loader').style.display = 'none';
  }

  // Service form handling
  document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display services
    fetchServices();
    
    // Form submission
    document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
  });

  async function fetchServices() {
    try {
      showLoader();
      
      const res = await axios.get("/api/services");
      
      const tableBody = document.querySelector('#servicesTable tbody');
      tableBody.innerHTML = '';
      
      if (res.data.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4">
              <i class="fas fa-concierge-bell fa-2x mb-2 text-muted"></i>
              <p class="mb-0">No services found</p>
            </td>
          </tr>
        `;
        return;
      }
      
      res.data.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <strong>${service.name}</strong>
            ${service.description ? `<small class="text-muted d-block">${service.description}</small>` : ''}
          </td>
          <td>₹${service.price}</td>
          <td>${service.duration} mins</td>
          <td class="text-nowrap">
            <button class="btn btn-sm btn-outline-primary action-btn" title="Edit" onclick="editService('${service.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger action-btn" title="Delete" onclick="deleteService('${service.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      
      hideLoader();
    } catch (err) {
      console.error('Error fetching services:', err);
      showToast('Failed to load services. Please try again.', 'danger');
      hideLoader();
    }
  }

  async function handleServiceSubmit(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const duration = document.getElementById('duration').value;
    
    if (!name || !price || !duration) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    
    try {
      showLoader();
      
      const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
      const method = serviceId ? 'put' : 'post';
      
      await axios[method](url, {
        name,
        description,
        price,
        duration
      });
      
      showToast(`Service ${serviceId ? 'updated' : 'added'} successfully!`);
      document.getElementById('serviceForm').reset();
      document.getElementById('serviceId').value = '';
      fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
      showToast(err.response?.data?.message || 'Failed to save service', 'danger');
      hideLoader();
    }
  }

  async function editService(id) {
    try {
      showLoader();
      
      const res = await axios.get(`/api/services/${id}`);
      
      document.getElementById('serviceId').value = id;
      document.getElementById('name').value = res.data.name;
      document.getElementById('description').value = res.data.description || '';
      document.getElementById('price').value = res.data.price;
      document.getElementById('duration').value = res.data.duration;
      
      // Scroll to form
      document.getElementById('serviceForm').scrollIntoView({ behavior: 'smooth' });
      hideLoader();
    } catch (err) {
      console.error('Error editing service:', err);
      showToast('Failed to load service details', 'danger');
      hideLoader();
    }
  }

  async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      showLoader();
      
      await axios.delete(`/api/services/${id}`);
      
      showToast('Service deleted successfully!');
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      showToast('Failed to delete service', 'danger');
      hideLoader();
    }
  }