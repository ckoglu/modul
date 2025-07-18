export async function meMode() {
  const user = 'ckoglu';
  const repo = 'egitim';
  const ul = document.getElementById('commits');
  const status = document.getElementById('me-durum-info');

  const today = new Date().toISOString().split('T')[0];
  const lastFetched = localStorage.getItem('lastFetched');
  const cachedCommits = localStorage.getItem('cachedCommits');

  if (lastFetched === today && cachedCommits) {
    const commits = JSON.parse(cachedCommits);
    renderCommits(commits, ul);
    if (status) status.setAttribute('data-ust-title', 'localStorage');
    return;
  }

  const now = new Date();
  const until = now.toISOString();
  const past = new Date();
  past.setDate(now.getDate() - 30);
  const since = past.toISOString();

  const baseUrl = `https://api.github.com/repos/${user}/${repo}/commits?author=${user}&since=${since}&until=${until}&per_page=100`;
  const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(baseUrl)}`;

  try {
    const res = await fetch(proxyUrl);
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('API geçersiz veri döndürdü.');
    }

    const commits = data
      .map((c) => {
        const [title, ...rest] = c.commit.message.split('\n');
        return {
          date: new Date(c.commit.author.date),
          title: title,
          description: rest.join('</p><p>') || '',
        };
      })
      .sort((a, b) => b.date - a.date);

    localStorage.setItem('cachedCommits', JSON.stringify(commits));
    localStorage.setItem('lastFetched', today);

    renderCommits(commits, ul);
    if (status) status.setAttribute('data-ust-title', 'API');
  } catch (err) {
    console.error(err);
    ul.innerHTML = `<div></div>`;
    showAlert(`Veri alınamadı: ${err.message}`, 'warning');
  }
}

// Yardımcı fonksiyon: Commits listele
export function renderCommits(commits, container) {
  if (!container) return;

  if (commits.length === 0) {
    container.innerHTML = '<div>Hiç commit bulunamadı.</div>';
    showAlert(`Bu dönemde commit bulunamadı.`, 'warning');
    return;
  }

  // Grupla: { '2025-07-09': [commit1, commit2], ... }
  const grouped = {};
  commits.forEach(commit => {
    const tarih = new Date(commit.date).toLocaleDateString("tr-TR", {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    if (!grouped[tarih]) grouped[tarih] = [];
    grouped[tarih].push(commit);
  });

  let html = '';
  for (const tarih in grouped) {
    html += `<div class="changelog-day"><h4>${tarih}</h4><ul class="changelog-list">`;
    
    grouped[tarih].forEach(commit => {
      html += `
        <li class="changelog-entry">
          <div class="entry-header">
            <strong class="entry-title">${commit.title}</strong>
            <span class="entry-time">${timeAgo(commit.date)}</span>
          </div>
          ${commit.description
            ? `<div class="entry-description">${commit.description}</div>`
            : ''}
        </li>
      `;
    });

    html += `</ul></div>`;
  }

  container.innerHTML = html;
}
