const staffId = new URLSearchParams(window.location.search).get("id");
const token = localStorage.getItem("token");

// Load staff name (optional if already known)
fetch(`http://localhost:3000/api/staff/${staffId}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("staffName").innerText = data.name || "Unknown";
  });

// Submit review
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const comment = document.getElementById("comment").value;
  const rating = document.getElementById("rating").value;

  try {
    const res = await fetch("http://localhost:3000/api/reviews/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ staffId, comment, rating }),
    });
    const data = await res.json();
    document.getElementById("reviewMessage").innerText = data.message || data.error;

    // Reload reviews after submitting
    loadReviews();
  } catch (err) {
    document.getElementById("reviewMessage").innerText = "Failed to submit review.";
  }
});

// Load reviews
async function loadReviews() {
  try {
    const res = await fetch(`http://localhost:3000/api/reviews/staff/${staffId}`);
    const data = await res.json();

    const reviewsHtml = data.map(r => `
      <div class="review">
        <strong>${r.userName}</strong> - ${r.rating}⭐️
        <p>${r.comment}</p>
        ${r.reply ? `<em>Staff Reply: ${r.reply}</em>` : ""}
      </div>
    `).join("");
    document.getElementById("reviewsList").innerHTML = reviewsHtml || "No reviews yet.";
  } catch (err) {
    document.getElementById("reviewsList").innerText = "Error loading reviews.";
  }
}

// Initial load
loadReviews();