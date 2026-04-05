const TRANSLATIONS = {
  uk: {
    pageTitle: 'VARTA — Генеральний штаб',
    topbarTitle: 'Генеральний штаб',
    back: 'Назад',
    mapAriaLabel: 'Інфраструктура на мапі',
    errLoad: 'Не вдалося завантажити точки інфраструктури',
    errParse: 'Не вдалося обробити відповідь сервера',
    errInvalid: 'Некоректні дані інфраструктури',
    labelType: 'Тип',
    labelEmail: 'Email',
    labelCoords: 'Координати',
    labelCreated: 'Створено',
    labelAddress: 'Адреса',
    labelCapacity: 'Місць',
    unitBeds: 'місць',
    typeUnit: 'Підрозділ',
    typeHospital: 'Госпіталь',
    typeHQ: 'Штаб',
    typeEvac: 'Точка евакуації',
    pickConfirm: 'Обрати геолокацію',
  },
  en: {
    pageTitle: 'VARTA — General Staff',
    topbarTitle: 'General Staff',
    back: 'Back',
    mapAriaLabel: 'Infrastructure on map',
    errLoad: 'Failed to load infrastructure points',
    errParse: 'Failed to process server response',
    errInvalid: 'Invalid infrastructure data',
    labelType: 'Type',
    labelEmail: 'Email',
    labelCoords: 'Coordinates',
    labelCreated: 'Created',
    labelAddress: 'Address',
    labelCapacity: 'Capacity',
    unitBeds: 'beds',
    typeUnit: 'Unit',
    typeHospital: 'Hospital',
    typeHQ: 'Headquarters',
    typeEvac: 'Evacuation point',
    pickConfirm: 'Use this location',
  },
};

if (!getToken() || getRole() !== 'headquarters') {
  window.location.href = '../../login/index.html';
}

let lang = vartaLang.get();

function t(key) { return TRANSLATIONS[lang][key]; }

const STORAGE_FORM_DRAFT = 'varta_hq_form_draft';
const STORAGE_MAP_RESULT = 'varta_hq_map_result';

let pickModeDraft = null;
const urlWantsPick = new URLSearchParams(window.location.search).get('pick') === '1';
if (urlWantsPick) {
  try {
    const raw = sessionStorage.getItem(STORAGE_FORM_DRAFT);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && (d.formEntity === 'unit' || d.formEntity === 'hospital')) {
        pickModeDraft = d;
      }
    }
  } catch {}
}
const pickModeActive = pickModeDraft !== null;
if (urlWantsPick && !pickModeDraft) {
  const u = new URL(window.location.href);
  u.searchParams.delete('pick');
  const q = u.searchParams.toString();
  window.history.replaceState({}, '', u.pathname + (q ? `?${q}` : '') + u.hash);
}

let pickMarker = null;
let pickLatLng = null;
let pickModeInitialized = false;

const MAP_ASSETS = '../../../assets/map/';
const ZOOM_MIN   = 5;
const ZOOM_MAX   = 19;
const ICON_PX_MIN = 16;
const ICON_PX_MAX = 52;

const ukraineBounds = L.latLngBounds([44.2, 22.1], [52.4, 40.3]);

const map = L.map('map', {
  minZoom: 5,
  maxBounds: ukraineBounds.pad(0.12),
}).fitBounds(ukraineBounds);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const IMAGE_TYPE_URL = {
  'Штаб':             `${MAP_ASSETS}headquarters.webp`,
  'Підрозділ':        `${MAP_ASSETS}unit.webp`,
  'Точка евакуації':  `${MAP_ASSETS}evacuation.webp`,
  'Госпіталь':        `${MAP_ASSETS}hospital.webp`,
};

const POPUP_OPTS = { maxWidth: 320, className: 'map-popup-theme', autoPanPadding: [16, 16] };

const markerRegistry = [];

let cachedData        = null;
let cachedUnitsById   = null;
let cachedHospitalsById = null;

function iconSizeForZoom(zoom) {
  const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
  const ratio = (z - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN);
  return Math.round(ICON_PX_MIN + ratio * (ICON_PX_MAX - ICON_PX_MIN));
}

function createImageIcon(type, size) {
  const url = IMAGE_TYPE_URL[type];
  if (!url) return null;
  const ax = size / 2;
  return L.icon({
    iconUrl: url,
    iconSize: [size, size],
    iconAnchor: [ax, size],
    popupAnchor: [0, -size + Math.max(4, Math.round(size * 0.12))],
    className: 'map-marker-icon',
  });
}

function iconForItemAtZoom(item, zoom) {
  const px = iconSizeForZoom(zoom);
  return createImageIcon(item.type, px);
}

function syncMarkerSizes() {
  const z = map.getZoom();
  for (const { marker, item } of markerRegistry) {
    const icon = iconForItemAtZoom(item, z);
    if (icon) marker.setIcon(icon);
  }
  if (pickModeActive && pickMarker && pickLatLng) {
    const mapType = pickModeDraft.formEntity === 'hospital' ? 'Госпіталь' : 'Підрозділ';
    const pmIcon = createImageIcon(mapType, iconSizeForZoom(z));
    if (pmIcon) pickMarker.setIcon(pmIcon);
  }
}

let zoomRaf = null;
function onZoomThrottled() {
  if (zoomRaf != null) return;
  zoomRaf = requestAnimationFrame(() => {
    zoomRaf = null;
    syncMarkerSizes();
  });
}

map.on('zoom', onZoomThrottled);
map.on('zoomend', syncMarkerSizes);

function parseCoordinates(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const segments = raw.split(',');
  if (segments.length !== 2) return null;
  const lat = parseFloat(segments[0].trim());
  const lon = parseFloat(segments[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return [lat, lon];
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' });
}

function typeLabel(apiType) {
  if (apiType === 'Підрозділ')       return t('typeUnit');
  if (apiType === 'Госпіталь')       return t('typeHospital');
  if (apiType === 'Штаб')            return t('typeHQ');
  if (apiType === 'Точка евакуації') return t('typeEvac');
  return apiType || '';
}

function appendRow(root, label, value) {
  if (value === undefined || value === null) return;
  const s = typeof value === 'string' ? value.trim() : String(value);
  if (s === '') return;
  const row = document.createElement('div');
  row.className = 'map-popup__row';
  const lb = document.createElement('span');
  lb.className = 'map-popup__label';
  lb.textContent = label;
  const val = document.createElement('span');
  val.className = 'map-popup__value';
  val.textContent = s;
  row.appendChild(lb);
  row.appendChild(val);
  root.appendChild(row);
}

function buildPopupEl(item, unitsById, hospitalsById) {
  const root = document.createElement('div');
  root.className = 'map-popup';

  const title = document.createElement('strong');
  title.className = 'map-popup__title';
  title.textContent = item.name || '—';
  root.appendChild(title);

  if (item.type === 'Підрозділ') {
    const full = unitsById.get(item.id);
    appendRow(root, t('labelType'), t('typeUnit'));
    if (full) {
      appendRow(root, t('labelEmail'), full.email);
      appendRow(root, t('labelCoords'), full.coordinates);
      appendRow(root, t('labelCreated'), formatDateTime(full.created_at));
    } else {
      appendRow(root, t('labelCoords'), item.coordinates);
    }
    return root;
  }

  if (item.type === 'Госпіталь') {
    const full = hospitalsById.get(item.id);
    appendRow(root, t('labelType'), t('typeHospital'));
    if (full) {
      appendRow(root, t('labelEmail'), full.email);
      appendRow(root, t('labelAddress'), full.address);
      appendRow(
        root,
        t('labelCapacity'),
        full.capacity_total != null ? `${full.capacity_total} ${t('unitBeds')}` : '',
      );
      appendRow(root, t('labelCoords'), full.coordinates);
      appendRow(root, t('labelCreated'), formatDateTime(full.created_at));
    } else {
      appendRow(root, t('labelCoords'), item.coordinates);
    }
    return root;
  }

  appendRow(root, t('labelType'), typeLabel(item.type));
  appendRow(root, t('labelCoords'), item.coordinates);
  return root;
}

function renderMarkers() {
  for (const { marker } of markerRegistry) {
    marker.remove();
  }
  markerRegistry.length = 0;

  for (const item of cachedData) {
    const ll = parseCoordinates(item.coordinates);
    if (!ll) continue;
    const icon = iconForItemAtZoom(item, map.getZoom());
    if (!icon) continue;
    const popupEl = buildPopupEl(item, cachedUnitsById, cachedHospitalsById);
    const marker = L.marker(ll, {
      icon,
      opacity: pickModeActive ? 0.38 : 1,
      interactive: !pickModeActive,
    }).bindPopup(popupEl, POPUP_OPTS);
    marker.addTo(map);
    markerRegistry.push({ marker, item });
  }

  syncMarkerSizes();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.getElementById('topbarTitle').textContent = t('topbarTitle');
  document.getElementById('backText').textContent = t('back');
  document.getElementById('map').setAttribute('aria-label', t('mapAriaLabel'));

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (cachedData) renderMarkers();

  const pickBtn = document.getElementById('mapPickConfirm');
  if (pickModeActive && pickBtn) pickBtn.textContent = t('pickConfirm');
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

async function loadInfrastructure() {
  const errEl = document.getElementById('mapError');
  errEl.hidden = true;

  try {
    const [infRes, unitsRes, hospRes] = await Promise.all([
      apiFetch('/headquarters/infrastructure'),
      apiFetch('/headquarters/army_units'),
      apiFetch('/headquarters/hospitals'),
    ]);

    if (!infRes || !infRes.ok) {
      errEl.textContent = t('errLoad');
      errEl.hidden = false;
      return;
    }

    let data;
    try {
      data = await infRes.json();
    } catch {
      errEl.textContent = t('errParse');
      errEl.hidden = false;
      return;
    }

    if (!Array.isArray(data)) {
      errEl.textContent = t('errInvalid');
      errEl.hidden = false;
      return;
    }

    cachedUnitsById = new Map();
    if (unitsRes && unitsRes.ok) {
      try {
        const units = await unitsRes.json();
        if (Array.isArray(units)) {
          for (const u of units) {
            if (u && typeof u.id === 'number') cachedUnitsById.set(u.id, u);
          }
        }
      } catch {}
    }

    cachedHospitalsById = new Map();
    if (hospRes && hospRes.ok) {
      try {
        const list = await hospRes.json();
        if (Array.isArray(list)) {
          for (const h of list) {
            if (h && typeof h.id === 'number') cachedHospitalsById.set(h.id, h);
          }
        }
      } catch {}
    }

    cachedData = data;
    renderMarkers();
  } finally {
    if (pickModeActive) initCoordPickMode();
  }
}

function pickMapTypeLabel() {
  return pickModeDraft.formEntity === 'hospital' ? 'Госпіталь' : 'Підрозділ';
}

function formatCoordsEn(latlng) {
  return `${latlng.lat.toFixed(7)}, ${latlng.lng.toFixed(7)}`;
}

function placeOrMovePickMarker(latlng) {
  pickLatLng = latlng;
  const z = map.getZoom();
  const icon = createImageIcon(pickMapTypeLabel(), iconSizeForZoom(z));
  if (!icon) return;
  if (pickMarker) {
    pickMarker.setLatLng(latlng);
    pickMarker.setIcon(icon);
  } else {
    pickMarker = L.marker(latlng, { icon, zIndexOffset: 2000 }).addTo(map);
  }
  document.getElementById('mapPickBar').hidden = false;
}

function initCoordPickMode() {
  if (pickModeInitialized) return;
  pickModeInitialized = true;
  document.body.classList.add('map-page--pick-mode');
  document.getElementById('mapPickConfirm').textContent = t('pickConfirm');

  document.getElementById('backLink').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.setItem(STORAGE_MAP_RESULT, 'cancelled');
    window.location.href = '../index.html';
  });

  map.on('click', (ev) => {
    placeOrMovePickMarker(ev.latlng);
  });

  document.getElementById('mapPickConfirm').addEventListener('click', () => {
    if (!pickLatLng) return;
    const raw = sessionStorage.getItem(STORAGE_FORM_DRAFT);
    if (!raw) return;
    let draft;
    try {
      draft = JSON.parse(raw);
    } catch {
      return;
    }
    draft.coordinates = formatCoordsEn(pickLatLng);
    sessionStorage.setItem(STORAGE_FORM_DRAFT, JSON.stringify(draft));
    sessionStorage.setItem(STORAGE_MAP_RESULT, 'confirmed');
    window.location.href = '../index.html';
  });

  const existing = parseCoordinates(pickModeDraft.coordinates);
  if (existing) {
    const ll = L.latLng(existing[0], existing[1]);
    map.setView(ll, Math.max(map.getZoom(), 9));
    placeOrMovePickMarker(ll);
  }
}

applyLang();
loadInfrastructure();
