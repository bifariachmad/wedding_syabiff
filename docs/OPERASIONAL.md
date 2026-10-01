# Bifari & Syafira — panduan panitia

Domain tujuan: https://diginvit.bifariachmad.com. Semua alamat di bawah memakai domain yang sama.

| Halaman | Kegunaan |
| --- | --- |
| `/` | Undangan digital sembilan bab untuk HP/tablet vertikal |
| `/reservasi` | Form reservasi langsung tanpa melewati cerita |
| `/reservasi?mode=panitia` | Reservasi atas nama tamu offline, tiket, dan cetak kartu personal |
| `/cetak` | Undangan A5 dua muka; memakai tiket terakhir yang dibuat di browser ini, jika ada |
| `/buku-tamu` | Scan QR, input kode, cari nama, check-in, ekspor CSV |
| `/album-admin` | Login PIN, ambil QR kamera, moderasi, buka/tutup galeri dan unggahan |
| `/kamera` | Kamera dan galeri tamu; masuk lewat link/QR album dari panitia |

## Reservasi dan buku tamu

PIN sama dengan admin reservasi sebelumnya, ada di Script Properties `ADMIN_PIN` pada proyek Apps Script. PIN tidak disimpan di source atau frontend. Reservasi memakai backend Google Sheets yang sudah aktif; tidak membutuhkan deployment ulang Apps Script.

Tab `Buku Tamu` di spreadsheet `list_reservasi` adalah tampilan otomatis kolom kode, nama, jumlah, status, dan waktu kehadiran dari tab `Reservations`. Check-in dilakukan lewat aplikasi. Jangan mengetik pada hasil formula tab `Buku Tamu`. Kode enam angka dan kode delapan karakter lama tetap didukung. Check-in ulang mempertahankan waktu kedatangan pertama.

Reservasi masih mengikuti kontrak lama: nama yang sama setelah normalisasi memperbarui reservasi yang sudah ada. Untuk dua keluarga dengan nama sama, gunakan nama pembeda saat reservasi. Data check-in merupakan jumlah rombongan sesuai reservasi.

## Cetak A5

PDF undangan berisi dua halaman A5: halaman 1 adalah cover poster prewedding dengan QR undangan digital kecil di tengah bawah; halaman 2 berisi detail acara, alamat lengkap, dan nama penerima. Tulisan "Dua Jiwa, Satu Lentera" tidak dicetak pada kedua muka kartu.

Untuk kartu umum gunakan PDF A5 yang disediakan. Untuk tamu offline: buat reservasi di mode panitia, pastikan kode muncul, lalu tekan Cetak undangan A5 dua muka. QR dan kode check-in pribadi tercetak di sisi belakang; kartu umum mengarahkan tamu untuk reservasi lewat QR digital pada cover. Pilih A5 portrait, cetak dua sisi/duplex, balik pada sisi panjang (long edge), skala 100%, background graphics aktif, header/footer browser mati. Kartu A5 148 × 210 mm; PDF tidak menambahkan bleed.

Alamat venue: Jl. Marelan Raya, Tanah Enam Ratus, Kec. Medan Marelan, Kota Medan, Sumatera Utara 20244. Patokan Google Maps: MMP4+X8P; pin yang dipakai undangan: https://maps.app.goo.gl/d5nJ9Rfvx1j3bCwp7. Jalan diverifikasi melalui [daftar merchant Bank Mandiri](https://www.bankmandiri.co.id/documents/20143/45659490/Merchant%2BCoffiesta%2B-%2BFAQ%2B%28Feb%2B23%29.pdf/8dde9c17-bf92-2532-7dd5-37d27440867f?t=1681723056872&version=1.2), dan wilayah/kode pos melalui [Dinas Pariwisata Medan](https://medantourism.medan.go.id/kuliner/public).

## Album kamera

Masuk `/album-admin` dengan PIN panitia. Salin link kamera atau cetak QR meja A5. Tamu menulis nama dan dapat mengambil foto atau memilih foto galeri tanpa akun. Link album mengandung kode akses; bagikan hanya kepada undangan.

Foto diubah menjadi JPG dengan sisi terpanjang maksimal 2560 px, kualitas 90%. Maksimal file sumber 30 MB, unggahan JPG 8 MB, 80 foto per identitas perangkat. HEIC bergantung dukungan decoder browser. Versi ini mengumpulkan foto, bukan video. Simpan foto asli untuk resolusi penuh.

Antrean foto disimpan di IndexedDB browser. Setelah internet kembali, halaman yang terbuka mencoba mengirim lagi; setelah membuka ulang, gunakan Kirim ulang antrean. Jangan hapus data browser sebelum semua foto terkirim. Halaman belum merupakan aplikasi offline yang dapat dibuka pertama kali tanpa jaringan.

Foto tersimpan di Vercel Blob privat, wilayah Singapore. Galeri awalnya tertutup. Tamu bisa melihat fotonya sendiri; foto tamu lain harus disetujui panitia dan galeri harus dibuka. Sembunyikan menarik foto dari tampilan tamu lain tanpa menghapus berkas. Unduh foto lewat tombol Simpan. Penyimpanan dan transfer mengikuti kuota Hobby Vercel; kapasitas tidak tak terbatas dan tidak ada upgrade berbayar otomatis yang dibuat oleh proyek ini.

Sesi album menggunakan cookie HttpOnly, Secure, SameSite=Lax dengan tanda tangan server. PIN diverifikasi oleh Apps Script. Token Blob hanya ada di environment Vercel. Mengganti token Blob memutus sesi dan link album lama. Jangan memasukkan `.env.local` ke Git.

## Pengembangan dan verifikasi

`npm ci`, `npm run dev`, `npm test`, `npm run build`. `node tests/companions.mjs` memeriksa reservasi, QR cetak, check-in, antrean gagal-upload dan tampilan admin dengan backend mock; menghasilkan screenshot dan PDF lokal. `node tests/restart.mjs` memeriksa perjalanan dan persistensi tiket lama. Endpoint `/api` dijalankan oleh Vercel Functions; gunakan `vercel dev` atau deployment untuk integrasi Blob sungguhan.

Folder `artifacts`, `output`, `tmp`, `.env*`, `.vercel`, dan `.openai` dikecualikan dari deployment melalui `.vercelignore`. Riwayat/artwork undangan tetap berada di workspace asli.
