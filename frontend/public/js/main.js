const stallList = document.getElementById("stallList");

const BASE_API_URL = "https://localbites-2.onrender.com"; 

const fetchStalls = async () => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/stalls`);
    const stalls = await res.json();

    stallList.innerHTML = stalls.map(stall => {
      const roleTag = stall.postedRole === "owner"
        ? '<span class="posted-by owner">👑 Posted by: Owner</span>'
        : '<span class="posted-by">Posted by: Foodie</span>';

      return `
        <div class="stall-card">
          <img src="${stall.imageUrl}" alt="${stall.name}" />
          <div class="info">
            <h3>${stall.name}</h3>
            ${roleTag}
            <p><strong>City:</strong> ${stall.city}, ${stall.area}</p>
            <p><strong>Item:</strong> ${stall.foodItem}</p>
            <p><strong>Category:</strong> ${stall.foodCategory}</p>
            <p><strong>GPay:</strong> ${stall.acceptsGpay ? 'Yes' : 'No'}</p>
            <a href="stall-details.html?id=${stall._id}">View Details ➡️</a>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error fetching stalls:", err); 
    stallList.innerHTML = '<p>Error loading stalls. Please try again later.</p>';
  }
};

fetchStalls();
