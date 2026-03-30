const TRANSLATIONS = {
  uk: {
    pageTitle: 'VARTA — Генеральний штаб',
    topbarTitle: 'Генеральний штаб',
    logout: 'Вийти',
    tabUnits: 'Підрозділи',
    tabHospitals: 'Госпіталі',
    tabMap: 'Мапа',
    addUnit: 'Додати підрозділ',
    addHospital: 'Додати госпіталь',
    unitsEmpty: 'Немає підрозділів',
    hospitalsEmpty: 'Немає госпіталів',
    cardEdit: 'Редагувати',
    cardDelete: 'Видалити',
    formAddUnit: 'Новий підрозділ',
    formAddHospital: 'Новий госпіталь',
    formEditUnit: 'Редагувати підрозділ',
    formEditHospital: 'Редагувати госпіталь',
    labelFieldName: 'Назва (мін. 6 символів)',
    labelFieldEmail: 'Email',
    fieldPasswordLabelAdd: 'Пароль (мін. 6 символів)',
    fieldPasswordLabelEdit: 'Новий пароль',
    passwordHint: 'Залиште порожнім, якщо не змінюєте пароль',
    labelFieldCoords: 'Координати (широта, довгота)',
    labelFieldAddress: 'Адреса (мін. 6 символів)',
    labelFieldCapacity: 'Місць (мін. 10)',
    formCancel: 'Скасувати',
    formSave: 'Зберегти',
    deleteTitle: 'Видалити',
    deleteUnit: 'підрозділ',
    deleteHospital: 'госпіталь',
    deleteSure: 'Ви впевнені, що хочете видалити',
    deleteCancel: 'Скасувати',
    deleteConfirm: 'Видалити',
    showPassword: 'Показати пароль',
    hidePassword: 'Приховати пароль',
    errorRequest: 'Помилка запиту',
    hospitalCapacity: 'місць',
    nameMinErr: 'Назва має містити щонайменше 6 символів',
    emailErr: 'Вкажіть коректний email',
    coordsErr: "Некоректний формат координат. Використовуйте формат: 'широта, довгота', наприклад '49.9935, 36.2304'",
    passwordAddErr: 'Пароль має містити щонайменше 6 символів',
    passwordEditErr: 'Новий пароль має містити щонайменше 6 символів',
    addressMinErr: 'Адреса має містити щонайменше 6 символів',
    capacityErr: 'Мінімальна кількість місць у госпіталі — 10',
  },
  en: {
    pageTitle: 'VARTA — General Staff',
    topbarTitle: 'General Staff',
    logout: 'Logout',
    tabUnits: 'Units',
    tabHospitals: 'Hospitals',
    tabMap: 'Map',
    addUnit: 'Add Unit',
    addHospital: 'Add Hospital',
    unitsEmpty: 'No units',
    hospitalsEmpty: 'No hospitals',
    cardEdit: 'Edit',
    cardDelete: 'Delete',
    formAddUnit: 'New Unit',
    formAddHospital: 'New Hospital',
    formEditUnit: 'Edit Unit',
    formEditHospital: 'Edit Hospital',
    labelFieldName: 'Name (min 6 chars)',
    labelFieldEmail: 'Email',
    fieldPasswordLabelAdd: 'Password (min 6 chars)',
    fieldPasswordLabelEdit: 'New Password',
    passwordHint: 'Leave blank if not changing password',
    labelFieldCoords: 'Coordinates (lat, lon)',
    labelFieldAddress: 'Address (min 6 chars)',
    labelFieldCapacity: 'Capacity (min 10)',
    formCancel: 'Cancel',
    formSave: 'Save',
    deleteTitle: 'Delete',
    deleteUnit: 'unit',
    deleteHospital: 'hospital',
    deleteSure: 'Are you sure you want to delete',
    deleteCancel: 'Cancel',
    deleteConfirm: 'Delete',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    errorRequest: 'Request error',
    hospitalCapacity: 'beds',
    nameMinErr: 'Name must be at least 6 characters',
    emailErr: 'Enter a valid email',
    coordsErr: "Invalid coordinates format. Use: 'lat, lon', e.g. '49.9935, 36.2304'",
    passwordAddErr: 'Password must be at least 6 characters',
    passwordEditErr: 'New password must be at least 6 characters',
    addressMinErr: 'Address must be at least 6 characters',
    capacityErr: 'Minimum hospital capacity is 10',
  },
};

if (!getToken() || getRole() !== 'headquarters') {
  window.location.href = '../login/index.html';
}

let lang = vartaLang.get();

function t(key) { return TRANSLATIONS[lang][key]; }

const tabUnits          = document.getElementById('tabUnits');
const tabHospitals      = document.getElementById('tabHospitals');
const addBtn            = document.getElementById('addBtn');
const panelUnits        = document.getElementById('panelUnits');
const panelHospitals    = document.getElementById('panelHospitals');
const unitsList         = document.getElementById('unitsList');
const hospitalsList     = document.getElementById('hospitalsList');
const unitsSkeleton     = document.getElementById('unitsSkeleton');
const hospitalsSkeleton = document.getElementById('hospitalsSkeleton');
const unitsEmpty        = document.getElementById('unitsEmpty');
const hospitalsEmpty    = document.getElementById('hospitalsEmpty');
const listError         = document.getElementById('listError');

const formModal             = document.getElementById('formModal');
const formModalTitle        = document.getElementById('formModalTitle');
const entityForm            = document.getElementById('entityForm');
const fieldName             = document.getElementById('fieldName');
const fieldEmail            = document.getElementById('fieldEmail');
const fieldPassword         = document.getElementById('fieldPassword');
const fieldPasswordLabel    = document.getElementById('fieldPasswordLabel');
const passwordHint          = document.getElementById('passwordHint');
const fieldCoordinates      = document.getElementById('fieldCoordinates');
const fieldAddressWrap      = document.getElementById('fieldAddressWrap');
const fieldAddress          = document.getElementById('fieldAddress');
const fieldCapacityWrap     = document.getElementById('fieldCapacityWrap');
const fieldCapacity         = document.getElementById('fieldCapacity');
const formError             = document.getElementById('formError');
const formCancelBtn         = document.getElementById('formCancelBtn');
const formSubmitBtn         = document.getElementById('formSubmitBtn');
const toggleFieldPassword   = document.getElementById('toggleFieldPassword');
const fieldPasswordIconEye    = document.getElementById('fieldPasswordIconEye');
const fieldPasswordIconEyeOff = document.getElementById('fieldPasswordIconEyeOff');

const deleteModal     = document.getElementById('deleteModal');
const deleteModalText = document.getElementById('deleteModalText');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

document.getElementById('logoutBtn').addEventListener('click', logout);

let activeTab       = 'units';
let formMode        = 'add';
let formEntity      = 'unit';
let editingId       = null;
let deleteTarget    = null;
let unitsLoaded     = false;
let hospitalsLoaded = false;
let unitsCache      = [];
let hospitalsCache  = [];

const MIN_STR_LEN           = 6;
const MIN_PASSWORD_LEN      = 6;
const MIN_HOSPITAL_CAPACITY = 10;

function isValidCoordinates(s) {
  const segments = s.split(',');
  if (segments.length !== 2) return false;
  const lat = parseFloat(segments[0].trim());
  const lon = parseFloat(segments[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

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

function resetPasswordFieldVisibility() {
  fieldPassword.type = 'password';
  fieldPasswordIconEye.style.display = 'none';
  fieldPasswordIconEyeOff.style.display = 'block';
  toggleFieldPassword.setAttribute('aria-label', t('showPassword'));
}

toggleFieldPassword.addEventListener('click', () => {
  const isPassword = fieldPassword.type === 'password';
  fieldPassword.type = isPassword ? 'text' : 'password';
  fieldPasswordIconEye.style.display = isPassword ? 'block' : 'none';
  fieldPasswordIconEyeOff.style.display = isPassword ? 'none' : 'block';
  toggleFieldPassword.setAttribute('aria-label', t(isPassword ? 'hidePassword' : 'showPassword'));
});

function setTabUi() {
  const isUnits = activeTab === 'units';
  tabUnits.classList.toggle('active', isUnits);
  tabHospitals.classList.toggle('active', !isUnits);
  tabUnits.setAttribute('aria-selected', isUnits);
  tabHospitals.setAttribute('aria-selected', !isUnits);
  panelUnits.hidden = !isUnits;
  panelHospitals.hidden = isUnits;
  addBtn.textContent = isUnits ? t('addUnit') : t('addHospital');
}

function switchTab(tab) {
  activeTab = tab;
  setTabUi();
  listError.hidden = true;
  if (tab === 'units' && !unitsLoaded) loadUnits();
  if (tab === 'hospitals' && !hospitalsLoaded) loadHospitals();
}

tabUnits.addEventListener('click', () => switchTab('units'));
tabHospitals.addEventListener('click', () => switchTab('hospitals'));

function showListError(msg) {
  listError.textContent = msg;
  listError.hidden = false;
}

function renderUnitCard(u) {
  const card = document.createElement('article');
  card.className = 'entity-card';
  card.innerHTML = `
    <div class="entity-card__body">
      <h2 class="entity-card__title"></h2>
      <p class="entity-card__meta"></p>
    </div>
    <div class="entity-card__actions">
      <button type="button" class="entity-card__btn entity-card__btn--edit" data-action="edit">${t('cardEdit')}</button>
      <button type="button" class="entity-card__btn entity-card__btn--delete" data-action="delete">${t('cardDelete')}</button>
    </div>
  `;
  card.querySelector('.entity-card__title').textContent = u.name;
  const metaEl = card.querySelector('.entity-card__meta');
  metaEl.append(document.createTextNode(u.email));
  metaEl.append(document.createElement('br'));
  metaEl.append(document.createTextNode(u.coordinates));

  card.querySelector('[data-action="edit"]').addEventListener('click', () => openFormEdit('unit', u));
  card.querySelector('[data-action="delete"]').addEventListener('click', () =>
    openDeleteModal({ kind: 'unit', id: u.id, name: u.name }),
  );
  return card;
}

function renderHospitalCard(h) {
  const card = document.createElement('article');
  card.className = 'entity-card';
  card.innerHTML = `
    <div class="entity-card__body">
      <h2 class="entity-card__title"></h2>
      <p class="entity-card__meta"></p>
    </div>
    <div class="entity-card__actions">
      <button type="button" class="entity-card__btn entity-card__btn--edit" data-action="edit">${t('cardEdit')}</button>
      <button type="button" class="entity-card__btn entity-card__btn--delete" data-action="delete">${t('cardDelete')}</button>
    </div>
  `;
  card.querySelector('.entity-card__title').textContent = h.name;
  const metaEl = card.querySelector('.entity-card__meta');
  metaEl.innerHTML = '';
  metaEl.append(document.createTextNode(h.email));
  metaEl.append(document.createElement('br'));
  metaEl.append(document.createTextNode(h.address));
  metaEl.append(document.createElement('br'));
  metaEl.append(document.createTextNode(`${h.capacity_total} ${t('hospitalCapacity')}`));
  metaEl.append(document.createElement('br'));
  metaEl.append(document.createTextNode(h.coordinates));

  card.querySelector('[data-action="edit"]').addEventListener('click', () => openFormEdit('hospital', h));
  card.querySelector('[data-action="delete"]').addEventListener('click', () =>
    openDeleteModal({ kind: 'hospital', id: h.id, name: h.name }),
  );
  return card;
}

function renderUnits() {
  unitsList.querySelectorAll('.entity-card').forEach((el) => el.remove());
  if (!unitsCache.length) {
    unitsEmpty.hidden = false;
    return;
  }
  unitsEmpty.hidden = true;
  for (const u of unitsCache) {
    unitsList.appendChild(renderUnitCard(u));
  }
}

function renderHospitals() {
  hospitalsList.querySelectorAll('.entity-card').forEach((el) => el.remove());
  if (!hospitalsCache.length) {
    hospitalsEmpty.hidden = false;
    return;
  }
  hospitalsEmpty.hidden = true;
  for (const h of hospitalsCache) {
    hospitalsList.appendChild(renderHospitalCard(h));
  }
}

async function loadUnits() {
  listError.hidden = true;
  const showSkeleton = !unitsLoaded;
  if (showSkeleton) {
    unitsList.querySelectorAll('.entity-card').forEach((el) => el.remove());
    unitsSkeleton.hidden = false;
    unitsEmpty.hidden = true;
  }
  const res = await apiFetch('/headquarters/army_units');
  if (!res) {
    unitsSkeleton.hidden = true;
    return;
  }
  unitsSkeleton.hidden = true;
  if (!res.ok) {
    showListError(await readError(res));
    return;
  }
  unitsCache = await res.json();
  unitsLoaded = true;
  renderUnits();
}

async function loadHospitals() {
  listError.hidden = true;
  const showSkeleton = !hospitalsLoaded;
  if (showSkeleton) {
    hospitalsList.querySelectorAll('.entity-card').forEach((el) => el.remove());
    hospitalsSkeleton.hidden = false;
    hospitalsEmpty.hidden = true;
  }
  const res = await apiFetch('/headquarters/hospitals');
  if (!res) {
    hospitalsSkeleton.hidden = true;
    return;
  }
  hospitalsSkeleton.hidden = true;
  if (!res.ok) {
    showListError(await readError(res));
    return;
  }
  hospitalsCache = await res.json();
  hospitalsLoaded = true;
  renderHospitals();
}

function applyFormLayout() {
  const isHospital = formEntity === 'hospital';
  fieldAddressWrap.hidden = !isHospital;
  fieldCapacityWrap.hidden = !isHospital;
  fieldAddress.required = isHospital && formMode === 'add';
  fieldCapacity.required = isHospital && formMode === 'add';
  if (isHospital && formMode === 'edit') {
    fieldAddress.required = true;
    fieldCapacity.required = true;
  }
  if (!isHospital) {
    fieldAddress.required = false;
    fieldCapacity.required = false;
  }
  if (formMode === 'add') {
    fieldPassword.required = true;
    fieldPasswordLabel.textContent = t('fieldPasswordLabelAdd');
    passwordHint.hidden = true;
  } else {
    fieldPassword.required = false;
    fieldPasswordLabel.textContent = t('fieldPasswordLabelEdit');
    passwordHint.hidden = false;
  }
}

function openFormAdd() {
  formMode = 'add';
  formEntity = activeTab === 'units' ? 'unit' : 'hospital';
  editingId = null;
  entityForm.reset();
  resetPasswordFieldVisibility();
  formError.hidden = true;
  applyFormLayout();
  formModalTitle.textContent = formEntity === 'unit' ? t('formAddUnit') : t('formAddHospital');
  formModal.hidden = false;
}

function openFormEdit(kind, row) {
  formMode = 'edit';
  formEntity = kind;
  editingId = row.id;
  formError.hidden = true;
  entityForm.reset();
  resetPasswordFieldVisibility();
  fieldName.value = row.name;
  fieldEmail.value = row.email;
  fieldPassword.value = '';
  fieldCoordinates.value = row.coordinates;
  if (kind === 'hospital') {
    fieldAddress.value = row.address;
    fieldCapacity.value = String(row.capacity_total);
  } else {
    fieldAddress.value = '';
    fieldCapacity.value = '';
  }
  applyFormLayout();
  formModalTitle.textContent = kind === 'unit' ? t('formEditUnit') : t('formEditHospital');
  formModal.hidden = false;
}

function closeFormModal() {
  formModal.hidden = true;
  formError.hidden = true;
}

formCancelBtn.addEventListener('click', closeFormModal);

addBtn.addEventListener('click', openFormAdd);

entityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const name         = fieldName.value.trim();
  const email        = fieldEmail.value.trim();
  const password     = fieldPassword.value;
  const coordinates  = fieldCoordinates.value.trim();
  const address      = fieldAddress.value.trim();
  const capRaw       = fieldCapacity.value;
  const capacity_total = capRaw === '' ? NaN : parseInt(capRaw, 10);

  function fail(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }

  if (name.length < MIN_STR_LEN) { fail(t('nameMinErr')); return; }

  fieldEmail.value = email;
  if (!email || !fieldEmail.checkValidity()) { fail(t('emailErr')); return; }

  if (!isValidCoordinates(coordinates)) { fail(t('coordsErr')); return; }

  if (formMode === 'add' && (!password || password.length < MIN_PASSWORD_LEN)) {
    fail(t('passwordAddErr')); return;
  }

  if (formMode === 'edit' && password.length > 0 && password.length < MIN_PASSWORD_LEN) {
    fail(t('passwordEditErr')); return;
  }

  if (formEntity === 'hospital') {
    if (address.length < MIN_STR_LEN) { fail(t('addressMinErr')); return; }
    if (!Number.isFinite(capacity_total) || !Number.isInteger(capacity_total) || capacity_total < MIN_HOSPITAL_CAPACITY) {
      fail(t('capacityErr')); return;
    }
  }

  formSubmitBtn.disabled = true;

  try {
    if (formMode === 'add') {
      if (formEntity === 'unit') {
        const res = await apiFetch('/headquarters/army_units', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, coordinates }),
        });
        if (!res) return;
        if (!res.ok) { formError.textContent = await readError(res); formError.hidden = false; return; }
        if (activeTab === 'units') await loadUnits();
      } else {
        const res = await apiFetch('/headquarters/hospitals', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, address, coordinates, capacity_total }),
        });
        if (!res) return;
        if (!res.ok) { formError.textContent = await readError(res); formError.hidden = false; return; }
        if (activeTab === 'hospitals') await loadHospitals();
      }
    } else {
      const patch = { name, email, coordinates };
      if (password) patch.password = password;
      if (formEntity === 'hospital') {
        patch.address = address;
        patch.capacity_total = capacity_total;
      }
      const path =
        formEntity === 'unit'
          ? `/headquarters/army_units/${editingId}`
          : `/headquarters/hospitals/${editingId}`;
      const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(patch) });
      if (!res) return;
      if (!res.ok) { formError.textContent = await readError(res); formError.hidden = false; return; }
      if (formEntity === 'unit') {
        await loadUnits();
      } else {
        await loadHospitals();
      }
    }
    closeFormModal();
  } finally {
    formSubmitBtn.disabled = false;
  }
});

function openDeleteModal(target) {
  deleteTarget = target;
  const kindLabel = target.kind === 'unit' ? t('deleteUnit') : t('deleteHospital');
  deleteModalText.innerHTML = `${t('deleteSure')} ${kindLabel} <strong></strong>?`;
  deleteModalText.querySelector('strong').textContent = target.name;
  deleteModal.hidden = false;
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  deleteTarget = null;
}

deleteCancelBtn.addEventListener('click', closeDeleteModal);

deleteConfirmBtn.addEventListener('click', async () => {
  if (!deleteTarget) return;
  const tgt = deleteTarget;
  deleteConfirmBtn.disabled = true;
  try {
    const path =
      tgt.kind === 'unit'
        ? `/headquarters/army_units/${tgt.id}`
        : `/headquarters/hospitals/${tgt.id}`;
    const res = await apiFetch(path, { method: 'DELETE' });
    if (!res) return;
    if (!res.ok) {
      showListError(await readError(res));
      closeDeleteModal();
      return;
    }
    closeDeleteModal();
    if (tgt.kind === 'unit') {
      await loadUnits();
    } else {
      await loadHospitals();
    }
  } finally {
    deleteConfirmBtn.disabled = false;
  }
});

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  document.getElementById('topbarTitle').textContent = t('topbarTitle');
  document.getElementById('logoutText').textContent = t('logout');
  document.getElementById('logoutBtn').title = t('logout');

  tabUnits.textContent = t('tabUnits');
  tabHospitals.textContent = t('tabHospitals');
  document.getElementById('tabMap').textContent = t('tabMap');

  unitsEmpty.textContent = t('unitsEmpty');
  hospitalsEmpty.textContent = t('hospitalsEmpty');

  document.getElementById('labelFieldName').textContent = t('labelFieldName');
  document.getElementById('labelFieldEmail').textContent = t('labelFieldEmail');
  document.getElementById('labelFieldCoords').textContent = t('labelFieldCoords');
  document.getElementById('labelFieldAddress').textContent = t('labelFieldAddress');
  document.getElementById('labelFieldCapacity').textContent = t('labelFieldCapacity');
  passwordHint.textContent = t('passwordHint');

  formCancelBtn.textContent = t('formCancel');
  formSubmitBtn.textContent = t('formSave');

  document.getElementById('deleteModalTitle').textContent = t('deleteTitle');
  deleteCancelBtn.textContent = t('deleteCancel');
  deleteConfirmBtn.textContent = t('deleteConfirm');

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  setTabUi();
  applyFormLayout();

  if (unitsLoaded) renderUnits();
  if (hospitalsLoaded) renderHospitals();
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

applyLang();
loadUnits();
