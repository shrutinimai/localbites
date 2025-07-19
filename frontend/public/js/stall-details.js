const stallContainer = document.getElementById("stallContainer");
const reviewsRatingsSection = document.getElementById("reviews-ratings-section");
const overallTasteRatingSpan = document.getElementById("overall-taste-rating");
const hygieneRatingSpan = document.getElementById("hygiene-rating");
const reviewsList = document.getElementById("reviews-list");
const reviewForm = document.getElementById("review-form");
const reviewRatingInput = document.getElementById("review-rating");
const reviewTextInput = document.getElementById("review-text");
const firstTimeCheckbox = document.getElementById("first-time");
const distanceInfoSection = document.getElementById("distance-info-section");

const reportStallBtn = document.getElementById("reportStallBtn");
const reportModal = document.getElementById("reportModal");
const closeButton = reportModal.querySelector(".close-button");
const reportForm = document.getElementById("reportForm");
const reportReasonInput = document.getElementById("reportReason");


const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get("id");
const token = localStorage.getItem("token");
const BASE_API_URL = "https://localbites-2.onrender.com";

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


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

        stallContainer.innerHTML = `
            <h2>${stall.name}</h2>
            <img src="${stall.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${stall.name}" class="stall-main-image"/>
            <p><strong>Owner:</strong> ${stall.ownerName}</p>
            <p><strong>Location:</strong> ${stall.city}, ${stall.area}</p>
            <p><strong>Food Category:</strong> ${stall.foodCategory}</p>
            <p><strong>Main Food Item:</strong> ${stall.foodItem}</p>
            ${stall.description ? `<p><strong>Description:</strong> ${stall.description}</p>` : ''}
            ${stall.foodInfo ? `<p><strong>Food Info:</strong> ${stall.foodInfo}</p>` : ''}
            <p><strong>Price Range:</strong> ${stall.priceRange || 'N/A'}</p>
            <p><strong>Opening Time:</strong> ${stall.openingTime || 'N/A'}</p>
            <p><strong>Closing Time:</strong> ${stall.closingTime || 'N/A'}</p>
            <p><strong>Rush Hours:</strong> ${stall.rushHours || 'N/A'}</p>
            <p><strong>Accepts GPay:</strong> ${stall.acceptsGpay ? "Yes" : "No"}</p>
            <p><strong>Report Count:</strong> ${stall.reportCount !== undefined ? stall.reportCount : 'N/A'}</p>`;

        hygieneRatingSpan.textContent = stall.hygieneRating ? `${stall.hygieneRating.toFixed(1)}` : 'N/A';
        overallTasteRatingSpan.textContent = stall.tasteRating ? `${stall.tasteRating.toFixed(1)}` : 'N/A';

        reviewsList.innerHTML = '';
        if (stall.reviews && stall.reviews.length > 0) {
            stall.reviews.forEach(review => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <p>
                        ${review.rating ? `<strong>Rating:</strong> ${review.rating}/5 ` : ''}
                        ${review.emoji || ''} - ${review.text || 'No text provided'}
                        <br>
                        <small>${review.firstTime ? ' (First visit)' : ' (Repeat visit)'}
                        ${review.userLocation ? ` from ${review.userLocation}` : ''}
                        ${review.createdAt ? ` on ${new Date(review.createdAt).toLocaleDateString()}` : ''}</small>
                    </p>
                `;
                reviewsList.appendChild(li);
            });
        } else {
            reviewsList.innerHTML = '<li>No reviews yet.</li>';
        }

        const [stallLng, stallLat] = stall.location?.coordinates || [];
        distanceInfoSection.innerHTML = '<p><strong>Your Distance:</strong> <span id="distance">Calculating...</span></p><p><a id="map-link" href="#" target="_blank"></a></p>';
        const distanceSpan = document.getElementById("distance");
        const mapLink = document.getElementById("map-link");

        if (stallLat && stallLng && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userLat = pos.coords.latitude;
                    const userLng = pos.coords.longitude;
                    const dist = haversineDistance(userLat, userLng, stallLat, stallLng);
                    distanceSpan.textContent = `${dist} km`;
                    mapLink.textContent = '📍 View on Map';
                    // Corrected Google Maps URL for directions
                    mapLink.href = `https://www.google.com/maps/dir/${userLat},${userLng}/${stallLat},${stallLng}`;
                },
                (error) => {
                    console.error("Error getting user location for distance:", error);
                    distanceSpan.textContent = "N/A (Couldn't get your location)";
                    mapLink.textContent = '📍 View Stall on Map';
                    // Corrected Google Maps URL for a single location
                    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${stallLat},${stallLng}`;
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            distanceSpan.textContent = "N/A (Stall location or Geolocation not available)";
            if(stallLat && stallLng){
                mapLink.textContent = '📍 View Stall on Map';
                // Corrected Google Maps URL for a single location
                mapLink.href = `https://www.google.com/maps/search/?api=1&query=${stallLat},${stallLng}`;
            } else {
                mapLink.textContent = '';
            }
        }


    } catch (err) {
        console.error("Error fetching stall details:", err);
        stallContainer.innerHTML = `<p>Error loading stall details: ${err.message}</p>`;
        reviewsRatingsSection.style.display = 'none';
        distanceInfoSection.style.display = 'none';
    }
}

reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!token) {
        alert("Please login to submit a review.");
        return;
    }

    const rating = parseInt(reviewRatingInput.value);
    const reviewText = reviewTextInput.value.trim();
    const firstTime = firstTimeCheckbox.checked;

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Please provide a valid rating between 1 and 5.");
        return;
    }
    if (!reviewText) {
        alert("Please write your review.");
        return;
    }

    try {
        let userLocationForReview = "Unknown Location";
        if (navigator.geolocation) {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000, maximumAge: 60000 });
            });

            userLocationForReview = `Lat: ${pos.coords.latitude.toFixed(2)}, Lng: ${pos.coords.longitude.toFixed(2)}`;
        }


        const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}/react`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                // emoji: "⭐",
                text: reviewText,
                rating,
                firstTime,
                userLocation: userLocationForReview,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to submit review");
        }
        alert("Review submitted successfully!");
        reviewRatingInput.value = '';
        reviewTextInput.value = '';
        firstTimeCheckbox.checked = false;
        getStallDetails();
    } catch (err) {
        console.error("Error submitting review:", err);
        alert(`Error: ${err.message}`);
    }
});


reportStallBtn.addEventListener("click", () => {
    // Only show modal if user is logged in
    if (!token) {
        alert("You need to be logged in to report a stall.");
        window.location.href = "/login.html";
        return;
    }
    reportModal.style.display = "flex"; // Use flex to center the modal
});

// Close modal when close button is clicked
closeButton.addEventListener("click", () => {
    reportModal.style.display = "none";
    reportForm.reset();
});

window.addEventListener("click", (event) => {
    if (event.target === reportModal) {
        reportModal.style.display = "none";
        reportForm.reset();
    }
});

reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!token) {
        alert("You need to be logged in to report a stall.");
        window.location.href = "/login.html";
        return;
    }

    const reason = reportReasonInput.value.trim();
    if (!reason) {
        alert("Please provide a reason for reporting.");
        return;
    }

    try {
        const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}/report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to submit report.");
        }

        const successData = await res.json();
        alert(`Report submitted successfully! Current report count: ${successData.currentReportCount}`);
        reportModal.style.display = "none"; // Hide modal
        reportForm.reset();
        getStallDetails();
    } catch (error) {
        console.error("Error submitting report:", error);
        alert(`Error submitting report: ${error.message}`);
    }
});
