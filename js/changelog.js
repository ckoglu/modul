// changelog.js
const site = location.origin;
const repository = "/modul/";
const jsURL = site + repository + "js/";
const modulURL = jsURL + "modules/";
const helperURL = jsURL + "helper/";

const headerTitle = document.getElementById("header-title");
const headerText = document.getElementById("header-text");
const userName = document.getElementById("user-name");

let previousCommand = "";
let inputTimeout;
let highlightApplyModule;

window.showAlert = function (message, type) {console.log(`${type}: ${message}`);};

/**
 * Komutları işleyen ana fonksiyon.
 * @param {string} cmd Çalıştırılacak komut.
 */
window.cmdRun = async function (cmd) {
  if (!cmd || typeof cmd !== "string") {
    console.warn("Geçersiz komut:", cmd);
    return;
  }

  try {
    const userModul = await import(`${modulURL}user.js`);

    if (!(await userModul.isLoggedIn())) {
      const typed = cmd.trim().length > 0 && cmd !== "info";
      if (typed) {
        showAlert("Bu işlem için önce giriş yapmalısınız.", "error");
      }
      return;
    }

    const currentUser = await userModul.getCurrentUser();
    if (!currentUser?.uid) {
      window.showAlert("API anahtarı bulunamadı.", "error");
      return;
    }

    if (!(await userModul.isVerified())) {
      window.showAlert("Lütfen e-posta adresinizi doğrulayın.", "warning");
      return;
    }

    // Tema komutları
    if (["dark", "light", "auto", "system"].includes(cmd)) {
      const temaModul = await import(`${helperURL}theme.js`);
      await temaModul.optionTheme(cmd, {
        showAlert: window.showAlert,
        isPageLoaded: false,
      });
      return;
    }

    // Bilinmeyen komut
    else {
      console.warn("Bilinmeyen komut:", cmd);
      window.showAlert("Geçersiz komut.", "warning");
      return;
    }
  } catch (error) {
    console.error(`'${cmd}' komutu işlenirken hata oluştu:`, error);
    window.showAlert("Komut işlenirken bir hata oluştu.", "error");
  }
};

function setupThemeClickHandler() {
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest(".theme-option");
    if (target) {
      const selectedTheme = target.getAttribute("data-cmd");
      if (["dark", "light", "auto", "system"].includes(selectedTheme)) {
        import(`${helperURL}theme.js`).then((mod) => {
          mod.temayiUygula(selectedTheme);
          window.showAlert(`${selectedTheme} tema ayarlandı`, selectedTheme);
        });
      }
    }
  });
}

async function initializeApp() {
  try {
    const alertModul = await import(`${helperURL}alert.js`);
    window.showAlert = alertModul.showAlert;
    window.hideAlert = alertModul.hideAlert;

    const themeModul = await import(`${helperURL}theme.js`);
    themeModul.loadStoredTheme();
    themeModul.initializeThemeDropdown({
      isPageLoaded: false,
      showAlert: window.showAlert,
    });
    setupThemeClickHandler();

    const otherModul = await import(`${helperURL}other.js`);
    otherModul.menuToggle();
    otherModul.endpointButtons();
    otherModul.Year();
    window.toggleDropdown = otherModul.toggleDropdown;

    window.addEventListener("storage", (event) => {if (event.key === STORAGE_KEY) {renderHistoryLazy();}});

    const initAuthUI = await import(`${modulURL}authUI.js`);
    await initAuthUI.initAuthUI();

    const processBtnModul = await import(`${helperURL}processBtn.js`);
    processBtnModul.setupCommandButtons();

    const historyModul = await import(`${modulURL}history.js`);
    historyModul.renderHistoryLazy();

    const tooltipModul = await import(`${helperURL}tooltip.js`);
    tooltipModul.initializeTooltip();

    const urlModul = await import(`${modulURL}urlParams.js`);
    await urlModul.processUrlParams();
    
    const timeModul = await import(`${helperURL}timeAgo.js`);
    window.timeAgo = timeModul.timeAgo; 

    const commitsModul = await import(`${helperURL}commits.js`);
    await commitsModul.meMode();

  } catch (error) {
    console.error("Uygulama başlatılırken kritik bir hata oluştu:", error);
    window.showAlert?.("Uygulama yüklenemedi. Lütfen sayfayı yenileyin.", "error");
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);