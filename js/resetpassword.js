document.addEventListener('DOMContentLoaded', async () => {
  try {
    const site = location.origin;
    const repository = "/modul/";
    const jsURL = site + repository + "js/";
    const modulURL = jsURL + "modules/";
    const helperURL = jsURL + "helper/";

    // Dinamik import ile user modülünü yükle
    const userModul = await import(`${modulURL}user.js`);
    
    // Form event listener'ını ekle
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        
        try {
          // Şifre sıfırlama e-postası gönder
          const message = await userModul.resetPassword(email);
          
          // Başarı mesajını göster
          showSuccess(message);
          
          // Formu temizle
          e.target.reset();
        } catch (error) {
          showError(error.message);
        }
      });
    }

    // Giriş yap bağlantısı
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
      });
    }

  } catch (error) {
    console.error('Modül yükleme hatası:', error);
    showError('Sistem hatası. Lütfen sayfayı yenileyin.');
  }
});

// Hata göster
function showError(message) {
  const errorElement = document.getElementById('resetError');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Başarı mesajını gizle
    const successElement = document.getElementById('resetSuccess');
    if (successElement) successElement.style.display = 'none';
  }
}

// Başarı mesajı göster
function showSuccess(message) {
  const successElement = document.getElementById('resetSuccess');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hata mesajını gizle
    const errorElement = document.getElementById('resetError');
    if (errorElement) errorElement.style.display = 'none';
  }
}