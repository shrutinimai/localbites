document.addEventListener("DOMContentLoaded", async () => {
  const stallList = document.getElementById("stall-list");

  const BASE_API_URL = "https://localbites-2.onrender.com";

  function getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }

  const token = localStorage.getItem("token");
  const currentUserId = token ? getUserIdFromToken(token) : null;

  try {
    const res = await fetch(`${BASE_API_URL}/api/stalls`);
    if (!res.ok) throw new Error("Failed to fetch stalls");
    const stalls = await res.json();

    if (!stalls.length) {
      stallList.innerHTML = "<p>No stalls found. Be the first to add one!</p>";
      return;
    }

    stalls.forEach((stall) => {
      const card = document.createElement("div");
      card.className = "stall-card";

      const isMyStall = stall.postedBy && currentUserId && (stall.postedBy.toString() === currentUserId);

      card.classList.toggle("my-stall", isMyStall);

      card.innerHTML = `
        <img src="${stall.imageUrl}" alt="${stall.name}" width="200" />
        <h3>${stall.name} ${isMyStall ? '<span style="color:green;">(Your Stall)</span>' : ''}</h3>
        <p>${stall.description}</p>
        <p><strong>City:</strong> ${stall.city}</p>
        <p><strong>Category:</strong> ${stall.foodCategory}</p>
        <a href="/stall-details?id=${stall._id}">View Details</a>
      `;
      stallList.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching stalls:", err);
    stallList.innerHTML = "<p>Failed to load stalls. Please try again later.</p>";
  }
});
