// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}

// Profile Page — Mock Data & Edit Logic

// Mock user data (backend dev replaces this with real API call)
const mockUser = {
    name:           "Name",
    email:          "name@email.com",
    age:            21,
    preferredField: "Information Technology",
    careerGoal:     "Software Developer",
    joinedDate:     "10 May 2024"
};

// Populate page with mock data
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("headerName").textContent   = mockUser.name;
    document.getElementById("profileName").textContent  = mockUser.name;
    document.getElementById("profileEmail").textContent = mockUser.email;
    document.getElementById("profileJoined").textContent = "Joined on " + mockUser.joinedDate;

    document.getElementById("dispName").textContent  = mockUser.name;
    document.getElementById("dispEmail").textContent = mockUser.email;
    document.getElementById("dispAge").textContent   = mockUser.age;
    document.getElementById("dispField").textContent = mockUser.preferredField;
    document.getElementById("dispGoal").textContent  = mockUser.careerGoal;

    document.getElementById("editName").value  = mockUser.name;
    document.getElementById("editEmail").value = mockUser.email;
    document.getElementById("editAge").value   = mockUser.age;
    document.getElementById("editField").value = mockUser.preferredField;
    document.getElementById("editGoal").value  = mockUser.careerGoal;
});

// Toggle Edit Mode
function toggleEdit() {
    const fields = ["Name","Email","Age","Field","Goal"];
    fields.forEach(f => {
        document.getElementById("disp" + f).classList.add("d-none");
        document.getElementById("edit" + f).classList.remove("d-none");
    });
    document.getElementById("saveRow").classList.remove("d-none");
}

// Save Changes
function saveProfile() {
    const fields = ["Name","Email","Age","Field","Goal"];
    fields.forEach(f => {
        const val = document.getElementById("edit" + f).value;
        document.getElementById("disp" + f).textContent = val;
        document.getElementById("disp" + f).classList.remove("d-none");
        document.getElementById("edit" + f).classList.add("d-none");
    });
    document.getElementById("profileName").textContent  = document.getElementById("editName").value;
    document.getElementById("profileEmail").textContent = document.getElementById("editEmail").value;
    document.getElementById("saveRow").classList.add("d-none");
}

// Cancel Edit
function cancelEdit() {
    const fields = ["Name","Email","Age","Field","Goal"];
    fields.forEach(f => {
        document.getElementById("disp" + f).classList.remove("d-none");
        document.getElementById("edit" + f).classList.add("d-none");
    });
    document.getElementById("saveRow").classList.add("d-none");
}
