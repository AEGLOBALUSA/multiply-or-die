/* Desk Verification Tool Logic */
(function() {
  var pinScreen = document.getElementById('pin-screen');
  var verifyScreen = document.getElementById('verify-screen');
  var pinInput = document.getElementById('pin-input');
  var pinBtn = document.getElementById('pin-btn');
  var pinMessage = document.getElementById('pin-message');
  var codeInput = document.getElementById('code-input');
  var verifyBtn = document.getElementById('verify-btn');
  var verifyMessage = document.getElementById('verify-message');
  var resultValid = document.getElementById('result-valid');
  var resultCollected = document.getElementById('result-collected');
  var resultInvalid = document.getElementById('result-invalid');
  var resultName = document.getElementById('result-name');
  var resultChurch = document.getElementById('result-church');
  var collectedTime = document.getElementById('collected-time');
  var collectBtn = document.getElementById('collect-btn');
  var offlineBanner = document.getElementById('offline-banner');

  var currentCode = '';

  // Check if PIN already stored in session
  if (sessionStorage.getItem('desk_pin_verified')) {
    showVerifyScreen();
  }

  // Offline detection
  window.addEventListener('offline', function() { offlineBanner.classList.add('visible'); });
  window.addEventListener('online', function() { offlineBanner.classList.remove('visible'); });

  // PIN submission
  pinBtn.addEventListener('click', submitPin);
  pinInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitPin();
  });

  function submitPin() {
    var pin = pinInput.value.trim();
    if (!pin || pin.length !== 4) {
      showMessage(pinMessage, 'Please enter a 4-digit PIN.', 'error');
      return;
    }

    showLoading(pinBtn);
    clearMessage(pinMessage);

    apiCall('verify-pin', { pin: pin }).then(function(data) {
      hideLoading(pinBtn);
      if (data.success) {
        sessionStorage.setItem('desk_pin_verified', '1');
        showVerifyScreen();
      }
    }).catch(function(err) {
      hideLoading(pinBtn);
      showMessage(pinMessage, err.message || 'Invalid PIN.', 'error');
      pinInput.value = '';
      pinInput.focus();
    });
  }

  function showVerifyScreen() {
    pinScreen.classList.add('hidden');
    verifyScreen.classList.remove('hidden');
    codeInput.focus();
  }

  // Code verification
  verifyBtn.addEventListener('click', verifyCode);
  codeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') verifyCode();
  });

  // Auto-uppercase and auto-prepend MOD-
  codeInput.addEventListener('input', function() {
    var val = this.value.toUpperCase();
    this.value = val;
  });

  function hideAllResults() {
    resultValid.classList.add('hidden');
    resultCollected.classList.add('hidden');
    resultInvalid.classList.add('hidden');
    clearMessage(verifyMessage);
  }

  function verifyCode() {
    var code = codeInput.value.trim().toUpperCase();
    if (!code) return;

    // Auto-prepend MOD- if not present
    if (!code.startsWith('MOD-') && code.length === 4) {
      code = 'MOD-' + code;
      codeInput.value = code;
    }

    hideAllResults();
    showLoading(verifyBtn);
    currentCode = code;

    apiCall('verify-code', { code: code }).then(function(data) {
      hideLoading(verifyBtn);

      if (data.status === 'valid') {
        resultName.textContent = data.first_name + ' ' + data.last_name;
        resultChurch.textContent = data.church_name;
        resultValid.classList.remove('hidden');
      } else if (data.status === 'collected') {
        var date = new Date(data.redeemed_at);
        collectedTime.textContent = 'This code was already redeemed at ' + date.toLocaleString();
        resultCollected.classList.remove('hidden');
      } else {
        resultInvalid.classList.remove('hidden');
      }
    }).catch(function(err) {
      hideLoading(verifyBtn);
      showMessage(verifyMessage, err.message || 'Connection error. Please try again.', 'error');
    });
  }

  // Mark as collected
  collectBtn.addEventListener('click', function() {
    if (!currentCode) return;

    showLoading(collectBtn);

    apiCall('mark-collected', { code: currentCode }).then(function(data) {
      hideLoading(collectBtn);
      if (data.success) {
        // Reset for next code
        hideAllResults();
        codeInput.value = '';
        codeInput.focus();
        showMessage(verifyMessage, 'Book collected successfully!', 'success');
        setTimeout(function() { clearMessage(verifyMessage); }, 3000);
      }
    }).catch(function(err) {
      hideLoading(collectBtn);
      showMessage(verifyMessage, err.message || 'Failed to mark as collected.', 'error');
    });
  });
})();
