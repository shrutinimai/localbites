const stallList = document.getElementById("stallList");
const pageNumbersContainer = document.getElementById("pageNumbers");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const limitSelect = document.getElementById("limitSelect");

let currentPage = 1;
let currentLimit = parseInt(limitSelect.value);
let totalPages = 1;

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

const myUserId = getUserIdFromToken();

async function fetchStalls(page = 1, limit = 5) {
  stallList.innerHTML = "Loading stalls...";
  try {
    const res = await fetch(
      `http://localhost:5000/api/stalls?page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Failed to load stalls");
    const data = await res.json();

    totalPages = data.pagination.totalPages;
    currentPage = data.pagination.page;
    currentLimit = data.pagination.limit;

    if (data.stalls.length === 0) {
      stallList.innerHTML = "<p>No stalls found.</p>";
      pageNumbersContainer.innerHTML = "";
      return;
    }

    renderStalls(data.stalls);
    renderPagination();
  } catch (err) {
    stallList.innerHTML = `<p>Error loading stalls: ${err.message}</p>`;
  }
}

function renderStalls(stalls) {
  stallList.innerHTML = "";
  stalls.forEach((stall) => {
    const isMine = stall.postedBy && stall.postedBy._id === myUserId; // Use _id for comparison
    const isPostedByOwner = stall.postedBy && stall.postedBy.role === "owner";

    const div = document.createElement("div");
    div.className = "stall";
    if (isMine) {
      div.classList.add("mine"); // add a class to style your own stalls differently
    }
    div.innerHTML = `
      <h3>${stall.name} ${isMine ? '<span style="color:#00b894;">(You)</span>' : ''}</h3>
      ${isPostedByOwner ? '<p style="font-weight: bold; color: green; margin-top: -5px;">Posted by Owner</p>' : ''}
      <p><strong>Category:</strong> ${stall.foodCategory}</p>
      <p><strong>City:</strong> ${stall.city}</p>
      <p><strong>Food Item:</strong> ${stall.foodItem || "N/A"}</p>
    `;
    div.addEventListener("click", () => {
      window.location.href = `stall-details.html?id=${stall._id}`;
    });
    stallList.appendChild(div);
  });
}

function renderPagination() {
  pageNumbersContainer.innerHTML = "";

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (i !== currentPage) fetchStalls(i, currentLimit);
    });
    pageNumbersContainer.appendChild(btn);
  }

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    fetchStalls(currentPage - 1, currentLimit);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    fetchStalls(currentPage + 1, currentLimit);
  }
});

limitSelect.addEventListener("change", () => {
  currentLimit = parseInt(limitSelect.value);
  fetchStalls(1, currentLimit);
});

const style = document.createElement("style");
style.textContent = `
  .stall.mine {
    border: 2px solid #00b894;
    padding: 10px;
    border-radius: 8px;
    background-color: #eaffea;
  }
`;
document.head.appendChild(style);

fetchStalls(currentPage, currentLimit);