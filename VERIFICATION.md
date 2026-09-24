# Verification report — 24 September 2026

## Completed checks

| Check | Result and evidence |
|---|---|
| Mobile layout | 27 section screenshots: all nine sections at 360, 390, 430 px. No horizontal overflow. `artifacts/browser/` |
| Artwork | 29 generated illustrations, 18 procedural PNG assets, three brand icons and one share image. All 47 main assets reviewed at 1×/2× on paper/ink; transparent-cutout correction pass completed. `artifacts/raster-review/` |
| Share image | 1200 × 630 PNG; inspected at 400 × 210. `artifacts/og-small.png` |
| Lighthouse mobile | Performance **80**, accessibility **100**. Lighthouse 12.8.2, default simulated mobile throttling, local production build in Chrome. Total transfer **958,627 bytes** (0.96 MB), below 3 MB. LCP 5.26 s. `artifacts/lighthouse.json` and `.html` |
| Frontend validation | Empty name, one-character name, guest counts 0 and 6 rejected; valid submission enabled. Exactly two visible reservation fields plus hidden honeypot. |
| Backend logic | Six tests execute the actual Apps Script source using Google service adapters. Validation, stable IDs for normalized names, locked writes, PIN checks, repeated check-in, stats, malformed actions and literal formula-like names pass. `npm test` |
| Reservation flow | Valid submit, same-name update with same ID, ticket recall after reload, network failure/retry all pass in browser. The test-only API adapter executes actual `Code.gs`; no mock API ships. |
| QR and admin | Ticket decoded with qr-scanner; the actual admin camera scanner also decoded a canvas-generated MediaStream containing the ticket. Correct updated name and guest count shown, then check-in succeeded. Manual code, name search, wrong PIN rejection and CSV export verified. Physical camera remains untested. |
| Downloads | Ticket PNG downloaded; QR readable. Calendar downloaded and checked for `20261031T023000Z`, `20261031T064000Z`, venue, geo and configured URL. |
| Event content | Countdown target exactly `2026-10-31T09:30:00+07:00`; all eight rundown times checked against config and concept. Supplied copy inspected. |
| Personalization | `?to=` trimmed, capped to 60, shown as plain text; literal HTML input creates no element. |
| Motion | Gate hinges/chain transition, audio toggle, all eight row entrances, PNG loops and reduced-motion behavior checked. No page errors in the browser suite. |
| Build and assets | Production Vite build passes. Static `/admin/` entry included. No SVG files/references in application source or public assets; scanner uses the generated PNG overlay. |
| Runtime dependencies | `npm audit --omit=dev`: zero reported vulnerabilities. |

The initial Lighthouse result was 76. Prerendered content, early gate/font loading and viewport-based image loading improved it to 80. The Lighthouse CLI first hit a Windows temporary-directory cleanup error after writing its report; the final run used an explicitly managed Chrome process and exited successfully.

## Concept checklist

| Concept section | Status |
|---|---|
| 1 Concept | Done — romantic gothic storybook |
| 2 Event facts | Done |
| 3 Rundown | Done — all eight rows |
| 4 Visual identity | Done with user-directed PNG interpretation |
| 5 Page structure | Done — gate, cover, greeting, countdown, location, rundown, dress code, reservation, closing |
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
- Lighthouse is a lab result. The 80 score meets the requested threshold but LCP still measures 5.26 s under its mobile simulation; hosting, network and device results will vary.
- The Sites preview is private. Final guest access, custom domain and third-party link preview scraping need the owner's final deployment.
- Development-only Lighthouse/sharp dependency trees currently have npm advisories; those packages are not included in the static guest bundle. The production dependency audit is clear.

Owner actions: deploy the supplied Apps Script in a private Sheet, set/record the PIN, paste its `/exec` URL into config, deploy to Vercel or choose the final guest domain, update `BASE_URL`, optionally replace music, then repeat the live two-device reservation/check-in check. Exact steps are in README.md.
