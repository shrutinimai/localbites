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
        window.location.href = "/login.html";
        return;
    }
    // --- End Frontend Debugging Logs ---

    const formData = new FormData(form);

    try {
        console.log("Attempting fetch request to:", `${BASE_API_URL}/api/stalls/add`);
        console.log("Fetch headers:", { Authorization: `Bearer ${token}` });

        const res = await fetch(`${BASE_API_URL}/api/stalls/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        console.log("Backend response received. Status:", res.status, res.statusText); 

        const responseText = await res.text(); 
        console.log("Raw backend response text:", responseText);

        if (res.ok) { 
            try {
                const result = JSON.parse(responseText);
                console.log("Successful response JSON:", result);
                alert("Stall added successfully!");
                window.location.href = "/stalls";
            } catch (parseError) {
                console.error("Failed to parse successful response as JSON:", parseError);
                alert("Stall added, but response was unexpected. Check console for details.");
            }
        } else {
            let errorMessage = "Something went wrong.";
            try {
                const backendDetails = JSON.parse(responseText);
                errorMessage = backendDetails.error || errorMessage;
                console.error("Parsed error response JSON from backend:", backendDetails);
            } catch (jsonParseError) {
                console.error("Backend did NOT return valid JSON on error. Cannot parse response.", jsonParseError);
                errorMessage = `Server Error (${res.status}): Backend response was not JSON. Check backend logs for full error.`;
            }
            alert(`Failed to add stall: ${errorMessage}`);
        }
    } catch (fetchError) {
        console.error("Frontend Fetch Error (Network/Promise Rejection):", fetchError);
        alert("Failed to connect to the server or a network error occurred. Please check your internet connection or try again later.");
    }
});
