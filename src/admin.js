import { request, ID_PATTERN, normalizeCode, displayCode } from './api.js';
import { icon } from './art.js';
import { downloadBlob } from './ticket.js';

export async function renderAdmin(app) {
  let pin = '', rows = [], scanner = null, selected = null;
  let loading = false, saving = false, cameraStarting = false, filter = 'all', session = 0, scanAttempt = 0;
  document.title = 'Buku Tamu — Bifari & Syafira';
  const clock = value => new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value));
  app.innerHTML = `<main class="admin paper reception">
    <nav class="companion-nav" aria-label="Navigasi buku tamu"><a href="/">B & S <span>31.10.2026</span></a><a href="/">Undangan digital ↗</a></nav>
    <header class="companion-heading reception-heading"><p class="kicker">BIFARI & SYAFIRA · 31 OKTOBER 2026</p><h1>Buku Tamu</h1><p>Setiap kehadiran, satu halaman dalam cerita kami.</p></header>
    <p id="admin-status" role="status" aria-live="polite"></p>
    <div id="reception-welcome" class="reception-welcome">
      <div class="reception-illustration" aria-hidden="true"><img class="reception-book" src="/assets/png/guestbook/closed.png" alt=""><img class="reception-bifari" src="/assets/png/welcome/bifari-front.png" alt=""><img class="reception-syafira" src="/assets/png/welcome/syafira-front.png" alt=""><span>Sepasang jiwa. Sejuta cerita.</span></div>
      <form id="admin-login" class="companion-card"><p class="kicker">MEJA PENERIMA TAMU</p><h2>Selamat datang,<br>penjaga cerita.</h2><p>Masuk untuk menyambut tamu dan mencatat kehadiran mereka.</p><label for="admin-pin">PIN panitia</label><input type="password" id="admin-pin" autocomplete="current-password" placeholder="Masukkan PIN panitia" maxlength="128" required aria-describedby="login-note"><button class="button primary" id="login-submit">Buka buku tamu →</button><p id="login-note" class="small-note">Gunakan PIN panitia yang sama dengan admin reservasi.</p><div class="reception-login-note">Pindai QR · Cari nama · Catat kehadiran</div></form>
    </div>
    <div id="admin-panel" hidden>
      <div class="reception-toolbar"><p id="sync-status" role="status"></p><div class="admin-actions"><button class="button" id="refresh">Muat ulang</button><button class="button" id="export">${icon('download')}Ekspor CSV</button><button class="button" id="logout">Keluar</button></div></div>
      <div class="admin-totals" aria-label="Ringkasan kehadiran"><div><span>Tamu diundang</span><strong id="total-guests">0</strong><small id="total-reservations">0 reservasi</small></div><div><span>Sudah hadir</span><strong id="total-checkin">0</strong><small>orang tercatat</small></div><div><span>Belum hadir</span><strong id="total-waiting">0</strong><small>orang dinantikan</small></div></div>
      <div class="reception-workspace">
        <section class="reception-scanner" aria-labelledby="scan-title"><p class="kicker">01 / SAMBUT TAMU</p><h2 id="scan-title">Segel kehadiran</h2><p class="reception-intro">Pindai QR pada tiket atau masukkan kode tamu.</p>
          <div class="scanner-stage"><video id="scanner-video" playsinline muted hidden aria-label="Kamera pemindai QR"></video><div id="scanner-overlay" aria-hidden="true"><img src="/assets/png/scanner-frame.png" alt=""></div><div id="scanner-placeholder"><img src="/assets/png/guestbook/closed.png" alt=""><p>Satu tiket, satu cerita.</p><span>Kamera aktif saat kamu menekan Pindai QR.</span></div></div>
          <div class="scan-actions"><button class="button primary" id="scan">Pindai QR</button><button class="button" id="stop-scan" hidden>Tutup kamera</button></div>
          <form id="manual-form"><label for="manual-code">Atau masukkan kode tamu</label><div class="inline-form"><input id="manual-code" autocomplete="off" spellcheck="false" placeholder="482 731" inputmode="text" maxlength="18" required><button class="button">Cari</button></div></form>
          <div id="checkin-result" aria-live="polite" aria-atomic="true" tabindex="-1"></div>
        </section>
        <section class="companion-card reception-directory" aria-labelledby="directory-title"><p class="kicker">02 / HALAMAN KEHADIRAN</p><div class="reception-directory-title"><h2 id="directory-title">Nama dalam cerita</h2><img src="/assets/png/guestbook/closed.png" alt=""></div><label for="search-name">Cari nama atau kode</label><input id="search-name" type="search" autocomplete="off" placeholder="Nama tamu / 482 731"><div class="reception-filters" role="group" aria-label="Filter kehadiran"><button data-filter="all" aria-pressed="true">Semua</button><button data-filter="waiting" aria-pressed="false">Belum hadir</button><button data-filter="present" aria-pressed="false">Sudah hadir</button></div><p id="list-note" role="status"></p><div id="reservation-list"></div><p class="small-note reception-count-note">Jumlah hadir mengikuti jumlah orang dalam reservasi.</p></section>
      </div>
      <nav class="reception-links" aria-label="Alat panitia"><a href="/reservasi?mode=panitia" target="_blank" rel="noopener">Reservasikan tamu offline ↗</a><a href="https://docs.google.com/spreadsheets/d/18MMsdmA47e9p3nhbQrhV-P4b8W9F4njlfvXiZEj6jsE/edit#gid=10312026" target="_blank" rel="noopener">Buka Google Sheets ↗</a><a href="/album-admin" target="_blank" rel="noopener">Kelola album ↗</a></nav>
    </div>
    <footer class="companion-footer">BIFARI & SYAFIRA <span>SATU HARI, SELAMANYA DIKENANG</span></footer>
  </main>`;
  const $ = selector => app.querySelector(selector);
  const status = $('#admin-status'), panel = $('#admin-panel');
  function safe(tag, text, cls = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function setBusy() {
    $('#refresh').disabled = loading || saving;
    $('#login-submit').disabled = loading;
    $('#login-submit').textContent = loading ? 'Membuka buku…' : 'Buka buku tamu →';
    $('#scan').disabled = saving || loading || cameraStarting;
    $('#manual-form button').disabled = saving || loading;
    app.querySelectorAll('.admin-row button').forEach(button => button.disabled = saving || loading);
    const mark = $('#mark-present');
    if (mark) mark.disabled = saving || loading;
  }
  function render() {
    const total = rows.reduce((sum, row) => sum + row.guests, 0);
    const present = rows.filter(row => row.checked_in).reduce((sum, row) => sum + row.guests, 0);
    $('#total-guests').textContent = total;
    $('#total-checkin').textContent = present;
    $('#total-waiting').textContent = total - present;
    $('#total-reservations').textContent = rows.length + ' reservasi';
    const query = $('#search-name').value.trim().toLocaleLowerCase('id');
    const code = normalizeCode(query);
    const filtered = rows.filter(row => (row.name.toLocaleLowerCase('id').includes(query) || row.id.includes(code)) && (filter === 'all' || (filter === 'present' ? row.checked_in : !row.checked_in))).sort((a, b) => a.name.localeCompare(b.name, 'id'));
    const list = $('#reservation-list');
    list.replaceChildren();
    $('#list-note').textContent = filtered.length + ' dari ' + rows.length + ' reservasi';
    for (const row of filtered) {
      const item = safe('article', '', 'admin-row'), details = safe('div', '');
      details.append(safe('h3', row.name), safe('p', row.guests + ' tamu · ' + displayCode(row.id)));
      details.append(safe('span', row.checked_in ? 'Hadir' + (row.checked_in_at ? ' · ' + clock(row.checked_in_at) + ' WIB' : '') : 'Menanti kehadiran', 'reception-badge ' + (row.checked_in ? 'is-present' : '')));
      const button = safe('button', row.checked_in ? 'Lihat' : 'Check-in', 'button');
      button.type = 'button';
      button.setAttribute('aria-label', (row.checked_in ? 'Lihat kehadiran ' : 'Check-in ') + row.name);
      button.onclick = () => { if (!saving && !loading) show(row, true); };
      item.append(details, button);
      list.append(item);
    }
    if (!filtered.length) list.append(safe('p', rows.length ? 'Belum ada nama yang cocok. Coba kata lain atau ubah filter.' : 'Buku masih kosong. Reservasi tamu akan muncul di sini setelah dimuat ulang.', 'reception-empty'));
    setBusy();
  }
  function synced() {
    $('#sync-status').textContent = 'Terakhir disinkronkan ' + clock(Date.now()) + ' WIB';
    $('#sync-status').dataset.state = 'synced';
  }
  async function load() {
    if (loading || saving) return;
    const current = session;
    loading = true;
    stop();
    setBusy();
    status.textContent = 'Memuat daftar tamu…';
    try {
      const result = await request('list', { pin });
      if (current !== session) return;
      rows = result.reservations.map(row => ({ ...row, id: String(row.id), guests: Number(row.guests) }));
      panel.hidden = false;
      $('#reception-welcome').hidden = true;
      $('#admin-login').hidden = true;
      $('.reception').classList.add('is-open');
      status.textContent = '';
      synced();
      render();
      if (selected) {
        const latest = rows.find(row => row.id === selected.id);
        if (latest) show(latest); else resetResult();
      }
    } catch (error) {
      if (current !== session) return;
      status.textContent = panel.hidden ? error.message : 'Gagal memuat ulang. Daftar sebelumnya masih dapat dicari; coba muat ulang saat koneksi kembali.';
      $('#sync-status').textContent = 'Daftar belum diperbarui';
      $('#sync-status').dataset.state = 'stale';
      throw error;
    } finally {
      if (current === session) { loading = false; setBusy(); }
    }
  }
  $('#admin-login').onsubmit = async event => {
    event.preventDefault();
    if (loading) return;
    pin = $('#admin-pin').value;
    try { await load(); $('#admin-pin').value = ''; } catch { pin = ''; }
  };
  $('#refresh').onclick = () => load().catch(() => {});
  $('#search-name').oninput = render;
  app.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      filter = button.dataset.filter;
      app.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    };
  });
  function stop() {
    scanAttempt++;
    scanner?.stop();
    $('#scanner-video').hidden = true;
    $('#scanner-overlay').style.display = 'none';
    $('#scanner-placeholder').hidden = false;
    $('#stop-scan').hidden = true;
    $('#scan').hidden = false;
  }
  function resetResult() {
    selected = null;
    $('#checkin-result').replaceChildren();
    $('#manual-code').value = '';
  }
  function nextButton(target) {
    const next = safe('button', 'Tamu berikutnya →', 'button');
    next.type = 'button';
    next.id = 'next-guest';
    next.onclick = () => { resetResult(); status.textContent = ''; $('#scan').focus(); };
    target.append(next);
  }
  function show(row, focus = false) {
    selected = row;
    stop();
    const target = $('#checkin-result');
    target.replaceChildren();
    target.dataset.state = row.checked_in ? 'present' : 'confirm';
    target.append(safe('p', row.checked_in ? 'KEHADIRAN TERCATAT' : 'TIKET DITEMUKAN', 'kicker'), safe('h3', row.name), safe('p', 'Jumlah Tamu: ' + row.guests), safe('p', displayCode(row.id), 'reception-result-code'));
    if (row.checked_in) {
      target.append(safe('p', 'Sudah hadir' + (row.checked_in_at ? ' · ' + clock(row.checked_in_at) + ' WIB' : ''), 'present'));
      target.append(safe('p', 'Tamu ini sudah tercatat. Kehadiran tidak dihitung dua kali.', 'small-note'));
      nextButton(target);
    } else {
      target.append(safe('p', 'Pastikan nama dan jumlah rombongan sesuai sebelum mencatat kehadiran.', 'small-note'));
      const button = safe('button', 'Tandai Hadir', 'button primary');
      button.id = 'mark-present';
      button.onclick = async () => {
        if (saving || loading) return;
        const current = session;
        saving = true;
        setBusy();
        button.textContent = 'Mencatat kehadiran…';
        status.textContent = 'Menyimpan kehadiran…';
        try {
          const result = await request('checkin', { id: row.id, pin });
          if (current !== session) return;
          const updated = { ...result.reservation, id: String(result.reservation.id), guests: Number(result.reservation.guests) };
          rows = rows.map(item => item.id === row.id ? updated : item);
          show(updated);
          render();
          status.textContent = 'Kehadiran ' + updated.name + ' tersimpan. Selamat datang!';
        } catch {
          if (current !== session) return;
          status.textContent = 'Belum ada konfirmasi penyimpanan. Periksa koneksi lalu coba lagi; check-in ulang tidak menggandakan kehadiran.';
          let message = target.querySelector('.reception-save-error');
          if (!message) { message = safe('p', '', 'small-note reception-save-error'); target.append(message); }
          message.textContent = 'Kehadiran belum terkonfirmasi. Periksa koneksi lalu coba simpan lagi.';
          button.textContent = 'Coba simpan lagi';
        } finally {
          if (current === session) { saving = false; setBusy(); }
        }
      };
      target.append(button);
    }
    if (focus) { target.scrollIntoView({ block: 'nearest' }); target.focus({ preventScroll: true }); }
    setBusy();
  }
  function findCode(value) {
    if (saving || loading || panel.hidden) return false;
    const id = normalizeCode(value);
    const row = ID_PATTERN.test(id) && rows.find(item => item.id === id);
    status.textContent = '';
    if (row) show(row, true);
    else {
      stop();
      selected = null;
      const target = $('#checkin-result');
      target.dataset.state = 'missing';
      target.replaceChildren(safe('h3', 'Kode tidak ditemukan.'), safe('p', 'Gunakan QR tiket reservasi. Coba muat ulang daftar, masukkan kode, atau cari nama tamu.'));
      nextButton(target);
      target.scrollIntoView({ block: 'nearest' });
      target.focus({ preventScroll: true });
    }
    return !!row;
  }
  $('#manual-form').onsubmit = event => { event.preventDefault(); findCode($('#manual-code').value); };
  $('#scan').onclick = async () => {
    if (saving || loading || cameraStarting || panel.hidden) return;
    resetResult();
    const attempt = ++scanAttempt;
    const current = session;
    cameraStarting = true;
    setBusy();
    $('#scan').hidden = true;
    $('#stop-scan').hidden = false;
    status.textContent = 'Membuka kamera…';
    try {
      const { default: QrScanner } = await import('qr-scanner');
      if (attempt !== scanAttempt || current !== session) return;
      // The scanner measures the video during construction; it must already be visible.
      $('#scanner-video').hidden = false;
      $('#scanner-placeholder').hidden = true;
      if (!scanner) scanner = new QrScanner($('#scanner-video'), result => findCode(result.data), { preferredCamera: 'environment', returnDetailedScanResult: true, highlightScanRegion: true, overlay: $('#scanner-overlay'), maxScansPerSecond: 5 });
      const activeScanner = scanner;
      await activeScanner.start();
      if (attempt !== scanAttempt || current !== session) { activeScanner.stop(); return; }
      status.textContent = 'Arahkan QR tiket ke dalam bingkai kamera.';
    } catch {
      if (attempt !== scanAttempt || current !== session) return;
      stop();
      status.textContent = 'Kamera tidak tersedia. Izinkan akses kamera, masukkan kode manual, atau cari nama.';
    } finally {
      if (current === session) { cameraStarting = false; setBusy(); }
    }
  };
  $('#stop-scan').onclick = () => { stop(); status.textContent = ''; };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => { stop(); scanner?.destroy(); scanner = null; });
  $('#export').onclick = () => {
    const cell = value => '"' + String(value).replace(/^[=+\-@]/, "'$&").replaceAll('"', '""') + '"';
    const lines = [['id', 'name', 'guests', 'checked_in', 'checked_in_at'], ...rows.map(row => [row.id, row.name, row.guests, row.checked_in, row.checked_in_at])];
    downloadBlob(new Blob(['\uFEFF' + lines.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'reservasi.csv');
  };
  $('#logout').onclick = () => {
    session++;
    pin = ''; rows = []; loading = false; saving = false; cameraStarting = false; filter = 'all';
    stop(); scanner?.destroy(); scanner = null;
    resetResult();
    panel.hidden = true;
    $('#reception-welcome').hidden = false;
    $('#admin-login').hidden = false;
    $('.reception').classList.remove('is-open');
    $('#reservation-list').replaceChildren();
    $('#search-name').value = '';
    $('#admin-pin').value = '';
    app.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    status.textContent = '';
    render();
    $('#admin-pin').focus();
  };
}
