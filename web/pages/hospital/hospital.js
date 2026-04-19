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
    dischargeTextPrefix: 'Виписка для',
    dischargeCancel: 'Скасувати',
    dischargeConfirm: 'Виписати',
    dischargeConfirmWait: 'Зачекайте...',
    labelDischargeDate: 'Дата виписки',
    labelCourse: 'Перебіг',
    labelTreatment: 'Лікування',
    labelRecommendations: 'Рекомендації',
    labelConclusion: 'Висновок',
    dischargeFillAll: 'Заповніть усі поля форми.',
    dischargeErrorGeneric: 'Не вдалося виписати. Спробуйте ще раз.',
    pdfModalTitle: 'Виписку оформлено',
    pdfModalText: 'Завантажте PDF з даними виписки.',
    pdfDownload: 'Завантажити PDF',
    pdfModalClose: 'Закрити',
    pdfDocTitle: 'Виписка з госпіталю',
    pdfBrand: 'VARTA',
    pdfDocSubtitle: 'Офіційна медична виписка',
    pdfPatientBlockTitle: 'Облікові дані військовослужбовця',
    pdfFooterNote: 'Документ сформовано електронно в інформаційній системі VARTA',
    pdfLabelFullName: 'ПІБ',
    pdfLabelRank: 'Звання',
    pdfLabelBirth: 'Дата народження',
    pdfLabelIot: 'Пристрій IoT',
    pdfLabelDischargeDate: 'Дата виписки',
    pdfLabelLatestDiagnosis: 'Останній діагноз',
    pdfLabelCourse: 'Перебіг',
    pdfLabelTreatment: 'Лікування',
    pdfLabelRecommendations: 'Рекомендації',
    pdfLabelConclusion: 'Висновок',
    pdfErrorLibs: 'Не вдалося завантажити бібліотеки PDF. Перевірте з’єднання з інтернетом.',
    pdfErrorCreate: 'Помилка створення PDF.',
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
    dischargeTextPrefix: 'Discharge for',
    dischargeCancel: 'Cancel',
    dischargeConfirm: 'Discharge',
    dischargeConfirmWait: 'Please wait...',
    labelDischargeDate: 'Discharge date',
    labelCourse: 'Clinical course',
    labelTreatment: 'Treatment',
    labelRecommendations: 'Recommendations',
    labelConclusion: 'Conclusion',
    dischargeFillAll: 'Please fill in all fields.',
    dischargeErrorGeneric: 'Discharge failed. Please try again.',
    pdfModalTitle: 'Discharge completed',
    pdfModalText: 'Download the PDF with discharge details.',
    pdfDownload: 'Download PDF',
    pdfModalClose: 'Close',
    pdfDocTitle: 'Hospital discharge summary',
    pdfBrand: 'VARTA',
    pdfDocSubtitle: 'Official medical discharge summary',
    pdfPatientBlockTitle: 'Service member identification',
    pdfFooterNote: 'Document generated electronically in the VARTA information system',
    pdfLabelFullName: 'Full name',
    pdfLabelRank: 'Rank',
    pdfLabelBirth: 'Date of birth',
    pdfLabelIot: 'IoT device',
    pdfLabelDischargeDate: 'Discharge date',
    pdfLabelLatestDiagnosis: 'Latest diagnosis',
    pdfLabelCourse: 'Clinical course',
    pdfLabelTreatment: 'Treatment',
    pdfLabelRecommendations: 'Recommendations',
    pdfLabelConclusion: 'Conclusion',
    pdfErrorLibs: 'PDF libraries failed to load. Check your internet connection.',
    pdfErrorCreate: 'Failed to create PDF.',
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
const dischargeModal       = document.getElementById('dischargeModal');
const dischargeModalName   = document.getElementById('dischargeModalName');
const dischargeCancelBtn   = document.getElementById('dischargeCancelBtn');
const dischargeConfirmBtn  = document.getElementById('dischargeConfirmBtn');
const dischargeForm        = document.getElementById('dischargeForm');
const dischargeDate        = document.getElementById('dischargeDate');
const dischargeCourse      = document.getElementById('dischargeCourse');
const dischargeTreatment   = document.getElementById('dischargeTreatment');
const dischargeRecommendations = document.getElementById('dischargeRecommendations');
const dischargeConclusion  = document.getElementById('dischargeConclusion');
const dischargeFormError   = document.getElementById('dischargeFormError');
const pdfModal             = document.getElementById('pdfModal');
const pdfModalTitle        = document.getElementById('pdfModalTitle');
const pdfModalText         = document.getElementById('pdfModalText');
const pdfDownloadBtn       = document.getElementById('pdfDownloadBtn');
const pdfModalCloseBtn     = document.getElementById('pdfModalCloseBtn');
const pdfRenderRoot        = document.getElementById('pdfRenderRoot');

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
  document.getElementById('labelDischargeDate').textContent = t('labelDischargeDate');
  document.getElementById('labelCourse').textContent = t('labelCourse');
  document.getElementById('labelTreatment').textContent = t('labelTreatment');
  document.getElementById('labelRecommendations').textContent = t('labelRecommendations');
  document.getElementById('labelConclusion').textContent = t('labelConclusion');
  pdfModalTitle.textContent = t('pdfModalTitle');
  pdfModalText.textContent = t('pdfModalText');
  pdfDownloadBtn.textContent = t('pdfDownload');
  pdfModalCloseBtn.textContent = t('pdfModalClose');

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

let pendingDischargePatient = null;
let pendingPdfPayload = null;

function localDateYmd() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatPdfDischargeDate(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const p = ymd.split('-').map(Number);
  const dt = new Date(p[0], p[1] - 1, p[2]);
  return dt.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatLatestDiagnosisPdfValue(line) {
  const s = String(line || '').trim();
  return s || '\u2014';
}

function resetDischargeForm() {
  dischargeDate.value = localDateYmd();
  dischargeCourse.value = '';
  dischargeTreatment.value = '';
  dischargeRecommendations.value = '';
  dischargeConclusion.value = '';
  dischargeFormError.hidden = true;
  dischargeFormError.textContent = '';
}

function openDischargeModal(soldierId) {
  const p = allPatients.find((x) => String(x.soldier_id) === String(soldierId));
  if (!p) return;
  pendingDischargePatient = p;
  dischargeModalName.textContent = p.full_name;
  resetDischargeForm();
  dischargeModal.hidden = false;
}

function closeDischargeModal() {
  dischargeModal.hidden = true;
  pendingDischargePatient = null;
  dischargeConfirmBtn.disabled = false;
  dischargeConfirmBtn.textContent = t('dischargeConfirm');
}

function closePdfModal() {
  pdfModal.hidden = true;
  pendingPdfPayload = null;
  pdfRenderRoot.replaceChildren();
  pdfModalText.textContent = t('pdfModalText');
  pdfDownloadBtn.disabled = false;
}

function buildPdfDom(payload) {
  pdfRenderRoot.replaceChildren();
  const doc = document.createElement('div');
  doc.className = 'pdf-doc';

  const header = document.createElement('header');
  header.className = 'pdf-doc-header';
  const brand = document.createElement('p');
  brand.className = 'pdf-doc-brand';
  brand.textContent = t('pdfBrand');
  const title = document.createElement('h1');
  title.className = 'pdf-doc-title';
  title.textContent = t('pdfDocTitle');
  const sub = document.createElement('p');
  sub.className = 'pdf-doc-subtitle';
  sub.textContent = t('pdfDocSubtitle');
  header.append(brand, title, sub);
  doc.appendChild(header);

  const blockTitle = document.createElement('p');
  blockTitle.className = 'pdf-block-title';
  blockTitle.textContent = t('pdfPatientBlockTitle');
  doc.appendChild(blockTitle);

  const grid = document.createElement('div');
  grid.className = 'pdf-patient-grid';

  function labelText(key) {
    return t(key).replace(/:\s*$/, '');
  }

  function addPatientRow(labelKey, value) {
    const row = document.createElement('div');
    row.className = 'pdf-patient-row';
    const lab = document.createElement('div');
    lab.className = 'pdf-patient-label';
    lab.textContent = labelText(labelKey);
    const val = document.createElement('div');
    val.className = 'pdf-patient-val';
    val.textContent = value;
    row.append(lab, val);
    grid.appendChild(row);
  }

  addPatientRow('pdfLabelFullName', payload.full_name);
  addPatientRow('pdfLabelRank', payload.rank);
  addPatientRow('pdfLabelBirth', payload.birth_date);
  addPatientRow('pdfLabelIot', payload.iot_serial);
  addPatientRow('pdfLabelDischargeDate', formatPdfDischargeDate(payload.discharge_date));
  addPatientRow('pdfLabelLatestDiagnosis', formatLatestDiagnosisPdfValue(payload.latest_diagnosis_line));
  doc.appendChild(grid);

  function addSection(titleKey, text) {
    const sec = document.createElement('div');
    sec.className = 'pdf-section';
    const head = document.createElement('div');
    head.className = 'pdf-section__title';
    head.textContent = t(titleKey);
    const body = document.createElement('div');
    body.className = 'pdf-section__body';
    body.textContent = text;
    sec.append(head, body);
    doc.appendChild(sec);
  }

  addSection('pdfLabelCourse', payload.course);
  addSection('pdfLabelTreatment', payload.treatment);
  addSection('pdfLabelRecommendations', payload.recommendations);
  addSection('pdfLabelConclusion', payload.conclusion);

  const foot = document.createElement('div');
  foot.className = 'pdf-footer';
  foot.textContent = t('pdfFooterNote');
  doc.appendChild(foot);

  pdfRenderRoot.appendChild(doc);
}

async function runPdfDownload() {
  if (!pendingPdfPayload || !window.jspdf || !window.html2canvas) return;
  const { jsPDF } = window.jspdf;
  buildPdfDom(pendingPdfPayload);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const canvas = await window.html2canvas(pdfRenderRoot, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const imgData = canvas.toDataURL('image/png');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let imgWidth = pageWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;
  if (imgHeight > pageHeight) {
    imgHeight = pageHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }
  const x = (pageWidth - imgWidth) / 2;
  pdf.addImage(imgData, 'PNG', x, 0, imgWidth, imgHeight);
  let safe = pendingPdfPayload.full_name.trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_');
  if (!safe) safe = 'patient';
  safe = safe.slice(0, 60);
  pdf.save(`Виписка_${safe}_${pendingPdfPayload.discharge_date}.pdf`);
}

dischargeCancelBtn.addEventListener('click', () => {
  closeDischargeModal();
});

dischargeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!pendingDischargePatient) return;

  const dateVal = dischargeDate.value;
  const course = dischargeCourse.value.trim();
  const treatment = dischargeTreatment.value.trim();
  const recommendations = dischargeRecommendations.value.trim();
  const conclusion = dischargeConclusion.value.trim();

  if (!dateVal || !course || !treatment || !recommendations || !conclusion) {
    dischargeFormError.textContent = t('dischargeFillAll');
    dischargeFormError.hidden = false;
    return;
  }

  dischargeFormError.hidden = true;
  dischargeConfirmBtn.disabled = true;
  dischargeConfirmBtn.textContent = t('dischargeConfirmWait');

  const p = pendingDischargePatient;
  const soldierIdNum = parseInt(String(p.soldier_id), 10);

  try {
    let latestDiagnosisLine = '';
    const diagRes = await apiFetch(`/hospitals/diagnoses/${soldierIdNum}`);
    if (diagRes && diagRes.ok) {
      const diagList = await diagRes.json().catch(() => []);
      if (Array.isArray(diagList) && diagList.length > 0 && diagList[0].diagnosis_text) {
        latestDiagnosisLine = String(diagList[0].diagnosis_text).trim();
      }
    }

    const res = await apiFetch('/hospitals/discharge_patient', {
      method: 'POST',
      body: JSON.stringify({ soldier_id: soldierIdNum }),
    });

    if (!res) {
      dischargeConfirmBtn.disabled = false;
      dischargeConfirmBtn.textContent = t('dischargeConfirm');
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      dischargeFormError.textContent = data.detail || t('dischargeErrorGeneric');
      dischargeFormError.hidden = false;
      dischargeConfirmBtn.disabled = false;
      dischargeConfirmBtn.textContent = t('dischargeConfirm');
      return;
    }

    pendingPdfPayload = {
      full_name: p.full_name,
      rank: p.rank,
      birth_date: p.birth_date,
      iot_serial: p.iot_serial,
      discharge_date: dateVal,
      latest_diagnosis_line: latestDiagnosisLine,
      course,
      treatment,
      recommendations,
      conclusion,
    };

    dischargeModal.hidden = true;
    pendingDischargePatient = null;
    dischargeConfirmBtn.disabled = false;
    dischargeConfirmBtn.textContent = t('dischargeConfirm');
    resetDischargeForm();

    await loadPatients();

    pdfModal.hidden = false;
  } catch (err) {
    dischargeFormError.textContent = t('dischargeErrorGeneric');
    dischargeFormError.hidden = false;
    dischargeConfirmBtn.disabled = false;
    dischargeConfirmBtn.textContent = t('dischargeConfirm');
  }
});

pdfModalCloseBtn.addEventListener('click', closePdfModal);

pdfDownloadBtn.addEventListener('click', async () => {
  if (!window.jspdf || !window.html2canvas) {
    pdfModalText.textContent = t('pdfErrorLibs');
    return;
  }
  pdfDownloadBtn.disabled = true;
  try {
    await runPdfDownload();
  } catch (err) {
    pdfModalText.textContent = t('pdfErrorCreate');
  } finally {
    pdfDownloadBtn.disabled = false;
  }
});

patientsList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || !patientsList.contains(btn)) return;
  const card = btn.closest('.patient-card');
  if (!card || !patientsList.contains(card)) return;
  const id = card.dataset.id;
  const name = card.dataset.name;

  if (btn.dataset.action === 'diagnoses') {
    window.location.href = `../diagnoses/index.html?soldier_id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
  }
  if (btn.dataset.action === 'discharge') openDischargeModal(id);
});

applyLang();
loadPatients();
