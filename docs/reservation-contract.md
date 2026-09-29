# Kontrak reservasi untuk aplikasi berikutnya

`src/`: pengalaman undangan. `public/assets/`: aset aplikasi. `apps-script/`: backend Google Sheets. `tests/`: pengujian. `artifacts/`: hasil uji yang tidak dipublikasikan. `../source-art/`: generasi dan revisi artwork asli.

Reservasi baru memakai ID string enam angka 100000–999999. Tiket menampilkan `482 731`, sedangkan nilai yang disimpan adalah `482731`. Backend memeriksa keunikan di dalam script lock. Nama yang sama memperbarui reservasi dengan ID yang tetap.

Payload QR: `DJSL-482731`. Kode delapan karakter dan QR lama tetap didukung. Input manual boleh memakai spasi atau tanda hubung, tanpa mengetik prefiks. ID bukan sandi admin.

POST JSON dengan Content-Type `text/plain;charset=utf-8` ke endpoint di `src/config.js`, mengikuti redirect Google:

- `reserve`: `{action:'reserve',name,guests,website:''}`; publik; respons `{ok:true,updated,reservation:{id,name,guests}}`.
- `list`: `{action:'list',pin}`; admin; daftar reservasi dan statistik.
- `checkin`: `{action:'checkin',pin,id}`; admin; idempotent dan mempertahankan waktu check-in pertama.
- `stats`: `{action:'stats',pin}`; admin; jumlah reservasi, tamu, dan tamu yang hadir.

PIN dimasukkan petugas saat memakai aplikasi admin dan disimpan dalam memori; jangan ditanam di frontend atau QR. Route `/admin` yang sudah ada tetap tersedia untuk pemeriksaan, tanpa pembatas perangkat undangan.

Undangan memakai kanvas 9:16 pada HP/tablet vertikal. Desktop menampilkan petunjuk membuka di perangkat mobile. Orientasi mendatar meminta perangkat diputar tanpa menghapus progres.

Buku tamu tablet dan aplikasi kamera akan menjadi aplikasi terpisah pada tahap selanjutnya. Buku tamu dapat memakai kontrak ini untuk scan kamera, input kode, pencarian nama, dan check-in. Aplikasi kamera belum dibuat; Google Sheet bukan penyimpanan foto.
