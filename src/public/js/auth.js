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

function showSuccess(title, text = '', redirect = null) {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonColor: '#9aab89',
    confirmButtonText: 'OK'
  }).then(() => {
    if (redirect) {
      window.location.href = redirect;
    }
  });
}

// Signup handler
const signupForm = document.getElementById("signupForm");
function getRoleFromSignupQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('role');
}
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = getRoleFromSignupQuery();

    // Basic client-side validation
    if (!name || !email || !phone || !password) {
      return showError("Validation Error", "Please fill in all fields");
    }

    try {
      const res = await axios.post("/api/auth/register" + (role ? `?role=${role}` : ''), {
        name,
        email,
        phone,
        password,
      });

      showSuccess("Signup Successful", "Your account has been created. Please login with your credentials.", "/api/auth/login");
      // No need for manual redirect as showSuccess handles it
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.response?.data?.message || "Signup failed. Please try again.";
      showError("Registration Error", errorMsg);
    }
  });
}

// Login handler
const loginForm = document.getElementById("loginForm");
function getRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('role') || 'customer';
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Login form submitted");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = getRoleFromQuery();

    if (!email || !password) {
      return showError("Validation Error", "Please enter both email and password");
    }

    try {
      // Login: sets HttpOnly cookie
      await axios.post("/api/auth/login", { email, password });

      // Now fetch user profile to get the role
      const profileRes = await axios.get("/api/dashboard/auth/profile");
      const role = profileRes.data.role;

      if (role === "admin") {
        window.location.href = "/admin-dashboard.html";
      } else if (role === "customer") {
        window.location.href = "/customer-dashboard.html";
      } else if (role === "staff") {
        window.location.href = "/staff-dashboard.html";
      } else {
        window.location.href = "/dashboard.html";
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      showError("Login Error", errorMsg);
    }
  });
}