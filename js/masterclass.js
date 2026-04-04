/* Masterclass Hub Logic */
(function() {
  var personId = getParam('id');
  var token = getParam('token');

  var loadingEl = document.getElementById('loading');
  var denied = document.getElementById('denied');
  var dashboard = document.getElementById('dashboard');
  var videoList = document.getElementById('video-list');
  var greeting = document.getElementById('greeting');
  var completionUnder100 = document.getElementById('completion-under100');
  var completion100plus = document.getElementById('completion-100plus');

  if (!personId || !token) {
    showDenied();
    return;
  }

  loadDashboard();

  function showDenied() {
    loadingEl.classList.add('hidden');
    denied.classList.remove('hidden');
  }

  function loadDashboard() {
    apiGet('masterclass-data?id=' + personId + '&token=' + token).then(function(data) {
      loadingEl.classList.add('hidden');

      greeting.textContent = 'Halo, ' + data.person.first_name + '!';

      // Check if masterclass is complete
      if (data.masterclass_complete) {
        if (data.is_large_church) {
          // Check if Video 5 is completed
          var v5 = data.videos.find(function(v) { return v.number === 5; });
          if (v5 && v5.assignment_submitted) {
            completion100plus.classList.remove('hidden');
            return;
          }
        } else {
          completionUnder100.classList.remove('hidden');
          return;
        }
      }

      // Render video cards
      dashboard.classList.remove('hidden');
      renderVideos(data.videos);
    }).catch(function(err) {
      if (err.message && (err.message.includes('denied') || err.message.includes('403'))) {
        showDenied();
      } else {
        loadingEl.innerHTML = '<div class="message message-error">' + escapeHtml(err.message || 'Gagal memuat data.') + '</div>';
      }
    });
  }

  function renderVideos(videos) {
    videoList.innerHTML = '';

    videos.forEach(function(video) {
      var card = document.createElement('div');
      card.className = 'video-card';

      if (video.status === 'locked') {
        card.classList.add('locked');
      } else if (video.status === 'completed') {
        card.classList.add('completed');
      } else if (video.status === 'in_progress') {
        card.classList.add('in-progress');
      }

      // Video number circle
      var numEl = document.createElement('div');
      numEl.className = 'video-number';
      numEl.textContent = video.number;
      card.appendChild(numEl);

      // Info section
      var info = document.createElement('div');
      info.className = 'video-info';

      var title = document.createElement('div');
      title.className = 'video-title';
      title.textContent = video.title;
      info.appendChild(title);

      var status = document.createElement('div');
      status.className = 'video-status';

      if (video.status === 'locked') {
        if (video.available_date) {
          var unlockDate = new Date(video.available_date);
          var days = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
          status.textContent = 'Terbuka dalam ' + days + ' hari';
        } else {
          status.textContent = 'Terkunci';
        }
      } else if (video.status === 'available') {
        status.textContent = 'Siap ditonton';
        status.style.color = 'var(--green)';
      } else if (video.status === 'in_progress') {
        status.textContent = 'Sedang berlangsung — tugas belum dikirim';
        status.style.color = 'var(--gold)';
      } else if (video.status === 'completed') {
        status.textContent = 'Selesai';
        status.style.color = 'var(--green)';
      }

      info.appendChild(status);
      card.appendChild(info);

      // Lock/play icon
      var icon = document.createElement('div');
      icon.className = 'lock-icon';
      if (video.status === 'locked') {
        icon.textContent = '\uD83D\uDD12';
      } else if (video.status === 'completed') {
        icon.textContent = '\u2705';
      } else {
        icon.textContent = '\u25B6';
      }
      card.appendChild(icon);

      // Click handler for unlocked videos
      if (video.status !== 'locked') {
        card.addEventListener('click', function() {
          window.location.href = '/masterclass/video.html?id=' + personId + '&token=' + token + '&v=' + video.number;
        });
      }

      videoList.appendChild(card);
    });
  }
})();
