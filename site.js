'use strict';
// Список версий и ссылка на скачивание. Версии берутся из changelog.json, ссылка на установщик из последнего релиза GitHub.

const REPO = 'pandemiaas/capemusic';
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

async function loadChangelog() {
  const box = document.getElementById('changelog-list');
  try {
    const res = await fetch('changelog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    const list = await res.json();
    box.replaceChildren();
    list.forEach((r, i) => {
      const art = document.createElement('article');
      art.className = 'rel';
      art.innerHTML =
        `<header><h3>${esc(r.version)}</h3><time datetime="${esc(r.date)}">${esc(fmtDate(r.date))}</time>${i === 0 ? '<span class="badge">последняя</span>' : ''}</header>` +
        `<ul>${(r.notes || []).map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
      box.append(art);
    });
  } catch {
    box.innerHTML = '<p class="muted">Не удалось загрузить список версий. Обнови страницу.</p>';
  }
}

// Последний релиз GitHub: tag_name (v0.4.1) и файл установщика (.exe) среди приложенных файлов.
async function loadLatest() {
  const link = document.getElementById('download-link');
  link.setAttribute('href', RELEASES_PAGE);
  link.removeAttribute('download');
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return;
    const rel = await res.json();
    const version = String(rel.tag_name || '').replace(/^v/i, '');
    const exe = (rel.assets || []).find((a) => /\.exe$/i.test(a.name));
    if (!version) return;
    document.getElementById('hero-version').textContent = `Версия ${version} · Windows 10 и новее`;
    document.getElementById('download-info').textContent = `Версия ${version}. Для Windows 10 и новее. Дальше приложение обновляется само.`;
    if (exe && /^https:\/\/github\.com\//.test(exe.browser_download_url)) link.setAttribute('href', exe.browser_download_url);
  } catch {
    // релиза ещё нет или нет связи: остаётся ссылка на страницу релизов
  }
}

loadChangelog();
loadLatest();
