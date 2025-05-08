const baseUrl = window.location.origin;

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
      return alert("Please fill in all fields");
    }

    try {
      const res = await axios.post("/api/auth/register" + (role ? `?role=${role}` : ''), {
        name,
        email,
        phone,
        password,
      });

      alert("Signup successful! Please login.");
      window.location.href = "/api/auth/login"; // Redirect to login page
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.response?.data?.message || "Signup failed. Please try again.";
      alert(errorMsg);
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
      return alert("Please enter both email and password");
    }

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
        role
      });
      console.log("token", res.data.token);
      
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      window.location.href = "/api/dashboard/page";
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMsg);
    }
  });
}