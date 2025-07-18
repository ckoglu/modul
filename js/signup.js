document.addEventListener('DOMContentLoaded', async () => {
  try {
    const site = location.origin;
    const repository = "/modul/";
    const jsURL = site + repository + "js/";
    const modulURL = jsURL + "modules/";
    const helperURL = jsURL + "helper/";

    // Dinamik import ile user modülünü yükle
    const userModul = await import(`${modulURL}user.js`);
    
    // Eğer zaten giriş yapılmışsa yönlendir
    if (await userModul.isLoggedIn()) {
      window.location.href = '/modul/';
      return;
    }

    // Form event listener'ını ekle
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const confirmPassword = e.target.elements.confirmPassword?.value;
        
        try {
          // Şifreler eşleşiyor mu kontrol et
          if (confirmPassword && password !== confirmPassword) {
            throw new Error('Şifreler eşleşmiyor');
          }
          
          // Kayıt ol
          await userModul.register(email, password);
          
          // Başarı mesajı göster ve giriş sayfasına yönlendir
          showAlert('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın. Doğrulama linki gönderildi.', 'success');
          
          // 3 saniye sonra giriş sayfasına yönlendir
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
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
  const errorElement = document.getElementById('registerError');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}