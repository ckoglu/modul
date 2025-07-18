// komutSonucBlock.js

/**
 * Yeni bir komut çıktı bloğu oluşturur
 * @param {string} cmdText - Çalıştırılan komut
 * @returns {Object} Blok elementleri
 */
export function createNewOutputBlock(cmdText) {
  const container = document.getElementById("output-container");
  if (!container) return null;
  if (cmdText === "info") return null;

  const block = document.createElement("div");
  block.className = "output-block";

  block.innerHTML = `<p class="cmdText"><code>${cmdText}</code> komutu sonuçları :</p><div class="endpoint-buttons"><h4>JSON</h4><div class="sag-buttons"><a class="header-link gorBtn" data-ust-title="Kodu kopyala"><div class="icon"><i class="copy"></i></div></a><a class="header-link lnkBtn" data-ust-title="bağlantıya git"><div class="icon"><i class="link"></i></div></a></div></div><div class="endpoint"></div><div class="wiki-section"><h3 class="result-il-baslik"></h3><div class="il-wiki"><p class="result-il-metin"></p></div></div>`;
  container.prepend(block);

  return {
    block,
    endpoint: block.querySelector(".endpoint"),
    ilBaslik: block.querySelector(".result-il-baslik"),
    ilMetin: block.querySelector(".result-il-metin"),
    copyBtn: block.querySelector(".copy-btn"),
    deleteBtn: block.querySelector(".delete-btn"),
    copyJsonBtn: block.querySelector(".copy-json-btn")
  };
}

/**
 * Komut çıktısını işler
 * @param {string} cmdText - Çalıştırılan komut
 * @param {Object} response - handleAllParams'ten gelen yanıt
 * @param {Object} blockElements - Blok elementleri
 */
export async function processCommandOutput(cmdText, response, blockElements) {
  if (!blockElements) return;

  const { endpoint, ilBaslik, ilMetin } = blockElements;

  try {
    if (!response.success) {
      displayError(response.error, endpoint);
      return;
    }

    displayResult(response.data, endpoint);
    await loadWikiInfo(cmdText, response.data, ilBaslik, ilMetin);
    loadMap(response.data, blockElements.block);

  } catch (error) {
    console.error("Çıktı işleme hatası:", error);
    endpoint.innerHTML = `<div class="error-message p-3 bg-red-100 text-red-800 rounded">
      <h4 class="font-bold">İşlem hatası</h4>
      <p class="text-sm">${error.message}</p>
    </div>`;
  }
}

// Yardımcı fonksiyonlar
function displayResult(data, endpoint) {
  endpoint.innerHTML = window.Highlight?.syntaxHighlight?.(data) || 
    JSON.stringify(data, null, 2);
}

function displayError(error, endpoint) {
  endpoint.innerHTML = `
    <div class="error-message p-3 bg-red-100 text-red-800 rounded">
      <h4 class="font-bold">${error.message}</h4>
      ${error.details ? `<p class="text-sm mt-1">${error.details}</p>` : ''}
      <p class="text-xs mt-2">Komut: ${error.cmd}</p>
    </div>
  `;
}

async function loadWikiInfo(cmdText, data, baslikEl, metinEl) {
  const parsedParams = new URLSearchParams(cmdText);
  const il = parsedParams.get("il");
  const ilce = parsedParams.get("ilce");
  
  if (!il && !ilce) return;

  try {
    const ilWikiModul = await import("./ilWiki.js");
    
    // İlçe varsa ve il yoksa, il bilgisini data'dan al
    let actualIl = il;
    if (ilce && !il && data?.ilce?.il) {
      actualIl = data.ilce.il;
    }
    
    // Hem il hem de ilçe bilgisi varsa, ikisini de yükle
    if (actualIl && ilce) {
      // Önce il bilgisini yükle
      await ilWikiModul.yukleIlWiki(actualIl, "il", "", baslikEl, metinEl);
      
      // İlçe bilgisini yüklemek için yeni elementler oluştur
      const ilceBaslikEl = document.createElement('h3');
      const ilceMetinEl = document.createElement('div');
      metinEl.appendChild(ilceBaslikEl);
      metinEl.appendChild(ilceMetinEl);
      
      await ilWikiModul.yukleIlWiki(ilce, "ilce", actualIl, ilceBaslikEl, ilceMetinEl);
    } 
    // Sadece il varsa
    else if (actualIl && !ilce) {
      await ilWikiModul.yukleIlWiki(actualIl, "il", "", baslikEl, metinEl);
    }
    // Sadece ilçe varsa (ve data'dan il bilgisi alınabildiyse)
    else if (ilce && actualIl) {
      await ilWikiModul.yukleIlWiki(ilce, "ilce", actualIl, baslikEl, metinEl);
    }
  } catch (error) {
    console.error("Wiki yükleme hatası:", error);
  }
}

function loadMap(data, container) {
  if (!data || !data.iller || !Array.isArray(data.iller)) return;

  const il = data.iller[0]; // İlk ili al

  if (!il.enlem_duzeltildi || !il.boylam_duzeltildi) return;

  // Harita kutusu oluştur
  const mapContainer = document.createElement("div");
  mapContainer.id = "harita";
  mapContainer.className = "result-map";
  container.appendChild(mapContainer);

  // Leaflet.js yüklenmiş mi kontrol et
  if (typeof L === "undefined") {
    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletScript.onload = () => initMap(il);
    document.body.appendChild(leafletScript);
  } else {
    initMap(il);
  }

  function initMap(il) {
    const map = L.map("harita").setView([il.enlem_duzeltildi, il.boylam_duzeltildi], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: "&copy; OpenStreetMap katkıcıları",}).addTo(map);

    L.marker([il.enlem_duzeltildi, il.boylam_duzeltildi])
      .addTo(map)
      .bindPopup(`${il.adi} (${il.enlem_duzeltildi}, ${il.boylam_duzeltildi})`)
      .openPopup();
  }
}