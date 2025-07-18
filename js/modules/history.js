// history.js

const site = location.origin;
const repository = "/modul/";
const jsURL = site + repository + "js/";
const modulURL = jsURL + "modules/";
const helperURL = jsURL + "helper/";

const STORAGE_KEY = "historyCmd";
const HISTORY_UPDATE_EVENT = "historyUpdated";

let historyItems = [];
let renderedCount = 0;
const PAGE_SIZE = 10;
let isLoading = false;

/**
 * Komut geçmişi değişikliklerinde tetiklenen event
 */
document.addEventListener(HISTORY_UPDATE_EVENT, () => {
  renderHistoryLazy();
});

/**
 * Komut tıklanma olayı
 * @param {string} cmd 
 */
function handleCommandClick(cmd) {
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const index = list.findIndex(item => item.cmd === cmd);

  if (index !== -1) {
    // Komutu en üstte güncelle ve tarihe göre öne al
    const item = list.splice(index, 1)[0];
    item.date = new Date().toISOString();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    document.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
  }

  // URL'yi güncelle ve sayfayı yenile
  const url = new URL(location.href);
  url.searchParams.set("cmd", cmd);
  location.href = url.toString();
}

/**
 * Geçmiş verilerini kullanıcı bazında getirir (localStorage'dan)
 * @param {string} uid 
 * @returns {Array} Komut geçmişi listesi
 */
async function getHistory(uid) {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return raw.filter(item => item.uid === uid)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Kullanıcı bilgisini modülden alır
 * @returns {Object} Kullanıcı objesi (uid gibi)
 */
async function getCurrentUser() {
  try {
    const userModul = await import(`${modulURL}user.js`);
    return await userModul.getCurrentUser();
  } catch (error) {
    console.error("Kullanıcı alınamadı:", error);
    return null;
  }
}

/**
 * Geçmişi 10'ar 10'ar (PAGE_SIZE) yükler, başlangıçta ekran dolana kadar otomatik yükler
 * Scroll yapıldıkça devam eder (sonsuz scroll)
 */
export async function renderHistoryLazy(batchSize = PAGE_SIZE) {
  const container = document.getElementById("history-cmd");
  if (!container) return;

  const currentUser = await getCurrentUser();
  if (!currentUser?.uid) {
    container.innerHTML = `<p class="text-muted">Kullanıcı giriş yapmamış.</p>`;
    return;
  }

  historyItems = await getHistory(currentUser.uid);

  if (historyItems.length === 0) {
    container.innerHTML = `<p class="text-muted">Henüz hiç komut girilmedi.</p>`;
    return;
  }

  container.innerHTML = "";
  renderedCount = 0;
  isLoading = false;

  function renderNextBatch() {
    if (isLoading) return;
    isLoading = true;

    const batch = historyItems.slice(renderedCount, renderedCount + batchSize);
    if (batch.length === 0) {
      window.removeEventListener("scroll", onScroll);
      isLoading = false;
      return;
    }

    // Gruplama için
    const now = new Date();
    const groupTitles = {
      today: "Bugün",
      yesterday: "Dün",
      week: "Geçen Hafta",
      month: "Geçen Ay",
      year: "Geçen Yıl",
      older: "Daha Eski"
    };
    const addedGroups = new Set();

    batch.forEach(entry => {
      const entryDate = new Date(entry.date);
      const diffTime = now - entryDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let groupKey;
      if (diffDays === 0) {
        groupKey = "today";
      } else if (diffDays === 1) {
        groupKey = "yesterday";
      } else if (diffDays <= 7) {
        groupKey = "week";
      } else if (diffDays <= 30) {
        groupKey = "month";
      } else if (diffDays <= 365) {
        groupKey = "year";
      } else {
        groupKey = "older";
      }

      // Grup başlığı ekle (aynı grup daha önce eklenmemişse)
      if (!addedGroups.has(groupKey)) {
        const groupTitle = document.createElement("p");
        groupTitle.className = "history-group-title";
        groupTitle.textContent = groupTitles[groupKey];
        container.appendChild(groupTitle);
        addedGroups.add(groupKey);
      }

      // Komut öğesi
      const div = document.createElement("div");
      div.className = "history-item";

      const link = document.createElement("div");
      link.className = "history-cmd-link";
      link.style.cursor = "pointer";
      link.setAttribute("data-sag-title", entry.cmd);
      link.textContent = entry.cmd;

      link.addEventListener("click", () => handleCommandClick(entry.cmd));

      div.appendChild(link);
      container.appendChild(div);
    });

    renderedCount += batch.length;
    isLoading = false;
  }

  // Ekran dolana kadar otomatik yükle (scrollHeight > viewportHeight olana kadar)
  function loadUntilFull() {
    while (
      renderedCount < historyItems.length &&
      document.documentElement.scrollHeight <= window.innerHeight + 50
    ) {
      renderNextBatch();
    }
  }

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (
      scrollTop + viewportHeight >= fullHeight - 100 &&
      !isLoading &&
      renderedCount < historyItems.length
    ) {
      renderNextBatch();
    }
  }

  // Scroll event listener ekle
  window.addEventListener("scroll", onScroll);

  // İlk yükleme
  loadUntilFull();
}

/**
 * Geçmişe komut ekler veya günceller
 * @param {string} cmd 
 * @param {string} uid 
 */
export function addToHistory(cmd, uid) {
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const now = new Date().toISOString();

  const existingIndex = list.findIndex(item => item.cmd === cmd && item.uid === uid);

  if (existingIndex !== -1) {
    list[existingIndex].date = now;
    const [updated] = list.splice(existingIndex, 1);
    list.unshift(updated); // en üste al
  } else {
    list.unshift({ cmd, date: now, uid });
  }

  // En fazla 200 kayıt tut
  const trimmed = list.slice(0, 200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  document.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT));
}

/**
 * History modülünü başlatır
 */
export function initializeHistory() {
  renderHistoryLazy();

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      renderHistoryLazy();
    }
  });
}
