const TRANSLATIONS = {
  uk: {
    pageTitle: 'VARTA — Підрозділ',
    topbarTitle: 'Генеральний штаб',
    backToList: 'До списку',
    unitDetailSectionSoldiers: 'Військовослужбовці',
    unitDetailSectionPoints: 'Точки евакуації',
    unitDetailEmptySoldiers: 'Немає записів',
    unitDetailEmptyPoints: 'Немає точок',
    invalidUnitId: 'Некоректний ідентифікатор підрозділу',
    errorRequest: 'Помилка запиту',
    brandSuffix: 'VARTA',
    forceTotalSoldiers: 'Усього військових',
    forceInHospital: 'У госпіталі',
    forceNotInHospital: 'Не в госпіталі',
    soldierStatusGood: 'Норма',
    soldierStatusWarning: 'Увага',
    soldierStatusCritical: 'Критично',
    soldierStatusHospital: 'На лікуванні',
    soldierStatusNodata: 'Немає даних',
    metricTempShort: 'Т.',
    metricHrShort: 'ЧСС',
    metricBatShort: 'Ак.',
  },
  en: {
    pageTitle: 'VARTA — Unit',
    topbarTitle: 'General Staff',
    backToList: 'Back to list',
    unitDetailSectionSoldiers: 'Personnel',
    unitDetailSectionPoints: 'Evacuation points',
    unitDetailEmptySoldiers: 'No records',
    unitDetailEmptyPoints: 'No points',
    invalidUnitId: 'Invalid unit id',
    errorRequest: 'Request error',
    brandSuffix: 'VARTA',
    forceTotalSoldiers: 'Total personnel',
    forceInHospital: 'In hospital',
    forceNotInHospital: 'Not in hospital',
    soldierStatusGood: 'Normal',
    soldierStatusWarning: 'Warning',
    soldierStatusCritical: 'Critical',
    soldierStatusHospital: 'In treatment',
    soldierStatusNodata: 'No data',
    metricTempShort: 'T.',
    metricHrShort: 'HR',
    metricBatShort: 'Bat.',
  },
};

if (!getToken() || getRole() !== 'headquarters') {
  window.location.href = '../../login/index.html';
}

let lang = vartaLang.get();

function t(key) {
  return TRANSLATIONS[lang][key];
}

function documentTitleForUnit(name) {
  if (lang === 'uk') return `${name} — Підрозділ | ${t('brandSuffix')}`;
  return `${name} — Unit | ${t('brandSuffix')}`;
}

const topbarTitle = document.getElementById('topbarTitle');
const backText = document.getElementById('backText');
const pageErr = document.getElementById('pageErr');
const pageContent = document.getElementById('pageContent');
const unitTitle = document.getElementById('unitTitle');
const unitDetailSummary = document.getElementById('unitDetailSummary');
const unitDetailSoldiersHeading = document.getElementById('unitDetailSoldiersHeading');
const unitDetailSoldiers = document.getElementById('unitDetailSoldiers');
const unitDetailPointsHeading = document.getElementById('unitDetailPointsHeading');
const unitDetailPoints = document.getElementById('unitDetailPoints');

let lastSummary = null;
let lastSoldiers = null;
let lastPoints = null;
let unitDetailLoading = false;

const STAT_PLACEHOLDER = '—';

function formatApiDetail(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .join('; ');
  }
  return t('errorRequest');
}

async function readError(res) {
  try {
    const data = await res.json();
    return formatApiDetail(data.detail) || t('errorRequest');
  } catch {
    return t('errorRequest');
  }
}

function soldierStatusLabel(status) {
  if (status === 'Good') return t('soldierStatusGood');
  if (status === 'Warning') return t('soldierStatusWarning');
  if (status === 'Critical') return t('soldierStatusCritical');
  if (status === 'На лікуванні') return t('soldierStatusHospital');
  return t('soldierStatusNodata');
}

function soldierStatusClass(status) {
  if (status === 'Good') return 'good';
  if (status === 'Warning') return 'warning';
  if (status === 'Critical') return 'critical';
  if (status === 'На лікуванні') return 'hospital';
  return 'nodata';
}

function renderUnitDetailSummaryPlaceholder() {
  unitDetailSummary.innerHTML = '';
  const items = [
    { v: STAT_PLACEHOLDER, l: t('forceTotalSoldiers'), mod: 'total' },
    { v: `${STAT_PLACEHOLDER} (${STAT_PLACEHOLDER}%)`, l: t('forceInHospital'), mod: 'hospital' },
    { v: `${STAT_PLACEHOLDER} (${STAT_PLACEHOLDER}%)`, l: t('forceNotInHospital'), mod: 'field' },
  ];
  for (const it of items) {
    const el = document.createElement('div');
    el.className = `unit-detail__stat unit-detail__stat--${it.mod}`;
    el.innerHTML = '<span class="unit-detail__stat-value"></span><span class="unit-detail__stat-label"></span>';
    el.querySelector('.unit-detail__stat-value').textContent = it.v;
    el.querySelector('.unit-detail__stat-label').textContent = it.l;
    unitDetailSummary.appendChild(el);
  }
}

const PANEL_SKELETON_COUNT = 3;

function renderPanelSkeletonList(container) {
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'skeleton-list unit-detail__skeleton-list';
  for (let i = 0; i < PANEL_SKELETON_COUNT; i += 1) {
    list.appendChild(document.createElement('div')).className = 'skeleton-card';
  }
  container.appendChild(list);
}

function renderUnitDetailSummary(s) {
  unitDetailSummary.innerHTML = '';
  const items = [
    { v: String(s.total_soldiers), l: t('forceTotalSoldiers'), mod: 'total' },
    {
      v: `${s.soldiers_in_hospital} (${s.soldiers_in_hospital_percent}%)`,
      l: t('forceInHospital'),
      mod: 'hospital',
    },
    {
      v: `${s.soldiers_not_in_hospital} (${s.soldiers_not_in_hospital_percent}%)`,
      l: t('forceNotInHospital'),
      mod: 'field',
    },
  ];
  for (const it of items) {
    const el = document.createElement('div');
    el.className = `unit-detail__stat unit-detail__stat--${it.mod}`;
    el.innerHTML = '<span class="unit-detail__stat-value"></span><span class="unit-detail__stat-label"></span>';
    el.querySelector('.unit-detail__stat-value').textContent = it.v;
    el.querySelector('.unit-detail__stat-label').textContent = it.l;
    unitDetailSummary.appendChild(el);
  }
}

function renderUnitDetailSoldiers(list) {
  unitDetailSoldiers.innerHTML = '';
  if (!list.length) {
    const row = document.createElement('div');
    row.className = 'unit-detail__row';
    row.textContent = t('unitDetailEmptySoldiers');
    unitDetailSoldiers.appendChild(row);
    return;
  }
  for (const s of list) {
    const row = document.createElement('div');
    row.className = `unit-detail__row unit-detail__row--soldier unit-detail__row--${soldierStatusClass(s.status)}`;
    let metricsLine = '';
    if (s.metrics) {
      const m = s.metrics;
      metricsLine = ` · ${t('metricTempShort')} ${Number(m.temperature).toFixed(1)}°C · ${t('metricHrShort')} ${m.heart_rate} · ${t('metricBatShort')} ${m.battery_percent}%`;
    }
    row.innerHTML = `
      <div class="unit-detail__row-name"></div>
      <div class="unit-detail__row-meta"></div>
    `;
    row.querySelector('.unit-detail__row-name').textContent = s.full_name;
    const meta = `${s.rank} · ${s.birth_date} · IoT: ${s.iot_serial} · ${soldierStatusLabel(s.status)}${s.coordinates ? ` · GPS: ${s.coordinates}` : ''}${metricsLine}`;
    row.querySelector('.unit-detail__row-meta').textContent = meta;
    unitDetailSoldiers.appendChild(row);
  }
}

function renderUnitDetailPoints(list) {
  unitDetailPoints.innerHTML = '';
  if (!list.length) {
    const row = document.createElement('div');
    row.className = 'unit-detail__row';
    row.textContent = t('unitDetailEmptyPoints');
    unitDetailPoints.appendChild(row);
    return;
  }
  for (const p of list) {
    const row = document.createElement('div');
    row.className = 'unit-detail__row unit-detail__row--point';
    const desc = p.description ? ` — ${p.description}` : '';
    row.innerHTML = '<div class="unit-detail__row-name"></div><div class="unit-detail__row-meta"></div>';
    row.querySelector('.unit-detail__row-name').textContent = p.name;
    row.querySelector('.unit-detail__row-meta').textContent = `${p.coordinates}${desc}`;
    unitDetailPoints.appendChild(row);
  }
}

function applyStaticLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  topbarTitle.textContent = t('topbarTitle');
  backText.textContent = t('backToList');
  unitDetailSoldiersHeading.textContent = t('unitDetailSectionSoldiers');
  unitDetailPointsHeading.textContent = t('unitDetailSectionPoints');

  document.querySelectorAll('.lang-switcher__btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (lastSummary) {
    unitTitle.textContent = lastSummary.army_unit_name;
    document.title = documentTitleForUnit(lastSummary.army_unit_name);
    renderUnitDetailSummary(lastSummary);
    renderUnitDetailSoldiers(lastSoldiers || []);
    renderUnitDetailPoints(lastPoints || []);
  } else if (unitDetailLoading) {
    unitTitle.textContent = STAT_PLACEHOLDER;
    document.title = t('pageTitle');
    renderUnitDetailSummaryPlaceholder();
    renderPanelSkeletonList(unitDetailSoldiers);
    renderPanelSkeletonList(unitDetailPoints);
  }
}

function failUnitLoadMessage(msg) {
  lastSummary = null;
  lastSoldiers = null;
  lastPoints = null;
  unitDetailLoading = false;
  pageContent.hidden = true;
  pageErr.textContent = msg;
  pageErr.hidden = false;
}

async function loadUnit(unitId) {
  pageErr.hidden = true;
  pageContent.hidden = false;
  unitDetailLoading = true;
  unitTitle.textContent = STAT_PLACEHOLDER;
  renderUnitDetailSummaryPlaceholder();
  renderPanelSkeletonList(unitDetailSoldiers);
  renderPanelSkeletonList(unitDetailPoints);

  try {
    const r1 = await apiFetch(`/headquarters/army_units/${unitId}/summary`);
    if (!r1) {
      failUnitLoadMessage(t('errorRequest'));
      return;
    }
    const r2 = await apiFetch(`/headquarters/army_units/${unitId}/soldiers`);
    if (!r2) {
      failUnitLoadMessage(t('errorRequest'));
      return;
    }
    const r3 = await apiFetch(`/headquarters/army_units/${unitId}/evacuation_points`);
    if (!r3) {
      failUnitLoadMessage(t('errorRequest'));
      return;
    }

    if (!r1.ok) throw new Error(await readError(r1));
    if (!r2.ok) throw new Error(await readError(r2));
    if (!r3.ok) throw new Error(await readError(r3));

    const summary = await r1.json();
    const soldiers = await r2.json();
    const points = await r3.json();

    lastSummary = summary;
    lastSoldiers = Array.isArray(soldiers) ? soldiers : [];
    lastPoints = Array.isArray(points) ? points : [];

    unitTitle.textContent = summary.army_unit_name;
    document.title = documentTitleForUnit(summary.army_unit_name);
    renderUnitDetailSummary(lastSummary);
    renderUnitDetailSoldiers(lastSoldiers);
    renderUnitDetailPoints(lastPoints);

    unitDetailLoading = false;
  } catch (e) {
    failUnitLoadMessage(e.message || t('errorRequest'));
  }
}

function parseUnitId() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('id');
  if (raw == null || !/^\d+$/.test(raw.trim())) return null;
  const id = parseInt(raw, 10);
  if (id < 1) return null;
  return id;
}

window.addEventListener('varta:langchange', (e) => {
  lang = e.detail.lang;
  applyStaticLang();
});

document.querySelectorAll('.lang-switcher__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    vartaLang.set(btn.dataset.lang);
  });
});

applyStaticLang();

const unitId = parseUnitId();
if (unitId == null) {
  pageErr.textContent = t('invalidUnitId');
  pageErr.hidden = false;
} else {
  loadUnit(unitId);
}
