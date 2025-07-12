const stallsList = document.getElementById("stallsList");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageSpan = document.getElementById("currentPageSpan");
const addStallBtn = document.getElementById("addStallBtn");
const logoutBtn = document.getElementById("logoutBtn");

const searchNameInput = document.getElementById("searchName");
const searchCityInput = document.getElementById("searchCity");
const filterCategorySelect = document.getElementById("filterCategory");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const stallsPerPageSelect = document.getElementById("stallsPerPage");

let currentPage = 1;

const BASE_API_URL = "https://localbites-2.onrender.com"; // Your deployed backend URL
const token = localStorage.getItem("token");

if (token) {
    addStallBtn.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
} else {
    addStallBtn.style.display = "none";
    logoutBtn.style.display = "none";
}

addStallBtn.addEventListener("click", () => {
    window.location.href = "/add-stall";
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "/login";
});

async function fetchStalls() {
    stallsList.innerHTML = "<p class='loading-message'>Loading stalls...</p>";
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;

    const name = searchNameInput.value;
    const city = searchCityInput.value;
    const category = filterCategorySelect.value;
    const limit = stallsPerPageSelect.value; 

    let query = `page=${currentPage}&limit=${limit}`;
    if (name) query += `&name=${encodeURIComponent(name)}`;
    if (city) query += `&city=${encodeURIComponent(city)}`;
    if (category) query += `&foodCategory=${encodeURIComponent(category)}`;

    try {
        const res = await fetch(`${BASE_API_URL}/api/stalls?${query}`); // Corrected API URL
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        renderStalls(data.stalls);
        updatePagination(data.pagination);
    } catch (error) {
        console.error("Error fetching stalls:", error);
        stallsList.innerHTML = "<p class='no-stalls-message'>Failed to load stalls. Please try again later.</p>";
    }
}

function renderStalls(stalls) {
    stallsList.innerHTML = "";
    if (stalls.length === 0) {
        stallsList.innerHTML = "<p class='no-stalls-message'>No stalls found matching your criteria.</p>";
        return;
    }

    stalls.forEach((stall) => {
        const stallCard = document.createElement("div");
        stallCard.classList.add("stall-card");

        const isPostedByOwner = stall.postedBy && stall.postedBy.role === "owner";
        const ownerTag = isPostedByOwner ? `<span class="owner-tag">Posted by Owner</span>` : '';

        stallCard.innerHTML = `
            <img src="${stall.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${stall.name}">
            <h2>${stall.name} ${ownerTag}</h2> <p><strong>Owner:</strong> ${stall.ownerName}</p>
            <p><strong>Location:</strong> ${stall.city}, ${stall.area}</p>
            <p><strong>Category:</strong> ${stall.foodCategory}</p>
            <p><strong>Food Item:</strong> ${stall.foodItem}</p>
            <p><strong>Accepts GPay:</strong> ${stall.acceptsGpay ? "Yes" : "No"}</p>
            <button class="details-btn" data-id="${stall._id}">View Details</button>
        `;
        stallsList.appendChild(stallCard);
    });

    document.querySelectorAll(".details-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const stallId = e.target.dataset.id;
            window.location.href = `/stall-details?id=${stallId}`;
        });
    });
}

function updatePagination(pagination) {
    const { total, page, limit, totalPages } = pagination;
    currentPageSpan.textContent = `Page ${page} of ${totalPages}`;
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === totalPages;
}

prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchStalls();
    }
});

nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchStalls();
});

applyFiltersBtn.addEventListener("click", () => {
    currentPage = 1; 
    fetchStalls();
});

stallsPerPageSelect.addEventListener("change", () => {
    currentPage = 1; 
    fetchStalls();
});

fetchStalls();
