const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const BASE_API_URL = "https://localbites-2.onrender.com"; 

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/signup`, { //  BASE_API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "/login";
      } else {
        alert(result.error || "Signup failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/login`, { //  BASE_API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("token", result.token);
        alert("Login successful!");
        window.location.href = "/stalls";
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out successfully.");
  window.location.href = "/login";
}
