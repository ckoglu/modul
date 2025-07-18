export async function processUrlParams() {

  const cmdInput = document.getElementById("cmd");
  const endpoint = document.getElementById("endpoint");
  // const eCopyBtn = document.getElementById('endpoint-copy-button');
  // const eLinkBtn = document.getElementById('endpoint-link-button');
  // const eTrashBtn = document.getElementById('endpoint-trash-button');

  if (!cmdInput) return;

  const urlParams = new URLSearchParams(window.location.search);
  const cmdFromUrl = urlParams.get("cmd");

  // index.html varsa temizle
  if (location.pathname.includes("index.html")) {
    const cleanedUrl = location.href.replace(/index\.html/, "");
    history.replaceState({}, "", cleanedUrl);
  }

  // Highlight helper'ı yükle
  let highlightHelper;
  try {highlightHelper = await import("../helper/highlightApply.js");} catch (e) {console.warn("highlightApply.js yüklenemedi:", e);}

  // Sayfa açıldığında URL'deki komutu uygula
  if (cmdFromUrl) {
    cmdInput.value = cmdFromUrl;
    await window.cmdRun(cmdFromUrl);
    setTimeout(() => {
      highlightHelper?.highlightIfJson(endpoint);
    }, 50);
  }

  // Input değişince URL'yi güncelle ve highlight uygula
  cmdInput.addEventListener("input", () => {
    const currentValue = cmdInput.value.trim();
    const newUrl = new URL(window.location.href);

    if (currentValue) {
      newUrl.searchParams.set("cmd", currentValue);
    } else {
      newUrl.searchParams.delete("cmd");
    }

    history.replaceState({}, "", newUrl.toString());

    setTimeout(() => {
      highlightHelper?.highlightIfJson(endpoint);
    }, 50);
  });
}
