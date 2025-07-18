export function updatePrefix(site, repository) {
  const prefixElement = document.getElementById("prefix");

  if (!prefixElement) return;

  if (window.innerWidth > 768) {
    prefixElement.innerText = site;
  } else {
    prefixElement.innerText = repository;
  }
}

// Otomatik çalıştırmak istersen bu kısmı dışarıdan da tetikleyebilirsin:
export function initPrefix(site, repository) {
  updatePrefix(site, repository);
  window.addEventListener("resize", () => updatePrefix(site, repository));
}