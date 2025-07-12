const form = document.getElementById("addStallForm");

const BASE_API_URL = "https://localbites-2.onrender.com";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Add Stall form submitted.");
    const currentFormElement = document.getElementById("addStallForm");
    if (!currentFormElement) {
        console.error("Error: Form element with ID 'addStallForm' not found!");
        alert("Internal Error: Form not found.");
        return; 
    }
    console.log("Form element found:", currentFormElement);

    const token = localStorage.getItem("token");
    console.log("Retrieved Token:", token ? "Token present (first few chars: " + token.substring(0, 10) + "...)" : "No token found in localStorage.");

    if (!token) {
        alert("You must be logged in to add a stall.");
        window.location.href = "/login.html"; // Redirect to login if no token
        return; // Stop execution if no token
    }

    const formData = new FormData(form);

    try {
        console.log("Attempting fetch request to:", `${BASE_API_URL}/api/stalls/add`);
        console.log("Fetch headers:", { Authorization: `Bearer ${token}` });
        // Note: formData cannot be directly console.logged effectively, but its presence is checked.

        const res = await fetch(`${BASE_API_URL}/api/stalls/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        // --- Frontend Response Handling ---
        console.log("Backend response received. Status:", res.status, res.statusText);

        // Check if response is OK (2xx status)
        if (res.ok) {
            const result = await res.json(); // Attempt to parse JSON if status is OK
            console.log("Successful response JSON:", result);
            alert("Stall added successfully!");
            window.location.href = "/stalls"; // Redirect on success
        } else {
            // Handle non-OK responses (e.g., 4xx or 5xx)
            let errorMessage = "Something went wrong.";
            let backendDetails = {};
            try {
                // Try to parse JSON even on error, as backend *should* send JSON
                backendDetails = await res.json();
                errorMessage = backendDetails.error || errorMessage;
                console.error("Error response JSON from backend:", backendDetails);
            } catch (jsonError) {
                // If backend didn't send JSON (e.g., HTML error page for 500)
                console.error("Backend did NOT return valid JSON on error. Cannot parse response.", jsonError);
                console.error("Full text response from backend:", await res.text()); // Get raw text
                errorMessage = `Server Error (${res.status}): Backend response was not JSON. Check backend logs for full error.`;
            }
            alert(`Failed to add stall: ${errorMessage}`);
        }
    } catch (fetchError) {
        console.error("Frontend Fetch Error (Network/Promise Rejection):", fetchError);
        alert("Failed to connect to the server or a network error occurred. Please check your internet connection or try again later.");
    }
});
