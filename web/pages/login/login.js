const TRANSLATIONS = {
  uk: {
    pageTitle: 'VARTA — Вхід',
    emailPlaceholder: 'Електронна пошта',
    passwordPlaceholder: 'Пароль',
    showPassword: 'Показати пароль',
    hidePassword: 'Приховати пароль',
    submitBtn: 'Вхід',
    loading: 'Завантаження...',
    emptyFields: 'Будь ласка, заповніть всі поля',
    wrongCredentials: 'Невірний логін або пароль',
    networkError: "Не вдалося з'єднатися з сервером. Перевірте інтернет-з'єднання.",
    supportTitle: 'Підтримка та відгуки',
  },
  en: {
    pageTitle: 'VARTA — Login',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submitBtn: 'Sign In',
    loading: 'Loading...',
    emptyFields: 'Please fill in all fields',
    wrongCredentials: 'Invalid email or password',
    networkError: 'Could not connect to the server. Check your internet connection.',
    supportTitle: 'Support & Feedback',
  },
};

const API_BASE = 'https://varta-1-wgnl.onrender.com';

let lang = vartaLang.get();

function t(key) { return TRANSLATIONS[lang][key]; }

const form          = document.getElementById('loginForm');
const emailInput    = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleBtn     = document.getElementById('togglePassword');
const iconEye       = document.getElementById('iconEye');
const iconEyeOff    = document.getElementById('iconEyeOff');
const errorMsg      = document.getElementById('errorMsg');
const submitBtn     = document.getElementById('submitBtn');

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  emailInput.placeholder = t('emailPlaceholder');
  passwordInput.placeholder = t('passwordPlaceholder');
  toggleBtn.setAttribute('aria-label', t('showPassword'));
  submitBtn.textContent = t('submitBtn');
  document.getElementById('supportTitle').textContent = t('supportTitle');

  document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
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

toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  iconEye.style.display = isPassword ? 'block' : 'none';
  iconEyeOff.style.display = isPassword ? 'none' : 'block';
  toggleBtn.setAttribute('aria-label', t(isPassword ? 'hidePassword' : 'showPassword'));
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('visible');
}

function hideError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle('loading', loading);
  submitBtn.textContent = loading ? t('loading') : t('submitBtn');
}

function parseJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatLoginDetail(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((x) => (x && x.msg) || '').filter(Boolean).join(' ') || '';
  }
  return '';
}

function cleanEmail(s) {
  return s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function stripInvisible(s) {
  return s.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email    = cleanEmail(emailInput.value);
  const password = stripInvisible(passwordInput.value);

  if (!email || !password) {
    showError(t('emptyFields'));
    return;
  }

  setLoading(true);

  try {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    body.set('grant_type', 'password');

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString(),
    });

    const raw = await response.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      showError(t('wrongCredentials'));
      return;
    }

    if (!response.ok) {
      showError(formatLoginDetail(data && data.detail) || t('wrongCredentials'));
      return;
    }

    const token = data && data.access_token;
    if (!token) {
      showError(t('wrongCredentials'));
      return;
    }

    const payload = parseJwtPayload(token);
    let role = typeof data.role === 'string' ? data.role.trim() : '';
    if (!role && payload && typeof payload.role === 'string') {
      role = payload.role.trim();
    }
    role = role.toLowerCase();

    if (role !== 'hospital' && role !== 'headquarters') {
      showError(t('wrongCredentials'));
      return;
    }

    localStorage.setItem('access_token', token);
    localStorage.setItem('role', role);

    const routes = {
      hospital: '../hospital/index.html',
      headquarters: '../headquarters/index.html',
    };

    window.location.href = routes[role];
  } catch {
    showError(t('networkError'));
  } finally {
    setLoading(false);
  }
});

applyLang();
