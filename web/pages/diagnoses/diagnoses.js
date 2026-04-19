const TRANSLATIONS = {
  uk: {
    titlePrefix: 'Діагнози',
    pageTitle: 'VARTA — Діагнози',
    back: 'Назад',
    listHeading: 'Список діагнозів',
    emptyMsg: 'Діагнози відсутні',
    formHeading: 'Новий діагноз',
    labelDiagText: 'Код МКХ-10 (діагноз)',
    diagPlaceholder: 'Пошук за кодом або назвою...',
    icdHint: 'Класифікація МКХ-10 (ВООЗ), рубрики українською — для медичної документації в Україні.',
    icdLoadError: 'Не вдалося завантажити перелік МКХ-10. Перезавантажте сторінку.',
    icdNoResults: 'Нічого не знайдено',
    icdListAria: 'Перелік кодів МКХ-10',
    clearIcdAria: 'Скинути вибір',
    labelSeverity: 'Тяжкість',
    sevMild: 'Легке',
    sevModerate: 'Середнє',
    sevSevere: 'Важке',
    sevCritical: 'Критичне',
    submitBtn: 'Додати діагноз',
    submitBtnWait: 'Зачекайте...',
    emptyTextError: 'Оберіть діагноз з переліку МКХ-10',
    loadError: 'Помилка завантаження',
    deleteDiagTitle: 'Видалити діагноз',
    deleteDiagText: 'Ви впевнені, що хочете видалити цей діагноз?',
    deleteDiagCancel: 'Скасувати',
    deleteDiagConfirm: 'Видалити',
    deleteDiagConfirmWait: 'Зачекайте...',
    deleteDiagAria: 'Видалити діагноз',
    deleteDiagFail: 'Не вдалося видалити діагноз',
  },
  en: {
    titlePrefix: 'Diagnoses',
    pageTitle: 'VARTA — Diagnoses',
    back: 'Back',
    listHeading: 'Diagnoses list',
    emptyMsg: 'No diagnoses',
    formHeading: 'New Diagnosis',
    labelDiagText: 'ICD-10 code (diagnosis)',
    diagPlaceholder: 'Search by code or title...',
    icdHint: 'WHO ICD-10 structure with Ukrainian rubric titles (for clinical documentation in Ukraine).',
    icdLoadError: 'Could not load the ICD-10 list. Reload the page.',
    icdNoResults: 'No matches',
    icdListAria: 'ICD-10 code list',
    clearIcdAria: 'Clear selection',
    labelSeverity: 'Severity',
    sevMild: 'Mild',
    sevModerate: 'Moderate',
    sevSevere: 'Severe',
    sevCritical: 'Critical',
    submitBtn: 'Add Diagnosis',
    submitBtnWait: 'Please wait...',
    emptyTextError: 'Select a diagnosis from the ICD-10 list',
    loadError: 'Load error',
    deleteDiagTitle: 'Delete diagnosis',
    deleteDiagText: 'Are you sure you want to delete this diagnosis?',
    deleteDiagCancel: 'Cancel',
    deleteDiagConfirm: 'Delete',
    deleteDiagConfirmWait: 'Please wait...',
    deleteDiagAria: 'Delete diagnosis',
    deleteDiagFail: 'Could not delete diagnosis',
  },
};

const ICD_JSON_QUERY = 'v=1';

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
const icdPicker     = document.getElementById('icdPicker');
const diagnosisSearch = document.getElementById('diagnosisSearch');
const diagnosisSelected = document.getElementById('diagnosisSelected');
const diagnosisSelectedCode = document.getElementById('diagnosisSelectedCode');
const diagnosisSelectedTitle = document.getElementById('diagnosisSelectedTitle');
const diagnosisClearBtn = document.getElementById('diagnosisClearBtn');
const diagnosisDropdown = document.getElementById('diagnosisDropdown');
const icdHint       = document.getElementById('icdHint');
const severitySelect = document.getElementById('severitySelect');
const submitBtn     = document.getElementById('submitBtn');
const formMsg       = document.getElementById('formMsg');
const deleteDiagModal       = document.getElementById('deleteDiagModal');
const deleteDiagModalTitle  = document.getElementById('deleteDiagModalTitle');
const deleteDiagModalText   = document.getElementById('deleteDiagModalText');
const deleteDiagModalError  = document.getElementById('deleteDiagModalError');
const deleteDiagCancelBtn   = document.getElementById('deleteDiagCancelBtn');
const deleteDiagConfirmBtn  = document.getElementById('deleteDiagConfirmBtn');

let cachedDiagnoses = null;
let dataLoaded      = false;
let pendingDeleteDiagId = null;

let icdList = [];
let icdLoadFailed = false;
let selectedIcd = null;
let filterRaf = null;

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
        <div class="diag-item__header-right">
          <span class="diag-item__date">${formatDate(d.date_diagnosed)}</span>
          <button type="button" class="diag-item__delete" data-action="delete-diag" data-diag-id="${d.id}" aria-label="${escapeHtml(t('deleteDiagAria'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="diag-item__text">${escapeHtml(d.diagnosis_text)}</p>
    `;
    diagnosesList.appendChild(el);
  });
}

function filterIcd(q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return icdList;
  const out = [];
  for (let i = 0; i < icdList.length; i++) {
    const x = icdList[i];
    if (x.code.toLowerCase().includes(needle) || x.title.toLowerCase().includes(needle)) {
      out.push(x);
    }
  }
  return out;
}

function renderDropdown(items) {
  diagnosisDropdown.innerHTML = '';
  if (!icdList.length) {
    diagnosisDropdown.hidden = true;
    return;
  }
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'icd-picker__empty';
    empty.textContent = t('icdNoResults');
    diagnosisDropdown.appendChild(empty);
    diagnosisDropdown.hidden = false;
    return;
  }
  for (const row of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icd-picker__item';
    btn.setAttribute('role', 'option');
    btn.innerHTML = `
      <span class="icd-picker__item-code">${escapeHtml(row.code)}</span>
      <span class="icd-picker__item-title">${escapeHtml(row.title)}</span>
    `;
    btn.addEventListener('click', () => {
      selectedIcd = { code: row.code, title: row.title };
      diagnosisSearch.value = '';
      updateSelectedUi();
      diagnosisDropdown.hidden = true;
    });
    diagnosisDropdown.appendChild(btn);
  }
  diagnosisDropdown.hidden = false;
}

function scheduleFilter() {
  if (filterRaf != null) cancelAnimationFrame(filterRaf);
  filterRaf = requestAnimationFrame(() => {
    filterRaf = null;
    renderDropdown(filterIcd(diagnosisSearch.value));
  });
}

function updateSelectedUi() {
  if (selectedIcd) {
    diagnosisSelected.hidden = false;
    diagnosisSelectedCode.textContent = selectedIcd.code;
    diagnosisSelectedTitle.textContent = selectedIcd.title;
  } else {
    diagnosisSelected.hidden = true;
    diagnosisSelectedCode.textContent = '';
    diagnosisSelectedTitle.textContent = '';
  }
}

function clearIcdSelection(opts) {
  const focusSearch = !opts || opts.focusSearch !== false;
  selectedIcd = null;
  updateSelectedUi();
  if (focusSearch) {
    diagnosisSearch.focus();
  } else {
    diagnosisSearch.blur();
  }
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
  diagnosisSearch.placeholder = t('diagPlaceholder');
  icdHint.textContent = icdLoadFailed ? t('icdLoadError') : t('icdHint');
  diagnosisDropdown.setAttribute('aria-label', t('icdListAria'));
  diagnosisClearBtn.setAttribute('aria-label', t('clearIcdAria'));
  diagnosisClearBtn.textContent = '×';
  document.getElementById('labelSeverity').textContent = t('labelSeverity');

  document.querySelector('#severitySelect option[value="Легке"]').textContent   = t('sevMild');
  document.querySelector('#severitySelect option[value="Середнє"]').textContent = t('sevModerate');
  document.querySelector('#severitySelect option[value="Важке"]').textContent   = t('sevSevere');
  document.querySelector('#severitySelect option[value="Критичне"]').textContent = t('sevCritical');

  submitBtn.textContent = t('submitBtn');

  deleteDiagModalTitle.textContent = t('deleteDiagTitle');
  deleteDiagModalText.textContent = t('deleteDiagText');
  deleteDiagCancelBtn.textContent = t('deleteDiagCancel');
  deleteDiagConfirmBtn.textContent = t('deleteDiagConfirm');

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (dataLoaded) renderDiagnoses(cachedDiagnoses);
  if (icdList.length && document.activeElement === diagnosisSearch) {
    scheduleFilter();
  }
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

diagnosisSearch.addEventListener('input', scheduleFilter);
diagnosisSearch.addEventListener('focus', () => {
  if (icdList.length) scheduleFilter();
});
diagnosisSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') diagnosisDropdown.hidden = true;
});

diagnosisClearBtn.addEventListener('click', clearIcdSelection);

document.addEventListener('click', (e) => {
  if (!icdPicker.contains(e.target)) diagnosisDropdown.hidden = true;
});

async function loadIcdData() {
  try {
    const url = new URL(`icd10-ua.json?${ICD_JSON_QUERY}`, window.location.href);
    const res = await fetch(url.href);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('shape');
    icdList = data;
    icdLoadFailed = false;
  } catch {
    icdList = [];
    icdLoadFailed = true;
  }
  applyLang();
}

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
  if (!selectedIcd) {
    showFormMsg(t('emptyTextError'), 'error');
    return;
  }
  const text = `${selectedIcd.code} — ${selectedIcd.title}`;

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
      diagnosisDropdown.hidden = true;
      diagnosisSearch.value = '';
      clearIcdSelection({ focusSearch: false });
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

function openDeleteDiagModal(id) {
  pendingDeleteDiagId = id;
  deleteDiagModalError.hidden = true;
  deleteDiagModalError.textContent = '';
  deleteDiagModal.hidden = false;
}

function closeDeleteDiagModal() {
  deleteDiagModal.hidden = true;
  pendingDeleteDiagId = null;
  deleteDiagModalError.hidden = true;
  deleteDiagModalError.textContent = '';
}

deleteDiagCancelBtn.addEventListener('click', closeDeleteDiagModal);

deleteDiagConfirmBtn.addEventListener('click', async () => {
  if (!pendingDeleteDiagId) return;

  deleteDiagConfirmBtn.disabled = true;
  deleteDiagConfirmBtn.textContent = t('deleteDiagConfirmWait');
  deleteDiagModalError.hidden = true;

  try {
    const res = await apiFetch(`/hospitals/diagnosis/${pendingDeleteDiagId}`, { method: 'DELETE' });
    if (!res) return;

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const detail = typeof data.detail === 'string' ? data.detail : t('deleteDiagFail');
      deleteDiagModalError.textContent = detail;
      deleteDiagModalError.hidden = false;
      return;
    }

    closeDeleteDiagModal();
    await loadDiagnoses();
  } catch (e) {
    deleteDiagModalError.textContent = `${t('deleteDiagFail')}: ${e.message}`;
    deleteDiagModalError.hidden = false;
  } finally {
    deleteDiagConfirmBtn.disabled = false;
    deleteDiagConfirmBtn.textContent = t('deleteDiagConfirm');
  }
});

diagnosesList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="delete-diag"]');
  if (!btn || !diagnosesList.contains(btn)) return;
  const id = parseInt(btn.getAttribute('data-diag-id'), 10);
  if (!id || id < 1) return;
  openDeleteDiagModal(id);
});

applyLang();
Promise.all([loadIcdData(), loadDiagnoses()]);
