document.getElementById("addStallForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const token = localStorage.getItem("token");

  const BASE_API_URL = "https://localbites-2.onrender.com"; 

  try {
    const res = await fetch(`${BASE_API_URL}/api/stalls/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const text = await res.text();
    console.log("Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("Could not parse JSON:", parseErr);
      alert(" Server sent unexpected response.");
      return;
    }

    if (res.ok) {
      alert(" Stall added successfully!");
      window.location.href = "/stalls.html";
    } else {
      alert(" Failed to add stall: " + data.error);
      console.error(" Server error data:", data);
    }
  } catch (err) {
    alert("Network/Server error: " + err.message);
    console.error(" Fetch crash:", err);
  }
});
