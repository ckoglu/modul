// ana.js

// Sabitler ve Değişkenler
const site = location.origin;
const repository = "/modul/";
const jsURL = site + repository + "js/";
const modulURL = jsURL + "modules/";
const helperURL = jsURL + "helper/";

const cmdInput = document.getElementById("cmd");
const endPoint = document.getElementById("endpoint");
const cmdRunButton = document.getElementById("cmdRun");
const outputContainer = document.getElementById("output-container");
const headerTitle = document.getElementById("header-title");
const headerText = document.getElementById("header-text");
const userName = document.getElementById("user-name");
const children = outputContainer.children;

let previousCommand = "";
let inputTimeout;
let highlightApplyModule;

window.showAlert = function (message, type) {
  console.log(`${type}: ${message}`);
};

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

    if (!window.dataLoader) {
      await import(`${modulURL}veriYukleyici.js`).then((mod) =>
        mod.verileriYukle()
      );
    }

    const komutSonucModul = await import(`${modulURL}komutSonucBlock.js`);
    const paramsModul = await import(`${modulURL}komutIsleyici.js`);
    const historyModul = await import(`${modulURL}history.js`);
    const infoHelper = await import(`${helperURL}infoHelper.js`);

    const isParametricCmd =
      cmd.includes("&") ||
      cmd.includes("=") ||
      ["il", "ilce", "mahalle", "koy", "sokak"].includes(cmd);

    // Tema komutları
    if (["dark", "light", "auto", "system"].includes(cmd)) {
      const temaModul = await import(`${helperURL}theme.js`);
      await temaModul.optionTheme(cmd, {
        showAlert: window.showAlert,
        isPageLoaded: false,
      });
      return;
    }

    // info komutu
    else if (cmd === "info") {
      infoHelper.gosterInfo(cmdInput);
      if (userName) {
        userName.scrollIntoView({ behavior: "smooth", block: "start" });
        if (typeof userName.focus === "function") {
          userName.setAttribute("tabindex", "-1");
          userName.focus();
        }
      }
      return;
    }

    // SADECE GEÇERLİ PARAMETRİK KOMUTLARDA AŞAĞIDAKİLERİ YAP:
    else if (isParametricCmd) {
      const blockElements = komutSonucModul.createNewOutputBlock(cmd);
      const response = await paramsModul.handleAllParams(cmd);
      await komutSonucModul.processCommandOutput(cmd, response, blockElements);

      if (currentUser?.uid) {
        historyModul.addToHistory(cmd, currentUser.uid);
        historyModul.renderHistoryLazy();
      }

      // otomatik kaydırma
      if (children.length > 0) {
        const firstChild = children[0];
        const y =
          firstChild.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      }

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

function highlightIfJson() {
  setTimeout(() => {
    if (endPoint && highlightApplyModule?.highlightIfJson) {
      highlightApplyModule.highlightIfJson(endPoint);
    }
  }, 50);
}

function setupEventListeners() {
  if (!cmdInput || !cmdRunButton) return;

  cmdRunButton.addEventListener("click", async () => {
    const currentCmd = cmdInput.value.trim();
    if (currentCmd && currentCmd !== previousCommand) {
      await window.cmdRun(currentCmd);
      previousCommand = currentCmd;
    }
  });

  cmdInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentCmd = cmdInput.value.trim();
      if (currentCmd && currentCmd !== previousCommand) {
        await window.cmdRun(currentCmd);
        previousCommand = currentCmd;
      }
    }
  });
}

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

    const veriModul = await import(`${modulURL}veriYukleyici.js`);
    await veriModul.verileriYukle();

    highlightApplyModule = await import(`${helperURL}highlightApply.js`);
    const highlightHelperMod = await import(`${helperURL}highlightHelper.js`);
    window.Highlight = highlightHelperMod;

    const themeModul = await import(`${helperURL}theme.js`);
    themeModul.loadStoredTheme();
    themeModul.initializeThemeDropdown({
      isPageLoaded: false,
      showAlert: window.showAlert,
    });
    setupThemeClickHandler();

    const prefixModul = await import(`${helperURL}prefix.js`);
    prefixModul.initPrefix(site + repository, repository);

    const otherModul = await import(`${helperURL}other.js`);
    otherModul.menuToggle();
    otherModul.endpointButtons();
    otherModul.Year();
    window.toggleDropdown = otherModul.toggleDropdown;

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {renderHistoryLazy();}
    });

    const initAuthUI = await import(`${modulURL}authUI.js`);
    await initAuthUI.initAuthUI();

    const processBtnModul = await import(`${helperURL}processBtn.js`);
    processBtnModul.setupCommandButtons();

    const historyModul = await import(`${modulURL}history.js`);
    historyModul.renderHistoryLazy();

    const tooltipModul = await import(`${helperURL}tooltip.js`);
    tooltipModul.initializeTooltip();

    setupEventListeners();

    const urlModul = await import(`${modulURL}urlParams.js`);
    await urlModul.processUrlParams();
  } catch (error) {
    console.error("Uygulama başlatılırken kritik bir hata oluştu:", error);
    window.showAlert?.("Uygulama yüklenemedi. Lütfen sayfayı yenileyin.", "error");
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
