# undangan_digital

Undangan cerita interaktif, reservasi tamu online, tiket QR, jadwal, dan lokasi. Proyek ini tidak memuat aplikasi check-in, cetak, atau kamera.

## Jalankan sendiri

```powershell
cd undangan_digital
npm ci
npm run dev
```

Buka http://localhost:5173/. Setiap proyek memiliki `package.json`, lockfile, dependensi, aset, dan konfigurasi build sendiri. Tidak ada import source atau symlink ke folder aplikasi lain.

- `npm run build`: hasil produksi di `dist/`.
- `npm run preview`: hasil build di http://localhost:4173/.
- `npm test`: tes proyek ini.
- `npm run verify`: pemeriksaan browser; jalankan server dev proyek ini terlebih dahulu.

Riwayat Git dan remote `bifariachmad/wedding_syabiff` diteruskan di folder ini. Pemisahan ini baru lokal; website yang sudah live belum diubah. Sebelum deployment berikutnya, pasang aplikasi pendamping secara terpisah dan atur domain/routing yang diperlukan.

Sumber artwork adegan ada di `source-art/`, aset web di `public/assets/`.

## Produksi (13 Oktober 2026)

- Aplikasi: https://undangan.diginvit.bifariachmad.com/
- Git: https://github.com/bifariachmad/wedding_syabiff
- Proyek Vercel: `wedding-syabiff-undangan`.
- Jalankan `npm run build` lalu `vercel --prod` dari folder ini. Kredensial server disimpan di Vercel, tidak di Git.
- URL antar-app mengikuti `.env.example`; mode development tanpa override tetap memakai port lokal.


## Konfirmasi tidak dapat hadir (14 Oktober 2026)

Buku tamu meminta pilihan **Akan hadir** atau **Tidak dapat hadir** secara eksplisit. Jumlah rombongan 1–5 hanya diperlukan jika akan hadir. Jawaban berhalangan menampilkan ucapan terima kasih tanpa QR/tiket, tersimpan di perangkat yang sama untuk dibuka kembali, dan dapat diubah lewat Ubah Konfirmasi. Perubahan dengan nama yang sama mempertahankan satu catatan.

Backend bersama menyimpan jawaban berhalangan sebagai jumlah 0 dengan respons API attendance=declined. Tamu Organizer menampilkan dan memfilter jawaban ini, sedangkan statistik dan daftar check-in hanya menghitung tamu yang akan hadir. QR yang pernah diunduh ditolak jika konfirmasi terbaru berhalangan.

Perubahan sumber ini perlu dirilis bersama: deploy Tamu Organizer, Dashboard, dan Aplikasi check-in terlebih dahulu; perbarui Apps Script dari Tamu_Organizer/apps-script/Code.gs, jalankan setup() untuk validasi jumlah 0–5, lalu perbarui versi deployment pada URL yang sama; terakhir deploy undangan digital. Tanpa pembaruan backend, jawaban berhalangan akan ditolak dan halaman tetap menampilkan kegagalan, bukan konfirmasi sukses.

npm test mencakup validasi RSVP, perubahan dua arah, statistik, dan penolakan QR lama. npm run verify juga menguji RSVP melalui backend tiruan; tidak ada penulisan ke Sheet produksi.


## Audit undangan — 14 Oktober 2026

Pilihan RSVP kini eksplisit: akan hadir / tidak dapat hadir. Jawaban berhalangan tidak menerbitkan QR dan tidak dihitung sebagai tamu aktif. Penutup menyediakan unduhan kalender; alamat venue tertulis di halaman lokasi. Kegagalan ilustrasi tiket memakai kertas/teks cadangan dan tidak menghentikan navigasi. Status RSVP tertutup dibaca dari pengaturan panitia dan juga diperiksa server.

Temuan lanjutan: identitas reservasi masih menggunakan nama yang dinormalisasi, sehingga dua orang bernama persis sama dianggap satu reservasi. Sebelum membagikan undangan ke nama yang sama, bedakan nama/keluarganya melalui Organizer. Kontak panitia belum ditampilkan karena nomor yang boleh dipublikasikan belum diberikan. Navigasi per bab dapat dipertimbangkan untuk tamu yang membuka undangan kembali.
