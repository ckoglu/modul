export const htmlData = `
<section>
  <h2>Hakkında</h2>
  <p>Bu sayfa, <strong>Türkiye'nin il, ilçe, mahalle, köy, belde ve sokak</strong> verilerini sorgulamanıza olanak tanıyan açık kaynaklı bir <strong>JSON API arayüzü</strong> sunar.</p>

  <p>Tüm veriler GitHub üzerinden alınmakta ve istemci tarafında JavaScript ile işlenmektedir. Hiçbir arka uç sunucuya ihtiyaç duymadan hızlı, sade ve okunabilir bir arayüz sağlar.</p>

  <p>Veriler <code>CSV</code> formatında <a href="https://github.com/ckoglu/csv-tr-api" target="_blank" rel="noopener noreferrer">GitHub deposunda</a> barındırılmaktadır.</p>

  <h3 data-content="#" class="hover:content">Komutlar</h3>
  <ul>
    <li><code>il</code> – Tüm illeri JSON olarak döner</li>
    <li><code>il={adı,no}</code> – Belirli bir ili sorgular</li>
    <li><code>ilce</code> – Tüm ilçeleri listeler</li>
    <li><code>ilce={adı,no}</code> – Belirli bir ilçeyi sorgular</li>
    <li><code>ilcekod={no}</code> – İlçe kodu ile sorgu</li>
    <li><code>mahalle={adı,no}</code> – Mahalle verisi</li>
    <li><code>koy={adı,no}</code> – Köy verisi</li>
    <li><code>sokak={adı,no}</code> – Sokak bilgisi</li>
    <li><code>ara={kelime}</code> – Tüm veri içinde arama</li>
    <li><code>filtre={il,ilce,mahalle,koy,sokak}</code> – Arama sonuçlarını filtrele</li>
    <li><code>sirala={az,za}</code> – A-Z veya Z-A sıralama</li>
    <li><code>sutun={sütunadı}</code> – Belirli sütunları göster</li>
    <li><code>belediye={il adı,ilçe adı}</code> – Belediye bilgisi</li>
    <li><code>universite={il adı}</code> – Üniversite bilgisi</li>
  </ul>

  <h3 data-content="#" class="hover:content">Örnek Kullanımlar</h3>
  <ul>
    <li><code>il=ankara</code> – Ankara ilini getirir</li>
    <li><code>il=adana&ilce</code> – Adana’daki tüm ilçeleri döner</li>
    <li><code>ilce=seyhan&mahalle</code> – Seyhan ilçesindeki mahalleleri döner</li>
    <li><code>il=adana&sutun=id,adi</code> – Sadece id ve ad bilgisi</li>
    <li><code>il=adana&ilce=çukurova&mahalle=beyazevler&sokak=80060</code> – Sokak verisiyle birlikte detaylı çıktı</li>
    <li><code>ara=adana</code> – Tüm veri kümesinde adana araması</li>
    <li><code>ara=adana&filtre=il</code> – Sadece illerde adana araması</li>
    <li><code>ara=ank&baslayan=il,mahalle</code> – “ank” ile başlayan il ve mahalleler</li>
    <li><code>il&bolge=akdeniz</code> – Akdeniz bölgesindeki iller</li>
    <li><code>il&buyuksehir=false</code> – Büyükşehir olmayan iller</li>
    <li><code>il&nufus=1000000</code> – Nüfusu 1 milyonu geçen iller</li>
    <li><code>il&rakim=1000</code> – Rakımı 1000 m'den fazla olan iller</li>
    <li><code>il&kiyi=true</code> – Denize kıyısı olan iller</li>
    <li><code>ara=*ada&filtre=il&</code> – Ada ile başlayan illeri filtrele</li>
    <li><code>ara=*ada*&filtre=il&</code> – Ada içeren illeri filtrele</li>
    <li><code>ara=ada*&filtre=il&</code> – Ada ile biten illeri filtrele</li>
  </ul>

  <h3 data-content="#" class="hover:content">Kullanım</h3>
  <p>Sayfadaki komut kutusuna yukarıdaki örneklerden birini yazarak veriye ulaşabilirsiniz. Örneğin: <code>il=antalya&ilce=alanya</code></p>
  <p></p>
  <h3 data-content="#" class="hover:content">Hakkında</h3>
  <p>Bu proje, Türkiye’nin resmi idari birimlerini açık veri felsefesiyle herkese sunmak için geliştirilmiştir. Tüm sistem istemci taraflıdır, dış servise ihtiyaç duymaz.</p>

  <ul>
    <li>Yalnızca HTML, CSS ve JavaScript ile çalışır</li>
    <li>Veri kaynakları: Türkiye İstatistik Kurumu, NVI, OpenStreetMap vb.</li>
    <li>Açık kaynaklıdır ve MIT lisansı altındadır</li>
  </ul>
</section>
`;

export function gosterInfo(cmdInput) {
  if (!cmdInput) return;
  cmdInput.value = "info";
  const url = new URL(window.location.href);
  url.searchParams.set("cmd", "info");
  history.replaceState({}, "", url.toString());
  document.getElementById("header-text").innerHTML = htmlData;
}