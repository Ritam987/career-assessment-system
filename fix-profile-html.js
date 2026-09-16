const fs = require('fs');

let htmlFile = 'html-frontend/admin/profile/profile.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Replace "Change Cover" with "Change Avatar" + hidden file input
htmlContent = htmlContent.replace(/<button class="upload-btn"><i class="bi bi-camera me-1"><\/i> Change Cover<\/button>/, 
    '<button class="upload-btn" onclick="document.getElementById(\'avatarUpload\').click()"><i class="bi bi-camera me-1"></i> Change Avatar</button>' + 
    '\n                    <input type="file" id="avatarUpload" style="display:none;" accept="image/*">');

// Update Avatar Display
htmlContent = htmlContent.replace(/<div class="profile-avatar">A<\/div>/, '<img src="" id="profileAvatarDisplay" class="profile-avatar" style="object-fit:cover; display:none;"><div class="profile-avatar d-flex align-items-center justify-content-center fw-bold fs-3" id="profileAvatarFallback">A</div>');

// Update Name and Role headers
htmlContent = htmlContent.replace(/<h3>System Administrator<\/h3>\s*<p>Super Admin[^<]*<\/p>/, '<h3 id="hdrName">Loading...</h3>\n                        <p id="hdrRole">Loading...</p>');

// Update Input Fields
let fieldsHTML = `
                                <div class="col-md-6">
                                    <label class="f-lbl">Full Name</label>
                                    <input type="text" id="pName" class="f-ctrl">
                                </div>
                                <div class="col-md-6">
                                    <label class="f-lbl">Role (Read-Only)</label>
                                    <input type="text" id="pRole" class="f-ctrl" readonly style="background-color:#f8f9fa;">
                                </div>
                                <div class="col-md-12">
                                    <label class="f-lbl">Email Address</label>
                                    <input type="email" id="pEmail" class="f-ctrl">
                                </div>
`;
htmlContent = htmlContent.replace(/<div class="col-md-6">\s*<label class="f-lbl">First Name<\/label>[\s\S]*?<div class="col-md-6">\s*<label class="f-lbl">Phone Number<\/label>[\s\S]*?<\/div>/, fieldsHTML);

// Update Save Changes button
htmlContent = htmlContent.replace(/<button class="btn-primary"><i class="bi bi-check2 me-1"><\/i> Save Changes<\/button>/, '<button class="btn-primary" id="btnSaveProfile"><i class="bi bi-check2 me-1"></i> Save Changes</button>');

// Update Password Section
let passHTML = `
                                <div class="col-12">
                                    <label class="f-lbl">Current Password</label>
                                    <input type="password" id="pOldPass" class="f-ctrl" placeholder="Enter current password">
                                </div>
                                <div class="col-12 mt-3">
                                    <label class="f-lbl">New Password</label>
                                    <input type="password" id="pNewPass" class="f-ctrl" placeholder="Create new password">
                                    <div style="font-size:.65rem; color:var(--text-muted); margin-top:4px;">Must be at least 8 characters.</div>
                                </div>
                                <div class="col-12 mt-3">
                                    <label class="f-lbl">Confirm New Password</label>
                                    <input type="password" id="pConfirmPass" class="f-ctrl" placeholder="Confirm new password">
                                </div>
`;
htmlContent = htmlContent.replace(/<div class="col-12">\s*<label class="f-lbl">Current Password<\/label>[\s\S]*?<div class="col-12">\s*<label class="f-lbl">Confirm New Password<\/label>[\s\S]*?<\/div>/, passHTML);

// Update Password Button
htmlContent = htmlContent.replace(/<button class="btn-outline" style="color:var\(--purple\); border-color:var\(--purple\);"><i class="bi bi-shield-lock me-1"><\/i> Update Password<\/button>/, '<button class="btn-outline" id="btnSavePassword" style="color:var(--purple); border-color:var(--purple);"><i class="bi bi-shield-lock me-1"></i> Update Password</button>');

fs.writeFileSync(htmlFile, htmlContent);
console.log("Patched profile.html successfully.");
