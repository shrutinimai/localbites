const stallContainer = document.getElementById("stallContainer");
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get("id");
const token = localStorage.getItem("token");
const BASE_API_URL = "https://localbites-2.onrender.com";

if (!stallId) {
    stallContainer.innerHTML = "<p>Stall ID is missing.</p>";
} else {
    getStallDetails();
}

async function getStallDetails() {
    try {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch stall details.");
        const stall = await res.json();

        let averageRating = 0;
        if (stall.reviews?.length > 0) {
            const total = stall.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            averageRating = (total / stall.reviews.length).toFixed(1);
        }

        let distanceHTML = '';
        let mapLinkHTML = '';
        const [lng, lat] = stall.location?.coordinates || [];
        if (lat && lng && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;
                const dist = haversineDistance(userLat, userLng, lat, lng);
                document.getElementById("distance").textContent = `${dist} km`;
            });
            distanceHTML = `<p><strong>Your Distance:</strong> <span id="distance">Calculating...</span></p>`;
            mapLinkHTML = `<a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">📍 View on Map</a>`;
        }

        stallContainer.innerHTML = `
            <h2>${stall.name}</h2>
            <img src="${stall.imageUrl}" alt="${stall.name}" class="stall-main-image"/>
            ${distanceHTML}
            ${mapLinkHTML}
            ...
            <div class="reviews-section">
                <h3>User Reviews</h3>
                <p><strong>Average Rating:</strong> <span id="average-rating">${averageRating}</span> / 5</p>
                ${stall.reviews && stall.reviews.length > 0 ? `
                    <ul>
                        ${stall.reviews.map(r => `
                            <li>
                                ⭐ ${r.rating || 'N/A'} | ${r.firstTime ? "🆕 First Timer" : "🔁 Repeat"}: 
                                ${r.text} <em>(${r.userLocation || "Unknown"})</em>
                            </li>
                        `).join('')}
                    </ul>
                ` : '<p>No reviews yet.</p>'}
            </div>
        `;


        const reviewForm = document.getElementById("review-form");
        if (reviewForm) {
            reviewForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!token) return alert("Please login to submit review.");

                const rating = parseInt(document.getElementById("rating").value);
                const reviewText = document.getElementById("review").value;

                try {
                    const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}/react`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            emoji: "",  // optional
                            text: reviewText,
                            rating,
                            userLocation: "N/A", // optional: add input if needed
                            firstTime: true       // optional: set default
                        }),
                    });

                    if (!res.ok) throw new Error("Failed to submit review");
                    alert("Review submitted!");
                    getStallDetails(); // reload to reflect
                } catch (err) {
                    alert(err.message);
                }
            });
        }

    } catch (err) {
        console.error("Error fetching stall details:", err);
        stallContainer.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
