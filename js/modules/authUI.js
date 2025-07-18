export async function initAuthUI() {
  try {
    const site = location.origin;
    const repository = "/modul/";
    const jsURL = site + repository + "js/";
    const modulURL = jsURL + "modules/";

    // Dinamik import ile user modülünü yükle
    const userModul = await import(`${modulURL}user.js`);

    // Kullanıcıyı al
    const user = await userModul.getCurrentUser();

    // Kullanıcı varsa info'yu göster
    if (user) {
      showUserInfo(user.email,user.uid, userModul.logout);
    } else {
      showAuthButtons();
    }

  } catch (error) {
    console.error("UI init hatası:", error);
    showAuthButtons();
  }
}

function showUserInfo(email,uid, logoutFn) {
  const username = email.split("@")[0];
  const container = document.getElementById("showUserInfo");
  const h1UserName = document.getElementById("user-name");
  if (h1UserName) {h1UserName.innerText = "Merhaba, " + username + "!";}
  if (!container) return;

  container.innerHTML = `
    <button class="dropdown-btn" onclick="toggleDropdown('mainDropdown')">
      <span class="icon">${username.charAt(0).toUpperCase()}</span>
    </button>
    <div class="dropdown-content">
      <div class="username-dropdown-div">
        <span id="username-dropdown-name">${username}</span>
        <span id="username-dropdown-api">${uid}</span>
      </div>
      <a href="#" class="dropdown-item" onclick="openAccountSettings()">Hesap Ayarları</a>
      <details class="theme-slide">
        <summary class="dropdown-item">Tema Değiştir</summary>
        <div class="theme-options">
          <div class="theme-option" data-cmd="light"><span>Açık Tema</span></div>
          <div class="theme-option" data-cmd="dark"><span>Koyu Tema</span></div>
          <div class="theme-option" data-cmd="system"><span>Sistem</span></div>
          <div class="theme-option" data-cmd="auto"><span>Otomatik</span></div>
        </div>
      </details>
      <a href="#" id="logoutBtnDropdown" class="dropdown-item">Çıkış Yap</a>
    </div>`;

  document.getElementById("logoutBtnDropdown").addEventListener("click", async () => {
    await logoutFn();
    location.reload();
  });
}

function showAuthButtons() {
  const container = document.getElementById("authButtons");
  const h1UserName = document.getElementById("user-name");
  if (h1UserName) {h1UserName.innerText = "Merhaba!";}

  if (!container) return;

  container.innerHTML = `
    <button id="loginBtn" class="btn-auth">Giriş Yap</button>
    <button id="registerBtn" class="btn-auth">Kayıt Ol</button>
  `;

  document.getElementById("loginBtn")?.addEventListener("click", () => {
    window.location.href = "/modul/login.html";
  });

  document.getElementById("registerBtn")?.addEventListener("click", () => {
    window.location.href = "/modul/signup.html";
  });
}
