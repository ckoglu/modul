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
    if (await userModul.isLoggedIn() && await userModul.isVerified()) {
      redirectToPreviousPage();
      return;
    }

    // Form event listener'ını ekle
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        
        try {
          await userModul.login(email, password);
          
          // Kullanıcı bilgilerini al
          const user = await userModul.getCurrentUser();
          
          // E-posta doğrulanmamışsa uyarı göster
          if (!user.emailVerified) {
            showAlert('Lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-posta adresinize gönderilmiştir.', 'warning');
            await userModul.logout(); // Doğrulanmamış kullanıcıyı çıkış yap
            return;
          }
          
          // Başarılı giriş - önceki sayfaya yönlendir
          redirectToPreviousPage();
        } catch (error) {
          showError(error.message);
        }
      });
    }

    // Şifremi unuttum bağlantısı
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'resetpassword.html';
      });
    }

    // Kayıt ol bağlantısı
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'signup.html';
      });
    }

  } catch (error) {
    console.error('Modül yükleme hatası:', error);
    showError('Sistem hatası. Lütfen sayfayı yenileyin.');
  }
});

// Önceki sayfaya yönlendirme
function redirectToPreviousPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('returnUrl') || '/modul/';
  window.location.href = returnUrl;
}

// Hata göster
function showError(message) {
  const errorElement = document.getElementById('loginError');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}