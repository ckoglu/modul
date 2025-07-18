export async function yukleIlWiki(ilAdi, tip = '', anaIl = '', baslikElement, metinElement) {
  if (!ilAdi || !baslikElement || !metinElement) return;

  // İlk harfleri büyüt, geri kalanı küçült
  const format = str => {
    if (!str) return ''; // anaIl boş olabilir, bu durumda boş string döndür
    return str
      .split(' ')
      .map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'))
      .join(' ');
  };

  const displayName = format(ilAdi);         // ekranda gösterilecek ad
  const displayAnaIl = format(anaIl);        // varsa il adı da düzgün biçimde

  let pageTitle;
  if (tip === 'ilce') {
    // Eğer anaIl yoksa ama ilçe ise, ilçe_il formatında ara
    if (!anaIl) {
      // Örneğin: seyhan_adana
      pageTitle = `${displayName.replaceAll(' ', '_')}_${ilAdi.toLowerCase()}`;
    } else {
      // URL için Sarıçam,_Adana formatı
      pageTitle = `${displayName.replaceAll(' ', '_')},_${displayAnaIl.replaceAll(' ', '_')}`;
    }
  } else {
    // URL için sadece Adana
    pageTitle = displayName.replaceAll(' ', '_');
  }

  const wikipediaApiUrl = `https://tr.wikipedia.org/w/rest.php/v1/page/${encodeURIComponent(pageTitle)}/html`;

  try {
    const response = await fetch(wikipediaApiUrl);
    if (!response.ok) throw new Error(`HTTP hata kodu: ${response.status}`);

    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const targetElement = doc.querySelector('[data-mw-section-id="0"]');
    if (!targetElement) {
      metinElement.innerHTML = `<div class="text-red-500">"${displayName}" sayfasında bilgi bulunamadı.</div>`;
      return;
    }

    // Paragrafları al
    let paragraphs = [];
    let foundTable = false;
    for (const child of targetElement.children) {
      if (child.tagName === 'TABLE') foundTable = true;
      else if (foundTable && child.tagName === 'P') paragraphs.push(child.innerText.trim());
    }

    const metin = paragraphs.length > 0 ? paragraphs.join('\n\n') : ``;

    // Görsel
    const img = doc.querySelector('img[alt*="Türkiye\'deki konumu"], img[alt*="konumu"]');
    let imgHtml = '';
    if (img) {
      const fullSrc = img.src.startsWith('//') ? 'https:' + img.src : img.src;
      imgHtml = `<img src="${fullSrc}" alt="${img.alt}" class="max-w-full h-auto mb-3 rounded">`;
    }

    // Başlık metni
    const gosterimBaslik = tip === 'ilce' && displayAnaIl ? `${displayName}, ${displayAnaIl}` : displayName;

    // Elementleri güncelle
    baslikElement.textContent = paragraphs.length > 0 ? `${gosterimBaslik}` : ``;
    baslikElement.classList.remove('hidden');
    metinElement.innerHTML = `<div class="wiki-content">${imgHtml}<div class="wiki-text">${metin}</div></div>`;

  } catch (err) {
    metinElement.innerHTML = `<div class="text-red-500">"${displayName}" için veri alınamadı: ${err.message}</div>`;
    console.error("ilWiki hata:", err);
  }
}