const API_BASE = 'https://varta-1-wgnl.onrender.com';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePassword');
const iconEye = document.getElementById('iconEye');
const iconEyeOff = document.getElementById('iconEyeOff');
const errorMsg = document.getElementById('errorMsg');
const submitBtn = document.getElementById('submitBtn');

toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  iconEye.style.display = isPassword ? 'block' : 'none';
  iconEyeOff.style.display = isPassword ? 'none' : 'block';
  toggleBtn.setAttribute('aria-label', isPassword ? 'Приховати пароль' : 'Показати пароль');
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
  submitBtn.textContent = loading ? 'Завантаження...' : 'Вхід';
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

  const email = cleanEmail(emailInput.value);
  const password = stripInvisible(passwordInput.value);

  if (!email || !password) {
    showError('Будь ласка, заповніть всі поля');
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
      showError('Невірний логін або пароль');
      return;
    }

    if (!response.ok) {
      showError(formatLoginDetail(data && data.detail) || 'Невірний логін або пароль');
      return;
    }

    const token = data && data.access_token;
    if (!token) {
      showError('Невірний логін або пароль');
      return;
    }

    const payload = parseJwtPayload(token);
    let role = typeof data.role === 'string' ? data.role.trim() : '';
    if (!role && payload && typeof payload.role === 'string') {
      role = payload.role.trim();
    }
    role = role.toLowerCase();

    if (role !== 'hospital' && role !== 'headquarters') {
      showError('Невірний логін або пароль');
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
    showError('Не вдалося з\'єднатися з сервером. Перевірте інтернет-з\'єднання.');
  } finally {
    setLoading(false);
  }
});
