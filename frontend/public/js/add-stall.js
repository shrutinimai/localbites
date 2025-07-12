const form = document.getElementById("addStallForm");

const BASE_API_URL = "https://localbites-2.onrender.com";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_API_URL}/api/stalls/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const result = await res.json();
  if (res.ok) {
    alert("Stall added successfully!");
    window.location.href = "/stalls";
  } else {
    alert("Failed to add stall: " + (result.error || "Something went wrong"));
  }
});
