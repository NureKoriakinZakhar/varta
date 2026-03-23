const API_BASE = 'https://varta-1-wgnl.onrender.com';

function getToken() {
  return localStorage.getItem('access_token');
}

function getRole() {
  return localStorage.getItem('role');
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('role');
  window.location.href = '/pages/login/index.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    logout();
    return null;
  }

  return response;
}
