if (!getToken() || getRole() !== 'hospital') {
  window.location.href = '../login/index.html';
}

const patientsList = document.getElementById('patientsList');
const skeletonList = document.getElementById('skeletonList');
const emptyMsg     = document.getElementById('emptyMsg');
const errorMsg     = document.getElementById('errorMsg');
const searchInput  = document.getElementById('searchInput');
const filterBtns   = document.querySelectorAll('.filter-btn');

const statTotal    = document.getElementById('statTotal');
const statGood     = document.getElementById('statGood');
const statWarning  = document.getElementById('statWarning');
const statCritical = document.getElementById('statCritical');

document.getElementById('logoutBtn').addEventListener('click', logout);

let allPatients = [];
let activeFilter = 'all';

function statusClass(status) {
  if (status === 'Good')     return 'good';
  if (status === 'Warning')  return 'warning';
  if (status === 'Critical') return 'critical';
  return 'nodata';
}

function statusLabel(status) {
  if (status === 'Good')     return 'Норма';
  if (status === 'Warning')  return 'Увага';
  if (status === 'Critical') return 'Критично';
  return 'Немає даних';
}

function tempClass(t) {
  if (t < 34.0 || t >= 39.5) return 'metric__value--crit';
  if (t < 35.0 || t >= 38.5) return 'metric__value--warn';
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
        <span class="metric__label">Темп.</span>
      </div>
      <div class="metric">
        <span class="metric__value ${hrClass(m.heart_rate)}">${m.heart_rate}</span>
        <span class="metric__label">ЧСС</span>
      </div>
      <div class="metric">
        <span class="metric__value ${batteryClass(m.battery_percent)}">${m.battery_percent}%</span>
        <span class="metric__label">Акум.</span>
      </div>
      <div class="metric">
        <span class="metric__value" style="font-size:13px;font-weight:400;color:var(--color-text-secondary)">${formatTime(m.last_update)}</span>
        <span class="metric__label">Оновлено</span>
      </div>
    </div>
  ` : `<span class="badge-nodata">Немає даних</span>`;

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
        <button type="button" class="patient-actions__btn patient-actions__btn--diagnoses" data-action="diagnoses">Діагнози</button>
        <button type="button" class="patient-actions__btn patient-actions__btn--discharge" data-action="discharge">Виписати</button>
      </div>
    </div>
  `;
  return card;
}

function updateStats(patients) {
  statTotal.textContent     = patients.length;
  statGood.textContent      = patients.filter(p => p.status === 'Good').length;
  statWarning.textContent   = patients.filter(p => p.status === 'Warning').length;
  statCritical.textContent  = patients.filter(p => p.status === 'Critical').length;
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
    updateStats(allPatients);
    renderList();

  } catch (e) {
    skeletonList.remove();
    errorMsg.textContent = `Помилка завантаження: ${e.message}`;
    errorMsg.hidden = false;
  }
}

loadPatients();

const admitSoldierId = document.getElementById('admitSoldierId');
const admitBtn       = document.getElementById('admitBtn');
const admitMsg       = document.getElementById('admitMsg');

function showAdmitMsg(text, type) {
  admitMsg.textContent = text;
  admitMsg.className = `admit-panel__msg admit-panel__msg--${type}`;
  admitMsg.hidden = false;
}

async function submitAdmit() {
  const id = parseInt(admitSoldierId.value, 10);
  if (!id || id < 1) {
    showAdmitMsg('Введіть коректний ID військовослужбовця', 'error');
    return;
  }

  admitBtn.disabled = true;
  admitBtn.textContent = 'Зачекайте...';
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
    admitBtn.textContent = 'Прийняти';
  }
}

admitBtn.addEventListener('click', submitAdmit);

admitSoldierId.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAdmit();
});

const dischargeModal      = document.getElementById('dischargeModal');
const dischargeModalName  = document.getElementById('dischargeModalName');
const dischargeCancelBtn  = document.getElementById('dischargeCancelBtn');
const dischargeConfirmBtn = document.getElementById('dischargeConfirmBtn');

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
  dischargeConfirmBtn.textContent = 'Зачекайте...';

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
    dischargeConfirmBtn.textContent = 'Виписати';
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
