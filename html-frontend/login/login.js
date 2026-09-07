// Custom JavaScript for Login Page

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Basic validation check
        if(email && password) {
            console.log("Mock Login Attempt:", { email, password });
            
            // Simulate a successful login and redirect to the dashboard (or index for now)
            alert("Login successful! Redirecting...");
            window.location.href = "../index.html"; 
        } else {
            alert("Please fill in all fields.");
        }
    });
});
