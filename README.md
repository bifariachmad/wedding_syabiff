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

- Aplikasi: https://wedding-syabiff-undangan.vercel.app/
- Git: https://github.com/bifariachmad/wedding_syabiff
- Proyek Vercel: `wedding-syabiff-undangan`.
- Jalankan `npm run build` lalu `vercel --prod` dari folder ini. Kredensial server disimpan di Vercel, tidak di Git.
- URL antar-app mengikuti `.env.example`; mode development tanpa override tetap memakai port lokal.
