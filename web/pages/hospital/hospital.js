const TRANSLATIONS = {
  uk: {
    pageTitle: 'VARTA — Пацієнти',
    topbarTitle: 'Пацієнти госпіталю',
    logout: 'Вийти',
    searchPlaceholder: 'Пошук за ПІБ...',
    filterAll: 'Всі',
    filterGood: 'Норма',
    filterWarning: 'Увага',
    filterCritical: 'Критично',
    statTotal: 'Всього',
    statGood: 'Норма',
    statWarning: 'Увага',
    statCritical: 'Критично',
    emptyMsg: 'Пацієнтів не знайдено',
    admitPanelTitle: 'Прийом на лікування',
    admitLabel: 'ID військовослужбовця',
    admitPlaceholder: 'Введіть ID...',
    admitBtn: 'Прийняти',
    admitBtnWait: 'Зачекайте...',
    admitIdError: 'Введіть коректний ID військовослужбовця',
    dischargeModalTitle: 'Виписати пацієнта',
    dischargeTextPrefix: 'Ви впевнені, що хочете виписати',
    dischargeCancel: 'Скасувати',
    dischargeConfirm: 'Виписати',
    dischargeConfirmWait: 'Зачекайте...',
    loadError: 'Помилка завантаження:',
    statusGood: 'Норма',
    statusWarning: 'Увага',
    statusCritical: 'Критично',
    statusNodata: 'Немає даних',
    metricTemp: 'Темп.',
    metricHr: 'ЧСС',
    metricBat: 'Акум.',
    metricUpdated: 'Оновлено',
    btnDiagnoses: 'Діагнози',
    btnDischarge: 'Виписати',
    badgeNodata: 'Немає даних',
  },
  en: {
    pageTitle: 'VARTA — Patients',
    topbarTitle: 'Hospital Patients',
    logout: 'Logout',
    searchPlaceholder: 'Search by name...',
    filterAll: 'All',
    filterGood: 'Normal',
    filterWarning: 'Warning',
    filterCritical: 'Critical',
    statTotal: 'Total',
    statGood: 'Normal',
    statWarning: 'Warning',
    statCritical: 'Critical',
    emptyMsg: 'No patients found',
    admitPanelTitle: 'Admission',
    admitLabel: 'Soldier ID',
    admitPlaceholder: 'Enter ID...',
    admitBtn: 'Admit',
    admitBtnWait: 'Please wait...',
    admitIdError: 'Enter a valid soldier ID',
    dischargeModalTitle: 'Discharge Patient',
    dischargeTextPrefix: 'Are you sure you want to discharge',
    dischargeCancel: 'Cancel',
    dischargeConfirm: 'Discharge',
    dischargeConfirmWait: 'Please wait...',
    loadError: 'Load error:',
    statusGood: 'Normal',
    statusWarning: 'Warning',
    statusCritical: 'Critical',
    statusNodata: 'No data',
    metricTemp: 'Temp.',
    metricHr: 'HR',
    metricBat: 'Bat.',
    metricUpdated: 'Updated',
    btnDiagnoses: 'Diagnoses',
    btnDischarge: 'Discharge',
    badgeNodata: 'No data',
  },
};

if (!getToken() || getRole() !== 'hospital') {
  window.location.href = '../login/index.html';
}

let lang = vartaLang.get();

function t(key) { return TRANSLATIONS[lang][key]; }

const patientsList       = document.getElementById('patientsList');
const skeletonList       = document.getElementById('skeletonList');
const emptyMsg           = document.getElementById('emptyMsg');
const errorMsg           = document.getElementById('errorMsg');
const searchInput        = document.getElementById('searchInput');
const filterBtns         = document.querySelectorAll('.filter-btn');
const statTotal          = document.getElementById('statTotal');
const statGood           = document.getElementById('statGood');
const statWarning        = document.getElementById('statWarning');
const statCritical       = document.getElementById('statCritical');
const admitSoldierId     = document.getElementById('admitSoldierId');
const admitBtn           = document.getElementById('admitBtn');
const admitMsg           = document.getElementById('admitMsg');
const dischargeModal     = document.getElementById('dischargeModal');
const dischargeModalName = document.getElementById('dischargeModalName');
const dischargeCancelBtn = document.getElementById('dischargeCancelBtn');
const dischargeConfirmBtn = document.getElementById('dischargeConfirmBtn');

document.getElementById('logoutBtn').addEventListener('click', logout);

let allPatients  = [];
let activeFilter = 'all';
let dataLoaded   = false;

function statusClass(status) {
  if (status === 'Good')     return 'good';
  if (status === 'Warning')  return 'warning';
  if (status === 'Critical') return 'critical';
  return 'nodata';
}

function statusLabel(status) {
  if (status === 'Good')     return t('statusGood');
  if (status === 'Warning')  return t('statusWarning');
  if (status === 'Critical') return t('statusCritical');
  return t('statusNodata');
}

function tempClass(temp) {
  if (temp < 34.0 || temp >= 39.5) return 'metric__value--crit';
  if (temp < 35.0 || temp >= 38.5) return 'metric__value--warn';
  return '';
}

function hrClass(hr) {
  if (hr < 40 || hr > 130) return 'metric__value--crit';
  if (hr < 50 || hr > 110) return 'metric__value--warn';
  return '';
}

function batteryClass(b) {
  if (b <= 10) return 'metric__value--crit';
  if (b <= 20) return 'metric__value--warn';
  return '';
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
       + ' ' + d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
}

function renderPatient(p) {
  const cls = statusClass(p.status);
  const m   = p.metrics;

  const metricsHtml = m ? `
    <div class="patient-metrics">
      <div class="metric">
        <span class="metric__value ${tempClass(m.temperature)}">${m.temperature.toFixed(1)}°C</span>
        <span class="metric__label">${t('metricTemp')}</span>
      </div>
      <div class="metric">
        <span class="metric__value ${hrClass(m.heart_rate)}">${m.heart_rate}</span>
        <span class="metric__label">${t('metricHr')}</span>
      </div>
      <div class="metric">
        <span class="metric__value ${batteryClass(m.battery_percent)}">${m.battery_percent}%</span>
        <span class="metric__label">${t('metricBat')}</span>
      </div>
      <div class="metric">
        <span class="metric__value" style="font-size:13px;font-weight:400;color:var(--color-text-secondary)">${formatTime(m.last_update)}</span>
        <span class="metric__label">${t('metricUpdated')}</span>
      </div>
    </div>
  ` : `<span class="badge-nodata">${t('badgeNodata')}</span>`;

  const card = document.createElement('div');
  card.className = `patient-card patient-card--${cls}`;
  card.dataset.id   = p.soldier_id;
  card.dataset.name = p.full_name;
  card.innerHTML = `
    <span class="status-dot status-dot--${cls}" title="${statusLabel(p.status)}"></span>
    <div class="patient-info">
      <span class="patient-info__name">${p.full_name}</span>
      <span class="patient-info__meta">${p.rank} · ${p.birth_date} · IoT: ${p.iot_serial}</span>
    </div>
    <div class="patient-card-right">
      ${metricsHtml}
      <div class="patient-actions">
        <button type="button" class="patient-actions__btn patient-actions__btn--diagnoses" data-action="diagnoses">${t('btnDiagnoses')}</button>
        <button type="button" class="patient-actions__btn patient-actions__btn--discharge" data-action="discharge">${t('btnDischarge')}</button>
      </div>
    </div>
  `;
  return card;
}

function updateStats(patients) {
  statTotal.textContent    = patients.length;
  statGood.textContent     = patients.filter(p => p.status === 'Good').length;
  statWarning.textContent  = patients.filter(p => p.status === 'Warning').length;
  statCritical.textContent = patients.filter(p => p.status === 'Critical').length;
}

function renderList() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = allPatients.filter(p => {
    const matchStatus = activeFilter === 'all' || p.status === activeFilter;
    const matchSearch = !query || p.full_name.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  patientsList.querySelectorAll('.patient-card').forEach(el => el.remove());

  if (filtered.length === 0) {
    emptyMsg.hidden = false;
  } else {
    emptyMsg.hidden = true;
    filtered.forEach(p => patientsList.appendChild(renderPatient(p)));
  }
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.getElementById('topbarTitle').textContent = t('topbarTitle');
  document.getElementById('logoutText').textContent = t('logout');
  document.getElementById('logoutBtn').title = t('logout');

  document.querySelector('[data-status="all"]').textContent = t('filterAll');
  document.querySelector('[data-status="Good"]').innerHTML = `<span class="dot dot--good"></span>${t('filterGood')}`;
  document.querySelector('[data-status="Warning"]').innerHTML = `<span class="dot dot--warning"></span>${t('filterWarning')}`;
  document.querySelector('[data-status="Critical"]').innerHTML = `<span class="dot dot--critical"></span>${t('filterCritical')}`;

  document.getElementById('labelTotal').textContent = t('statTotal');
  document.getElementById('labelGood').textContent = t('statGood');
  document.getElementById('labelWarning').textContent = t('statWarning');
  document.getElementById('labelCritical').textContent = t('statCritical');

  emptyMsg.textContent = t('emptyMsg');

  document.getElementById('admitTitle').textContent = t('admitPanelTitle');
  document.getElementById('admitLabel').textContent = t('admitLabel');
  admitSoldierId.placeholder = t('admitPlaceholder');
  admitBtn.textContent = t('admitBtn');

  document.getElementById('dischargeModalTitle').textContent = t('dischargeModalTitle');
  document.getElementById('dischargeModalTextPrefix').textContent = t('dischargeTextPrefix');
  dischargeCancelBtn.textContent = t('dischargeCancel');
  dischargeConfirmBtn.textContent = t('dischargeConfirm');

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (dataLoaded) renderList();
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

searchInput.addEventListener('input', renderList);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.status;
    renderList();
  });
});

async function loadPatients() {
  try {
    const res = await apiFetch('/hospitals/all_patients');
    if (!res) return;

    skeletonList.remove();

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Помилка сервера');
    }

    allPatients = await res.json();
    dataLoaded = true;
    updateStats(allPatients);
    renderList();

  } catch (e) {
    skeletonList.remove();
    errorMsg.textContent = `${t('loadError')} ${e.message}`;
    errorMsg.hidden = false;
  }
}

function showAdmitMsg(text, type) {
  admitMsg.textContent = text;
  admitMsg.className = `admit-panel__msg admit-panel__msg--${type}`;
  admitMsg.hidden = false;
}

async function submitAdmit() {
  const id = parseInt(admitSoldierId.value, 10);
  if (!id || id < 1) {
    showAdmitMsg(t('admitIdError'), 'error');
    return;
  }

  admitBtn.disabled = true;
  admitBtn.textContent = t('admitBtnWait');
  admitMsg.hidden = true;

  try {
    const res = await apiFetch('/hospitals/accept_patient', {
      method: 'POST',
      body: JSON.stringify({ soldier_id: id }),
    });

    if (!res) return;

    const data = await res.json();

    if (!res.ok) {
      showAdmitMsg(data.detail || 'Помилка сервера', 'error');
    } else {
      showAdmitMsg(data.detail, 'success');
      admitSoldierId.value = '';
      await loadPatients();
    }
  } catch (e) {
    showAdmitMsg(`Помилка: ${e.message}`, 'error');
  } finally {
    admitBtn.disabled = false;
    admitBtn.textContent = t('admitBtn');
  }
}

admitBtn.addEventListener('click', submitAdmit);

admitSoldierId.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAdmit();
});

let pendingDischargeId = null;

function openDischargeModal(id, name) {
  pendingDischargeId = id;
  dischargeModalName.textContent = name;
  dischargeModal.hidden = false;
}

function closeDischargeModal() {
  dischargeModal.hidden = true;
  pendingDischargeId = null;
}

dischargeCancelBtn.addEventListener('click', closeDischargeModal);

dischargeConfirmBtn.addEventListener('click', async () => {
  if (!pendingDischargeId) return;

  dischargeConfirmBtn.disabled = true;
  dischargeConfirmBtn.textContent = t('dischargeConfirmWait');

  try {
    const res = await apiFetch('/hospitals/discharge_patient', {
      method: 'POST',
      body: JSON.stringify({ soldier_id: parseInt(pendingDischargeId, 10) }),
    });

    if (!res) return;

    closeDischargeModal();

    if (res.ok) {
      await loadPatients();
    }
  } catch (e) {
  } finally {
    dischargeConfirmBtn.disabled = false;
    dischargeConfirmBtn.textContent = t('dischargeConfirm');
  }
});

patientsList.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn || !patientsList.contains(btn)) return;
  const card = btn.closest('.patient-card');
  if (!card || !patientsList.contains(card)) return;
  const id   = card.dataset.id;
  const name = card.dataset.name;

  if (btn.dataset.action === 'diagnoses') {
    window.location.href = `../diagnoses/index.html?soldier_id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
  }
  if (btn.dataset.action === 'discharge') openDischargeModal(id, name);
});

applyLang();
loadPatients();
