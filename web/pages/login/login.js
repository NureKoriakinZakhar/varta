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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Будь ласка, заповніть всі поля');
    return;
  }

  setLoading(true);

  try {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.detail || 'Невірний email або пароль');
      return;
    }

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('role', data.role);

    const routes = {
      hospital: '../hospital/index.html',
    };

    const destination = routes[data.role];
    if (!destination) {
      showError('Невірний логін або пароль');
      return;
    }

    window.location.href = destination;
  } catch {
    showError('Не вдалося з\'єднатися з сервером. Перевірте інтернет-з\'єднання.');
  } finally {
    setLoading(false);
  }
});
