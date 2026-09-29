# Undangan Pernikahan — Bifari & Syafira

Undangan visual novel sembilan bab, dengan artwork PNG, navigasi Kembali/Lanjut, dan kanvas 9:16 untuk HP atau tablet vertikal. Desktop menampilkan petunjuk perangkat; tablet mendatar meminta diputar tanpa menghapus progres.

## Menjalankan

Di folder `invitation/`, jalankan `npm ci` lalu `npm run dev`. Server lokal berada di http://127.0.0.1:5173/. Untuk mencoba dari HP pada Wi-Fi yang sama, jalankan `npm run dev -- --host 0.0.0.0`, lalu gunakan alamat jaringan yang dicetak Vite. Browser desktop hanya menampilkan pemberitahuan, sesuai kebutuhan produk. Mode perangkat mobile di DevTools dapat dipakai untuk pengujian lokal.

`npm run build` menghasilkan `dist/`. `npm run preview` membuka hasil build di port 4173. Produksi memakai Vercel di https://diginvit.bifariachmad.com.

## Alur

1. Ketukan pintu, undangan, kertas terbakar, portal.
2. Gerbang pagi terbuka, tamu langsung berjalan, nama pengantin tampil.
3. Pengantin menyambut secara bergantian, lalu menuju jam besar.
4. Tanggal, waktu, dan hitung mundur; “Simpan tanggalnya, ya!”
5. Lokasi, waktu acara, dan tombol Google Maps.
6. Gulungan terbuka menampilkan seluruh rundown, lalu menutup sebelum beralih.
7. Kain maroon dan hitam: ditumpuk, kemudian dipisah.
8. Buku dibuka, kamera mendekat ke halaman kanan, tamu menulis reservasi dan menerima segel.
9. Tiket PNG dengan QR dan kode tamu enam angka; bisa disimpan sebagai foto.

Reservasi harus diisi sebelum tiket dibuka. Navigasi menggunakan Lanjut dan Kembali; pada tiket akhir hanya Kembali yang ditampilkan.

## Penyimpanan dan musik

Endpoint Google Sheets sudah aktif di `src/config.js`. `apps-script/SETUP-ID.md` mencatat deployment. Reservasi baru memakai enam angka, ditampilkan seperti `482 731`; QR dan kode lama tetap didukung. Route `/admin` tetap dilindungi PIN dan dapat dipakai untuk pemeriksaan. Kontrak untuk aplikasi buku tamu tablet berikutnya: [docs/reservation-contract.md](docs/reservation-contract.md).

BGM: Canon in D, piano Lee Galloway, CC BY-SA 3.0; atribusi tersedia di halaman tiket dan `public/assets/audio/CREDITS.html`. Musik dimulai setelah interaksi tamu. Efek suara terpisah dari volume BGM. Pilihan mute disimpan di perangkat.

## Folder

- `src/`: scene, animasi, audio, form, tiket, dan alat admin yang sudah ada.
- `public/assets/`: PNG, font, dan musik yang digunakan website.
- `apps-script/`: backend dan catatan deployment Google Sheets.
- `artwork/`: prompt serta metadata aset.
- `docs/`: kontrak integrasi dan riwayat implementasi.
- `tests/`: pengujian backend serta browser; semua tes otomatis memakai backend tiruan.
- `scripts/`: build dan pengolahan aset.
- `artifacts/`: hasil uji lokal, tidak ikut deployment.
- `../source-art/`: sumber artwork dan seluruh revisi, dipisahkan dari aplikasi.

Buku tamu tablet, reservasi langsung, cetak A5, dan album kamera tersedia sebagai halaman terpisah. Panduan rute, PIN, QR, moderasi, penyimpanan foto, dan batasan ada di [docs/OPERASIONAL.md](docs/OPERASIONAL.md). Proyek memakai Vercel Functions dan Vercel Blob privat untuk album; reservasi tetap memakai Apps Script dan Google Sheets yang sudah aktif.

## Pemeriksaan

`npm test`: validasi, kode, kompatibilitas, dan check-in backend.
`npm run verify`: seluruh scene, form, QR, unduh tiket, perubahan reservasi, kegagalan jaringan, dan pemindaian QR admin dengan kamera simulasi.
`node tests/portrait.mjs`: bingkai HP/tablet, pemberitahuan desktop/orientasi, animasi buku, rundown, aset musik, dan ekspor tiket.
`node tests/restart.mjs`: navigasi akhir tanpa tombol Ulangi; kembali dan muat ulang tetap menjaga tiket.

Detail sumber aset: [ASSETS.md](ASSETS.md). Uraian lama disimpan dalam [docs/implementation-history.md](docs/implementation-history.md).
