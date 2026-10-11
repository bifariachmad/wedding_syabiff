# Verification report — 25 September 2026

## Completed checks

| Check | Result and evidence |
|---|---|
| Scene 1 | Seven reading stops. Instrumented Web Audio checks knocks before dialogue and portal SFX after burning, plus mute. Paper burns while the separate hands remain visible and unclipped; after paper disappears the hands lower, then the portal opens. One-line invitation text, navigation, intact-card replay, click locking, plain-text names and reduced motion are checked at 360×640, 430×932, 1440×900 and 844×390. Current evidence: `node tests/arrival.mjs`, `artifacts/arrival-v4/results.json` and screenshots. |
| Scene 3 | Four reading stops, independent manor door hinges, couple welcome and original invitation wording. Two-footstep approach, rapid-click locking, forward/back/replay and reduced motion pass. Four viewport screenshots and no overflow/browser/asset errors: tests/welcome.mjs and artifacts/welcome/results.json. |
| Scene 2 | Morning garden arrival, approach, independent gate hinges, inward camera movement and The Wedding title. Forward/back and rapid-click lock verified, including return to Scene 1. Four viewport checks and reduced motion pass in tests/courtyard.mjs; evidence in artifacts/courtyard/. |
| Scene 1 artwork | Short bent left forearm, separate holding hands, maroon cutout button/dialogue panel, progress strip and on/off sound badges. Grip and held burning inspected separately; the right-side handle stays with the door. Sixteen active PNGs; prompts and alpha metadata are in the four `artwork/arrival-generation*.json` manifests. |
| Visual-novel layout | 48 screenshots: all 16 scenes at 360, 390, 430 px. No horizontal or vertical page overflow. Additional reviews at 360 × 640, 390 × 844 and 1440 × 900. `artifacts/browser/` and `artifacts/novel/` |
| Artwork | 29 generated illustrations, 18 procedural PNG assets, three brand icons and one share image. All 47 main assets reviewed at 1×/2× on paper/ink; transparent-cutout correction pass completed. `artifacts/raster-review/` |
| Share image | 1200 × 630 PNG; inspected at 400 × 210. `artifacts/og-small.png` |
| Lighthouse mobile | Performance **87**, accessibility **100**. Lighthouse 12.8.2, default simulated mobile throttling, local production build in Chrome. Initial transfer **506,348 bytes** (0.51 MB), below 3 MB. LCP 3.98 s, CLS 0. `artifacts/lighthouse.json` and `.html` |
| Frontend validation | Empty name, one-character name, guest counts 0 and 6 rejected; valid submission enabled. Exactly two visible reservation fields plus hidden honeypot. |
| Backend logic | Six tests execute the actual Apps Script source using Google service adapters. Validation, stable IDs for normalized names, locked writes, PIN checks, repeated check-in, stats, malformed actions and literal formula-like names pass. `npm test` |
| Reservation flow | Valid submit, same-name update with same ID, ticket recall after reload, network failure/retry all pass in browser. The test-only API adapter executes actual `Code.gs`; no mock API ships. |
| QR and admin | Ticket decoded with qr-scanner; the actual admin camera scanner also decoded a canvas-generated MediaStream containing the ticket. Correct updated name and guest count shown, then check-in succeeded. Manual code, name search, wrong PIN rejection and CSV export verified. Physical camera remains untested. |
| Downloads | Ticket PNG downloaded; QR readable. Calendar downloaded and checked for `20261031T023000Z`, `20261031T064000Z`, venue, geo and configured URL. |
| Event content | Countdown target exactly `2026-10-31T09:30:00+07:00`; all eight rundown times checked against config and concept. Supplied copy inspected. |
| Personalization | `?to=` trimmed, capped to 60, shown as plain text; literal HTML input creates no element. |
| Motion and navigation | Exactly two story navigation buttons. All 30 normal-motion forward/back transitions checked. Gate leaves hinge independently before a perspective push; incoming and outgoing PNGs use different Z transforms. Repeated clicks are locked during travel. Wheel does not change scenes; inactive scenes are inert. Reduced motion uses short fades. |
| Build and assets | Production Vite build passes. Static `/admin/` entry included. No SVG files/references in application source or public assets; scanner uses the generated PNG overlay. |
| Runtime dependencies | `npm audit --omit=dev`: zero reported vulnerabilities. |

The new opening first scored 77. Deferring the later gate imagery improved initial loading. Only each next action's assets warm during the reading pause, including the gate while the invitation is open. The Scene 2 revision scored 87 with its first-action images prefetched. The final run used an explicitly managed Chrome process.

## Concept checklist

| Concept section | Status |
|---|---|
| 1 Concept | Done — romantic gothic storybook |
| 2 Event facts | Done |
| 3 Rundown | Done — eight individual scenes |
| 4 Visual identity | Done with user-directed PNG interpretation |
| 5 Page structure | Updated by latest user request — 16 full-screen visual-novel scenes, Kembali/Lanjut only for navigation |
| 6 Motion and sound | Done with raster adaptations documented in DECISIONS.md |
| 7 Reservation, QR, backend, admin | Code and local end-to-end checks done; live Google connection pending owner setup |
| 8 Asset manifest | PNG replacements and generated audio delivered; internal vector layer behavior adapted to HTML layers |
| 9 Indonesian copy | Done |
| 10 Technical requirements | Build, mobile, metadata, config, performance and reduced motion done |
| 11 Hard constraints | Checked |
| 12 Acceptance criteria | Local checks pass; live Google and physical phone checks remain |
| 13 Allowed placeholders | Final domain/music remain configurable; private PIN generated during Apps Script setup |

## Limits and owner handoff

- `APPS_SCRIPT_URL` is not configured. The preview cannot save real reservations until the owner completes README setup. Tests validate the code, not a deployed Google account's permissions, redirect/CORS behavior or quotas.
- Concurrent-call tests verify retained records and lock coverage in an in-memory harness. They do not simulate Google's distributed execution scheduling. Repeat two simultaneous submissions after live deployment.
- Camera tests use a generated video feed, not physical optics or event lighting. Phone smoothness, iOS behavior, camera permission UX, actual speaker quality and sustained hardware frame rate require real-device checks.
- Lighthouse is a lab result. The 87 score meets the requested threshold; LCP measures 3.98 s under its mobile simulation; hosting, network and device results will vary.
- The Sites preview is private. Final guest access, custom domain and third-party link preview scraping need the owner's final deployment.
- Development-only Lighthouse/sharp dependency trees currently have npm advisories; those packages are not included in the static guest bundle. The production dependency audit is clear.

Owner actions: deploy the supplied Apps Script in a private Sheet, set/record the PIN, paste its `/exec` URL into config, deploy to Vercel or choose the final guest domain, update `BASE_URL`, optionally replace music, then repeat the live two-device reservation/check-in check. Exact steps are in README.md.

Scene 2 follow-up: tests/courtyard.mjs additionally samples camera rise/settle across steps, compares the outgoing and title garden bounds (all differences below 1px), and verifies the actual GALVANIZED font is loaded. The four viewport navigation/replay checks pass with no browser or asset errors. Build passes.

Title-frame revision: courtyard checks pass at four viewport sizes, including unchanged final garden framing, GALVANIZED loading, forward/back replay and reduced motion. Inspected the enlarged names, two-line date and complete cutout rose frame in artifacts/courtyard/title.png and viewport screenshots. Production build passes.
# Scene 1 / 3 follow-up

Scene 1 replay samples every animation frame during envelope pickup and letter reveal: held-layer opacity remains exactly 0 or 1. Existing burn-before-portal, sound, reverse navigation and four viewport checks pass. Scene 3 checks five reading stops, exterior visibility, two separate character layers, alternating speaker emphasis, dimmed inactive character, forward/back replay, click locking and four viewports without overflow or asset errors.
# Scenes 1–4 journey revision

Clock-room tests cover four reading stops, talking-mouth opacity alternation, live ticking countdown, entrance-door layers, returning to restored host positions, and four viewports without dialogue/countdown overlap. Gate tests verify +102/-102 degree inward hinges, visible crossing raven during the six-step walk, and unchanged final title framing. Arrival regression and 48-screenshot full navigation/reservation harness passed. Door-layer source reconstruction is exact (zero differing pixels); generated mouth frames differ only inside their recorded mouth rectangles. No live backend deployment is implied by harness tests.
# Scene 5 follow-up

tests/maproom.mjs verifies portal brightness starts at zero and passes through intermediate brightness, both raven PNG frames alternate, title date is absent and heading is maroon, opening door zoom begins concurrently, the room is empty before hosts appear, Syafira is left, four map-room stops replay in both directions, Maps URL remains the configured venue URL, and dialogue fits 360x640, 430x932, 1440x900 and 844x390. Browser/asset errors: none. Grounded clock composition inspected in artifacts/maproom/grounded-clock.png. Gate extraction reconstructs original RGBA exactly with zero differing pixels.

# Scene 6 and gate revision
tests/agenda.mjs passes normal-motion slow opening (final inward angle 82 degrees), centered cream heading, venue information outside dialogue, all eight original schedule pages, backward replay, and four viewports (360x640, 430x932, 1440x900, 844x390), without browser or asset errors. This supersedes the earlier 102-degree gate and maroon title expectations. Scene 5 leads naturally from the map table to the open agenda book.

# Scene 7 wardrobe
The focused wardrobe test covers the normal-motion book-to-wardrobe entrance, four dialogue stops, alternating speakers, cloth reveal, navigation to reservation and back to agenda, image loading, no SVG, no page overflow, and 360x640 / 430x932 / 1440x900 / 844x390 layouts. Production build passes. No backend behavior changed.

# Final journey revision
Focused finale checks cover the outward mirrored gate, removed invitation subtitle, enlarged invitation headline, three date lines and rounded venue logo, progressive scroll entries, maroon/black dresscode, reservation and garden farewell in four viewports. Normal transitions and reverse navigation pass with all PNGs loaded and no browser errors. The live Google Apps Script URL remains unconfigured; reservation checks use the existing service harness.

# Guestbook and summary revision
Focused tests cover the one-line date, venue logo in Scene 5, all eight centered rundown entries, two separate cloth options, three guestbook states, GALVANIZED display type, labeled local-only mockup success, decoded DEMO-prefixed QR, and a 1080x1600 PNG summary export. Checked 360x640, 430x932, 1440x900 and 844x390. Mockup tickets use a separate storage key and never call the reservation service; setting a live service URL restores server submission and real-ticket storage. Empty summaries show no invented QR or guest count.

# Guest clarity and coherent rooms — 26 September 2026

Focused guest-friendly checks pass at 360×640, 430×932, 1440×900 and 844×390: chapter menu and Escape focus return; reservation-required final ticket; stored-ticket recall; edited-name guard; one closed/open/zooming book; visible form bounds; responsive ticket centering; QR decoding; and 1080×1600 PNG export. The older book-summary entry point now runs the current test. Inspected screenshots under artifacts/guest-friendly, including enlarged portrait hosts and landscape ticket.

All six backend unit tests pass. Production build and the production / plus /admin smoke check pass with no browser errors or SVG artwork. The live service remains unconfigured: the published site uses an explicitly labeled local demo; these checks do not claim a real reservation was sent.

Full browser regression also passes: 45 mobile chapter screenshots, all 16 internal scenes forward/back, normal and reduced motion, reservation validation/update/recall, network failure recovery, decoded QR, PNG/calendar export, admin lookup/check-in, and simulated camera decode. Browser errors: none. Closing is intentionally excluded from the initial unsaved-tour screenshots; its saved-reservation route and the mandatory guard are tested separately.

## 28 September 2026 — revisi portrait dan alur ringkas

- Build dan 8 tes backend lulus.
- `tests/portrait.mjs` lulus pada 360×640, 390×844, 430×932, 768×1024, dan 820×1180. Rasio kanvas 9:16, desktop notice, orientasi, posisi halaman kanan buku, input transparan, jadwal, ekspor PNG, kode enam angka, dan aset audio diperiksa.
- `npm run verify` lulus: 24 screenshot, seluruh 9 scene maju/mundur, normal/reduced motion, 4 kasus validasi, QR decode, unduh, update reservasi, recall, kegagalan jaringan, admin/check-in, kamera simulasi. Tidak ada browser error. Backend asli dijalankan melalui adapter in-memory; tidak menulis ke Sheet produksi.
- `tests/restart.mjs` lulus: menu/tombol akhir mengulang seluruh prolog, reservasi tetap dapat diedit, kode tetap sama.
- Apps Script Version 2 aktif, URL tetap sama. Uji langsung menghasilkan kode enam angka dan dicocokkan dengan Sheet; baris uji dibersihkan. Data pengguna yang sudah ada dipertahankan.
- Pemeriksaan visual terakhir memperbaiki jarak tepi kertas, baris rundown, proporsi tombol, dan segel sukses. Screenshot ada di `artifacts/portrait/`.
- Website publik belum dipublikasikan ulang. Pemeriksaan kamera menggunakan simulasi; uji kamera tablet fisik dilakukan saat aplikasi buku tamu dibuat.

## Reception update — 10 October 2026

The earlier morning schedule above is historical. The reception now starts at 16:00 WIB, with ten untimed rundown items. `node tests/reception-invitation.mjs` verifies current countdown/location/calendar content, all ten rows on phone/tablet, four print faces, inside left/right placement, and the rendered cover QR. `node scripts/print-a5.mjs` exports four A5 pages and two A4 folding spreads. Local verification only; publishing remains deferred.

## Digital invitation feedback — 11 October 2026

- `node tests/invitation-feedback.mjs` passes: revised copy for Parts I–VIII, envelope without recipient text, one 4.65-second hinge effect, three footsteps before the hosts appear, and frame-by-frame countdown-to-location isolation with a successful return transition.
- Screenshots at 360×640, 390×844, and 768×1024 verify the inset italic rundown, left-aligned reservation heading, form, and complete edit button. Existing reservations use “Update Kehadiran” and retain their ticket code when the guest count changes.
- Downloaded 1080×1600 tickets decode successfully. The new layout puts the guest name first, QR on the left, and date/time/venue/full address on the right. Maximum-length unbroken names remain inside the border. Direct reservations use the same PNG renderer.
- `npm test`: 18 tests pass. `npm run build` passes. Visual artifacts and focused results are in `artifacts/invitation-feedback/`. Browser reservation calls use the in-memory Apps Script adapter; no production Sheet writes or deployment were performed.
- `node tests/browser.mjs` also passes: all nine scenes forward/back with normal and reduced motion, 24 screenshots, validation, reservation update/recall, network failure recovery, ticket download, QR decode, and simulated admin camera/check-in. No browser errors.
- The copyediting pass was reverted at the user's request. Preserve their previous casual wording rather than making the dialogue formal.
- Open-gate dialogue fix: the scene transition now preserves a hidden outgoing dialogue and respects the incoming scene's intended dialogue opacity. `node tests/gate-dialogue.mjs` reproduced empty-box flashes before the fix (92 normal-motion frames and 61 reduced-motion frames). After the fix, both forward/back paths record zero empty-box frames, and returning to a speaking gate step restores the dialogue. `node tests/invitation-feedback.mjs` and `npm run build` also pass. Changes remain local.
- Walking follow-up: the opacity-only check above did not establish that the frame had left layout. Fresh screenshots did not reproduce a visible box, but the strengthened test found the gate panel still laid out in all 656 sampled walking frames. The courtyard now applies native `hidden` after fading out, throughout the open-gate walk, and when returning to the open gate; speaking steps restore it. The updated test passes with 537 walking frames, zero laid-out gate boxes, zero visible scene panels during walking, and successful back navigation in normal/reduced motion. Start/middle walking screenshots were inspected; `npm run build` passes. No copy changes or deployment.

## Digital release verification — 11 October 2026

The digital release includes the 16:00 reception, ten untimed rundown items, requested casual dialogue, sound and transition fixes, and the revised reservation ticket. The existing companion layouts retain their production behavior, with the displayed reception time synchronized. The tablet kiosk, its PIN-free endpoints, and unfinished print design changes remain local.

The isolated release passes 12 backend/album tests, `npm run build`, all eight chapters in `tests/invitation-feedback.mjs`, and `tests/gate-dialogue.mjs` with normal/reduced motion (194 sampled walking frames, zero laid-out gate boxes or visible panels). Reservation checks use an in-memory backend and do not write to the production Google Sheet.
