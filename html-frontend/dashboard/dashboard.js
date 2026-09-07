// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}

// Dashboard mock data

document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in (Mock check)
    // Normally you would check localStorage or a cookie here
    
    // For demo purposes, let's set a fake user name
    const mockUserName = "Anjali"; 

    // Update names on the page
    const headerName = document.getElementById("userNameHeader");
    const bannerName = document.getElementById("userNameBanner");

    if (headerName) headerName.textContent = mockUserName;
    if (bannerName) bannerName.textContent = mockUserName;
});
