/* Shared utilities for Multiply or Die */

async function apiCall(endpoint, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Koneksi timeout. Silakan coba lagi.');
    }
    throw err;
  }
}

async function apiGet(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/' + endpoint, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Terjadi kesalahan.');
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Koneksi timeout.');
    }
    throw err;
  }
}

function showLoading(btn) {
  btn.disabled = true;
  btn._originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Memproses...';
}

function hideLoading(btn) {
  btn.disabled = false;
  btn.textContent = btn._originalText || 'Submit';
}

function showMessage(container, text, type) {
  container.innerHTML = '<div class="message message-' + type + '">' + escapeHtml(text) + '</div>';
}

function clearMessage(container) {
  container.innerHTML = '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPhone(value) {
  // Strip non-digits except leading +
  let cleaned = value.replace(/[^\d+]/g, '');
  // Auto-prepend +62 for Indonesian numbers
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1);
  } else if (cleaned.startsWith('62') && !cleaned.startsWith('+62')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+62' + cleaned;
  }
  return cleaned;
}
