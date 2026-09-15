/**
 * admin/questions/questions.js
 */

let allQuestions = [];
let questionModal;

document.addEventListener('DOMContentLoaded', async () => {
    const admin = await window.adminApi.requireAuth();
    if (!admin) return;
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = admin.name);

    questionModal = new bootstrap.Modal(document.getElementById('questionModal'));
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
            <td class="text-end">
                <button class="btn btn-sm btn-light text-primary me-1" onclick="openEditModal(${q.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-light text-danger" onclick="deleteQuestion(${q.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddModal() {
    document.getElementById('questionForm').reset();
    document.getElementById('qId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Question';
    questionModal.show();
}

function openEditModal(id) {
    const q = allQuestions.find(x => x.id === id);
    if (!q) return;

    document.getElementById('qId').value = q.id;
    document.getElementById('qText').value = q.question_text;
    document.getElementById('qCategory').value = q.category_id;
    document.getElementById('qType').value = q.question_type || 'Likert';
    document.getElementById('qTrait').value = q.mapped_trait || '';
    document.getElementById('qStatus').value = q.status || 'Active';
    
    document.getElementById('qOptA').value = q.option_a || '';
    document.getElementById('qScoreA').value = q.score_a !== null ? q.score_a : '';
    document.getElementById('qOptB').value = q.option_b || '';
    document.getElementById('qScoreB').value = q.score_b !== null ? q.score_b : '';
    document.getElementById('qOptC').value = q.option_c || '';
    document.getElementById('qScoreC').value = q.score_c !== null ? q.score_c : '';
    document.getElementById('qOptD').value = q.option_d || '';
    document.getElementById('qScoreD').value = q.score_d !== null ? q.score_d : '';

    document.getElementById('modalTitle').textContent = 'Edit Question';
    questionModal.show();
}

async function saveQuestion() {
    const id = document.getElementById('qId').value;
    const btn = document.getElementById('btnSaveQuestion');
    
    const payload = {
        category_id: parseInt(document.getElementById('qCategory').value),
        question_text: document.getElementById('qText').value.trim(),
        question_type: document.getElementById('qType').value,
        mapped_trait: document.getElementById('qTrait').value.trim(),
        status: document.getElementById('qStatus').value,
        option_a: document.getElementById('qOptA').value.trim(),
        score_a: parseInt(document.getElementById('qScoreA').value) || 0,
        option_b: document.getElementById('qOptB').value.trim(),
        score_b: parseInt(document.getElementById('qScoreB').value) || 0,
        option_c: document.getElementById('qOptC').value.trim(),
        score_c: parseInt(document.getElementById('qScoreC').value) || 0,
        option_d: document.getElementById('qOptD').value.trim(),
        score_d: parseInt(document.getElementById('qScoreD').value) || 0
    };

    if (!payload.question_text || !payload.category_id) {
        window.adminApi.showToast('Text and Category ID are required', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

    try {
        if (id) {
            await window.adminApi.put('/admin/questions/' + id, payload);
            window.adminApi.showToast('Question updated successfully');
        } else {
            await window.adminApi.post('/admin/questions', payload);
            window.adminApi.showToast('Question added successfully');
        }
        questionModal.hide();
        loadQuestions();
    } catch (e) {
        window.adminApi.showToast(e.message || 'Failed to save question', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Question';
    }
}

async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
        await window.adminApi.delete('/admin/questions/' + id);
        window.adminApi.showToast('Question deleted');
        loadQuestions();
    } catch (e) {
        window.adminApi.showToast('Failed to delete question', 'error');
    }
}

window.logout = function() { window.adminApi.logout(); }
