if (!getToken() || getRole() !== 'headquarters') {
  window.location.href = '../../login/index.html';
}

const MAP_ASSETS = '../../../assets/map/';
const ZOOM_MIN = 5;
const ZOOM_MAX = 19;
const ICON_PX_MIN = 16;
const ICON_PX_MAX = 52;

const ukraineBounds = L.latLngBounds([44.2, 22.1], [52.4, 40.3]);

const map = L.map('map', {
  minZoom: 5,
  maxBounds: ukraineBounds.pad(0.12),
}).fitBounds(ukraineBounds);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const IMAGE_TYPE_URL = {
  Штаб: `${MAP_ASSETS}headquarters.webp`,
  Підрозділ: `${MAP_ASSETS}unit.webp`,
  'Точка евакуації': `${MAP_ASSETS}evacuation.webp`,
  Госпіталь: `${MAP_ASSETS}hospital.webp`,
};

const POPUP_OPTS = { maxWidth: 320, className: 'map-popup-theme', autoPanPadding: [16, 16] };

const markerRegistry = [];

function iconSizeForZoom(zoom) {
  const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
  const t = (z - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN);
  return Math.round(ICON_PX_MIN + t * (ICON_PX_MAX - ICON_PX_MIN));
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
    appendRow(root, 'Тип', 'Підрозділ');
    if (full) {
      appendRow(root, 'Email', full.email);
      appendRow(root, 'Координати', full.coordinates);
      appendRow(root, 'Створено', formatDateTime(full.created_at));
    } else {
      appendRow(root, 'Координати', item.coordinates);
    }
    return root;
  }

  if (item.type === 'Госпіталь') {
    const full = hospitalsById.get(item.id);
    appendRow(root, 'Тип', 'Госпіталь');
    if (full) {
      appendRow(root, 'Email', full.email);
      appendRow(root, 'Адреса', full.address);
      appendRow(
        root,
        'Місць',
        full.capacity_total != null ? `${full.capacity_total} місць` : '',
      );
      appendRow(root, 'Координати', full.coordinates);
      appendRow(root, 'Створено', formatDateTime(full.created_at));
    } else {
      appendRow(root, 'Координати', item.coordinates);
    }
    return root;
  }

  appendRow(root, 'Тип', item.type || '');
  appendRow(root, 'Координати', item.coordinates);
  return root;
}

async function loadInfrastructure() {
  const errEl = document.getElementById('mapError');
  errEl.hidden = true;

  const [infRes, unitsRes, hospRes] = await Promise.all([
    apiFetch('/headquarters/infrastructure'),
    apiFetch('/headquarters/army_units'),
    apiFetch('/headquarters/hospitals'),
  ]);

  if (!infRes || !infRes.ok) {
    errEl.textContent = 'Не вдалося завантажити точки інфраструктури';
    errEl.hidden = false;
    return;
  }

  let data;
  try {
    data = await infRes.json();
  } catch {
    errEl.textContent = 'Не вдалося обробити відповідь сервера';
    errEl.hidden = false;
    return;
  }

  if (!Array.isArray(data)) {
    errEl.textContent = 'Некоректні дані інфраструктури';
    errEl.hidden = false;
    return;
  }

  const unitsById = new Map();
  if (unitsRes && unitsRes.ok) {
    try {
      const units = await unitsRes.json();
      if (Array.isArray(units)) {
        for (const u of units) {
          if (u && typeof u.id === 'number') unitsById.set(u.id, u);
        }
      }
    } catch {}
  }

  const hospitalsById = new Map();
  if (hospRes && hospRes.ok) {
    try {
      const list = await hospRes.json();
      if (Array.isArray(list)) {
        for (const h of list) {
          if (h && typeof h.id === 'number') hospitalsById.set(h.id, h);
        }
      }
    } catch {}
  }

  markerRegistry.length = 0;
  for (const item of data) {
    const ll = parseCoordinates(item.coordinates);
    if (!ll) continue;
    const icon = iconForItemAtZoom(item, map.getZoom());
    if (!icon) continue;
    const popupEl = buildPopupEl(item, unitsById, hospitalsById);
    const marker = L.marker(ll, { icon }).bindPopup(popupEl, POPUP_OPTS);
    marker.addTo(map);
    markerRegistry.push({ marker, item });
  }

  syncMarkerSizes();
}

loadInfrastructure();
