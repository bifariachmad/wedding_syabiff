# Penyimpanan reservasi

Target: https://docs.google.com/spreadsheets/d/18MMsdmA47e9p3nhbQrhV-P4b8W9F4njlfvXiZEj6jsE/edit

Tab Reservations sudah diformat melalui Google Sheets: delapan kolom, header tetap, filter, validasi jumlah 1–5, checkbox kehadiran, kolom normalisasi disembunyikan, zona waktu Asia/Jakarta. Belum ada data tamu.

Untuk menghubungkan website:
1. Buka Extensions > Apps Script dari Sheet tersebut.
2. Salin Code.gs ke editor, lalu jalankan setup(). Izinkan akses ke Sheet.
3. Deploy > New deployment > Web app. Execute as: pemilik; Who has access: Anyone.
4. Simpan URL /exec ke APPS_SCRIPT_URL di src/config.js.
5. Uji reservasi dan pastikan barisnya muncul di Reservations.

ADMIN_PIN dibuat saat setup, tersimpan di Project Settings > Script Properties. Jangan masukkan PIN admin ke frontend. Website tetap menandai tiket sebagai contoh sampai endpoint aktif; koneksi Google Drive di Codex tidak otomatis menjadi endpoint bagi tamu website.

Proyek Apps Script sudah dibuat dan Code.gs sudah disimpan: https://script.google.com/u/0/home/projects/11QvuW0Qt04LnEz5wYIY0BZNV4pXz9eTTdJZjsQKd0vvbL3Pq1kX3mYAi/edit
Nama proyek: Reservasi Bifari & Syafira. setup() berhasil dijalankan pada 28 September 2026, 14:06 WIB. Web app Version 1 aktif dengan akses Anyone sesuai persetujuan pengguna pada 14:12 WIB.

Endpoint: https://script.google.com/macros/s/AKfycby6Q4_kxRQJ_l8Z8dpck1jXLT2v2dgq-9-V-Z4d6YjJeNE645GnrfMTkMWXfdNyXur1yA/exec

Endpoint sudah dipasang ke src/config.js. Pengujian otomatis memakai mock atau mode contoh agar tidak menulis ke Sheet asli.

Verifikasi langsung 28 September 2026, 14:18 WIB: modul API website mengirim satu reservasi sintetis dari browser lokal, menerima respons ok beserta kode reservasi, dan baris yang sama terbaca di Reservations!A2:H2. Baris uji tersebut kemudian dibersihkan dan dibaca ulang untuk memastikan kosong; header serta format tetap utuh. Tidak ada tiket uji yang disimpan ke localStorage. Versi website lokal sudah terhubung; website hosting belum dipublikasikan ulang.

Version 2 berhasil diaktifkan pada 28 September 2026, 15:31 WIB, pada deployment dan URL yang sama. Reservasi baru menghasilkan enam angka; delapan karakter lama tetap terbaca. Uji browser langsung menghasilkan kode 630458, diverifikasi di Sheet baris 3, lalu hanya baris uji tersebut dibersihkan. Reservasi pengguna di baris 2 dipertahankan.
