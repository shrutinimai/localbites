const BASE_API_URL = "https://localbites-2.onrender.com"; // Your deployed backend URL
const token = localStorage.getItem("token");

async function fetchUser() {
  if (!token) {
    document.getElementById("user-section").innerHTML = `
      <div class="auth-links">
        <a href="/login"><button>Login</button></a>
        <a href="/signup"><button>Sign Up</button></a>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`${BASE_API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = await res.json();

    if (res.ok) {
      const isOwner = user.role === "owner";
      document.getElementById("user-section").innerHTML = `
        <h2>Welcome, ${user.name} (${user.role})!</h2>
        <p>You can explore or post about hidden food gems.</p>
        ${isOwner ? '<a href="/add-stall"><button>Add Stall</button></a>' : ''}
        <button onclick="logout()">Logout</button>
      `;
    } else {
      throw new Error("Invalid token");
    }
  } catch (err) {
    localStorage.removeItem("token");
    document.getElementById("user-section").innerHTML = `
      <p>Session expired. Please <a href="/login">login</a> again.</p>
    `;
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  window.location.reload();
}

// Initial fetch when home.js loads
fetchUser();
