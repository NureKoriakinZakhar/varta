if (!getToken() || getRole() !== 'hospital') {
  window.location.href = '../login/index.html';
}

const params = new URLSearchParams(window.location.search);
const soldierIdRaw = params.get('soldier_id');
const soldierId = soldierIdRaw ? parseInt(soldierIdRaw, 10) : NaN;
const patientName = params.get('name') || 'Пацієнт';

if (!soldierId || soldierId < 1) {
  window.location.href = '../hospital/index.html';
}

document.getElementById('pageTitle').textContent = `Діагнози — ${patientName}`;

const diagnosesList = document.getElementById('diagnosesList');
const skeletonList = document.getElementById('skeletonList');
const emptyMsg = document.getElementById('emptyMsg');
const listErrorMsg = document.getElementById('listErrorMsg');
const diagnosisText = document.getElementById('diagnosisText');
const severitySelect = document.getElementById('severitySelect');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

function fitDiagnosisTextarea() {
  diagnosisText.style.height = 'auto';
  diagnosisText.style.height = `${diagnosisText.scrollHeight}px`;
}

diagnosisText.addEventListener('input', fitDiagnosisTextarea);
fitDiagnosisTextarea();

function severityClass(s) {
  if (s === 'Легке') return 'diag--mild';
  if (s === 'Середнє') return 'diag--moderate';
  if (s === 'Важке') return 'diag--severe';
  if (s === 'Критичне') return 'diag--critical';
  return '';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderDiagnoses(data) {
  diagnosesList.querySelectorAll('.diag-item').forEach(el => el.remove());
  if (!data.length) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;
  data.forEach(d => {
    const el = document.createElement('article');
    el.className = 'diag-item';
    el.innerHTML = `
      <div class="diag-item__header">
        <span class="diag-item__severity ${severityClass(d.severity)}">${d.severity}</span>
        <span class="diag-item__date">${formatDate(d.date_diagnosed)}</span>
      </div>
      <p class="diag-item__text">${escapeHtml(d.diagnosis_text)}</p>
    `;
    diagnosesList.appendChild(el);
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function loadDiagnoses() {
  listErrorMsg.hidden = true;
  try {
    const res = await apiFetch(`/hospitals/diagnoses/${soldierId}`);
    if (!res) return;

    const data = await res.json();
    skeletonList.remove();

    if (!res.ok) {
      listErrorMsg.textContent = data.detail || 'Помилка завантаження';
      listErrorMsg.hidden = false;
      emptyMsg.hidden = true;
      return;
    }

    renderDiagnoses(data);
  } catch (e) {
    skeletonList.remove();
    listErrorMsg.textContent = `Помилка: ${e.message}`;
    listErrorMsg.hidden = false;
  }
}

function showFormMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `add-panel__msg add-panel__msg--${type}`;
  formMsg.hidden = false;
}

async function submitDiagnosis() {
  const text = diagnosisText.value.trim();
  if (!text) {
    showFormMsg('Введіть опис діагнозу', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Зачекайте...';
  formMsg.hidden = true;

  try {
    const res = await apiFetch('/hospitals/add_diagnosis', {
      method: 'POST',
      body: JSON.stringify({
        soldier_id: soldierId,
        diagnosis_text: text,
        severity: severitySelect.value,
      }),
    });

    if (!res) return;

    const data = await res.json();

    if (!res.ok) {
      showFormMsg(data.detail || 'Помилка сервера', 'error');
    } else {
      showFormMsg(data.detail || 'Діагноз додано', 'success');
      diagnosisText.value = '';
      fitDiagnosisTextarea();
      await loadDiagnoses();
    }
  } catch (e) {
    showFormMsg(`Помилка: ${e.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Додати діагноз';
  }
}

submitBtn.addEventListener('click', submitDiagnosis);

loadDiagnoses();
