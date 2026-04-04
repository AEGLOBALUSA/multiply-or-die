/* Landing Page Registration Logic */
(function() {
  var form = document.getElementById('register-form');
  var formSection = document.getElementById('form-section');
  var confirmation = document.getElementById('confirmation');
  var codeDisplay = document.getElementById('code-display');
  var submitBtn = document.getElementById('submit-btn');
  var messageEl = document.getElementById('form-message');
  var phoneInput = document.getElementById('mobile_phone');

  // Check if code already in hash (returning visitor)
  var hashCode = window.location.hash.match(/code=([A-Z0-9-]+)/);
  if (hashCode) {
    showConfirmation(hashCode[1]);
  }

  // Auto-format phone on blur
  phoneInput.addEventListener('blur', function() {
    if (this.value.trim()) {
      this.value = formatPhone(this.value);
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage(messageEl);

    // Client-side validation
    var firstName = form.first_name.value.trim();
    var lastName = form.last_name.value.trim();
    var email = form.email.value.trim().toLowerCase();
    var phone = formatPhone(form.mobile_phone.value.trim());
    var churchName = form.church_name.value.trim();
    var city = form.city.value.trim();
    var language = form.preferred_language.value;
    var consent = form.consent.checked;

    if (!firstName || !lastName || !email || !phone || !churchName || !city) {
      showMessage(messageEl, 'Harap isi semua bidang yang wajib (*).', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage(messageEl, 'Harap masukkan alamat email yang valid.', 'error');
      return;
    }

    if (phone.length < 10) {
      showMessage(messageEl, 'Harap masukkan nomor WhatsApp yang valid.', 'error');
      return;
    }

    if (!consent) {
      showMessage(messageEl, 'Harap centang persetujuan untuk melanjutkan.', 'error');
      return;
    }

    // Prevent double-submit
    showLoading(submitBtn);

    apiCall('register', {
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile_phone: phone,
      church_name: churchName,
      city: city,
      preferred_language: language
    }).then(function(data) {
      hideLoading(submitBtn);
      if (data.code) {
        window.location.hash = 'code=' + data.code;
        showConfirmation(data.code);
      } else {
        showMessage(messageEl, 'Terjadi kesalahan. Silakan coba lagi.', 'error');
      }
    }).catch(function(err) {
      hideLoading(submitBtn);
      showMessage(messageEl, err.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
    });
  });

  function showConfirmation(code) {
    formSection.classList.add('hidden');
    confirmation.classList.remove('hidden');
    codeDisplay.textContent = code;
  }
})();
