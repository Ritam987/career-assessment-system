/**
 * admin/questions/questions.js
 */

let allQuestions = [];


document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    
    loadQuestions();
});

async function loadQuestions() {
    try {
        const data = await window.adminApi.get('/admin/questions');
        allQuestions = data && data.questions ? data.questions : [];
        renderTable();
    } catch (e) {
        window.adminApi.showToast('Failed to load questions', 'error');
    }
}

function renderTable() {
    const tbody = document.querySelector('#questionsTable tbody');
    if (!tbody) return;

    if (allQuestions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No questions found.</td></tr>';
        return;
    }

    tbody.innerHTML = allQuestions.map((q, i) => `
        <tr>
            <td>${q.id}</td>
            <td style="max-width: 300px;" class="text-truncate" title="${q.question_text}">${q.question_text}</td>
            <td><span class="badge bg-secondary">${q.category_id}</span></td>
            <td>${q.question_type}</td>
            <td><span class="badge ${q.status === 'Active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary'}">${q.status}</span></td>
            
        </tr>
    `).join('');
}

