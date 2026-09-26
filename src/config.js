export const CONFIG = Object.freeze({
  BASE_URL: 'https://dua-jiwa-satu-lentera.bifariachmad.chatgpt.site',
  APPS_SCRIPT_URL: '',
  BGM_SRC: '',
  MAX_GUESTS: 5,
  EVENT: {
    title: 'Undangan Pernikahan',
    names: ['Achmad Bifari', 'Syafira Aulia'],
    dateLabel: 'Sabtu, 31 Oktober 2026',
    start: '2026-10-31T09:30:00+07:00',
    end: '2026-10-31T13:40:00+07:00',
    arrival: '09:30 WIB',
    venue: 'Lumbung Kuliner',
    maps: 'https://maps.app.goo.gl/d5nJ9Rfvx1j3bCwp7',
    geo: [3.6875523, 98.6558724],
    dresscode: 'Maroon atau hitam',
  },
  RUNDOWN: [
    ['09:30-10:00', 'Penerimaan Tamu', 'Tunjukkan QR reservasi, duduk santai', 'gate', 'wine-glass'],
    ['10:00-10:15', 'Pembukaan MC', 'Sambutan hangat dan penjelasan aplikasi foto (QR-nya tersedia di lokasi)', 'curtain', 'raven'],
    ['10:15-11:00', 'Prosesi Akad', 'Ijab kabul', 'arch-roses'],
    ['11:00-11:15', 'Doa', 'Doa bersama', 'candle'],
    ['11:15-11:45', 'Pesan dari Keluarga', 'Ucapan dari perwakilan keluarga', 'book-quill'],
    ['11:45-12:10', 'Foto Bersama', 'Foto bersama keluarga dan saksi', 'photo-frame-camera'],
    ['12:10-13:25', 'Ramah Tamah & Makan', 'Pengantin menyapa tiap meja; makan diiringi biola akustik', 'long-table', 'violin'],
    ['13:25-13:40', 'Penutup', 'Ucapan terima kasih dari pengantin', 'lantern', 'raven-flight'],
  ],
});
export const invitationUrl = () => CONFIG.BASE_URL || window.location.origin;
