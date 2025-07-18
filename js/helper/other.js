// Highlight helper'ı yükle
let highlightHelper;
try {highlightHelper = await import("../helper/highlightApply.js");} catch (e) {console.warn("highlightApply.js yüklenemedi:", e);}
// infoHelper yükle
const { gosterInfo } = await import("../helper/infoHelper.js");

// helper/other.js
export function menuToggle() {
  const sidebar = document.getElementById('sidebar');
  const menuToggleBtn = document.getElementById('menuToggle');
  const header = document.querySelector('.header');
  const mainContent = document.querySelector('.main-content');
  const commandBar = document.querySelector('.command-bar');
  const historyCmd = document.getElementById('history-cmd');

  if (!sidebar || !menuToggleBtn || !header) return;

  const isMobile = () => window.innerWidth <= 768;

  // Başlangıç durumu kontrolü
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed && !isMobile()) {
    sidebar.classList.add('collapsed');
    historyCmd.classList.add('hidden');
  }

  if (!isCollapsed ){historyCmd.classList.remove('hidden');}
  
  if (isMobile()) {
    sidebar.classList.remove('collapsed');
    historyCmd.classList.add('hidden');
  }

  // Kenar çubuğunu aç/kapat
  function toggleSidebar() {
    if (isMobile()) {
      sidebar.classList.toggle('visible');
      historyCmd.classList.toggle('hidden');
    } else {
      sidebar.classList.toggle('collapsed');
      historyCmd.classList.toggle('hidden');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
  }

  menuToggleBtn.addEventListener('click', toggleSidebar);

  // Mobilde dışarı tıklanınca kapat
  document.addEventListener('click', function (event) {
    if (isMobile() && sidebar.classList.contains('visible') && !sidebar.contains(event.target) && event.target !== menuToggleBtn) {
      sidebar.classList.remove('visible');
    }
  });

  // Header konumunu güncelle
  function updateHeaderMargin() {
    if (window.innerWidth > 768) {
      if (sidebar.classList.contains('collapsed')) {
        header.style.left = '70px';
      } else {
        header.style.left = '250px';
      }
    } else {
      header.style.left = '0';
    }
  }

  // İlk yükleme ve değişiklik takibi
  updateHeaderMargin();

  const observer = new MutationObserver(updateHeaderMargin);
  observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

  // Pencere boyutu değişirse
  window.addEventListener('resize', () => {
    updateHeaderMargin();
    if (!isMobile()) {
      sidebar.classList.remove('visible'); // mobil görünümde açık kalan menüyü kapat
    }
  });
}

export function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;

  dropdown.classList.toggle('active');

  // Aktifse dış tıklama ile kapatma dinleyicisini ekle
  if (dropdown.classList.contains('active')) {
    // Zaten varsa tekrar eklenmesin
    if (!dropdown._outsideClickListener) {
      dropdown._outsideClickListener = function (event) {
        const btn = dropdown.querySelector('.dropdown-btn');
        if (!dropdown.contains(event.target) && event.target !== btn) {
          dropdown.classList.remove('active');
          document.removeEventListener('click', dropdown._outsideClickListener);
          delete dropdown._outsideClickListener;
        }
      };
      setTimeout(() => {
        document.addEventListener('click', dropdown._outsideClickListener);
      }, 0);
    }
  }
}


export function Year() {
  let year = document.getElementById('year');
  if (year) {year.textContent = new Date().getFullYear();}
}

export function endpointButtons() {
  const eCopyBtn = document.getElementById('endpoint-copy-button');
  const eLinkBtn = document.getElementById('endpoint-link-button');
  const eTrashBtn = document.getElementById('endpoint-trash-button');
  const prefixDIV = document.getElementById('prefix');
  const endpoint = document.getElementById('endpoint');
  const cmd = document.getElementById('cmd');
  const site = location.origin;
  const repository = "/modul/";
  

  if (eCopyBtn) {
    eCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(endpoint.textContent);
      showAlert(`JSON çıktısı kopyalandı.`, `copy`);
    });
  }

  if (eLinkBtn) {
    eLinkBtn.addEventListener('click', () => {
      window.open(site + repository + 'api.html?cmd=' + cmd.value, '_blank');
    });
  }

  if (prefixDIV) {
    prefixDIV.addEventListener('click', () => {
      cmd.focus();
    });
  }

  if (eTrashBtn) {
    eTrashBtn.addEventListener('click', () => {
      if (cmd.value !== "info") {
        gosterInfo(cmd, endpoint, highlightHelper?.highlightIfJson);
        const resultIl = document.getElementById("result-il-metin");
        if (resultIl) resultIl.innerHTML = ""; // önceki sonuçları temizle
        cmd.select();
        cmd.focus();
        showAlert('JSON verileri temizlendi', 'clean');
      }

    });
  }
}

export function normalizeTR(text) {
  return text
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i') // bazı platformlar için
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
/**
 * Türkiye koordinatları için özel normalize edici
 * Örn: "37.001.667" → 37.001667
 * @param {string|number} raw - Enlem veya boylam verisi
 * @returns {number}
 */
export function normalizeLoc(raw) {
  const str = String(raw).replace(/\D/g, ""); // Sadece rakamları al
  if (str.length < 5) return NaN;

  const ondalikIndex = 2;
  const duzeltilmis = str.slice(0, ondalikIndex) + '.' + str.slice(ondalikIndex);
  return parseFloat(duzeltilmis);
}
// Buraya başka fonksiyonlar da ekleyebilirsin
// export function setupFooter() { ... }
// export function sayHello(name) { ... }