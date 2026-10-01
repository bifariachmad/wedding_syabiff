import {CONFIG} from './config.js';

// The digital QR belongs to the front; the back keeps the personal check-in QR.
export function physicalInvitationMarkup(){
  return `<section class="a5-preview" aria-label="Pratinjau undangan dua muka"><div class="a5-spread">
    <figure class="a5-side"><figcaption class="a5-face-label no-print">DEPAN · POSTER PREWEDDING</figcaption>
      <article class="a5-cover" id="a5-cover" aria-label="Sisi depan undangan A5">
        <img class="a5-poster" src="/assets/png/print/prewedding-poster-v1.png" alt="Poster prewedding Bifari dan Syafira dengan mawar maroon dan lentera di hutan gothic">
        <div class="a5-cover-heading"><p>THE WEDDING</p><h2>Bifari <em>&</em> Syafira</h2></div>
        <div class="a5-cover-qr"><img id="a5-digital" alt="QR undangan digital"><span>UNDANGAN DIGITAL</span></div>
      </article>
    </figure>
    <figure class="a5-side"><figcaption class="a5-face-label no-print">BELAKANG · DETAIL UNDANGAN</figcaption>
      <article class="a5-card a5-back" id="a5-card" aria-label="Sisi belakang undangan A5">
        <p class="a5-intro">Dengan hangat, kami mengundang Anda<br>merayakan pernikahan</p>
        <h2>Achmad Bifari<br><em>&</em><br>Syafira Aulia</h2>
        <div class="a5-rule" aria-hidden="true"></div>
        <p class="a5-date">SABTU, 31 OKTOBER 2026</p>
        <p class="a5-time">09:30-13:40 WIB</p>
        <p class="a5-venue">Lumbung Kuliner</p>
        <p class="a5-address">${CONFIG.EVENT.addressLines.join('<br>')}</p>
        <p class="a5-location-code">Patokan peta: ${CONFIG.EVENT.plusCode}</p>
        <p class="a5-dresscode">Dresscode: maroon atau hitam</p>
        <div class="a5-recipient"><span>Kepada yang terkasih,</span><strong id="a5-name">Bapak / Ibu / Saudara/i</strong></div>
        <div class="a5-qrs"><div id="a5-ticket" hidden><img id="a5-checkin" alt="QR check-in reservasi"><span id="a5-code"></span></div></div>
        <p class="a5-checkin-note" id="a5-checkin-note" hidden>Tunjukkan QR/kode saat tiba · <span id="a5-guest-count"></span></p>
        <p class="a5-general-note" id="a5-general-note">Konfirmasi kehadiran melalui undangan digital<br>pada sisi depan kartu ini.</p>
        <p class="a5-footer">Kehadiranmu adalah bagian dari cerita kami.</p>
      </article>
    </figure>
  </div></section>`;
}
