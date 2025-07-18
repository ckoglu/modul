// helper/alert.js
export function showAlert(message, type = 'info', duration = 3000) {
  const alertBox = document.getElementById('alert');
  const messageBox = document.getElementById('alertMessage');
  const iconBox = document.getElementById('alertIcon');

  const icons = {
    success: '<div class="icon"><i class="check"></i></div>',
    error: '<div class="icon"><i class="danger"></i></div>',
    warning: '<div class="icon"><i class="warning"></i></div>',
    info: '<div class="icon"><i class="info"></i></div>',
    clean: '<div class="icon"><i class="info"></i></div>',
    dark: '<div class="icon"><i class="moon"></i></div>',
    light: '<div class="icon"><i class="sun"></i></div>',
    auto: '<div class="icon"><i class="auto"></i></div>',
    system: '<div class="icon"><i class="screen"></i></div>',
    copy: '<div class="icon"><i class="copy"></i></div>',
  };

  const bgColors = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
    clean: 'bg-danger',
    dark: 'bg-dark',
    light: 'bg-light',
    auto: 'bg-info',
    system: 'bg-info',
    copy: 'bg-success',
  };

  if (messageBox) messageBox.textContent = message;
  if (iconBox) iconBox.innerHTML = icons[type] || icons.info;

  const bgClass = bgColors[type] || 'info';
  if (alertBox) {alertBox.className = `alert show ${bgClass}`;}

  clearTimeout(window.alertTimeout);
  window.alertTimeout = setTimeout(hideAlert, duration);
}

export function hideAlert() {
  const alertBox = document.getElementById('alert');
  if (alertBox) {alertBox.classList.remove('show');}
}
