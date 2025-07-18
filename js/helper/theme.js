// Tema uygulama fonksiyonu
export function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");

  } else if (theme === "light") {
    document.body.classList.remove("dark-mode");
  } else if (theme === "auto") {
    const hour = new Date().getHours();
    document.body.classList.toggle("dark-mode", hour < 6 || hour >= 18);
  } else if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark-mode", prefersDark);
  }
}

export function loadStoredTheme() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    applyTheme(storedTheme); // butona tiklandiginda
    updateThemeUI(storedTheme); // sayfa yuklendiginde
  }
}

// UI simge + yazı güncelle
export function updateThemeUI(theme) {
  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");
  const allOptions = document.querySelectorAll(".theme-option");

  const iconMap = {
    light: "gg-sun",
    dark: "gg-moon",
    system: "gg-screen",
    auto: "gg-auto"
  };

  const textMap = {
    light: "Tema: Açık",
    dark: "Tema: Koyu",
    system: "Tema: Sistem",
    auto: "Tema: Otomatik"
  };

  if (icon) icon.className = iconMap[theme] || "gg-sun";
  if (text) text.innerText = textMap[theme] || "Tema";

  allOptions.forEach(opt => {
    const t = opt.getAttribute("data-cmd");
    opt.classList.toggle("selected", t === theme);
  });
}

// Komutla tema uygula
export function temayiUygula(theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  updateThemeUI(theme);
}

// Komut üzerinden (örneğin cmdRun)
export async function optionTheme(cmd, { showAlert = () => {}, isPageLoaded = false } = {}) {
  if (!["dark", "light", "auto", "system"].includes(cmd)) return;

  temayiUygula(cmd);

  if (!isPageLoaded) {
    showAlert(`${cmd} tema ayarlandı`, cmd);
  }
}

// Tema açılır menüsünü başlat
export function initializeThemeDropdown({ isPageLoaded = true, showAlert = () => {} } = {}) {
  // ✅ Burada static event listener'lar yerine delegation kullanalım
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest(".theme-option");
    if (!target) return;

    const selectedTheme = target.getAttribute("data-cmd");
    if (!["dark", "light", "auto", "system"].includes(selectedTheme)) return;

    localStorage.setItem("theme", selectedTheme);
    applyTheme(selectedTheme);
    updateThemeUI(selectedTheme);

    if (!isPageLoaded) {
      showAlert(`${selectedTheme} tema ayarlandı`, selectedTheme);
    }
  });
}

