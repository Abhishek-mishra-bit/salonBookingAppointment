const baseUrl = window.location.origin;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "localhost:3000/api/auth/login";
}

async function loadProfile() {
  try {
    const res = await axios.get("/api/dashboard/auth/profile", {
      headers: { Authorization: token }
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
    localStorage.removeItem("token");
    window.location.href = "/api/auth/login";
  }
}

loadProfile();

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = `${baseUrl}/api/auth/login`;
});

async function logout() {
  localStorage.removeItem("token");
  window.location.href = `${baseUrl}/api/auth/login`;
}