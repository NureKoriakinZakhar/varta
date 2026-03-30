const TRANSLATIONS = {
  uk: {
    titlePrefix: 'Діагнози',
    pageTitle: 'VARTA — Діагнози',
    back: 'Назад',
    listHeading: 'Список діагнозів',
    emptyMsg: 'Діагнози відсутні',
    formHeading: 'Новий діагноз',
    labelDiagText: 'Опис діагнозу',
    diagPlaceholder: 'Введіть текст діагнозу...',
    labelSeverity: 'Тяжкість',
    sevMild: 'Легке',
    sevModerate: 'Середнє',
    sevSevere: 'Важке',
    sevCritical: 'Критичне',
    submitBtn: 'Додати діагноз',
    submitBtnWait: 'Зачекайте...',
    emptyTextError: 'Введіть опис діагнозу',
    loadError: 'Помилка завантаження',
  },
  en: {
    titlePrefix: 'Diagnoses',
    pageTitle: 'VARTA — Diagnoses',
    back: 'Back',
    listHeading: 'Diagnoses list',
    emptyMsg: 'No diagnoses',
    formHeading: 'New Diagnosis',
    labelDiagText: 'Diagnosis description',
    diagPlaceholder: 'Enter diagnosis text...',
    labelSeverity: 'Severity',
    sevMild: 'Mild',
    sevModerate: 'Moderate',
    sevSevere: 'Severe',
    sevCritical: 'Critical',
    submitBtn: 'Add Diagnosis',
    submitBtnWait: 'Please wait...',
    emptyTextError: 'Enter diagnosis description',
    loadError: 'Load error',
  },
};

if (!getToken() || getRole() !== 'hospital') {
  window.location.href = '../login/index.html';
}

let lang = vartaLang.get();

function t(key) { return TRANSLATIONS[lang][key]; }

const params       = new URLSearchParams(window.location.search);
const soldierIdRaw = params.get('soldier_id');
const soldierId    = soldierIdRaw ? parseInt(soldierIdRaw, 10) : NaN;
const patientName  = params.get('name') || '';

if (!soldierId || soldierId < 1) {
  window.location.href = '../hospital/index.html';
}

const diagnosesList = document.getElementById('diagnosesList');
const skeletonList  = document.getElementById('skeletonList');
const emptyMsg      = document.getElementById('emptyMsg');
const listErrorMsg  = document.getElementById('listErrorMsg');
const diagnosisText = document.getElementById('diagnosisText');
const severitySelect = document.getElementById('severitySelect');
const submitBtn     = document.getElementById('submitBtn');
const formMsg       = document.getElementById('formMsg');

let cachedDiagnoses = null;
let dataLoaded      = false;

function fitDiagnosisTextarea() {
  diagnosisText.style.height = 'auto';
  diagnosisText.style.height = `${diagnosisText.scrollHeight}px`;
}

diagnosisText.addEventListener('input', fitDiagnosisTextarea);
fitDiagnosisTextarea();

function severityClass(s) {
  if (s === 'Легке')    return 'diag--mild';
  if (s === 'Середнє')  return 'diag--moderate';
  if (s === 'Важке')    return 'diag--severe';
  if (s === 'Критичне') return 'diag--critical';
  return '';
}

function severityLabel(s) {
  if (s === 'Легке')    return t('sevMild');
  if (s === 'Середнє')  return t('sevModerate');
  if (s === 'Важке')    return t('sevSevere');
  if (s === 'Критичне') return t('sevCritical');
  return s;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
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
        <span class="diag-item__severity ${severityClass(d.severity)}">${severityLabel(d.severity)}</span>
        <span class="diag-item__date">${formatDate(d.date_diagnosed)}</span>
      </div>
      <p class="diag-item__text">${escapeHtml(d.diagnosis_text)}</p>
    `;
    diagnosesList.appendChild(el);
  });
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.getElementById('pageTitle').textContent = patientName
    ? `${t('titlePrefix')} — ${patientName}`
    : t('titlePrefix');
  document.getElementById('backText').textContent = t('back');
  document.getElementById('listHeading').textContent = t('listHeading');
  emptyMsg.textContent = t('emptyMsg');
  document.getElementById('formHeading').textContent = t('formHeading');
  document.getElementById('labelDiagText').textContent = t('labelDiagText');
  diagnosisText.placeholder = t('diagPlaceholder');
  document.getElementById('labelSeverity').textContent = t('labelSeverity');

  document.querySelector('#severitySelect option[value="Легке"]').textContent   = t('sevMild');
  document.querySelector('#severitySelect option[value="Середнє"]').textContent = t('sevModerate');
  document.querySelector('#severitySelect option[value="Важке"]').textContent   = t('sevSevere');
  document.querySelector('#severitySelect option[value="Критичне"]').textContent = t('sevCritical');

  submitBtn.textContent = t('submitBtn');

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (dataLoaded) renderDiagnoses(cachedDiagnoses);
}

window.addEventListener('varta:langchange', (e) => {
  lang = e.detail.lang;
  applyLang();
});

document.querySelectorAll('.lang-switcher__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    vartaLang.set(btn.dataset.lang);
  });
});

async function loadDiagnoses() {
  listErrorMsg.hidden = true;
  try {
    const res = await apiFetch(`/hospitals/diagnoses/${soldierId}`);
    if (!res) return;

    const data = await res.json();
    skeletonList.remove();

    if (!res.ok) {
      listErrorMsg.textContent = data.detail || t('loadError');
      listErrorMsg.hidden = false;
      emptyMsg.hidden = true;
      return;
    }

    cachedDiagnoses = data;
    dataLoaded = true;
    renderDiagnoses(data);
  } catch (e) {
    skeletonList.remove();
    listErrorMsg.textContent = `${t('loadError')}: ${e.message}`;
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
    showFormMsg(t('emptyTextError'), 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = t('submitBtnWait');
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
    submitBtn.textContent = t('submitBtn');
  }
}

submitBtn.addEventListener('click', submitDiagnosis);

applyLang();
loadDiagnoses();
