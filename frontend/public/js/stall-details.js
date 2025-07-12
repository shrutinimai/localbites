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
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}`, { headers });
        if (!res.ok) {
            throw new Error("Failed to fetch stall details.");
        }
        const stall = await res.json();

        let currentUserId = null;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                currentUserId = payload.userId;
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }

        let alreadyReported = false;

        stallContainer.innerHTML = `
            <h2>${stall.name}</h2>
            <img src="${stall.imageUrl}" alt="${stall.name}" class="stall-main-image"/>
            <div class="info-group"><p><strong>Location:</strong> <span>${stall.city}, ${stall.area}</span></p></div>
            <div class="info-group"><p><strong>Food Item:</strong> <span>${stall.foodItem}</span></p></div>
            <div class="info-group"><p><strong>Category:</strong> <span>${stall.foodCategory}</span></p></div>
            <div class="info-group"><p><strong>Food Info:</strong> <span>${stall.foodInfo}</span></p></div>
            <div class="info-group"><p><strong>Description:</strong> <span>${stall.description || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Hygiene Rating:</strong> <span>${stall.hygieneRating || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Taste Rating:</strong> <span>${stall.tasteRating || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Price Range:</strong> <span>${stall.priceRange || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Timings:</strong> <span>${stall.openingTime || 'N/A'} - ${stall.closingTime || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Rush Hours:</strong> <span>${stall.rushHours || 'N/A'}</span></p></div>
            <div class="info-group"><p><strong>Accepts GPay:</strong> <span>${stall.acceptsGpay ? "Yes" : "No"}</span></p></div>

            <div class="reactions-section">
                <h3>Reactions</h3>
                <div class="reactions-buttons">
                    <button type="button" class="reaction-btn" data-reaction-type="love">
                        <i class="fas fa-heart"></i> <span class="reaction-count">${stall.emojiReactions?.love || 0}</span>
                    </button>
                    <button type="button" class="reaction-btn" data-reaction-type="fire">
                        <i class="fas fa-fire"></i> <span class="reaction-count">${stall.emojiReactions?.fire || 0}</span>
                    </button>
                    <button type="button" class="reaction-btn" data-reaction-type="meh">
                        <i class="fas fa-meh"></i> <span class="reaction-count">${stall.emojiReactions?.meh || 0}</span>
                    </button>
                    <button type="button" class="reaction-btn" data-reaction-type="thumbsUp">
                        <i class="fas fa-thumbs-up"></i> <span class="reaction-count">${stall.emojiReactions?.thumbsUp || 0}</span>
                    </button>
                </div>
                <div id="reaction-animation-container"></div>
            </div>

            <form id="reactionForm">
                <h3>Share Your Feedback</h3>
                <input type="hidden" name="emoji" id="selectedEmoji" value="love" />
                <textarea name="text" placeholder="Write your thoughts..." required></textarea><br/>
                <div class="radio-group">
                    <label><input type="radio" name="firstTime" value="true" required /> First Time</label>
                    <label><input type="radio" name="firstTime" value="false" required /> Repeat Visit</label>
                </div><br/>
                <input type="text" name="userLocation" placeholder="Your City" required /><br/>
                <button type="submit" class="btn">Submit Feedback</button>
            </form>

            <div class="visitor-stats">
                <h3>Visitor Stats</h3>
                <p>First-time Visitors: ${stall.firstTimeCount || 0}</p>
                <p>Repeat Visitors: ${stall.repeatCount || 0}</p>
            </div>

            <div id="reportSection">
                <h3>Report this stall</h3>
                <p><strong>Reports:</strong> <span id="currentReportCount">${stall.reportCount || 0}</span></p>
                ${token ? `
                    <div class="report-actions">
                        <button id="reportBtn" class="btn btn-danger">Report Stall</button>
                    </div>
                ` : '<p>Please login to report this stall.</p>'}
            </div>
        `;

        const reactionForm = document.getElementById("reactionForm");
        const selectedEmojiInput = document.getElementById("selectedEmoji");
        const reactionButtons = document.querySelectorAll(".reaction-btn");
        const reactionAnimationContainer = document.getElementById("reaction-animation-container");

        reactionButtons.forEach(button => {
            button.addEventListener("click", () => {
                const emojiType = button.dataset.reactionType;
                selectedEmojiInput.value = emojiType;

                reactionAnimationContainer.innerHTML = `<span style="animation: fadeOut 1s forwards;">${getEmojiIcon(emojiType)}</span>`;

                const countSpan = button.querySelector(".reaction-count");
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
            });
        });

        if (reactionForm) {
            reactionForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!token) {
                    alert("You need to be logged in to submit feedback.");
                    return;
                }

                const formData = new FormData(reactionForm);
                const data = Object.fromEntries(formData.entries());
                data.firstTime = data.firstTime === "true";

                try {
                    const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}/react`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    });

                    if (!res.ok) throw new Error("Failed to submit reaction.");
                    alert("Feedback submitted successfully!");
                    getStallDetails();
                } catch (err) {
                    alert(err.message);
                }
            });
        }

        function getEmojiIcon(type) {
            switch (type) {
                case 'love': return '❤️';
                case 'fire': return '🔥';
                case 'meh': return '😐';
                case 'thumbsUp': return '👍';
                default: return '';
            }
        }

        const reportBtn = document.getElementById("reportBtn");

        if (reportBtn && token) {
            reportBtn.addEventListener("click", async () => {
                const reason = prompt("Please enter reason for reporting this stall:");
                if (!reason) return alert("Report reason is required");

                try {
                    const res = await fetch(`${BASE_API_URL}/api/stalls/${stallId}/report`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({ reason }),
                    });
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || "Failed to submit report");
                    }
                    const data = await res.json();

                    alert("Report submitted. Thank you!");
                    if (data.message === "Report submitted") {
                        reportBtn.disabled = true;
                        reportBtn.textContent = "You already reported this stall";
                    }
                    document.getElementById('currentReportCount').textContent = data.currentReportCount;
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
