document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch staff members
        await fetchStaff();
        
        // Initialize rating stars
        initializeRatingStars();
        
        // Handle form submission
        document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
        
    } catch (error) {
        console.error('Error initializing review page:', error);
        showNotification('Error loading review page. Please try again.', 'danger');
    }
});

// Fetch staff members
async function fetchStaff() {
    try {
        const response = await axios.get('/api/staff', {
        });
        const staff = response.data;
        
        const staffSelect = document.getElementById('staffId');
        staffSelect.innerHTML = '<option value="">Select Staff Member</option>';
        
        staff.forEach(staffMember => {
            const option = document.createElement('option');
            option.value = staffMember.id;
            option.textContent = `${staffMember.name} (${staffMember.specialization})`;
            staffSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        showNotification('Error loading staff members. Please try again.', 'danger');
    }
}

// Initialize rating stars
function initializeRatingStars() {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.value);
            updateRating(rating);
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.value);
            highlightStars(rating);
        });

        star.addEventListener('mouseout', () => {
            highlightStars(currentRating);
        });
    });
}

// Update rating
function updateRating(rating) {
    document.getElementById('rating').value = rating;
    highlightStars(rating);
}

// Highlight stars
function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value);
        star.classList.toggle('active', starValue <= rating);
    });
}

// Handle review submission
async function handleReviewSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem('token');

    try {
        showLoader();
        
        const response = await axios.post('/api/reviews/add', {
            bookingId: formData.get('bookingId'),
            staffId: formData.get('staffId'),
            rating: formData.get('rating'),
            comment: formData.get('comment')
        }, {
            headers: { Authorization: token }
        });

        if (response.status === 201) {
            showNotification('Review submitted successfully!', 'success');
            form.reset();
            // Reset rating stars
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => star.classList.remove('active'));
            document.getElementById('rating').value = '';
        } else {
            showNotification('Error submitting review. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Error submitting review. Please try again.', 'danger');
    } finally {
        hideLoader();
    }
}

// Show/hide loader
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) loader.remove();
}

// Show notification
function showNotification(message, type = 'info') {
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

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = "/api/auth/login";
}