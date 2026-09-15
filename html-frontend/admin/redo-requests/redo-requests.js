let allRequests = [];
let actionModal;
let currentRequestId = null;
let currentAction = null; // 'approve' or 'reject'

document.addEventListener('DOMContentLoaded', async () => {
    actionModal = new bootstrap.Modal(document.getElementById('actionModal'));

    try {
        const profileData = await window.adminApi.get('/admin/profile');
        if (profileData && profileData.admin) {
            document.querySelector('.admin-name').textContent = profileData.admin.name;
        }
    } catch (e) {
        console.warn('Could not load profile');
    }

    // Filter logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            });
            e.target.classList.remove('btn-outline-primary');
            e.target.classList.add('btn-primary');
            renderRequests(e.target.dataset.status);
        });
    });

    document.getElementById('confirmActionBtn').addEventListener('click', submitAction);

    loadRequests();
});

async function loadRequests() {
    /* loading */;
    try {
        const data = await window.adminApi.get('/admin/redo-requests');
        allRequests = data.requests || [];
        renderRequests('ALL');
    } catch (error) {
        console.error('Error loading redo requests:', error);
    } finally {
        /* done */;
    }
}

function renderRequests(filterStatus) {
    const container = document.getElementById('requestsContainer');
    
    let filtered = allRequests;
    if (filterStatus !== 'ALL') {
        filtered = allRequests.filter(r => r.status === filterStatus);
    }

    document.getElementById('requestCount').textContent = `${filtered.length} Requests`;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-5 border rounded bg-white">No requests found.</div>';
        return;
    }

    container.innerHTML = filtered.map(req => {
        let actionButtons = '';
        if (req.status === 'PENDING') {
            actionButtons = `
                <div class="req-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="openActionModal(${req.id}, 'reject')"><i class="bi bi-x-circle"></i> Reject</button>
                    <button class="btn btn-sm btn-success" onclick="openActionModal(${req.id}, 'approve')"><i class="bi bi-check-circle"></i> Approve</button>
                </div>
            `;
        }

        let adminCommentBlock = '';
        if (req.admin_comment) {
            adminCommentBlock = `
                <div class="mt-3 text-muted small">
                    <strong>Admin Note:</strong> ${req.admin_comment}
                </div>
            `;
        }

        let approvalUsedBadge = '';
        if (req.status === 'APPROVED') {
            approvalUsedBadge = req.approval_used 
                ? '<span class="badge bg-secondary ms-2">Used</span>' 
                : '<span class="badge bg-primary ms-2">Unused</span>';
        }

        return `
            <div class="request-card">
                <div class="req-hdr">
                    <div>
                        <div class="req-user">${req.full_name}</div>
                        <div class="req-email">${req.email}</div>
                    </div>
                    <div>
                        <span class="badge-status status-${req.status}">${req.status}</span>
                        ${approvalUsedBadge}
                    </div>
                </div>
                
                <div class="req-meta">
                    <div class="meta-item"><i class="bi bi-calendar-event me-1"></i> Requested: ${new Date(req.requested_at).toLocaleDateString()}</div>
                    <div class="meta-item"><i class="bi bi-arrow-repeat me-1"></i> Prev Attempts: ${req.completed_attempts_at_request}</div>
                    ${req.current_score ? `<div class="meta-item"><i class="bi bi-star me-1"></i> Prev Score: ${req.current_score}%</div>` : ''}
                    ${req.current_career ? `<div class="meta-item"><i class="bi bi-briefcase me-1"></i> Prev Match: ${req.current_career}</div>` : ''}
                </div>

                <div class="req-reason">
                    <strong>Reason for redo:</strong><br>
                    ${req.reason}
                </div>
                
                ${adminCommentBlock}
                ${actionButtons}
            </div>
        `;
    }).join('');
}

function openActionModal(id, action) {
    currentRequestId = id;
    currentAction = action;
    const req = allRequests.find(r => r.id === id);
    
    document.getElementById('modalTitle').textContent = action === 'approve' ? 'Approve Request' : 'Reject Request';
    document.getElementById('modalConfirmText').textContent = action === 'approve' 
        ? `Approve redo request for ${req.full_name}? They will be allowed one additional attempt.`
        : `Reject redo request for ${req.full_name}?`;
    
    document.getElementById('adminComment').value = '';
    
    const btn = document.getElementById('confirmActionBtn');
    if (action === 'approve') {
        btn.className = 'btn btn-success';
        btn.textContent = 'Approve';
    } else {
        btn.className = 'btn btn-danger';
        btn.textContent = 'Reject';
    }
    
    actionModal.show();
}

async function submitAction() {
    const comment = document.getElementById('adminComment').value;
    
    if (currentAction === 'reject' && !comment.trim()) {
        window.adminApi.showToast('Please provide a reason for rejection.', 'error');
        return;
    }

    const btn = document.getElementById('confirmActionBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
        await window.adminApi.post(`/admin/redo-requests/${currentRequestId}/${currentAction}`, {
            admin_comment: comment.trim()
        });
        
        window.adminApi.showToast(`Request ${currentAction}d successfully!`);
        actionModal.hide();
        loadRequests(); // refresh data
    } catch (e) {
        // Error toast handled by api wrapper
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
