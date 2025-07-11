const stallContainer = document.getElementById("stallDetails");
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get("id");

const token = localStorage.getItem("token");

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
}
function getUserRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

const myUserId = getUserIdFromToken(token);
const myUserRole = getUserRoleFromToken(token);

const getStallDetails = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/stalls/${stallId}`);
    if (!res.ok) throw new Error("Stall not found");
    const stall = await res.json();

    let userReported = false;
    if (token && stall.reports && stall.reports.length > 0) {
      userReported = stall.reports.some(
        (r) => r.reportedBy && r.reportedBy._id === myUserId
      );
    }

    const isPostedByOwner = stall.postedBy && stall.postedBy.role === "owner";
    const postedByText = isPostedByOwner
      ? `<span style="font-style: italic; color: green;">(Posted by Owner)</span>`
      : "";

    stallContainer.innerHTML = `
      <h2>${stall.name} ${postedByText}</h2>
      <img src="${
        stall.imageUrl
      }" alt="${stall.name}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px;"/>
      <p><strong>Location:</strong> ${stall.city}, ${stall.area}</p>
      <p><strong>Food Item:</strong> ${stall.foodItem}</p>
      <p><strong>Category:</strong> ${stall.foodCategory}</p>
      <p><strong>Food Info:</strong> ${stall.foodInfo}</p>
      <p><strong>Hygiene Rating:</strong> ${stall.hygieneRating}</p>
      <p><strong>Taste Rating:</strong> ${stall.tasteRating}</p>
      <p><strong>Price Range:</strong> ${stall.priceRange}</p>
      <p><strong>Timings:</strong> ${stall.openingTime} - ${stall.closingTime}</p>
      <p><strong>Rush Hours:</strong> ${stall.rushHours}</p>
      <p><strong>Accepts GPay:</strong> ${stall.acceptsGpay ? "Yes" : "No"}</p>

      <div>
        <h3>Reactions</h3>
        <button onclick="setSelectedEmoji('love')">❤️ Love (${
          stall.emojiReactions?.love || 0
        })</button>
        <button onclick="setSelectedEmoji('fire')">🔥 Spicy (${
          stall.emojiReactions?.fire || 0
        })</button>
        <button onclick="setSelectedEmoji('meh')">😐 Okay (${
          stall.emojiReactions?.meh || 0
        })</button>
        <button onclick="setSelectedEmoji('thumbsUp')">👍 Tasty (${
          stall.emojiReactions?.thumbsUp || 0
        })</button>
        <br/><br/>
        <form id="reactionForm">
          <textarea name="text" placeholder="Write your thoughts..." required></textarea><br/>
          <label><input type="radio" name="firstTime" value="true" required /> First Time</label>
          <label><input type="radio" name="firstTime" value="false" required /> Repeat Visit</label><br/>
          <input type="text" name="userLocation" placeholder="Your City" required /><br/>
          <button type="submit">Submit Feedback</button>
        </form>
      </div>

      <h3>Visitor Stats</h3>
      <p>First-time Visitors: ${stall.firstTimeCount}</p>
      <p>Repeat Visitors: ${stall.repeatCount}</p>

      <hr/>
      <h3>Visitor Reviews</h3>
      <div id="reviewsContainer">${renderReviews(stall.reviews)}</div>

      <hr/>
      <h3>Report this Stall</h3>
      <div id="reportSection">
        ${
          token
            ? userReported
              ? `<p>You have already reported this stall.</p>`
              : `<form id="reportForm">
                <textarea name="reason" placeholder="Reason for reporting" required minlength="5"></textarea><br/>
                <button type="submit">Submit Report</button>
              </form>`
            : `<p>Please login to report this stall.</p>`
        }
        <p>Current Reports: <span id="reportCountDisplay">${
          stall.reportCount || 0
        }</span></p>
        ${
          (myUserRole === "admin" && stall.reportCount > 0)
            ? `<button id="viewAllReportsBtn">View All Reports (${
                stall.reportCount || 0
              })</button>`
            : ""
        }
      </div>

      <div id="reportsList" style="display:none;">
        <h4>Detailed Reports</h4>
        <ul>
          ${
            stall.reports && stall.reports.length > 0
              ? stall.reports
                  .map(
                    (r) =>
                      `<li><strong>${r.reportedBy?.name || "Anonymous"}:</strong> ${
                        r.reason
                      } <br> <small>(${new Date(r.reportedAt).toLocaleDateString()} ${new Date(r.reportedAt).toLocaleTimeString()})</small></li>`
                  )
                  .join("")
              : "<li>No detailed reports available.</li>"
          }
        </ul>
      </div>
    `;

    if (myUserRole === "admin" && stall.reportCount > 0) {
      document.getElementById("viewAllReportsBtn")?.addEventListener("click", () => {
        const repList = document.getElementById("reportsList");
        repList.style.display = repList.style.display === "none" ? "block" : "none";
      });
    }

    if (token && !userReported) {
      document.getElementById("reportForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reason = formData.get("reason").trim();

        const res = await fetch(
          `http://localhost:5000/api/stalls/${stallId}/report`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          alert("Report submitted successfully.");
          document.getElementById("reportCountDisplay").textContent =
            data.currentReportCount;
          document.getElementById("reportSection").innerHTML =
            `<p>You have already reported this stall.</p><p>Current Reports: <span id="reportCountDisplay">${data.currentReportCount}</span></p>`;

          if (data.status === "reported_for_review") {
            alert("This stall has reached the report threshold and is now under review by admins.");
          }
        } else {
          alert(data.error || data.message || "Failed to submit report.");
        }
      });
    }

    document.getElementById("reactionForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!selectedEmoji) {
        alert("Please select an emoji reaction.");
        return;
      }
      const formData = new FormData(e.target);
      const text = formData.get("text");
      const firstTime = formData.get("firstTime") === "true";
      const userLocation = formData.get("userLocation");

      const res = await fetch(`http://localhost:5000/api/stalls/${stallId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: selectedEmoji, text, firstTime, userLocation }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Feedback submitted");
        location.reload();
      } else {
        alert(data.error || "Failed to submit feedback");
      }
    });
  } catch (err) {
    stallContainer.innerHTML = `<p>Error loading stall details: ${err.message}</p>`;
  }
};

let selectedEmoji = null;
function setSelectedEmoji(name) {
  selectedEmoji = name;
  alert(`Selected emoji: ${name}`);
}

function renderReviews(reviews) {
  if (!reviews || reviews.length === 0) return "<p>No reviews yet.</p>";
  return reviews
    .map(
      (r) => `
    <div style="border:1px solid #ccc; padding:8px; margin-bottom:6px; border-radius:8px;">
      <p><strong>${emojiToText(r.emoji)}</strong> (${
        r.firstTime ? "First time" : "Repeat"
      }) from ${r.userLocation}</p>
      <p>${r.text}</p>
    </div>
  `
    )
    .join("");
}

function emojiToText(emoji) {
  switch (emoji) {
    case "love":
      return "❤️ Love";
    case "fire":
      return "🔥 Spicy";
    case "meh":
      return "😐 Okay";
    case "thumbsUp":
      return "👍 Tasty";
    default:
      return "❓ Unknown";
  }
}

getStallDetails();