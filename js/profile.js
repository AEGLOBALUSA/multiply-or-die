/* Progressive Profile Form Logic */
(function() {
  var personId = getParam('id');
  var loadingEl = document.getElementById('loading');
  var errorScreen = document.getElementById('error-screen');
  var errorText = document.getElementById('error-text');
  var formSection = document.getElementById('form-section');
  var form = document.getElementById('profile-form');
  var submitBtn = document.getElementById('submit-btn');
  var messageEl = document.getElementById('form-message');
  var greeting = document.getElementById('greeting');
  var progressFill = document.getElementById('progress-fill');
  var progressText = document.getElementById('progress-text');
  var successScreen = document.getElementById('success-screen');
  var successTitle = document.getElementById('success-title');
  var successMessage = document.getElementById('success-message');
  var masterclassLink = document.getElementById('masterclass-link');

  var FIELDS = ['church_size', 'years_in_ministry', 'leadership_role', 'biggest_challenge', 'team_size', 'training_preference'];

  if (!personId) {
    showError('Link tidak valid. Silakan gunakan link dari WhatsApp Anda.');
    return;
  }

  // Load existing profile data
  loadProfile();

  function showError(msg) {
    loadingEl.classList.add('hidden');
    errorScreen.classList.remove('hidden');
    errorText.textContent = msg;
  }

  function loadProfile() {
    apiGet('submit-profile?id=' + personId).then(function(data) {
      loadingEl.classList.add('hidden');

      // Check if already unlocked
      if (data.lifecycle_stage === 'masterclass_unlocked' || data.lifecycle_stage === 'masterclass_complete') {
        showSuccess(true);
        return;
      }

      formSection.classList.remove('hidden');
      greeting.textContent = 'Halo, ' + data.first_name + '!';

      // Pre-fill existing values
      FIELDS.forEach(function(field) {
        if (data[field]) {
          var el = document.getElementById(field);
          if (el) el.value = data[field];
        }
      });

      updateProgress();
    }).catch(function(err) {
      showError(err.message || 'Gagal memuat profil.');
    });
  }

  // Live progress counter
  FIELDS.forEach(function(field) {
    document.getElementById(field).addEventListener('change', updateProgress);
  });

  function updateProgress() {
    var count = 0;
    FIELDS.forEach(function(field) {
      if (document.getElementById(field).value) count++;
    });
    var pct = Math.round((count / 6) * 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = count + ' dari 6 terisi' + (count < 4 ? ' (butuh ' + (4 - count) + ' lagi)' : ' — siap!');

    if (count >= 4) {
      progressFill.style.background = 'var(--green)';
    } else {
      progressFill.style.background = 'var(--navy)';
    }
  }

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage(messageEl);

    var payload = { person_id: personId };
    var filledCount = 0;

    FIELDS.forEach(function(field) {
      var val = document.getElementById(field).value;
      if (val) {
        payload[field] = val;
        filledCount++;
      }
    });

    if (filledCount === 0) {
      showMessage(messageEl, 'Harap isi minimal satu bidang.', 'error');
      return;
    }

    showLoading(submitBtn);

    apiCall('submit-profile', payload).then(function(data) {
      hideLoading(submitBtn);

      if (data.masterclass_unlocked) {
        showSuccess(true);
      } else if (data.profile_fields_completed >= 4) {
        showSuccess(true);
      } else {
        var remaining = 4 - data.profile_fields_completed;
        showMessage(messageEl, 'Profil disimpan! Lengkapi ' + remaining + ' bidang lagi untuk membuka Masterclass Anda.', 'success');
      }
    }).catch(function(err) {
      hideLoading(submitBtn);
      showMessage(messageEl, err.message || 'Gagal menyimpan. Silakan coba lagi.', 'error');
    });
  });

  function showSuccess(unlocked) {
    formSection.classList.add('hidden');
    loadingEl.classList.add('hidden');
    successScreen.classList.remove('hidden');

    if (unlocked) {
      successTitle.textContent = 'Masterclass Anda Telah Dibuka!';
      successMessage.textContent = 'Periksa WhatsApp Anda untuk tautan akses Masterclass.';
      masterclassLink.style.display = 'inline-block';
      masterclassLink.classList.remove('hidden');
      masterclassLink.href = '/masterclass?id=' + personId;
    } else {
      successTitle.textContent = 'Profil Disimpan!';
      successMessage.textContent = 'Terima kasih telah melengkapi profil Anda.';
    }
  }
})();
