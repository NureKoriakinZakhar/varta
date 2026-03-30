(function () {
  const KEY = 'lang';

  function get() {
    const v = localStorage.getItem(KEY);
    return v === 'en' ? 'en' : 'uk';
  }

  function set(code) {
    if (code !== 'uk' && code !== 'en') return;
    if (localStorage.getItem(KEY) === code) return;
    localStorage.setItem(KEY, code);
    window.dispatchEvent(new CustomEvent('varta:langchange', { detail: { lang: code } }));
  }

  window.vartaLang = { get, set };

  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || e.newValue == null) return;
    if (e.newValue !== 'uk' && e.newValue !== 'en') return;
    window.dispatchEvent(new CustomEvent('varta:langchange', { detail: { lang: e.newValue } }));
  });
})();
